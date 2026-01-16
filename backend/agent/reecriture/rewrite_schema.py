from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

class CritiqueJuge(BaseModel):
    """Judge's critique (original format without severity)."""
    point_negatif: str = Field(description="What is wrong or problematic in the text")
    suggestion: str = Field(description="How to concretely improve it")

class EntreeReecriture(BaseModel):
    """Input for the Rewriting Agent."""
    texte_brouillon: str = Field(description="The original draft text to be rewritten")
    critiques: List[CritiqueJuge] = Field(
        description="List of critiques from the Judge"
    )
    ids_sources_existantes: List[str] = Field(
        default_factory=list,
        description="IDs of valid citations that already exist (e.g., ['SOURCE_1', 'SOURCE_2'])"
    )
    contexte: Optional[str] = Field(
        default=None,
        description="Additional context or requirements for the rewriting"
    )

class CritiqueResolue(BaseModel):
    """A critique that has been successfully addressed."""
    critique_originale: str
    action_effectuee: str

class ProblemeNonResolu(BaseModel):
    """A problem that could not be resolved."""
    critique: str
    raison: str

class SortieReecriture(BaseModel):
    """Output of the Rewriting Agent."""
    texte_reecrit: str = Field(description="The improved text after rewriting")
    critiques_resolues: List[CritiqueResolue] = Field(
        description="Critiques that have been successfully fixed"
    )
    problemes_non_resolus: List[ProblemeNonResolu] = Field(
        description="Problems that could not be resolved (e.g., missing sources)"
    )
    resume_changements: str = Field(
        description="Brief summary of all the changes made"
    )
    iteration: int = Field(
        default=1,
        description="Rewriting iteration number"
    )
    horodatage: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="When this rewriting was performed (UTC ISO timestamp)"
    )