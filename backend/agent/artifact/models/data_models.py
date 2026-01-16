from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class RequestStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS" 
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class DocumentType(str, Enum):
    METHODOLOGY = "METHODOLOGY"
    PROBLEMATIC = "PROBLEMATIC"
    INTRODUCTION = "INTRODUCTION"
    RESULTS = "RESULTS"
    DISCUSSION = "DISCUSSION"
    CONCLUSION = "CONCLUSION"
    GENERAL = "GENERAL"

class ActivityType(str, Enum):
    RESEARCH = "RESEARCH"
    WRITING = "WRITING"
    JUDGING = "JUDGING"
    REWRITING = "REWRITING"
    ARCHIVING = "ARCHIVING"

# ===== ENTITÉS PRINCIPALES =====

class User(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    password: str  # En prod: hashé !
    role: str = "USER"
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class Token(BaseModel):
    id: str
    token_string: str
    created_at: datetime = Field(default_factory=datetime.now)
    user_id: str  # Relation OWN avec User

class Request(BaseModel):
    id: str
    name: str
    status: RequestStatus = RequestStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.now)
    user_id: Optional[str] = None  # Relation CREATE avec User

class RequestStep(BaseModel):
    id: str
    order_index: int
    token_cost: int
    content: str
    created_at: datetime = Field(default_factory=datetime.now)
    request_id: str  # Relation HAS_STEP avec Request
    
    # Métadonnées pour l'Agent Artefact
    agent_type: ActivityType
    agent_mode: Optional[str] = None  # Ex: "MODE_METHODOLOGY"
    quality_score: Optional[int] = None
    iteration_number: int = 1

class Document(BaseModel):
    id: str
    name: str
    document_type: DocumentType
    created_at: datetime = Field(default_factory=datetime.now)
    request_id: Optional[str] = None  # Relation CONTAIN avec Request
    user_id: Optional[str] = None  # Relation OWN avec User
    
    # Contenu et métadonnées
    content: str = ""
    version: str = "1.0"
    is_final: bool = False

class Activity(BaseModel):
    id: str
    name: str
    created_at: datetime = Field(default_factory=datetime.now)
    request_id: str  # Relation TRACK avec Request
    
    # Détails de l'activité
    activity_type: ActivityType
    agent_name: str
    duration_seconds: Optional[float] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    metadata: Dict[str, Any] = {}

# ===== MODÈLES POUR L'AGENT ARTEFACT =====

class MemoryContext(BaseModel):
    """Contexte partagé entre agents"""
    request_id: str
    current_step: int
    total_steps_completed: int
    
    # Historique condensé
    previous_activities: List[Activity]
    previous_feedbacks: List[Dict[str, Any]]  # Critiques des Judges
    previous_iterations: List[RequestStep]
    
    # État global
    total_tokens_used: int
    average_quality_score: float
    project_progression: float  # Pourcentage
    
    # Contexte sémantique
    validated_style: Dict[str, str]  # Style approuvé par les Judges
    recurring_issues: List[str]  # Patterns d'erreurs détectées
    key_sources: List[Dict[str, Any]]  # Sources importantes
    
class ProjectSnapshot(BaseModel):
    """Snapshot complet d'un projet à un moment T"""
    request_id: str
    snapshot_timestamp: datetime = Field(default_factory=datetime.now)
    snapshot_name: str
    
    # État complet
    current_request: Request
    all_steps: List[RequestStep]
    all_documents: List[Document] 
    all_activities: List[Activity]
    
    # Métriques consolidées
    total_token_cost: int
    quality_evolution: List[int]  # Évolution des scores
    efficiency_metrics: Dict[str, float]
    
class ArtifactMemory(BaseModel):
    """Mémoire principale de l'Agent Artefact"""
    request_id: str
    last_updated: datetime = Field(default_factory=datetime.now)
    
    # Données principales
    context: MemoryContext
    snapshots: List[ProjectSnapshot] = []
    
    # Cache intelligent pour performance
    cached_summaries: Dict[str, str] = {}  # Résumés par agent
    cached_recommendations: Dict[str, List[str]] = {}  # Recommandations
    
    # Analytics prédictifs
    estimated_remaining_tokens: int = 0
    estimated_completion_time: Optional[datetime] = None
    risk_factors: List[str] = []