from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

# --- 0. Types de sections ---
class SectionType(str, Enum):
    H1 = "H1"  # Titre principal
    H2 = "H2"  # Sous-titre niveau 2
    H3 = "H3"  # Sous-titre niveau 3
    PARAGRAPH = "paragraph"  # Paragraphe simple

# --- 1. Types de contenu à générer ---
class ContentType(str, Enum):
    PLAN = "plan"                    # Plan du mémoire
    BIBLIOGRAPHIE = "bibliographie"  # Bibliographie avec sources
    INTRODUCTION = "introduction"    # Introduction du mémoire
    SECTION = "section"              # Section du mémoire
    CONCLUSION = "conclusion"        # Conclusion du mémoire

# --- 2. Les Modes de Rédaction (template pour déclinaisons) ---
class WriterMode(str, Enum):
    METHODOLOGIE = "methodologie"   # Focus: Rigueur, outils, validité
    PROBLEMATIQUE = "problematique" # Focus: Hypothèses, cadre théorique
    INTRODUCTION = "introduction"   # Focus: Introduction académique
    GENERAL = "redaction_generale"  # Focus: Style académique standard

# --- 3. Ce que l'Écrivain reçoit (Input) ---
class WriterInput(BaseModel):
    # Informations principales du mémoire
    thesis_subject: str = Field(..., description="Le sujet global du mémoire")
    problematic: str = Field(..., description="La problématique centrale du mémoire")
    
    # Informations spécifiques de la section à rédiger
    topic: str = Field(..., description="Le sujet spécifique de cette section")
    content_type: ContentType = Field(default=ContentType.SECTION, description="Type de contenu à générer")
    section_type: SectionType = Field(default=SectionType.PARAGRAPH, description="Type de section (H1, H2...)")
    mode: WriterMode = Field(..., description="Le mode de rédaction à activer")
    
    # Contexte optionnel (pour la cohérence)
    previous_content: Optional[str] = Field(None, description="Ce qui a été écrit juste avant")
    key_points: List[str] = Field(default_factory=list, description="Liste des points clés à aborder obligatoirement")
    
    # Paramètres optionnels pour personnalisation (template pour déclinaisons)
    style_preferences: Optional[str] = Field(None, description="Préférences de style (académique, vulgarisé, etc.)")
    target_audience: Optional[str] = Field(None, description="Public cible (chercheurs, étudiants, grand public)")

# --- 4. Ce que l'Écrivain produit (Output) ---
class DraftOutput(BaseModel):
    content: str = Field(..., description="Le texte rédigé")
    word_count: int = Field(..., description="Nombre de mots approximatif")
    # Il auto-déclare ses sources (pour que le Juge vérifie plus tard)
    sources_used: List[str] = Field(default_factory=list, description="Sources citées dans le texte")
    # Métadonnées supplémentaires pour faciliter le traitement
    content_type: Optional[str] = Field(None, description="Type de contenu généré (pour validation)")
    structure_hints: Optional[List[str]] = Field(None, description="Indices sur la structure générée (pour plan, bibliographie)")