import uuid
import json
from typing import Optional, Dict, Any, List

from backend.agent.workflow.state import WorkflowInput, WorkflowOutput
from backend.agent.workflow.exporter import WorkflowExporter

from backend.agent.judge.agents.judge import JudgeAgent
from backend.agent.research.research import ResearchAgent
from backend.agent.reecriture.agent_reecriture import AgentReecriture

try:
    from backend.agent.artifact.agents.artifact import ArtifactAgent
    from backend.agent.artifact.models.data_models import (
        Request,
        RequestStep,
        ActivityType,
        RequestStatus,
        DocumentType
    )
except Exception:
    ArtifactAgent = None
    Request = None
    RequestStep = None
    ActivityType = None
    RequestStatus = None
    DocumentType = None


class WorkflowRunner:
    def __init__(self, max_iterations: int = 3):
        self.max_iterations = max_iterations

        self.research_agent = ResearchAgent()
        self.judge_agent = JudgeAgent()
        self.rewrite_agent = AgentReecriture()

        self.exporter = WorkflowExporter()

        self.artifact_agent = ArtifactAgent() if ArtifactAgent else None


    async def _log_artifact_step(
            self,
            run_id: str,
            step_name: str,
            payload: Dict[str, Any],
            token_cost: int = 0,
            quality_score: float = 0.0
    ) -> Dict[str, Any]:

        artefact = {"step": step_name, "payload": payload}

        if not self.artifact_agent or not Request or not RequestStep:
            return artefact

        try:
            if run_id not in self.artifact_agent.memory_store:
                req = Request(
                    id=run_id,
                    name=f"auto_thesis_run_{run_id}",
                    status=RequestStatus.IN_PROGRESS
                )
                await self.artifact_agent.create_project_memory(req)

            # ✅ order_index obligatoire
            memory = self.artifact_agent.memory_store[run_id]
            order_index = memory.context.current_step

            # ✅ content doit être une string
            content_str = json.dumps(payload, ensure_ascii=False)

            step = RequestStep(
                id=str(uuid.uuid4()),
                request_id=run_id,
                name=step_name,
                agent_type=ActivityType.ARCHIVING,
                order_index=order_index,
                content=content_str,
                token_cost=token_cost,
                quality_score=quality_score
            )

            archived = await self.artifact_agent.archive_step(step)
            artefact["archived"] = archived
            return artefact

        except Exception as e:
            artefact["artifact_error"] = str(e)
            return artefact

    def _build_requirements(self, contraintes: str, plan: str) -> str:
        return f"""
Contraintes globales: {contraintes or "Aucune"}
Plan à respecter: {plan}

Critères:
- Ton académique formel
- Cohérence logique et structure
- Pas d'invention de faits
- Si des sources existent, respecter les citations ([SOURCE_1] etc.)
""".strip()

    def _extract_valid_source_ids(self, sources_obj: Dict[str, Any]) -> List[str]:
        """
        Rewriter veut une liste d'IDs valides ex: ["[SOURCE_1]", "[SOURCE_2]"]
        On mappe simplement la liste des sources trouvées.
        """
        if not sources_obj:
            return []

        sources = sources_obj.get("sources_trouvees", [])
        ids = []
        for i in range(len(sources)):
            ids.append(f"[SOURCE_{i+1}]")
        return ids

    async def run(
        self,
        workflow_input: WorkflowInput,
        texte_brouillon: Optional[str] = None
    ) -> WorkflowOutput:
        run_id = str(uuid.uuid4())
        out = WorkflowOutput(run_id=run_id)

        # ---- STEP 0 : input ----
        out.artefacts.append(await self._log_artifact_step(
            run_id,
            "INPUT",
            workflow_input.model_dump()
        ))

        # ---- STEP 1 : research (MCP + analyse Gemini) ----
        research_result = await self.research_agent.search_sources(
            sujet=workflow_input.sujet,
            problematique=workflow_input.problematique,
            plan=workflow_input.plan,
            contraintes=workflow_input.contraintes or ""
        )

        if isinstance(research_result, dict) and research_result.get("error"):
            out.sources = research_result
            out.artefacts.append(await self._log_artifact_step(
                run_id,
                "RESEARCH_ERROR",
                research_result
            ))
            return out

        out.sources = research_result.model_dump() if hasattr(research_result, "model_dump") else dict(research_result)

        out.artefacts.append(await self._log_artifact_step(
            run_id,
            "RESEARCH_OK",
            out.sources
        ))

        # Si pas de texte fourni, on s'arrête là (car pas d'agent Ecriture encore)
        if not texte_brouillon:
            return out

        out.texte_initial = texte_brouillon

        # ---- STEP 2 : boucle Judge -> Rewrite ----
        requirements = self._build_requirements(workflow_input.contraintes or "", workflow_input.plan)
        valid_source_ids = self._extract_valid_source_ids(out.sources)

        current_text = texte_brouillon

        for iteration in range(1, self.max_iterations + 1):
            out.iterations = iteration

            verdict_obj = await self.judge_agent.evaluate_text(
                text_to_judge=current_text,
                context_requirements=requirements
            )

            verdict = verdict_obj.model_dump() if hasattr(verdict_obj, "model_dump") else verdict_obj
            out.verdict = verdict

            out.artefacts.append(await self._log_artifact_step(
                run_id,
                f"JUDGE_ITER_{iteration}",
                verdict
            ))

            if isinstance(verdict, dict) and verdict.get("status") == "VALIDE":
                out.texte_final = current_text
                break

            critiques = verdict.get("critiques", []) if isinstance(verdict, dict) else []

            # Rewriter input (EntreeReecriture)
            try:
                from backend.agent.reecriture.rewrite_schema import EntreeReecriture
                entree = EntreeReecriture(
                    texte_brouillon=current_text,
                    critiques=critiques,
                    ids_sources_existantes=valid_source_ids,
                    contexte=f"Sujet: {workflow_input.sujet} | Problématique: {workflow_input.problematique}"
                )
            except Exception:
                # fallback brut si import schema plante
                return out

            rewrite_out = await self.rewrite_agent.reecrire(
                donnees_entree=entree,
                iteration=iteration,
                id_document=run_id
            )

            rewritten_text = rewrite_out.texte_reecrit if hasattr(rewrite_out, "texte_reecrit") else current_text
            current_text = rewritten_text

            out.artefacts.append(await self._log_artifact_step(
                run_id,
                f"REWRITE_ITER_{iteration}",
                rewrite_out.model_dump() if hasattr(rewrite_out, "model_dump") else {}
            ))

            out.texte_final = current_text

        # ---- STEP 3 : export markdown ----
        md = f"""# Mémoire (draft)

## Sujet
{workflow_input.sujet}

## Problématique
{workflow_input.problematique}

## Plan
{workflow_input.plan}

## Contraintes
{workflow_input.contraintes or "Aucune"}

---

## Sources retenues
{out.sources}

---

## Texte final
{out.texte_final or ""}
"""
        out.export_path = self.exporter.save_markdown(run_id, md)

        out.artefacts.append(await self._log_artifact_step(
            run_id,
            "EXPORT_MD",
            {"export_path": out.export_path}
        ))

        # close MCP client si besoin
        try:
            await self.research_agent.close()
        except Exception:
            pass

        return out