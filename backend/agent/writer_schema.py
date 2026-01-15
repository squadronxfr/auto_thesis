from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from .judge_schema import SectionType # On réutilise les types du Juge pour être compatible

# --- 1. Les 3 Modes de l'Architecture ---
class WriterMode(str, Enum):
    METHODOLOGIE = "methodologie"   # Focus: Rigueur, outils, validité
    PROBLEMATIQUE = "problematique" # Focus: Hypothèses, cadre théorique
    GENERAL = "redaction_generale"  # Focus: Style académique standard

# --- 2. Ce que l'Écrivain reçoit (Input) ---
class WriterInput(BaseModel):
    topic: str = Field(..., description="Le sujet spécifique de cette section")
    thesis_subject: str = Field(..., description="Le sujet global du mémoire")
    section_type: SectionType = Field(..., description="Type de section (H1, H2...)")
    mode: WriterMode = Field(..., description="Le mode de rédaction à activer")
    
    # Contexte optionnel (pour la cohérence)
    previous_content: Optional[str] = Field(None, description="Ce qui a été écrit juste avant")
    key_points: List[str] = Field(default_factory=list, description="Liste des points clés à aborder obligatoirement")

# --- 3. Ce que l'Écrivain produit (Output) ---
class DraftOutput(BaseModel):
    content: str = Field(..., description="Le texte rédigé")
    word_count: int = Field(..., description="Nombre de mots approximatif")
    # Il auto-déclare ses sources (pour que le Juge vérifie plus tard)
    sources_used: List[str] = Field(default_factory=list, description="Sources citées dans le texte")