# ===== AGENT ARTEFACT - FICHIERS INIT =====

from .agents.artifact import ArtifactAgent
from .redis_manager import RedisMemoryManager
from .models.data_models import (
    ArtifactMemory, MemoryContext, ProjectSnapshot,
    Request, RequestStep, Activity, Document, Token, User,
    ActivityType, RequestStatus, DocumentType
)

__version__ = "1.0.0"
__author__ = "Auto Thesis Multi-Agent System"

# Exports principaux
__all__ = [
    # Agent principal
    "ArtifactAgent",
    
    # Gestionnaire Redis
    "RedisMemoryManager", 
    
    # Modèles de données
    "ArtifactMemory",
    "MemoryContext", 
    "ProjectSnapshot",
    "Request",
    "RequestStep",
    "Activity", 
    "Document",
    "Token",
    "User",
    
    # Enums
    "ActivityType",
    "RequestStatus", 
    "DocumentType"
]