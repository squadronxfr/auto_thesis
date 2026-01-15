from fastapi import APIRouter
from pydantic import BaseModel
from backend.agent.judge.agents.judge import JudgeAgent

judge_router = APIRouter()

class JudgeRequest(BaseModel):
    draft_text: str
    requirements: str

@judge_router.post("/evaluate")
async def run_judge(request: JudgeRequest):
    agent = JudgeAgent()
    result = await agent.evaluate_text(request.draft_text, request.requirements)
    return result