import json

# Le point "." signifie "dans le même dossier que moi"
from .base import BaseAgent, AgentConfig, AgentInput
from .judge_schema import Verdict

class JudgeAgent(BaseAgent):
    def __init__(self):
        # Configuration spécifique du Juge
        config = AgentConfig(
            name="AcademicJudge",
            role="Directeur de Thèse",
            # --- MODIFICATION DU PROMPT ICI ---
            system_instruction="""
            Tu es un professeur d'université expert et intransigeant.
            Ton rôle est d'évaluer des sections de mémoire.

            Critères : Rigueur, Style formel, Structure.

            Tu dois IMPERATIVEMENT répondre avec ce format JSON exact, sans rien ajouter d'autre :
            {
                "status": "REFUSE",  
                "score": 45,
                "reasoning": "Explication globale de la note...",
                "critiques": [
                    {
                        "point_negatif": "Le style est trop familier",
                        "suggestion": "Utiliser un vocabulaire académique"
                    }
                ]
            }
            
            Si le texte est parfait, mets "status": "VALIDE" et une liste "critiques" vide.
            """,
            # ----------------------------------
            temperature=0.1 
        )
        super().__init__(config)

    async def evaluate_text(self, text_to_judge: str, context_requirements: str):
        """
        Méthode spécialisée pour le juge.
        """
        prompt = f"""
        --- CONTEXTE ET CONSIGNES ---
        Ce texte doit respecter la consigne suivante : {context_requirements}
        
        --- TEXTE À ÉVALUER ---
        {text_to_judge}
        
        --- TA RÉPONSE ---
        Analyse le texte et fournis ton verdict au format JSON.
        """

        # Appel à Gemini avec "Generation Config" pour forcer le JSON (Astuce Pro)
        try:
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            # On parse le texte JSON en objet Python
            verdict_dict = json.loads(response.text)
            
            # On valide que ça correspond bien à notre schéma
            verdict_obj = Verdict(**verdict_dict)
            
            return verdict_obj
            
        except Exception as e:
            return {"error": f"Erreur de jugement: {str(e)}"}