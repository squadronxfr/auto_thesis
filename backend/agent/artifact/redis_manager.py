import redis
import json
import pickle
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import uuid
import sys
from dotenv import load_dotenv

# Chargement des variables d'environnement
load_dotenv()
import os

# Ajout du chemin pour les imports
current_dir = os.path.dirname(__file__)
sys.path.insert(0, current_dir)

from models.data_models import ArtifactMemory, ProjectSnapshot

class RedisMemoryManager:
    """
    🔄 Gestionnaire de persistance Redis pour l'Agent Artefact
    
    Gère :
    - Stockage versionnés des mémoires
    - Cache intelligent des contextes
    - Expiration automatique des anciennes données
    - Backup/restore des snapshots
    """
    
    def __init__(self, redis_host: str = "localhost", redis_port: int = 6379, redis_db: int = 0):
        try:
            # Récupération du mot de passe depuis les variables d'environnement
            redis_password = os.getenv("REDIS_PASSWORD", "")
            
            connection_params = {
                "host": redis_host,
                "port": redis_port,
                "db": redis_db,
                "decode_responses": False
            }
            
            # Ajout du mot de passe s'il existe
            if redis_password:
                connection_params["password"] = redis_password
                print(f"🔐 Connexion Redis avec authentification")
            
            self.redis_client = redis.Redis(**connection_params)
            # Test de connexion
            self.redis_client.ping()
            print("✅ Connexion Redis établie")
        except redis.ConnectionError:
            print("❌ Impossible de se connecter à Redis - Mode dégradé")
            self.redis_client = None
    
    # ===== GESTION DES MÉMOIRES =====
    
    async def store_memory(self, memory: ArtifactMemory, ttl_hours: int = 24 * 7) -> bool:
        """Stocke une mémoire avec TTL"""
        if not self.redis_client:
            return False
        
        try:
            key = f"artifact:memory:{memory.request_id}"
            serialized_memory = pickle.dumps(memory.dict())
            
            # Stockage avec expiration
            self.redis_client.setex(
                key,
                timedelta(hours=ttl_hours),
                serialized_memory
            )
            
            # Index pour recherche rapide
            self.redis_client.sadd("artifact:memory:index", memory.request_id)
            
            # Métadonnées pour analytics
            metadata_key = f"artifact:metadata:{memory.request_id}"
            metadata = {
                "last_updated": memory.last_updated.isoformat(),
                "steps_count": len(memory.context.previous_iterations),
                "total_tokens": memory.context.total_tokens_used,
                "progression": memory.context.project_progression
            }
            self.redis_client.setex(
                metadata_key,
                timedelta(hours=ttl_hours),
                json.dumps(metadata)
            )
            
            return True
            
        except Exception as e:
            print(f"❌ Erreur stockage mémoire: {e}")
            return False
    
    async def retrieve_memory(self, request_id: str) -> Optional[ArtifactMemory]:
        """Récupère une mémoire"""
        if not self.redis_client:
            return None
        
        try:
            key = f"artifact:memory:{request_id}"
            serialized_memory = self.redis_client.get(key)
            
            if serialized_memory:
                memory_dict = pickle.loads(serialized_memory)
                return ArtifactMemory(**memory_dict)
            
            return None
            
        except Exception as e:
            print(f"❌ Erreur récupération mémoire: {e}")
            return None
    
    async def list_active_projects(self) -> List[Dict[str, Any]]:
        """Liste tous les projets actifs avec métadonnées"""
        if not self.redis_client:
            return []
        
        try:
            project_ids = self.redis_client.smembers("artifact:memory:index")
            projects = []
            
            for project_id in project_ids:
                project_id = project_id.decode('utf-8')
                metadata_key = f"artifact:metadata:{project_id}"
                metadata_raw = self.redis_client.get(metadata_key)
                
                if metadata_raw:
                    metadata = json.loads(metadata_raw.decode('utf-8'))
                    projects.append({
                        "request_id": project_id,
                        **metadata
                    })
            
            return sorted(projects, key=lambda x: x['last_updated'], reverse=True)
            
        except Exception as e:
            print(f"❌ Erreur listage projets: {e}")
            return []
    
    # ===== GESTION DES SNAPSHOTS =====
    
    async def store_snapshot(self, snapshot: ProjectSnapshot) -> bool:
        """Stocke un snapshot avec versioning"""
        if not self.redis_client:
            return False
        
        try:
            # Clé unique avec timestamp
            timestamp = snapshot.snapshot_timestamp.strftime("%Y%m%d_%H%M%S")
            key = f"artifact:snapshot:{snapshot.request_id}:{timestamp}"
            
            serialized_snapshot = pickle.dumps(snapshot.dict())
            
            # Stockage permanent pour les snapshots (pas de TTL)
            self.redis_client.set(key, serialized_snapshot)
            
            # Index des snapshots par projet
            index_key = f"artifact:snapshots:{snapshot.request_id}"
            self.redis_client.lpush(index_key, key)
            
            # Limiter à 10 snapshots par projet
            self.redis_client.ltrim(index_key, 0, 9)
            
            return True
            
        except Exception as e:
            print(f"❌ Erreur stockage snapshot: {e}")
            return False
    
    async def retrieve_snapshots(self, request_id: str, limit: int = 5) -> List[ProjectSnapshot]:
        """Récupère les derniers snapshots d'un projet"""
        if not self.redis_client:
            return []
        
        try:
            index_key = f"artifact:snapshots:{request_id}"
            snapshot_keys = self.redis_client.lrange(index_key, 0, limit - 1)
            
            snapshots = []
            for key in snapshot_keys:
                key = key.decode('utf-8')
                serialized_snapshot = self.redis_client.get(key)
                
                if serialized_snapshot:
                    snapshot_dict = pickle.loads(serialized_snapshot)
                    snapshots.append(ProjectSnapshot(**snapshot_dict))
            
            return snapshots
            
        except Exception as e:
            print(f"❌ Erreur récupération snapshots: {e}")
            return []
    
    # ===== CACHE INTELLIGENT =====
    
    async def cache_agent_context(self, request_id: str, agent_type: str, context: Dict[str, Any], ttl_minutes: int = 30) -> bool:
        """Cache le contexte pour un agent spécifique"""
        if not self.redis_client:
            return False
        
        try:
            key = f"artifact:cache:{request_id}:{agent_type}"
            
            cached_data = {
                "context": context,
                "cached_at": datetime.now().isoformat(),
                "expires_at": (datetime.now() + timedelta(minutes=ttl_minutes)).isoformat()
            }
            
            self.redis_client.setex(
                key,
                timedelta(minutes=ttl_minutes),
                json.dumps(cached_data)
            )
            
            return True
            
        except Exception as e:
            print(f"❌ Erreur cache contexte: {e}")
            return False
    
    async def get_cached_context(self, request_id: str, agent_type: str) -> Optional[Dict[str, Any]]:
        """Récupère un contexte en cache"""
        if not self.redis_client:
            return None
        
        try:
            key = f"artifact:cache:{request_id}:{agent_type}"
            cached_raw = self.redis_client.get(key)
            
            if cached_raw:
                cached_data = json.loads(cached_raw.decode('utf-8'))
                return cached_data["context"]
            
            return None
            
        except Exception as e:
            print(f"❌ Erreur récupération cache: {e}")
            return None
    
    # ===== ANALYTICS ET MONITORING =====
    
    async def get_global_stats(self) -> Dict[str, Any]:
        """Statistiques globales sur l'utilisation"""
        if not self.redis_client:
            return {}
        
        try:
            stats = {}
            
            # Nombre de projets actifs
            stats["active_projects"] = self.redis_client.scard("artifact:memory:index")
            
            # Utilisation mémoire Redis
            memory_info = self.redis_client.info("memory")
            stats["redis_memory_mb"] = round(memory_info["used_memory"] / (1024 * 1024), 2)
            
            # Top 5 des projets par tokens
            projects = await self.list_active_projects()
            stats["top_token_consumers"] = sorted(
                projects, 
                key=lambda x: x.get("total_tokens", 0), 
                reverse=True
            )[:5]
            
            # Distribution des progressions
            progressions = [p.get("progression", 0) for p in projects]
            if progressions:
                stats["average_progression"] = sum(progressions) / len(progressions)
                stats["projects_near_completion"] = len([p for p in progressions if p > 80])
            
            return stats
            
        except Exception as e:
            print(f"❌ Erreur calcul stats: {e}")
            return {}
    
    async def cleanup_expired_data(self) -> Dict[str, int]:
        """Nettoyage des données expirées (maintenance)"""
        if not self.redis_client:
            return {}
        
        try:
            cleanup_stats = {
                "expired_memories": 0,
                "orphaned_metadata": 0,
                "cleaned_indexes": 0
            }
            
            # Nettoyage des index orphelins
            project_ids = self.redis_client.smembers("artifact:memory:index")
            for project_id in project_ids:
                project_id = project_id.decode('utf-8')
                memory_key = f"artifact:memory:{project_id}"
                
                if not self.redis_client.exists(memory_key):
                    # Supprimer de l'index si la mémoire n'existe plus
                    self.redis_client.srem("artifact:memory:index", project_id)
                    cleanup_stats["orphaned_metadata"] += 1
                    
                    # Supprimer les métadonnées orphelines
                    metadata_key = f"artifact:metadata:{project_id}"
                    if self.redis_client.exists(metadata_key):
                        self.redis_client.delete(metadata_key)
            
            return cleanup_stats
            
        except Exception as e:
            print(f"❌ Erreur nettoyage: {e}")
            return {}
    
    # ===== BACKUP ET RESTORE =====
    
    async def backup_project(self, request_id: str) -> Optional[Dict[str, Any]]:
        """Backup complet d'un projet"""
        if not self.redis_client:
            return None
        
        try:
            backup_data = {
                "request_id": request_id,
                "backup_timestamp": datetime.now().isoformat(),
                "memory": None,
                "snapshots": [],
                "metadata": {}
            }
            
            # Backup de la mémoire
            memory = await self.retrieve_memory(request_id)
            if memory:
                backup_data["memory"] = memory.dict()
            
            # Backup des snapshots
            snapshots = await self.retrieve_snapshots(request_id, limit=10)
            backup_data["snapshots"] = [s.dict() for s in snapshots]
            
            # Backup des métadonnées
            metadata_key = f"artifact:metadata:{request_id}"
            metadata_raw = self.redis_client.get(metadata_key)
            if metadata_raw:
                backup_data["metadata"] = json.loads(metadata_raw.decode('utf-8'))
            
            return backup_data
            
        except Exception as e:
            print(f"❌ Erreur backup: {e}")
            return None
    
    async def restore_project(self, backup_data: Dict[str, Any]) -> bool:
        """Restore d'un projet depuis backup"""
        if not self.redis_client or not backup_data:
            return False
        
        try:
            request_id = backup_data["request_id"]
            
            # Restore mémoire
            if backup_data["memory"]:
                memory = ArtifactMemory(**backup_data["memory"])
                await self.store_memory(memory)
            
            # Restore snapshots
            for snapshot_data in backup_data["snapshots"]:
                snapshot = ProjectSnapshot(**snapshot_data)
                await self.store_snapshot(snapshot)
            
            return True
            
        except Exception as e:
            print(f"❌ Erreur restore: {e}")
            return False