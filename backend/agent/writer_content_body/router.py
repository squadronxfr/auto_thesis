from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from backend.agent.writer_content_body.agents.content_body_writer import ContentBodyWriterAgent
from backend.agent.writer_content_body.agents.content_body_schema import ContentBodyMode, ContentBodyInput

content_body_router = APIRouter()

class ContentBodyRequest(BaseModel):
    """Requête pour générer du contenu long (50 pages)"""
    # Informations principales du mémoire
    thesis_subject: str = Field(..., description="Le sujet global du mémoire")
    problematic: str = Field(..., description="La problématique centrale du mémoire")
    
    # Structure du contenu
    target_pages: int = Field(default=50, description="Nombre de pages cible (environ 250-300 mots par page)")
    chapter_titles: List[str] = Field(default_factory=list, description="Liste des titres de chapitres à développer")
    
    # Mode de rédaction
    mode: ContentBodyMode = Field(default=ContentBodyMode.GENERAL, description="Le mode de rédaction à activer")
    
    # Points clés par chapitre
    key_points_by_chapter: Optional[Dict[str, List[str]]] = Field(
        None,
        description="Dictionnaire associant chaque chapitre à ses points clés"
    )
    
    # Contexte optionnel
    existing_plan: Optional[str] = Field(None, description="Plan existant du mémoire (si disponible)")
    previous_chapters: Optional[List[str]] = Field(None, description="Contenu des chapitres précédents pour cohérence")
    
    # Paramètres optionnels
    style_preferences: Optional[str] = Field(None, description="Préférences de style (académique, vulgarisé, etc.)")
    target_audience: Optional[str] = Field(None, description="Public cible (chercheurs, étudiants, grand public)")
    include_citations: bool = Field(default=True, description="Inclure des citations et références")

@content_body_router.post("/generate")
async def generate_content_body(request: ContentBodyRequest):
    """
    Endpoint principal pour générer du contenu long (50 pages) pour un mémoire de thèse.
    Génère le contenu par chapitres pour gérer efficacement les limites de tokens.
    """
    agent = ContentBodyWriterAgent()
    input_data = ContentBodyInput(
        thesis_subject=request.thesis_subject,
        problematic=request.problematic,
        target_pages=request.target_pages,
        chapter_titles=request.chapter_titles,
        mode=request.mode,
        key_points_by_chapter=request.key_points_by_chapter,
        existing_plan=request.existing_plan,
        previous_chapters=request.previous_chapters,
        style_preferences=request.style_preferences,
        target_audience=request.target_audience,
        include_citations=request.include_citations
    )
    result = await agent.generate_content_body(input_data)
    return result

@content_body_router.get("/health")
async def health_check():
    """Vérification de santé de l'agent"""
    return {"status": "healthy", "agent": "ContentBodyWriter"}
