import json

# Le point "." signifie "dans le même dossier que moi"
#from .base import BaseAgent, AgentConfig, AgentInput
#from .judge_schema import Verdict

#class JudgeAgent(BaseAgent):
 #   def __init__(self):
        # Configuration spécifique du Juge
  #      config = AgentConfig(
   #         name="AcademicJudge",
    #        role="Directeur de Thèse",
            # --- MODIFICATION DU PROMPT ICI ---
     #       system_instruction="""
      #      Tu es un professeur d'université expert et intransigeant.
       #     Ton rôle est d'évaluer des sections de mémoire.

        #    Critères : Rigueur, Style formel, Structure.

         #   Tu dois IMPERATIVEMENT répondre avec ce format JSON exact, sans rien ajouter d'autre :
          #  {
           #     "status": "REFUSE",  
            #    "score": 45,
             #   "reasoning": "Explication globale de la note...",
              #  "critiques": [
                #    {
               #         "point_negatif": "Le style est trop familier",
                 #       "suggestion": "Utiliser un vocabulaire académique"
                  #  }
                #]
            #}
            
            #Si le texte est parfait, mets "status": "VALIDE" et une liste "critiques" vide.
            #""",
            # ----------------------------------
            #temperature=0.1 
        #)
        #super().__init__(config)

    #async def evaluate_text(self, text_to_judge: str, context_requirements: str):
     #   """
      #  Méthode spécialisée pour le juge.
       # """
        #prompt = f"""
        #--- CONTEXTE ET CONSIGNES ---
        #Ce texte doit respecter la consigne suivante : {context_requirements}
        
        #--- TEXTE À ÉVALUER ---
        #{text_to_judge}
        
        #--- TA RÉPONSE ---
        #Analyse le texte et fournis ton verdict au format JSON.
        #"""

        # Appel à Gemini avec "Generation Config" pour forcer le JSON (Astuce Pro)
        #try:
         #   response = self.model.generate_content(
          #      prompt,
           #     generation_config={"response_mime_type": "application/json"}
            #)
            
            # On parse le texte JSON en objet Python
            #verdict_dict = json.loads(response.text)
            
            # On valide que ça correspond bien à notre schéma
            #verdict_obj = Verdict(**verdict_dict)
            
            #return verdict_obj
            
        #except Exception as e:
         #   return {"error": f"Erreur de jugement: {str(e)}"}




import json
from .base import BaseAgent, AgentConfig
from .judge_schema import JudgeInput, Verdict, SectionType

class JudgeAgent(BaseAgent):
    def __init__(self):
        # Configuration mise à jour pour le Juge Expert
        config = AgentConfig(
            name="AcademicJudgePro",
            role="Directeur de Thèse & Reviewer",
            system_instruction="""
            Tu es un auditeur académique expert.
            
            TA MISSION :
            Analyser le texte fourni selon le type de section, le contexte et les sources.
            
            FORMAT DE RÉPONSE OBLIGATOIRE (JSON STRICT) :
            Tu dois répondre UNIQUEMENT avec un JSON respectant EXACTEMENT ces clés en ANGLAIS :
            
            {
                "status": "REFUSE",  (ou "VALIDE" ou "A_REVOIR_MINEUR")
                "score": 45,         (Nombre entre 0 et 100)
                "strengths": ["Point fort 1", "Point fort 2"],
                "weaknesses": ["Point faible 1", "Point faible 2"],
                "critiques": [
                    {
                        "passage_concerne": "Le texte coupé...",
                        "type_erreur": "Cohérence",
                        "severity": "majeur",
                        "suggestion": "Reformuler ainsi..."
                    }
                ],
                "requires_rewrite": true
            }

            ATTENTION :
            - Garde les clés en ANGLAIS ("strengths", "weaknesses"...).
            - Ne traduis PAS les clés du JSON.
            - Le contenu des valeurs (le texte) doit être en FRANÇAIS.
            """,
            temperature=0.1,
            model_name="gemini-2.5-flash" # On force le modèle stable ici aussi au cas où
        )
        super().__init__(config)

    async def evaluate_full_context(self, input_data: JudgeInput) -> Verdict:
        """
        Méthode V2 : Prend en compte tout le contexte.
        """
        # Construction du Prompt Contextuel
        prompt = f"""
        === 📋 CONTEXTE ===
        SUJET : {input_data.thesis_topic}
        NIVEAU : {input_data.academic_level}
        SECTION : {input_data.section_type.value.upper()}
        RÉSUMÉ PRÉCÉDENT : "{input_data.previous_context_summary}"
        
        === 📝 TEXTE À JUGER ===
        "{input_data.text_to_judge}"
        
        === 📚 SOURCES ===
        {input_data.sources_provided}
        
        Réponds uniquement avec le JSON demandé.
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            # Nettoyage au cas où l'IA mettrait des ```json ... ```
            text_response = response.text.strip()
            if text_response.startswith("```"):
                text_response = text_response.strip("`").replace("json", "").strip()

            verdict_dict = json.loads(text_response)
            verdict_obj = Verdict(**verdict_dict)
            
            return verdict_obj
            
        except Exception as e:
            print(f"❌ Erreur critique du Juge : {str(e)}")
            # Pour le débogage, on affiche ce que l'IA a vraiment renvoyé
            try:
                print(f"🔍 Réponse brute IA : {response.text}")
            except:
                pass
                
            return Verdict(
                status="REFUSE",
                score=0,
                strengths=[],
                weaknesses=["Erreur technique de formatage IA"],
                critiques=[],
                requires_rewrite=True
            )