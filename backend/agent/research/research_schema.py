from pydantic import BaseModel, Field
from typing import List, Optional

class Source(BaseModel):
    titre: str = Field(description="Titre de la source")
    auteur: Optional[str] = Field(default=None, description="Auteur(s) de la source")
    date: Optional[str] = Field(default=None, description="Date de publication")
    lien: str = Field(description="URL de la source")
    resume: str = Field(description="Résumé du contenu pertinent")
    pertinence: int = Field(description="Score de pertinence par rapport au sujet (1-10)", ge=1, le=10)

class ResearchResult(BaseModel):
    sources_trouvees: List[Source] = Field(description="Liste des sources identifiées")
    nombre_sources: int = Field(description="Nombre total de sources trouvées")
    mots_cles_utilises: List[str] = Field(description="Mots-clés utilisés pour la recherche")
    synthese: str = Field(description="Synthèse rapide des résultats")