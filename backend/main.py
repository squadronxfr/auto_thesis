# Dans main.py
#from fastapi import FastAPI
#from agents.judge import JudgeAgent
#from pydantic import BaseModel

#app = FastAPI()

# Modèle pour tester l'API
#class JudgeRequest(BaseModel):
 #   draft_text: str
  #  requirements: str

#@app.post("/agents/judge/evaluate")
#async def run_judge(request: JudgeRequest):
 #   agent = JudgeAgent()
    # On lance l'évaluation
  #  result = await agent.evaluate_text(request.draft_text, request.requirements)
   # return result




from fastapi import FastAPI
# Correction ici : on utilise "agent" (singulier) partout
from agent.judge import JudgeAgent
from agent.judge_schema import JudgeInput

app = FastAPI(title="AutoThesis API", version="2.0")

# J'ai aussi corrigé la route pour qu'elle soit cohérente : /agent/...
@app.post("/agent/judge/evaluate")
async def run_judge(input_data: JudgeInput):
    """
    Endpoint V2 du Juge.
    Attend un objet JSON complet avec le texte, le type de section, le contexte et les sources.
    """
    agent = JudgeAgent()
    
    # On appelle la nouvelle méthode intelligente "evaluate_full_context"
    result = await agent.evaluate_full_context(input_data)
    
    return result