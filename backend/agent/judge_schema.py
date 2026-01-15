
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from enum import Enum

# --- 1. ÉNUMÉRATIONS (Pour forcer des choix précis) ---
class SectionType(str, Enum):
    INTRO = "introduction"
    CONCLUSION = "conclusion"
    H1 = "chapitre_principal"
    H2 = "sous_partie"
    H3 = "paragraphe_detail"
    BIBLIO = "bibliographie"

class SeverityLevel(str, Enum):
    BLOCKING = "bloquant"   # Erreur critique (Faux sens, Plagiat)
    MAJOR = "majeur"        # Problème de structure ou d'argumentation
    MINOR = "mineur"        # Style, orthographe, lourdeur

# --- 2. ENTRÉE (Ce que l'agent reçoit) ---
# C'est ici qu'on règle le problème de "Manque de Contextualisation"
class JudgeInput(BaseModel):
    text_to_judge: str = Field(..., description="Le texte rédigé par l'artefact")
    section_type: SectionType = Field(..., description="Le type de section (H1, Intro...)")
    
    # Contexte global
    thesis_topic: str = Field(..., description="Le sujet du mémoire")
    academic_level: str = Field("Master 2", description="Niveau attendu")
    
    # Contexte local (pour la cohérence)
    previous_context_summary: Optional[str] = Field(None, description="Résumé de ce qui précède")
    
    # Gestion des sources (Correction du point rouge 🔴)
    sources_provided: List[str] = Field(default_factory=list, description="Liste des sources citées")

# --- 3. SORTIE (Ce que l'agent renvoie) ---
class CritiqueDetail(BaseModel):
    passage_concerne: str = Field(..., description="Le bout de texte exact")
    type_erreur: str = Field(..., description="Ex: 'Cohérence', 'Source', 'Style'")
    severity: SeverityLevel = Field(..., description="Niveau de gravité")
    suggestion: str = Field(..., description="Correction concrète")

class Verdict(BaseModel):
    status: Literal["VALIDE", "REFUSE", "A_REVOIR_MINEUR"]
    score: int = Field(..., ge=0, le=100)
    
    strengths: List[str] = Field(description="Points forts identifiés")
    weaknesses: List[str] = Field(description="Points faibles identifiés")
    
    critiques: List[CritiqueDetail]
    
    # Indispensable pour l'orchestrateur
    requires_rewrite: bool = Field(..., description="Si True, on renvoie à l'artefact")




