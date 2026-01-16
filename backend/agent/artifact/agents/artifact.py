import json
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict

# Import du BaseAgent avec Gemini
import sys
import os
current_dir = os.path.dirname(__file__)
sys.path.insert(0, os.path.join(current_dir, '..'))

from base import BaseAgent, AgentConfig

# Import des modèles
from models.data_models import (
    ArtifactMemory, MemoryContext, ProjectSnapshot, 
    Request, RequestStep, Activity, Document,
    ActivityType, RequestStatus, DocumentType
)

class ArtifactAgent(BaseAgent):
    """
    🎯 Agent Artefact : Gestionnaire de mémoire collective
    
    Responsabilités :
    - 💾 Sauvegarde versionnée avec métadonnées
    - 📊 Traçabilité complète des modifications  
    - 🎯 État global et synthèse intelligente
    - 🔄 Contexte partagé entre agents
    """
    
    def __init__(self):
        config = AgentConfig(
            name="ArtifactCollectiveMemory",
            role="Gestionnaire de Mémoire Collective",
            system_instruction="""
            Tu es l'Agent Artefact, la mémoire collective du système multi-agents.
            
            Ton rôle est de :
            1. Capturer et structurer TOUS les échanges entre agents
            2. Maintenir la cohérence globale du projet
            3. Fournir le contexte nécessaire à chaque agent
            4. Générer des insights et recommandations basés sur l'historique
            
            Tu ne génères PAS de contenu académique, tu GÈRES la mémoire.
            Tes réponses sont factuelles, structurées et orientées données.
            """,
            temperature=0.1  # Très bas pour cohérence
        )
        super().__init__(config)
        
        # Stockage en mémoire (en prod: Redis/DB)
        self.memory_store: Dict[str, ArtifactMemory] = {}
        self.snapshots_store: Dict[str, List[ProjectSnapshot]] = defaultdict(list)
    
    # ===== GESTION DE LA MÉMOIRE PRINCIPALE =====
    
    async def create_project_memory(self, request: Request) -> ArtifactMemory:
        """Initialise la mémoire pour un nouveau projet"""
        
        initial_context = MemoryContext(
            request_id=request.id,
            current_step=0,
            total_steps_completed=0,
            previous_activities=[],
            previous_feedbacks=[],
            previous_iterations=[],
            total_tokens_used=0,
            average_quality_score=0.0,
            project_progression=0.0,
            validated_style={},
            recurring_issues=[],
            key_sources=[]
        )
        
        memory = ArtifactMemory(
            request_id=request.id,
            context=initial_context
        )
        
        self.memory_store[request.id] = memory
        
        # Log de création
        await self._log_activity(
            request.id, 
            "PROJECT_INITIALIZATION", 
            "ArtifactAgent",
            {"action": "memory_created", "request_name": request.name}
        )
        
        return memory
    
    async def archive_step(self, step: RequestStep) -> Dict[str, Any]:
        """Archive une étape avec enrichissement de métadonnées"""
        
        memory = self.memory_store.get(step.request_id)
        if not memory:
            return {"error": "Mémoire non trouvée pour ce projet"}
        
        # Enrichissement des métadonnées
        enriched_step = await self._enrich_step_metadata(step, memory.context)
        
        # Mise à jour du contexte
        memory.context.previous_iterations.append(enriched_step)
        memory.context.current_step += 1
        memory.context.total_steps_completed += 1
        memory.context.total_tokens_used += step.token_cost
        
        # Calcul de la progression (basé sur le type d'étape)
        memory.context.project_progression = await self._calculate_progression(memory.context)
        
        # Détection de patterns
        if step.quality_score and step.quality_score > 0:
            await self._analyze_quality_patterns(memory.context, step)
        
        memory.last_updated = datetime.now()
        
        return {
            "status": "archived",
            "step_id": step.id,
            "enriched_metadata": enriched_step.metadata if hasattr(enriched_step, 'metadata') else {},
            "progression": memory.context.project_progression
        }
    
    async def provide_context_for_agent(self, request_id: str, agent_type: ActivityType, target_mode: Optional[str] = None) -> Dict[str, Any]:
        """Fournit le contexte adapté pour un agent spécifique"""
        
        memory = self.memory_store.get(request_id)
        if not memory:
            return {"error": "Projet non trouvé"}
        
        context = memory.context
        
        # Contexte de base
        agent_context = {
            "request_id": request_id,
            "current_step": context.current_step,
            "project_progression": context.project_progression,
            "total_tokens_used": context.total_tokens_used,
            "average_quality": context.average_quality_score
        }
        
        # Contexte spécialisé par agent
        if agent_type == ActivityType.WRITING:
            agent_context.update({
                "validated_style": context.validated_style,
                "key_sources": context.key_sources,
                "previous_critiques_to_avoid": await self._get_recurring_critiques(context),
                "suggested_approach": await self._suggest_writing_approach(context, target_mode)
            })
            
        elif agent_type == ActivityType.JUDGING:
            agent_context.update({
                "previous_scores": [step.quality_score for step in context.previous_iterations if step.quality_score],
                "common_issues": context.recurring_issues,
                "quality_evolution": await self._get_quality_evolution(context),
                "benchmark_criteria": await self._get_benchmark_criteria(context, target_mode)
            })
            
        elif agent_type == ActivityType.REWRITING:
            latest_feedback = context.previous_feedbacks[-1] if context.previous_feedbacks else {}
            agent_context.update({
                "specific_critiques": latest_feedback.get("critiques", []),
                "improvement_suggestions": latest_feedback.get("suggestions", []),
                "previous_attempts": await self._get_rewriting_history(context),
                "success_patterns": await self._get_successful_improvements(context)
            })
            
        elif agent_type == ActivityType.RESEARCH:
            agent_context.update({
                "already_found_sources": context.key_sources,
                "research_gaps": await self._identify_research_gaps(context),
                "preferred_source_types": await self._get_preferred_sources(context),
                "keywords_to_explore": await self._suggest_keywords(context)
            })
        
        return agent_context
    
    async def create_smart_snapshot(self, request_id: str, snapshot_name: str) -> ProjectSnapshot:
        """Crée un snapshot intelligent du projet"""
        
        memory = self.memory_store.get(request_id)
        if not memory:
            raise ValueError(f"Projet {request_id} non trouvé")
        
        # Récupération de toutes les données (simulé ici)
        current_request = await self._get_request(request_id)
        all_steps = memory.context.previous_iterations
        all_activities = memory.context.previous_activities
        all_documents = await self._get_documents(request_id)
        
        # Calcul des métriques
        total_tokens = sum(step.token_cost for step in all_steps)
        quality_scores = [step.quality_score for step in all_steps if step.quality_score and step.quality_score > 0]
        
        efficiency_metrics = {
            "average_tokens_per_step": total_tokens / len(all_steps) if all_steps else 0,
            "average_quality": sum(quality_scores) / len(quality_scores) if quality_scores else 0,
            "iterations_per_section": await self._calculate_iteration_efficiency(all_steps),
            "time_per_validation": await self._calculate_time_efficiency(memory.context.previous_activities)
        }
        
        snapshot = ProjectSnapshot(
            request_id=request_id,
            snapshot_name=snapshot_name,
            current_request=current_request,
            all_steps=all_steps,
            all_documents=all_documents,
            all_activities=all_activities,
            total_token_cost=total_tokens,
            quality_evolution=quality_scores,
            efficiency_metrics=efficiency_metrics
        )
        
        # Stockage
        self.snapshots_store[request_id].append(snapshot)
        
        return snapshot
    
    # ===== ANALYTICS ET INSIGHTS =====
    
    async def generate_project_insights(self, request_id: str) -> Dict[str, Any]:
        """Génère des insights intelligents sur le projet"""
        
        memory = self.memory_store.get(request_id)
        if not memory:
            return {"error": "Projet non trouvé"}
        
        context = memory.context
        
        insights = {
            "performance_analysis": await self._analyze_performance(context),
            "quality_trends": await self._analyze_quality_trends(context),
            "efficiency_insights": await self._analyze_efficiency(context),
            "predictive_analytics": await self._generate_predictions(context),
            "recommendations": await self._generate_recommendations(context)
        }
        
        return insights
    
    async def get_project_dashboard(self, request_id: str) -> Dict[str, Any]:
        """Génère un dashboard complet du projet"""
        
        memory = self.memory_store.get(request_id)
        if not memory:
            return {"error": "Projet non trouvé"}
        
        context = memory.context
        
        dashboard = {
            "overview": {
                "progression": context.project_progression,
                "current_step": context.current_step,
                "total_tokens": context.total_tokens_used,
                "average_quality": context.average_quality_score,
                "last_updated": memory.last_updated.isoformat()
            },
            "recent_activities": context.previous_activities[-5:],  # 5 dernières
            "quality_evolution": await self._get_quality_evolution(context),
            "token_distribution": await self._get_token_distribution(context),
            "alerts": await self._generate_alerts(context),
            "next_recommendations": await self._get_next_actions(context)
        }
        
        return dashboard
    
    # ===== MÉTHODES PRIVÉES (LOGIQUE MÉTIER) =====
    
    async def _enrich_step_metadata(self, step: RequestStep, context: MemoryContext) -> RequestStep:
        """Enrichit les métadonnées d'une étape"""
        # Simulation d'enrichissement
        step.iteration_number = len([s for s in context.previous_iterations 
                                   if s.agent_type == step.agent_type]) + 1
        return step
    
    async def _calculate_progression(self, context: MemoryContext) -> float:
        """Calcule la progression globale du projet"""
        # Logique simplifiée - en réalité plus complexe
        steps_by_type = defaultdict(int)
        for step in context.previous_iterations:
            steps_by_type[step.agent_type] += 1
        
        # Estimation basée sur les types d'étapes complétées
        expected_steps = {
            ActivityType.RESEARCH: 1,
            ActivityType.WRITING: 3,  # Intro, Méthodo, Conclusion
            ActivityType.JUDGING: 3,
            ActivityType.REWRITING: 2
        }
        
        total_progress = 0
        for step_type, expected in expected_steps.items():
            actual = steps_by_type.get(step_type, 0)
            total_progress += min(actual / expected, 1.0) * 100 / len(expected_steps)
        
        return total_progress
    
    async def _log_activity(self, request_id: str, activity_name: str, agent_name: str, metadata: Dict[str, Any]):
        """Log une activité dans le contexte"""
        memory = self.memory_store.get(request_id)
        if memory:
            activity = Activity(
                id=str(uuid.uuid4()),
                name=activity_name,
                request_id=request_id,
                activity_type=ActivityType.ARCHIVING,
                agent_name=agent_name,
                metadata=metadata
            )
            memory.context.previous_activities.append(activity)
    
    # Autres méthodes privées (simplifiées pour l'exemple)
    async def _get_request(self, request_id: str) -> Request:
        return Request(id=request_id, name="Exemple", status=RequestStatus.IN_PROGRESS)
    
    async def _get_documents(self, request_id: str) -> List[Document]:
        return []
    
    async def _analyze_performance(self, context: MemoryContext) -> Dict[str, Any]:
        return {"status": "analysis_placeholder"}
    
    async def _analyze_quality_trends(self, context: MemoryContext) -> List[int]:
        return [step.quality_score for step in context.previous_iterations if step.quality_score]
    
    async def _generate_predictions(self, context: MemoryContext) -> Dict[str, Any]:
        return {"estimated_remaining_tokens": context.total_tokens_used * 0.3}
    
    async def _generate_recommendations(self, context: MemoryContext) -> List[str]:
        recommendations = []
        if context.average_quality_score < 75:
            recommendations.append("Considérer plus d'itérations pour améliorer la qualité")
        if context.total_tokens_used > 10000:
            recommendations.append("Optimiser les prompts pour réduire la consommation")
        return recommendations
    
    # ... Autres méthodes d'analyse (implémentation complète selon besoins)