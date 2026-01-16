from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any
from datetime import datetime
import sys
import os

# Ajout du chemin pour les imports
current_dir = os.path.dirname(__file__)
sys.path.insert(0, current_dir)

from agents.artifact import ArtifactAgent
from db_models import SessionLocal, Request

# Router pour l'Agent Artefact
artifact_router = APIRouter()

# Initialisation de l'agent
artifact_agent = ArtifactAgent()

# ===== ENDPOINTS SIMPLIFIÉS =====

@artifact_router.post("/projects/{request_id}/save")
async def save_agent_output(request_id: int, agent_name: str = Query(...), content: str = Query(...), token_cost: int = Query(default=0)):
    """💾 Sauvegarde la production d'un agent"""
    try:
        result = await artifact_agent.save_agent_output(request_id, agent_name, content, token_cost)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur sauvegarde: {str(e)}")

@artifact_router.get("/projects/{request_id}/memory")
async def get_memory_summary(request_id: int):
    """📊 Obtient le résumé de mémoire d'un projet"""
    try:
        result = await artifact_agent.generate_memory_summary(request_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur mémoire: {str(e)}")

@artifact_router.get("/projects/{request_id}/shared-memory")
async def get_shared_memory(request_id: int, agent_name: str = Query(...)):
    """🔄 Fournit la mémoire partagée pour un agent spécifique"""
    try:
        result = await artifact_agent.get_shared_memory(request_id, agent_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur mémoire partagée: {str(e)}")

@artifact_router.get("/projects/{request_id}/status")
async def get_project_status(request_id: int):
    """📋 État actuel d'un projet"""
    try:
        result = await artifact_agent.get_project_status(request_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur status: {str(e)}")

@artifact_router.get("/health")
async def health_check():
    """💚 Vérification de santé du service"""
    try:
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "artifact_agent_simple",
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@artifact_router.get("/")
def root():
    return {
        "message": "Agent Artefact Simplifié",
        "version": "1.0.0",
        "endpoints": {
            "save": "POST /projects/{id}/save",
            "memory": "GET /projects/{id}/memory", 
            "shared_memory": "GET /projects/{id}/shared-memory",
            "status": "GET /projects/{id}/status",
            "health": "GET /health"
        }
    }

