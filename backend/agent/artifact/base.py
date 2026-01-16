import os
import google.generativeai as genai
from pydantic import BaseModel
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from backend.config.settings import settings

# Charge les variables d'environnement
load_dotenv()

# Configuration de Gemini


genai.configure(api_key=settings.GEMINI_API_KEY)

# Modèle de configuration pour un agent
class AgentConfig(BaseModel):
    name: str
    role: str
    system_instruction: str
    model_name: str = "gemini-2.5-flash"
    temperature: float = 0.7

# Modèle pour ce que l'utilisateur envoie
class AgentInput(BaseModel):
    user_input: str  # Le texte à analyser ou la commande
    context: Optional[Dict[str, Any]] = {}

class BaseAgent:
    def __init__(self, config: AgentConfig):
        self.config = config
        self.model = genai.GenerativeModel(
            model_name=self.config.model_name,
            system_instruction=self.config.system_instruction
        )
        print(f"✅ Agent {config.name} initialisé avec Gemini")
    
    async def process(self, input_data: AgentInput):
        """
        Méthode générique (utilisée si on n'a pas besoin de JSON strict)
        """
        full_prompt = f"""
        CONTEXTE: {input_data.context}
        TACHE: {input_data.user_input}
        """
        try:
            response = self.model.generate_content(full_prompt)
            return {"response": response.text}
        except Exception as e:
            return {"error": str(e)}