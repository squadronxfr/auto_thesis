# ===== AGENT ARTEFACT SIMPLIFIÉ - PostgreSQL =====

from .agents.artifact import ArtifactAgent
from .db_models import (
    Request, RequestStep, Activity, Document, Token, User,
    ActivityType, RequestStatus, DocumentType
)

__version__ = "1.0.0"
__author__ = "Auto Thesis Multi-Agent System"

# Exports principaux (PostgreSQL uniquement)
__all__ = [
    # Agent principal
    "ArtifactAgent",
    
    # Modèles PostgreSQL
    "Request",
    "RequestStep", 
    "Activity",
    "Document",
    "Token", 
    "User",
    "ActivityType",
    "RequestStatus", 
    "DocumentType"
]