from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from backend.agent.workflow.runner import WorkflowRunner
from backend.agent.workflow.state import WorkflowInput, WorkflowOutput

workflow_router = APIRouter()


class WorkflowRunRequest(BaseModel):
    sujet: str
    problematique: str
    plan: str
    contraintes: Optional[str] = ""
    texte_brouillon: Optional[str] = None


@workflow_router.post("/run", response_model=WorkflowOutput)
async def run_workflow(request: WorkflowRunRequest):
    runner = WorkflowRunner(max_iterations=3)

    input_data = WorkflowInput(
        sujet=request.sujet,
        problematique=request.problematique,
        plan=request.plan,
        contraintes=request.contraintes or ""
    )

    result = await runner.run(
        workflow_input=input_data,
        texte_brouillon=request.texte_brouillon
    )
    return result