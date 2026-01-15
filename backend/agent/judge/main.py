# Dans main.py
from fastapi import FastAPI
from agents.judge import JudgeAgent
from pydantic import BaseModel

app = FastAPI()

# Modèle pour tester l'API
class JudgeRequest(BaseModel):
    draft_text: str
    requirements: str

@app.get("/")
async def root():
    return {"message": "Judge Agent is running."}

@app.post("/agents/judge/evaluate")
async def run_judge(request: JudgeRequest):
    agent = JudgeAgent()
    result = await agent.evaluate_text(request.draft_text, request.requirements)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)