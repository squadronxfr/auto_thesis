from pydantic import BaseModel, Field
from typing import List

class CritiqueDetail(BaseModel):
    point_negatif: str = Field(description="Ce qui ne va pas dans le texte")
    suggestion: str = Field(description="Comment l'améliorer concrètement")

class Verdict(BaseModel):
    status: str = Field(description="Le résultat final: 'VALIDE' ou 'REFUSE'")
    score: int = Field(description="Une note sur 100")
    reasoning: str = Field(description="Explication globale du professeur")
    critiques: List[CritiqueDetail] = Field(description="Liste des corrections demandées si refusé")