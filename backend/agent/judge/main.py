1# Dans main.py
from fastapi import FastAPI
from agents.judge import JudgeAgent
from pydantic import BaseModel

app = FastAPI()

# Modèle pour tester l'API
class JudgeRequest(BaseModel):
    draft_text: str
    requirements: str

@app.post("/agents/judge/evaluate")
async def run_judge(request: JudgeRequest):
    agent = JudgeAgent()
    # On lance l'évaluation
    result = await agent.evaluate_text(request.draft_text, request.requirements)
    return result