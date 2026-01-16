from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class WorkflowInput(BaseModel):
    sujet: str
    problematique: str
    plan: str
    contraintes: Optional[str] = ""


class WorkflowOutput(BaseModel):
    run_id: str

    sources: Optional[Dict[str, Any]] = None
    texte_initial: Optional[str] = None
    texte_final: Optional[str] = None

    verdict: Optional[Dict[str, Any]] = None
    iterations: int = 0

    artefacts: List[Dict[str, Any]] = Field(default_factory=list)
    export_path: Optional[str] = None