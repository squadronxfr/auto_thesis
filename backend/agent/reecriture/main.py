from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
import sys
import os
import uuid

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from reecriture.agent_reecriture import AgentReecriture
from reecriture.rewrite_schema import (
    EntreeReecriture,
    SortieReecriture,
    CritiqueJuge
)

app = FastAPI(
    title="Agent de Réécriture Académique",
    description="API pour améliorer les textes académiques selon des critiques",
    version="1.0.0"
)

class RewriteRequest(BaseModel):
    texte_brouillon: str
    critiques: List[dict]
    ids_sources_existantes: List[str] = []
    contexte: str = None
    iteration: int = 1
    id_document: str = Field(default_factory=lambda: str(uuid.uuid4()))

    class Config:
        schema_extra = {
            "example": {
                "texte_brouillon": "L'IA est cool [SOURCE_1]. C'est super intéressant!",
                "critiques": [
                    {
                        "point_negatif": "Langage trop informel ('cool', 'super')",
                        "suggestion": "Utiliser un vocabulaire académique approprié"
                    }
                ],
                "ids_sources_existantes": ["SOURCE_1", "SOURCE_2"],
                "contexte": "Introduction de mémoire de Master",
                "iteration": 1,
                "id_document": "memoire_intro_v1"
            }
        }

@app.get("/")
async def root():
    """Point d'entrée de l'API."""
    return {
        "service": "Agent de Réécriture Académique",
        "version": "1.0.0",
        "endpoints": {
            "improve": "/agents/rewrite/improve",
            "history": "/agents/rewrite/history/{id_document}",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Vérification de l'état de l'API."""
    try:
        agent = AgentReecriture()
        return {
            "status": "healthy",
            "service": "rewrite_agent",
            "model": agent.config.model_name
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Service unhealthy: {str(e)}"
        )

@app.post("/agents/rewrite/improve", response_model=SortieReecriture)
async def improve_text(request: RewriteRequest):
    """
    Améliore un texte brouillon selon les critiques fournies.
    
    Args:
        request: Contient le texte brouillon, les critiques, sources disponibles, etc.
    
    Returns:
        SortieReecriture avec le texte amélioré et métadonnées
    """
    try:
        critiques_obj = [
            CritiqueJuge(
                point_negatif=c["point_negatif"],
                suggestion=c["suggestion"]
            )
            for c in request.critiques
        ]
        
        entree = EntreeReecriture(
            texte_brouillon=request.texte_brouillon,
            critiques=critiques_obj,
            ids_sources_existantes=request.ids_sources_existantes,
            contexte=request.contexte
        )
        
        agent = AgentReecriture()
        resultat = await agent.reecrire(
            donnees_entree=entree,
            iteration=request.iteration,
            id_document=request.id_document
        )
        
        return resultat
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la réécriture: {str(e)}"
        )

@app.get("/agents/rewrite/history/{id_document}")
async def get_history(id_document: str):
    """
    Récupère l'historique de réécriture d'un document.
    
    Args:
        id_document: ID unique du document
    
    Returns:
        Liste des itérations de réécriture
    """
    try:
        agent = AgentReecriture()
        historique = agent.obtenir_historique(id_document)
        
        if not historique:
            return {
                "id_document": id_document,
                "iterations": [],
                "message": "Aucun historique trouvé pour ce document"
            }
        
        return {
            "id_document": id_document,
            "iterations": historique,
            "total": len(historique)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération de l'historique: {str(e)}"
        )

