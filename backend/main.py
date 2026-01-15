from fastapi import FastAPI
# Imports du Juge
from agent.judge import JudgeAgent
from agent.judge_schema import JudgeInput

# Imports de l'Écrivain (Nouveau !)
from agent.writer import WriterAgent
from agent.writer_schema import WriterInput

app = FastAPI(title="AutoThesis API", version="2.1")

# --- ROUTE DU JUGE (EXISTANTE) ---
@app.post("/agent/judge/evaluate")
async def run_judge(input_data: JudgeInput):
    """
    Endpoint du Juge : Évalue une section déjà rédigée.
    """
    agent = JudgeAgent()
    result = await agent.evaluate_full_context(input_data)
    return result

# --- ROUTE DE L'ÉCRIVAIN (NOUVELLE) ---
@app.post("/agent/writer/generate")
async def run_writer(input_data: WriterInput):
    """
    Endpoint de l'Écrivain : Rédige une section selon un mode précis (Méthodo, Problématique...).
    """
    agent = WriterAgent()
    result = await agent.generate_draft(input_data)
    return result