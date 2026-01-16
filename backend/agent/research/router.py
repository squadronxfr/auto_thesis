from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.agent.research.research import ResearchAgent
import traceback

research_router = APIRouter()


class ResearchRequest(BaseModel):
    sujet: str
    problematique: str
    plan: str
    contraintes: str = ""


@research_router.post("/search")
async def run_research(request: ResearchRequest):
    agent = None
    try:
        print("DEBUG: Debut de la recherche...")
        agent = ResearchAgent()
        print("DEBUG: Agent initialise")

        result = await agent.search_sources(
            sujet=request.sujet,
            problematique=request.problematique,
            plan=request.plan,
            contraintes=request.contraintes
        )

        print(f"DEBUG: Type resultat: {type(result)}")

        if isinstance(result, dict) and "error" in result:
            print(f"ERROR: Erreur detectee: {result['error']}")
            raise HTTPException(status_code=500, detail=result["error"])

        return result.dict()
    except Exception as e:
        print(f"ERROR: Exception complete:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if agent:
            await agent.close()