from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid
import sys
import os

# Ajout du chemin pour les imports
current_dir = os.path.dirname(__file__)
sys.path.insert(0, current_dir)

from agents.artifact import ArtifactAgent
from redis_manager import RedisMemoryManager
from models.data_models import (
    Request, RequestStep, Activity, ArtifactMemory,
    ActivityType, RequestStatus
)

app = FastAPI(
    title="Agent Artefact API",
    description="API pour la gestion de mémoire collective multi-agents",
    version="1.0.0"
)

# Initialisation des composants
artifact_agent = ArtifactAgent()
redis_manager = RedisMemoryManager()

# ===== ENDPOINTS PRINCIPAUX =====

@app.post("/projects/{request_id}/initialize")
async def initialize_project(request_id: str, project_name: str = Query(..., description="Nom du projet à créer")):
    """🎯 Initialise la mémoire pour un nouveau projet"""
    try:
        request = Request(
            id=request_id,
            name=project_name,
            status=RequestStatus.IN_PROGRESS
        )
        
        # Création en mémoire
        memory = await artifact_agent.create_project_memory(request)
        
        # Persistance Redis
        await redis_manager.store_memory(memory)
        
        return {
            "status": "initialized",
            "request_id": request_id,
            "project_name": project_name,
            "memory_created": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur initialisation: {str(e)}")

@app.post("/projects/{request_id}/steps")
async def archive_step(request_id: str, step_data: Dict[str, Any]):
    """📋 Archive une étape de traitement"""
    try:
        step = RequestStep(
            id=str(uuid.uuid4()),
            request_id=request_id,
            order_index=step_data.get("order_index", 0),
            token_cost=step_data.get("token_cost", 0),
            content=step_data.get("content", ""),
            agent_type=ActivityType(step_data.get("agent_type", "WRITING")),
            agent_mode=step_data.get("agent_mode"),
            quality_score=step_data.get("quality_score"),
            iteration_number=step_data.get("iteration_number", 1)
        )
        
        # Archivage
        result = await artifact_agent.archive_step(step)
        
        # Mise à jour Redis
        memory = artifact_agent.memory_store.get(request_id)
        if memory:
            await redis_manager.store_memory(memory)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur archivage: {str(e)}")

@app.get("/projects/{request_id}/context/{agent_type}")
async def get_agent_context(request_id: str, agent_type: str, agent_mode: Optional[str] = None):
    """🔄 Fournit le contexte pour un agent spécifique"""
    try:
        # Vérification cache Redis d'abord
        cached_context = await redis_manager.get_cached_context(request_id, agent_type)
        if cached_context:
            return {"source": "cache", "context": cached_context}
        
        # Génération du contexte
        activity_type = ActivityType(agent_type.upper())
        context = await artifact_agent.provide_context_for_agent(request_id, activity_type, agent_mode)
        
        # Mise en cache
        await redis_manager.cache_agent_context(request_id, agent_type, context, ttl_minutes=30)
        
        return {"source": "generated", "context": context}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur contexte: {str(e)}")

@app.post("/projects/{request_id}/snapshots")
async def create_snapshot(request_id: str, snapshot_name: str):
    """📸 Crée un snapshot du projet"""
    try:
        snapshot = await artifact_agent.create_smart_snapshot(request_id, snapshot_name)
        
        # Persistance Redis
        await redis_manager.store_snapshot(snapshot)
        
        return {
            "status": "snapshot_created",
            "snapshot_id": f"{request_id}_{snapshot.snapshot_timestamp.strftime('%Y%m%d_%H%M%S')}",
            "snapshot_name": snapshot_name,
            "total_tokens": snapshot.total_token_cost,
            "quality_average": sum(snapshot.quality_evolution) / len(snapshot.quality_evolution) if snapshot.quality_evolution else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur snapshot: {str(e)}")

@app.get("/projects/{request_id}/snapshots")
async def get_snapshots(request_id: str, limit: int = 5):
    """📋 Récupère les snapshots d'un projet"""
    try:
        snapshots = await redis_manager.retrieve_snapshots(request_id, limit)
        
        return {
            "request_id": request_id,
            "snapshots_count": len(snapshots),
            "snapshots": [
                {
                    "snapshot_name": s.snapshot_name,
                    "timestamp": s.snapshot_timestamp.isoformat(),
                    "total_tokens": s.total_token_cost,
                    "steps_count": len(s.all_steps),
                    "documents_count": len(s.all_documents)
                }
                for s in snapshots
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur récupération snapshots: {str(e)}")

@app.get("/projects/{request_id}/dashboard")
async def get_project_dashboard(request_id: str):
    """📊 Dashboard complet du projet"""
    try:
        # Récupération depuis Redis si possible
        memory = await redis_manager.retrieve_memory(request_id)
        if memory:
            artifact_agent.memory_store[request_id] = memory
        
        dashboard = await artifact_agent.get_project_dashboard(request_id)
        
        return dashboard
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur dashboard: {str(e)}")

@app.get("/projects/{request_id}/insights")
async def get_project_insights(request_id: str):
    """💡 Insights intelligents sur le projet"""
    try:
        # Récupération depuis Redis si nécessaire
        memory = await redis_manager.retrieve_memory(request_id)
        if memory:
            artifact_agent.memory_store[request_id] = memory
        
        insights = await artifact_agent.generate_project_insights(request_id)
        
        return insights
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur insights: {str(e)}")

# ===== ENDPOINTS DE GESTION =====

@app.get("/projects")
async def list_active_projects():
    """📋 Liste tous les projets actifs"""
    try:
        projects = await redis_manager.list_active_projects()
        return {
            "active_projects_count": len(projects),
            "projects": projects
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur listage: {str(e)}")

@app.get("/admin/stats")
async def get_global_stats():
    """📈 Statistiques globales du système"""
    try:
        stats = await redis_manager.get_global_stats()
        return {
            "timestamp": datetime.now().isoformat(),
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur stats: {str(e)}")

@app.post("/admin/cleanup")
async def cleanup_expired_data(background_tasks: BackgroundTasks):
    """🧹 Nettoyage des données expirées"""
    try:
        background_tasks.add_task(redis_manager.cleanup_expired_data)
        return {"status": "cleanup_scheduled"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur nettoyage: {str(e)}")

@app.post("/projects/{request_id}/backup")
async def backup_project(request_id: str):
    """💾 Backup complet d'un projet"""
    try:
        backup_data = await redis_manager.backup_project(request_id)
        if not backup_data:
            raise HTTPException(status_code=404, detail="Projet non trouvé")
        
        return {
            "status": "backup_created",
            "backup_timestamp": backup_data["backup_timestamp"],
            "data_size": {
                "memory": bool(backup_data["memory"]),
                "snapshots_count": len(backup_data["snapshots"]),
                "has_metadata": bool(backup_data["metadata"])
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur backup: {str(e)}")

@app.post("/projects/restore")
async def restore_project(backup_data: Dict[str, Any]):
    """🔄 Restore d'un projet depuis backup"""
    try:
        success = await redis_manager.restore_project(backup_data)
        
        if success:
            return {"status": "project_restored", "request_id": backup_data["request_id"]}
        else:
            raise HTTPException(status_code=500, detail="Échec du restore")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur restore: {str(e)}")

# ===== ENDPOINTS DE MONITORING =====

@app.get("/health")
async def health_check():
    """💚 Vérification de santé du service"""
    try:
        # Test Redis
        redis_status = "connected" if redis_manager.redis_client else "disconnected"
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "services": {
                "artifact_agent": "active",
                "redis": redis_status
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Démarrage Agent Artefact API sur http://localhost:8002")
    uvicorn.run(app, host="0.0.0.0", port=8002)