import json
from .base import BaseAgent, AgentConfig
from .writer_schema import WriterInput, DraftOutput, WriterMode

class WriterAgent(BaseAgent):
    def __init__(self):
        # Configuration de base (le prompt changera dynamiquement)
        config = AgentConfig(
            name="AcademicWriter",
            role="Rédacteur Académique Expert",
            system_instruction="Tu es un rédacteur de thèse expert.",
            model_name="gemini-2.5-flash", # On utilise ta version puissante
            temperature=0.7 # Un peu de créativité pour l'écriture
        )
        super().__init__(config)

    def _get_system_prompt(self, mode: WriterMode) -> str:
        """Sélectionne la personnalité selon le mode"""
        
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
            
        else: # WriterMode.GENERAL
            return """
            MODE ACTIVÉ : 📝 RÉDACTION ACADÉMIQUE STANDARD
            Ton objectif est de rédiger du contenu fluide et structuré.
            - Adopte un style formel (pas de "je", utilise "nous" ou le passif).
            - Connecte les idées avec des connecteurs logiques (En effet, Par conséquent...).
            - Assure une transition fluide avec le contexte précédent.
            """

    async def generate_draft(self, input_data: WriterInput) -> DraftOutput:
        """Génère le texte en fonction du mode et du contexte"""
        
        # 1. On charge la bonne personnalité
        specific_instruction = self._get_system_prompt(input_data.mode)
        
        # 2. On construit le prompt utilisateur
        user_prompt = f"""
        CONTEXTE GLOBAL : {input_data.thesis_subject}
        SUJET DE LA SECTION : {input_data.topic}
        TYPE : {input_data.section_type.value}
        
        POINTS CLÉS À TRAITER :
        {json.dumps(input_data.key_points, ensure_ascii=False)}
        
        CONTEXTE PRÉCÉDENT (pour la transition) :
        "{input_data.previous_content if input_data.previous_content else 'Aucun (Début de section)'}"
        
        TÂCHE : Rédige cette section.
        FORMAT DE SORTIE : JSON uniquement avec cles 'content', 'word_count', 'sources_used'.
        """

        # 3. On met à jour l'instruction système temporairement pour cet appel
        # (Astuce : on concatène l'instruction de base + la spécifique)
        full_system_prompt = f"{self.config.system_instruction}\n\n{specific_instruction}\n\nRÉPONDS UNIQUEMENT EN JSON (DraftOutput)."

        try:
            # On recrée un modèle temporaire avec le bon prompt système
            # (C'est nécessaire car l'API Gemini lie le system prompt à l'objet model)
            temp_model = self._create_temp_model(full_system_prompt)
            
            response = temp_model.generate_content(
                user_prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            data = json.loads(response.text)
            return DraftOutput(**data)
            
        except Exception as e:
            print(f"❌ Erreur Writer: {e}")
            return DraftOutput(
                content="Erreur de génération.",
                word_count=0,
                sources_used=[]
            )

    def _create_temp_model(self, system_instruction):
        """Helper pour recharger le modèle avec un nouveau prompt système"""
        import google.generativeai as genai
        return genai.GenerativeModel(
            model_name=self.config.model_name,
            system_instruction=system_instruction
        )