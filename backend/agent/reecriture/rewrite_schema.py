from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

class CritiqueJuge(BaseModel):
    """Critique du Judge (format original sans sévérité)."""
    point_negatif: str = Field(description="Ce qui ne va pas dans le texte")
    suggestion: str = Field(description="Comment l'améliorer concrètement")

class EntreeReecriture(BaseModel):
    """Entrée pour l'Agent de Réécriture."""
    texte_brouillon: str = Field(description="Le texte brouillon original à réécrire")
    critiques: List[CritiqueJuge] = Field(
        description="Liste des critiques du Juge"
    )
    ids_sources_existantes: List[str] = Field(
        default_factory=list,
        description="IDs de citations valides qui existent (ex: ['SOURCE_1', 'SOURCE_2'])"
    )
    contexte: Optional[str] = Field(
        default=None,
        description="Contexte ou exigences supplémentaires pour la réécriture"
    )

class CritiqueResolue(BaseModel):
    """Une critique qui a été traitée avec succès."""
    critique_originale: str
    action_effectuee: str

class ProblemeNonResolu(BaseModel):
    """Un problème qui n'a pas pu être résolu."""
    critique: str
    raison: str

class SortieReecriture(BaseModel):
    """Sortie de l'Agent de Réécriture."""
    texte_reecrit: str = Field(description="Le texte amélioré après réécriture")
    critiques_resolues: List[CritiqueResolue] = Field(
        description="Critiques qui ont été corrigées avec succès"
    )
    problemes_non_resolus: List[ProblemeNonResolu] = Field(
        description="Problèmes qui n'ont pas pu être résolus (ex: sources manquantes)"
    )
    resume_changements: str = Field(
        description="Résumé bref de tous les changements effectués"
    )
    iteration: int = Field(
        default=1,
        description="Numéro d'itération de réécriture"
    )
    horodatage: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="Quand cette réécriture a été effectuée"
    )