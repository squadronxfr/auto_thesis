import os
import json
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from pathlib import Path

# Load .env from backend directory (2 levels up from this file)
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class StockageMemoire:
    """
    Stockage mémoire basé sur Redis avec repli en mémoire.
    Stocke les artefacts de réécriture et données partagées entre agents.
    """
    
    def __init__(self):
        self.client_redis = None
        self.memoire_locale: Dict[str, Any] = {}
        self._init_redis()
    
    def _init_redis(self):
        """Initialise la connexion Redis avec repli vers dict local."""
        try:
            import redis
            hote_redis = os.getenv("REDIS_HOST", "localhost")
            port_redis = int(os.getenv("REDIS_PORT", "6379"))
            bd_redis = int(os.getenv("REDIS_DB", "0"))
            mdp_redis = os.getenv("REDIS_PASSWORD", None)
            
            self.client_redis = redis.Redis(
                host=hote_redis,
                port=port_redis,
                db=bd_redis,
                password=mdp_redis,
                decode_responses=True,
                socket_connect_timeout=2
            )
            # Test de connexion
            self.client_redis.ping()
            print("✓ Redis connecté avec succès")
        except Exception as e:
            print(f"⚠ Redis indisponible ({e}), utilisation de la mémoire locale")
            self.client_redis = None
    
    def definir(self, cle: str, valeur: Any, expiration_secondes: Optional[int] = None):
        """Stocke une valeur (sérialisation JSON automatique)."""
        serialisee = json.dumps(valeur) if not isinstance(valeur, str) else valeur
        
        if self.client_redis:
            try:
                self.client_redis.set(cle, serialisee)
                if expiration_secondes:
                    self.client_redis.expire(cle, expiration_secondes)
                return True
            except Exception as e:
                print(f"Erreur Redis SET: {e}, utilisation repli local")
        
        # Repli local
        self.memoire_locale[cle] = serialisee
        return True
    
    def obtenir(self, cle: str) -> Optional[Any]:
        """Récupère une valeur (désérialisation JSON automatique si possible)."""
        valeur = None
        
        if self.client_redis:
            try:
                valeur = self.client_redis.get(cle)
            except Exception as e:
                print(f"Erreur Redis GET: {e}, utilisation repli local")
        
        if valeur is None:
            valeur = self.memoire_locale.get(cle)
        
        if valeur is None:
            return None
        
        # Tente de désérialiser JSON
        try:
            return json.loads(valeur)
        except (json.JSONDecodeError, TypeError):
            return valeur
    
    def supprimer(self, cle: str):
        """Supprime une clé."""
        if self.client_redis:
            try:
                self.client_redis.delete(cle)
            except Exception as e:
                # Redis deletion failed, continue with local deletion anyway
                print(f"Erreur Redis DELETE: {e}, poursuite avec suppression locale")
        
        # Always attempt local deletion (fallback or primary storage)
        self.memoire_locale.pop(cle, None)
    
    def ajouter_a_liste(self, cle: str, valeur: Any):
        """Ajoute à une liste stockée à la clé."""
        actuel = self.obtenir(cle)
        if actuel is None:
            actuel = []
        elif not isinstance(actuel, list):
            actuel = [actuel]
        
        actuel.append(valeur)
        self.definir(cle, actuel)
    
    def obtenir_liste(self, cle: str) -> list:
        """Obtient une liste de la clé (retourne liste vide si non trouvée)."""
        valeur = self.obtenir(cle)
        if valeur is None:
            return []
        if isinstance(valeur, list):
            return valeur
        return [valeur]
    
    def stocker_artefact_reecriture(
        self, 
        id_document: str, 
        iteration: int, 
        artefact: Dict[str, Any]
    ):
        """Stocke un artefact de réécriture pour un document et itération spécifiques."""
        cle = f"reecriture:{id_document}:iteration:{iteration}"
        self.definir(cle, artefact, expiration_secondes=86400)  # Expiration 24h
        
        # Suit aussi toutes les itérations
        self.ajouter_a_liste(f"reecriture:{id_document}:iterations", iteration)
    
    def obtenir_historique_reecriture(self, id_document: str) -> list:
        """Obtient toutes les itérations de réécriture pour un document."""
        iterations = self.obtenir_liste(f"reecriture:{id_document}:iterations")
        historique = []
        
        for iteration in iterations:
            artefact = self.obtenir(f"reecriture:{id_document}:iteration:{iteration}")
            if artefact:
                historique.append(artefact)
        
        return historique

# Instance singleton globale
_stockage_memoire = None

def obtenir_stockage_memoire() -> StockageMemoire:
    """Obtient ou crée l'instance globale du stockage mémoire."""
    global _stockage_memoire
    if _stockage_memoire is None:
        _stockage_memoire = StockageMemoire()
    return _stockage_memoire