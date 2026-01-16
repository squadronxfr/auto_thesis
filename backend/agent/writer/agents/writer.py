import json
from .base import BaseAgent, AgentConfig
from .writer_schema import WriterInput, DraftOutput, WriterMode, ContentType

class WriterAgent(BaseAgent):
    def __init__(self):
        # Configuration de base
        config = AgentConfig(
            name="AcademicWriter",
            role="Rédacteur Académique Expert",
            system_instruction="Tu es un rédacteur de thèse expert.",
            model_name="gemini-2.5-flash", 
            temperature=0.7 
        )
        super().__init__(config)

    def _get_system_prompt(self, mode: WriterMode) -> str:
        """
        Sélectionne la personnalité selon le mode.
        Template modulaire pour faciliter les déclinaisons.
        """
        
        if mode == WriterMode.METHODOLOGIE:
            return """
            MODE ACTIVÉ : 🔬 MÉTHODOLOGIE SCIENTIFIQUE
            Ton objectif est de décrire COMMENT la recherche est menée.
            - Utilise un ton froid, objectif et précis.
            - Vocabulaire requis : "échantillon", "biais", "variables", "corrélation", "validité".
            - Structure : Approche → Collecte de données → Outils d'analyse.
            - Ne donne pas d'opinion, décris des faits et des procédures.
            """
            
        elif mode == WriterMode.PROBLEMATIQUE:
            return """
            MODE ACTIVÉ : ❓ PROBLÉMATISATION
            Ton objectif est de poser les fondations théoriques.
            - Formule des hypothèses claires (H1, H2...).
            - Identifie les lacunes de la littérature existante ("research gap").
            - Pose la Question de Recherche Centrale.
            - Ton : Interrogatif, analytique et critique.
            """
            
        elif mode == WriterMode.INTRODUCTION:
            return """
            MODE ACTIVÉ : 📖 INTRODUCTION ACADÉMIQUE
            Ton objectif est de rédiger une introduction captivante et structurée.
            - Commence par contextualiser le sujet dans son domaine.
            - Présente la problématique de manière progressive et claire.
            - Annonce la structure du mémoire et les objectifs de recherche.
            - Utilise un ton formel mais accessible.
            - Structure attendue : Contexte → Problématique → Objectifs → Plan
            """
            
        else: # WriterMode.GENERAL
            return """
            MODE ACTIVÉ : 📝 RÉDACTION ACADÉMIQUE STANDARD
            Ton objectif est de rédiger du contenu fluide et structuré.
            - Adopte un style formel (pas de "je", utilise "nous" ou le passif).
            - Connecte les idées avec des connecteurs logiques (En effet, Par conséquent...).
            - Assure une transition fluide avec le contexte précédent.
            """
    
    def _get_content_type_instructions(self, content_type: ContentType) -> str:
        """
        Retourne les instructions spécifiques selon le type de contenu.
        Template modulaire pour faciliter l'ajout de nouveaux types.
        """
        
        if content_type == ContentType.PLAN:
            return """
            TYPE DE CONTENU : 📋 PLAN DU MÉMOIRE
            - Génère une structure hiérarchique claire (H1, H2, H3).
            - Chaque section doit avoir un titre descriptif.
            - Indique brièvement le contenu attendu pour chaque section.
            - Format : Structure arborescente avec titres et sous-titres.
            """
            
        elif content_type == ContentType.BIBLIOGRAPHIE:
            return """
            TYPE DE CONTENU : 📚 BIBLIOGRAPHIE
            - Liste les sources utilisées dans un format académique standard (APA, MLA, etc.).
            - Organise par catégories si nécessaire (Livres, Articles, Sites web).
            - Inclus les informations complètes : Auteur, Titre, Date, Éditeur, etc.
            - Format : Liste structurée et ordonnée.
            """
            
        elif content_type == ContentType.INTRODUCTION:
            return """
            TYPE DE CONTENU : 🎯 INTRODUCTION
            - Structure classique : Contexte → Problématique → Objectifs → Plan
            - Longueur appropriée (généralement 5-10% du mémoire total).
            - Accroche le lecteur dès les premières lignes.
            - Annonce clairement la structure du document.
            """
            
        elif content_type == ContentType.CONCLUSION:
            return """
            TYPE DE CONTENU : 🏁 CONCLUSION
            - Synthétise les points clés développés dans le mémoire.
            - Répond à la problématique posée en introduction.
            - Présente les limites de la recherche.
            - Propose des perspectives et pistes de recherche futures.
            """
            
        else: # ContentType.SECTION
            return """
            TYPE DE CONTENU : 📄 SECTION DU MÉMOIRE
            - Développe le sujet de manière approfondie et structurée.
            - Respecte le niveau hiérarchique indiqué (H1, H2, H3).
            - Assure la cohérence avec le reste du document.
            """

    def _build_user_prompt(self, input_data: WriterInput) -> str:
        """
        Construit le prompt utilisateur de manière modulaire.
        Template réutilisable pour différentes déclinaisons.
        """
        prompt_parts = []
        
        # Informations principales du mémoire
        prompt_parts.append(f"SUJET DU MÉMOIRE : {input_data.thesis_subject}")
        prompt_parts.append(f"PROBLÉMATIQUE CENTRALE : {input_data.problematic}")
        
        # Informations spécifiques de la section
        prompt_parts.append(f"SUJET DE LA SECTION : {input_data.topic}")
        prompt_parts.append(f"TYPE DE CONTENU : {input_data.content_type.value}")
        prompt_parts.append(f"TYPE DE SECTION : {input_data.section_type.value}")
        
        # Points clés à traiter
        if input_data.key_points:
            prompt_parts.append(f"\nPOINTS CLÉS À TRAITER :")
            for i, point in enumerate(input_data.key_points, 1):
                prompt_parts.append(f"  {i}. {point}")
        
        # Contexte précédent pour la cohérence
        if input_data.previous_content:
            prompt_parts.append(f"\nCONTEXTE PRÉCÉDENT (pour la transition) :")
            prompt_parts.append(f'"{input_data.previous_content}"')
        else:
            prompt_parts.append(f"\nCONTEXTE PRÉCÉDENT : Aucun (Début de section)")
        
        # Personnalisations optionnelles
        if input_data.style_preferences:
            prompt_parts.append(f"\nPRÉFÉRENCES DE STYLE : {input_data.style_preferences}")
        
        if input_data.target_audience:
            prompt_parts.append(f"PUBLIC CIBLE : {input_data.target_audience}")
        
        prompt_parts.append(f"\nTÂCHE : Rédige ce contenu en respectant le mode et le type de contenu spécifiés.")
        prompt_parts.append("FORMAT DE SORTIE : JSON uniquement avec les clés 'content', 'word_count', 'sources_used', 'content_type' (optionnel), 'structure_hints' (optionnel).")
        
        return "\n".join(prompt_parts)
    
    def _build_full_system_prompt(self, input_data: WriterInput) -> str:
        """
        Construit le prompt système complet en combinant les différentes instructions.
        Template modulaire pour faciliter les personnalisations.
        """
        mode_instruction = self._get_system_prompt(input_data.mode)
        content_type_instruction = self._get_content_type_instructions(input_data.content_type)
        
        base_instruction = self.config.system_instruction
        
        # Instructions de format JSON
        json_instruction = """
IMPORTANT - FORMAT DE RÉPONSE JSON :
- Le champ 'sources_used' DOIT être une liste JSON (ex: ["source1", "source2"]), jamais une simple chaîne.
- Le champ 'word_count' DOIT être un nombre entier.
- Le champ 'content' DOIT contenir le texte rédigé complet.
- Les champs optionnels 'content_type' et 'structure_hints' peuvent être inclus si pertinent.
"""
        
        return f"{base_instruction}\n\n{mode_instruction}\n\n{content_type_instruction}\n{json_instruction}"
    
    async def generate_draft(self, input_data: WriterInput) -> DraftOutput:
        """
        Génère le texte en fonction du mode, du type de contenu et du contexte.
        Méthode principale modulaire et extensible.
        """
        
        # 1. Construction des prompts de manière modulaire
        full_system_prompt = self._build_full_system_prompt(input_data)
        user_prompt = self._build_user_prompt(input_data)
        
        try:
            # 2. Création du modèle avec le prompt système personnalisé
            temp_model = self._create_temp_model(full_system_prompt)
            
            # 3. Génération du contenu
            response = temp_model.generate_content(
                user_prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            # 4. Parsing et validation du JSON
            raw_data = json.loads(response.text)
            
            # 5. Correction automatique des erreurs communes
            raw_data = self._fix_common_errors(raw_data, input_data)
            
            # 6. Création de l'objet de sortie
            return DraftOutput(**raw_data)
            
        except json.JSONDecodeError as e:
            print(f"❌ Erreur de parsing JSON : {e}")
            return DraftOutput(
                content=f"Erreur de parsing JSON : {str(e)}",
                word_count=0,
                sources_used=[],
                content_type=input_data.content_type.value
            )
        except Exception as e:
            print(f"❌ Erreur Writer: {e}")
            return DraftOutput(
                content=f"Erreur de génération : {str(e)}",
                word_count=0,
                sources_used=[],
                content_type=input_data.content_type.value
            )
    
    def _fix_common_errors(self, raw_data: dict, input_data: WriterInput) -> dict:
        """
        Corrige les erreurs communes dans la réponse de l'IA.
        Template extensible pour ajouter d'autres corrections.
        """
        # Correction : sources_used doit être une liste
        if "sources_used" in raw_data and isinstance(raw_data["sources_used"], str):
            raw_data["sources_used"] = [raw_data["sources_used"]] if raw_data["sources_used"] else []
        
        # Correction : word_count doit être un entier
        if "word_count" in raw_data:
            try:
                raw_data["word_count"] = int(raw_data["word_count"])
            except (ValueError, TypeError):
                # Estimation basique si conversion échoue
                content = raw_data.get("content", "")
                raw_data["word_count"] = len(content.split())
        
        # Ajout du content_type si manquant
        if "content_type" not in raw_data:
            raw_data["content_type"] = input_data.content_type.value
        
        return raw_data

    def _create_temp_model(self, system_instruction):
        """Helper pour recharger le modèle avec un nouveau prompt système"""
        import google.generativeai as genai
        return genai.GenerativeModel(
            model_name=self.config.model_name,
            system_instruction=system_instruction
        )