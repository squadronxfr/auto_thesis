from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum

# --- Types de sections pour le contenu long ---
class SectionType(str, Enum):
    H1 = "H1"  # Titre principal (Chapitre)
    H2 = "H2"  # Sous-titre niveau 2 (Section)
    H3 = "H3"  # Sous-titre niveau 3 (Sous-section)

# --- Modes de rédaction pour contenu long ---
class ContentBodyMode(str, Enum):
    METHODOLOGIE = "methodologie"      # Focus: Rigueur, outils, validité
    PROBLEMATIQUE = "problematique"    # Focus: Hypothèses, cadre théorique
    ANALYSE = "analyse"                # Focus: Analyse de données, résultats
    DISCUSSION = "discussion"          # Focus: Interprétation, discussion
    GENERAL = "redaction_generale"     # Focus: Style académique standard

# --- Input pour la génération de contenu long ---
class ContentBodyInput(BaseModel):
    # Informations principales du mémoire
    thesis_subject: str = Field(..., description="Le sujet global du mémoire")
    problematic: str = Field(..., description="La problématique centrale du mémoire")
    
    # Structure du contenu à générer
    target_pages: int = Field(default=50, description="Nombre de pages cible (environ 250-300 mots par page)")
    chapter_titles: List[str] = Field(default_factory=list, description="Liste des titres de chapitres à développer")
    
    # Mode de rédaction
    mode: ContentBodyMode = Field(default=ContentBodyMode.GENERAL, description="Le mode de rédaction à activer")
    
    # Points clés à traiter dans chaque chapitre
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

# --- Output pour le contenu long généré ---
class ContentBodyOutput(BaseModel):
    content: str = Field(..., description="Le contenu complet rédigé (50 pages)")
    word_count: int = Field(..., description="Nombre de mots total généré")
    page_count: float = Field(..., description="Nombre de pages estimé (basé sur 250 mots/page)")
    chapters: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Liste des chapitres avec leur titre et contenu"
    )
    sources_used: List[str] = Field(
        default_factory=list,
        description="Sources citées dans le texte"
    )
    structure: List[str] = Field(
        default_factory=list,
        description="Structure hiérarchique générée (H1, H2, H3)"
    )
    content_type: str = Field(default="content_body", description="Type de contenu généré")
