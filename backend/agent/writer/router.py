from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from backend.agent.writer.agents.writer import WriterAgent
from backend.agent.writer.agents.writer_schema import WriterMode, SectionType, WriterInput, ContentType

writer_router = APIRouter()

class WriterRequest(BaseModel):
    # Informations principales du mémoire
    thesis_subject: str
    problematic: str
    
    # Informations spécifiques de la section
    topic: str
    content_type: ContentType = ContentType.SECTION
    section_type: SectionType = SectionType.PARAGRAPH
    mode: WriterMode
    
    # Contexte optionnel
    previous_content: Optional[str] = None
    key_points: List[str] = []
    
    # Personnalisations optionnelles (pour déclinaisons futures)
    style_preferences: Optional[str] = None
    target_audience: Optional[str] = None

@writer_router.post("/generate")
async def run_writer(request: WriterRequest):
    """
    Endpoint principal pour générer du contenu académique.
    Supporte différents types de contenu : plan, bibliographie, introduction, sections, conclusion.
    """
    agent = WriterAgent()
    input_data = WriterInput(
        thesis_subject=request.thesis_subject,
        problematic=request.problematic,
        topic=request.topic,
        content_type=request.content_type,
        section_type=request.section_type,
        mode=request.mode,
        previous_content=request.previous_content,
        key_points=request.key_points,
        style_preferences=request.style_preferences,
        target_audience=request.target_audience
    )
    result = await agent.generate_draft(input_data)
    return result
