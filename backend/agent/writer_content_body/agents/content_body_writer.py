import json
from typing import Dict, List
from .base import BaseAgent, AgentConfig
from .content_body_schema import ContentBodyInput, ContentBodyOutput, ContentBodyMode
from google import genai
from google.genai import types

class ContentBodyWriterAgent(BaseAgent):
    """
    Agent spécialisé pour générer du contenu long (50 pages) pour un mémoire de thèse.
    Génère le contenu par chapitres pour gérer efficacement les limites de tokens.
    """
    
    def __init__(self):
        config = AgentConfig(
            name="ContentBodyWriter",
            role="Rédacteur de Contenu Long Académique",
            system_instruction="Tu es un rédacteur expert spécialisé dans la génération de contenu académique long et structuré pour des mémoires de thèse.",
            model_name="gemini-2.5-flash",
            temperature=0.7
        )
        super().__init__(config)
    
    def _get_system_prompt(self, mode: ContentBodyMode) -> str:
        """Sélectionne les instructions selon le mode de rédaction."""
        
        if mode == ContentBodyMode.METHODOLOGIE:
            return """
            MODE ACTIVÉ : MÉTHODOLOGIE SCIENTIFIQUE
            Ton objectif est de décrire en détail COMMENT la recherche est menée.
            - Utilise un ton froid, objectif et précis.
            - Développe chaque aspect méthodologique en profondeur.
            - Vocabulaire requis : "échantillon", "biais", "variables", "corrélation", "validité", "fiabilité".
            - Structure : Approche → Collecte de données → Outils d'analyse → Limites.
            - Ne donne pas d'opinion, décris des faits et des procédures.
            """
            
        elif mode == ContentBodyMode.PROBLEMATIQUE:
            return """
            MODE ACTIVÉ : PROBLÉMATISATION
            Ton objectif est de poser les fondations théoriques en profondeur.
            - Formule des hypothèses claires (H1, H2...).
            - Identifie les lacunes de la littérature existante ("research gap").
            - Pose la Question de Recherche Centrale.
            - Développe le cadre théorique de manière exhaustive.
            - Ton : Interrogatif, analytique et critique.
            """
            
        elif mode == ContentBodyMode.ANALYSE:
            return """
            MODE ACTIVÉ : ANALYSE DE DONNÉES
            Ton objectif est de présenter et analyser les résultats de manière approfondie.
            - Présente les données de manière structurée et claire.
            - Analyse les résultats en détail.
            - Utilise des tableaux, graphiques et statistiques si pertinent.
            - Interprète les résultats de manière objective.
            """
            
        elif mode == ContentBodyMode.DISCUSSION:
            return """
            MODE ACTIVÉ : DISCUSSION
            Ton objectif est de discuter et interpréter les résultats en profondeur.
            - Compare tes résultats avec la littérature existante.
            - Interprète les implications de tes résultats.
            - Discute des limites de l'étude.
            - Propose des perspectives de recherche futures.
            """
            
        else:  # ContentBodyMode.GENERAL
            return """
            MODE ACTIVÉ : RÉDACTION ACADÉMIQUE STANDARD
            Ton objectif est de rédiger du contenu fluide, structuré et approfondi.
            - Adopte un style formel (pas de "je", utilise "nous" ou le passif).
            - Connecte les idées avec des connecteurs logiques (En effet, Par conséquent...).
            - Assure une transition fluide entre les sections.
            - Développe chaque point en profondeur.
            """
    
    def _build_chapter_prompt(self, input_data: ContentBodyInput, chapter_title: str, chapter_index: int, total_chapters: int, previous_content: str = "") -> str:
        """Construit le prompt pour générer un chapitre spécifique."""
        
        prompt_parts = []
        prompt_parts.append(f"=== GÉNÉRATION DE CONTENU LONG POUR MÉMOIRE DE THÈSE ===")
        prompt_parts.append(f"\nSUJET DU MÉMOIRE : {input_data.thesis_subject}")
        prompt_parts.append(f"PROBLÉMATIQUE CENTRALE : {input_data.problematic}")
        prompt_parts.append(f"\n--- CHAPITRE {chapter_index}/{total_chapters} ---")
        prompt_parts.append(f"TITRE DU CHAPITRE : {chapter_title}")
        
        # Points clés spécifiques à ce chapitre
        if input_data.key_points_by_chapter and chapter_title in input_data.key_points_by_chapter:
            prompt_parts.append(f"\nPOINTS CLÉS À TRAITER DANS CE CHAPITRE :")
            for i, point in enumerate(input_data.key_points_by_chapter[chapter_title], 1):
                prompt_parts.append(f"  {i}. {point}")
        
        # Contexte des chapitres précédents
        if previous_content:
            prompt_parts.append(f"\nCONTEXTE DES CHAPITRES PRÉCÉDENTS (pour assurer la cohérence) :")
            prompt_parts.append(f'"{previous_content[:2000]}..."')  # Limiter pour éviter les tokens excessifs
        
        # Instructions de longueur
        words_per_chapter = (input_data.target_pages * 275) // total_chapters  # ~275 mots/page
        prompt_parts.append(f"\nLONGUEUR CIBLE : Environ {words_per_chapter} mots pour ce chapitre")
        prompt_parts.append(f"OBJECTIF : Développer ce chapitre en profondeur avec une structure claire (H1, H2, H3)")
        
        # Personnalisations
        if input_data.style_preferences:
            prompt_parts.append(f"\nPRÉFÉRENCES DE STYLE : {input_data.style_preferences}")
        if input_data.target_audience:
            prompt_parts.append(f"PUBLIC CIBLE : {input_data.target_audience}")
        
        prompt_parts.append(f"\nTÂCHE : Rédige ce chapitre complet en respectant le mode de rédaction spécifié.")
        prompt_parts.append("IMPORTANT : Utilise la fonction 'generate_chapter_content' pour retourner le contenu structuré.")
        
        return "\n".join(prompt_parts)
    
    def _get_function_declaration(self) -> dict:
        """Crée la déclaration de fonction pour l'appel de fonction Gemini."""
        return {
            "name": "generate_chapter_content",
            "description": "Génère le contenu complet d'un chapitre pour un mémoire de thèse. Retourne le texte rédigé avec sa structure et ses métadonnées.",
            "parameters": {
                "type": "object",
                "properties": {
                    "content": {
                        "type": "string",
                        "description": "Le contenu complet du chapitre rédigé avec structure H1, H2, H3"
                    },
                    "word_count": {
                        "type": "integer",
                        "description": "Nombre de mots dans ce chapitre"
                    },
                    "structure": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Structure hiérarchique du chapitre (titres H1, H2, H3)"
                    },
                    "sources_used": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Liste des sources citées dans ce chapitre"
                    }
                },
                "required": ["content", "word_count", "structure"]
            }
        }
    
    async def generate_content_body(self, input_data: ContentBodyInput) -> ContentBodyOutput:
        """
        Génère le contenu long (50 pages) en générant chaque chapitre séparément.
        """
        
        # 1. Déterminer les chapitres à générer
        if not input_data.chapter_titles:
            # Si aucun chapitre spécifié, créer une structure par défaut
            estimated_chapters = max(3, input_data.target_pages // 10)  # ~10 pages par chapitre
            input_data.chapter_titles = [
                f"Chapitre {i+1}" for i in range(estimated_chapters)
            ]
        
        total_chapters = len(input_data.chapter_titles)
        mode_instruction = self._get_system_prompt(input_data.mode)
        
        # 2. Configuration du client Gemini
        client = genai.Client(api_key=self._get_api_key())
        function_declaration = self._get_function_declaration()
        tools = types.Tool(function_declarations=[function_declaration])
        
        all_chapters = []
        all_sources = []
        all_structure = []
        total_word_count = 0
        previous_content = ""
        
        # 3. Générer chaque chapitre
        for idx, chapter_title in enumerate(input_data.chapter_titles, 1):
            print(f"Génération du chapitre {idx}/{total_chapters} : {chapter_title}")
            
            try:
                # Construire le prompt pour ce chapitre
                chapter_prompt = self._build_chapter_prompt(
                    input_data, chapter_title, idx, total_chapters, previous_content
                )
                
                # Configuration avec system instruction
                config = types.GenerateContentConfig(
                    tools=[tools],
                    system_instruction=f"{self.config.system_instruction}\n\n{mode_instruction}"
                )
                
                # Génération du chapitre
                response = client.models.generate_content(
                    model=self.config.model_name,
                    contents=chapter_prompt,
                    config=config
                )
                
                # Extraction de l'appel de fonction
                if not response.candidates or len(response.candidates) == 0:
                    raise Exception(f"Aucune réponse générée pour le chapitre {idx}")
                
                candidate = response.candidates[0]
                if not candidate.content or len(candidate.content.parts) == 0:
                    raise Exception(f"Aucune partie dans la réponse pour le chapitre {idx}")
                
                part = candidate.content.parts[0]
                
                # Vérifier si c'est un appel de fonction
                if hasattr(part, 'function_call') and part.function_call:
                    function_call = part.function_call
                    print(f"  Fonction appelée : {function_call.name}")
                    
                    # Extraire les arguments
                    if hasattr(function_call, 'args'):
                        if isinstance(function_call.args, dict):
                            chapter_data = function_call.args
                        elif hasattr(function_call.args, '__dict__'):
                            chapter_data = function_call.args.__dict__
                        else:
                            chapter_data = dict(function_call.args) if function_call.args else {}
                    else:
                        raise Exception(f"Aucun argument dans l'appel de fonction pour le chapitre {idx}")
                    
                    # Extraire les données du chapitre
                    chapter_content = chapter_data.get("content", "")
                    chapter_word_count = int(chapter_data.get("word_count", 0))
                    chapter_structure = chapter_data.get("structure", [])
                    chapter_sources = chapter_data.get("sources_used", [])
                    
                    # Stocker le chapitre
                    all_chapters.append({
                        "title": chapter_title,
                        "content": chapter_content,
                        "word_count": chapter_word_count,
                        "structure": chapter_structure
                    })
                    
                    total_word_count += chapter_word_count
                    all_structure.extend(chapter_structure)
                    all_sources.extend(chapter_sources)
                    
                    # Mettre à jour le contexte pour le prochain chapitre
                    previous_content += f"\n\n# {chapter_title}\n{chapter_content[:1000]}"
                    
                else:
                    # Fallback : parser le texte
                    print(f"  Pas d'appel de fonction pour le chapitre {idx}, parsing du texte...")
                    text_content = None
                    if hasattr(part, 'text') and part.text:
                        text_content = part.text
                    elif hasattr(response, 'text') and response.text:
                        text_content = response.text
                    
                    if text_content:
                        # Essayer de parser comme JSON
                        try:
                            chapter_data = json.loads(text_content)
                        except:
                            chapter_data = {"content": text_content, "word_count": len(text_content.split())}
                        
                        chapter_content = chapter_data.get("content", text_content)
                        chapter_word_count = int(chapter_data.get("word_count", len(chapter_content.split())))
                        
                        all_chapters.append({
                            "title": chapter_title,
                            "content": chapter_content,
                            "word_count": chapter_word_count,
                            "structure": []
                        })
                        total_word_count += chapter_word_count
                        previous_content += f"\n\n# {chapter_title}\n{chapter_content[:1000]}"
                    else:
                        raise Exception(f"Aucun contenu disponible pour le chapitre {idx}")
                
            except Exception as e:
                print(f"Erreur lors de la génération du chapitre {idx} : {e}")
                # Continuer avec les autres chapitres même en cas d'erreur
                all_chapters.append({
                    "title": chapter_title,
                    "content": f"[Erreur lors de la génération : {str(e)}]",
                    "word_count": 0,
                    "structure": []
                })
        
        # 4. Assembler tout le contenu
        full_content = "\n\n".join([
            f"# {ch['title']}\n\n{ch['content']}" for ch in all_chapters
        ])
        
        # 5. Calculer le nombre de pages estimé
        estimated_pages = total_word_count / 275.0  # ~275 mots par page
        
        # 6. Créer l'output
        return ContentBodyOutput(
            content=full_content,
            word_count=total_word_count,
            page_count=round(estimated_pages, 1),
            chapters=all_chapters,
            sources_used=list(set(all_sources)),  # Dédupliquer les sources
            structure=all_structure,
            content_type="content_body"
        )
    
    def _get_api_key(self) -> str:
        """Récupère la clé API depuis les settings"""
        from backend.config.settings import settings
        return settings.GEMINI_API_KEY
