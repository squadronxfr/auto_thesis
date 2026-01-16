import json
from typing import Dict, List, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
import sys
import os

# Import du BaseAgent avec Gemini
current_dir = os.path.dirname(__file__)
sys.path.insert(0, os.path.join(current_dir, '..'))

from base import BaseAgent, AgentConfig
from db_models import SessionLocal, Request, RequestStep, Activity, Document

class ArtifactAgent(BaseAgent):
    """
    🎯 Agent Artefact Simplifié : Gestionnaire de mémoire collective
    
    Responsabilités :
    - 💾 Sauvegarder ce qui est produit par chaque agent
    - 📊 Résumer l'historique pour créer une 'mémoire'
    - 🔄 Partager cette mémoire avec les autres agents
    """
    
    def __init__(self):
        config = AgentConfig(
            name="ArtifactMemoryAgent",
            role="Gestionnaire de Mémoire Collective Simplifiée",
            system_instruction="""
            Tu es l'Agent Artefact, responsable de la mémoire collective du système.
            
            Ton rôle est simple et précis :
            1. SAUVEGARDER tout ce que produisent les autres agents
            2. RÉSUMER l'historique des actions pour créer une 'mémoire' partagée
            3. PARTAGER cette mémoire avec les autres agents quand ils en ont besoin
            
            Tu ne génères PAS de contenu académique.
            Tu GÈRES uniquement la mémoire et les résumés.
            
            Réponds toujours de manière structurée et factuelle.
            """,
            temperature=0.1  # Très bas pour cohérence
        )
        super().__init__(config)
    
    def get_db_session(self) -> Session:
        """Obtient une session de base de données"""
        return SessionLocal()
    
    async def save_agent_output(self, request_id: int, agent_name: str, agent_output: str, token_cost: int = 0) -> Dict[str, Any]:
        """
        Sauvegarde la production d'un agent
        Auto-crée le projet s'il n'existe pas
        """
        db = self.get_db_session()
        try:
            # 🔧 NOUVEAU: Vérifier si le projet existe, sinon le créer
            existing_request = db.query(Request).filter(Request.id == request_id).first()
            if not existing_request:
                # Créer automatiquement le projet
                new_request = Request(
                    id=request_id,  # Forcer l'ID
                    name=f"Projet Auto-Thesis {request_id}",
                    status="IN_PROGRESS",
                    user_id=1  # User par défaut (à adapter selon votre logique)
                )
                db.add(new_request)
                db.flush()  # Pour avoir l'ID disponible
                print(f"✅ Projet {request_id} créé automatiquement")
            
            # Obtenir le dernier order_index
            last_step = db.query(RequestStep).filter(RequestStep.request_id == request_id).order_by(RequestStep.order_index.desc()).first()
            next_order = (last_step.order_index + 1) if last_step else 1
            
            # Créer le RequestStep
            step = RequestStep(
                request_id=request_id,
                order_index=next_order,
                token_cost=token_cost,
                content=agent_output
            )
            db.add(step)
            
            # Créer l'Activity
            activity = Activity(
                name=f"{agent_name}_output_saved",
                request_id=request_id
            )
            db.add(activity)
            
            db.commit()
            
            return {
                "status": "saved",
                "step_id": step.id,
                "order_index": next_order,
                "saved_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            db.rollback()
            return {"error": f"Erreur sauvegarde: {str(e)}"}
        finally:
            db.close()
    
    async def generate_memory_summary(self, request_id: int) -> Dict[str, Any]:
        """
        Génère un résumé de la mémoire pour un projet
        """
        db = self.get_db_session()
        try:
            # Récupérer toutes les étapes du projet
            steps = db.query(RequestStep).filter(RequestStep.request_id == request_id).order_by(RequestStep.order_index).all()
            activities = db.query(Activity).filter(Activity.request_id == request_id).order_by(Activity.created_at).all()
            
            if not steps:
                return {"memory_summary": "Aucune donnée disponible pour ce projet"}
            
            # Préparer le contexte pour le résumé
            context_data = {
                "total_steps": len(steps),
                "total_tokens": sum(step.token_cost for step in steps),
                "recent_activities": [activity.name for activity in activities[-5:]],  # 5 dernières
                "content_snippets": [step.content[:200] + "..." if len(step.content) > 200 else step.content for step in steps[-3:]]  # 3 dernières
            }
            
            # Générer le résumé avec Gemini
            prompt = f"""
            Génère un résumé de mémoire collective pour ce projet académique.
            
            Données du projet:
            - Nombre d'étapes: {context_data['total_steps']}
            - Tokens utilisés: {context_data['total_tokens']}
            - Activités récentes: {', '.join(context_data['recent_activities'])}
            
            Contenus récents:
            {chr(10).join(context_data['content_snippets'])}
            
            Crée un résumé concis qui servira de mémoire partagée pour les autres agents.
            Réponds uniquement avec le résumé, sans commentaires.
            """
            
            response = self.model.generate_content(prompt)
            memory_summary = response.text
            
            return {
                "memory_summary": memory_summary,
                "project_stats": context_data,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"error": f"Erreur génération résumé: {str(e)}"}
        finally:
            db.close()
    
    async def get_shared_memory(self, request_id: int, requesting_agent: str) -> Dict[str, Any]:
        """
        Fournit la mémoire partagée pour un agent qui en fait la demande
        """
        # Génère d'abord le résumé actuel
        memory_data = await self.generate_memory_summary(request_id)
        
        if "error" in memory_data:
            return memory_data
        
        # Personnalise selon l'agent demandeur
        context_prompt = f"""
        Un agent '{requesting_agent}' demande la mémoire partagée du projet.
        
        Résumé actuel:
        {memory_data['memory_summary']}
        
        Adapte ce résumé pour l'agent '{requesting_agent}' en mettant l'accent sur ce qui pourrait l'intéresser le plus.
        Garde le résumé concis et utile.
        """
        
        try:
            response = self.model.generate_content(context_prompt)
            personalized_memory = response.text
            
            return {
                "shared_memory": personalized_memory,
                "for_agent": requesting_agent,
                "project_stats": memory_data["project_stats"],
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"error": f"Erreur personnalisation mémoire: {str(e)}"}
    
    async def get_project_status(self, request_id: int) -> Dict[str, Any]:
        """
        Donne l'état actuel d'un projet
        """
        db = self.get_db_session()
        try:
            request = db.query(Request).filter(Request.id == request_id).first()
            if not request:
                return {"error": "Projet non trouvé"}
            
            steps_count = db.query(RequestStep).filter(RequestStep.request_id == request_id).count()
            total_tokens = db.query(RequestStep).filter(RequestStep.request_id == request_id).with_entities(RequestStep.token_cost).all()
            total_tokens = sum(t[0] for t in total_tokens)
            
            return {
                "project_name": request.name,
                "status": request.status,
                "total_steps": steps_count,
                "total_tokens": total_tokens,
                "created_at": request.created_at.isoformat(),
                "checked_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"error": f"Erreur status: {str(e)}"}
        finally:
            db.close()