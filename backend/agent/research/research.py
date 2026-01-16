import json
import google.generativeai as genai
from google.generativeai import protos
from backend.agent.artifact.base import AgentConfig
from backend.agent.mcp_client import MCPClient
from .research_schema import ResearchResult, Source
from typing import List, Dict


class ResearchAgent:
    def __init__(self):
        self.config = AgentConfig(
            name="AcademicResearcher",
            role="Chercheur Académique",
            system_instruction="""
            Tu es un chercheur académique expert en recherche documentaire.

            Ton rôle est d'analyser les sources web fournies et d'en extraire les plus pertinentes
            pour un mémoire universitaire.

            IMPORTANT : 
            - Évalue la pertinence de chaque source (score 1-10)
            - Extrait un résumé pertinent de chaque source
            - Identifie les mots-clés importants
            """,
            model_name="gemini-2.5-flash",
            temperature=0.3
        )

        self.mcp_client = MCPClient()

        self.result_function = protos.Tool(
            function_declarations=[
                protos.FunctionDeclaration(
                    name="return_research_results",
                    description="Retourne les résultats de recherche analysés",
                    parameters=protos.Schema(
                        type=protos.Type.OBJECT,
                        properties={
                            "sources_trouvees": protos.Schema(
                                type=protos.Type.ARRAY,
                                items=protos.Schema(
                                    type=protos.Type.OBJECT,
                                    properties={
                                        "titre": protos.Schema(type=protos.Type.STRING),
                                        "auteur": protos.Schema(type=protos.Type.STRING),
                                        "date": protos.Schema(type=protos.Type.STRING),
                                        "lien": protos.Schema(type=protos.Type.STRING),
                                        "resume": protos.Schema(type=protos.Type.STRING),
                                        "pertinence": protos.Schema(type=protos.Type.INTEGER)
                                    },
                                    required=["titre", "lien", "resume", "pertinence"]
                                )
                            ),
                            "nombre_sources": protos.Schema(type=protos.Type.INTEGER),
                            "mots_cles_utilises": protos.Schema(
                                type=protos.Type.ARRAY,
                                items=protos.Schema(type=protos.Type.STRING)
                            ),
                            "synthese": protos.Schema(type=protos.Type.STRING)
                        },
                        required=["sources_trouvees", "nombre_sources", "mots_cles_utilises", "synthese"]
                    )
                )
            ]
        )

        self.model = genai.GenerativeModel(
            model_name=self.config.model_name,
            system_instruction=self.config.system_instruction,
            tools=[self.result_function]
        )

    async def search_sources(
            self,
            sujet: str,
            problematique: str,
            plan: str,
            contraintes: str = ""
    ):
        print("Checking MCP server health...")
        mcp_healthy = await self.mcp_client.health_check()
        if not mcp_healthy:
            return {"error": "MCP server unavailable at http://localhost:3000"}

        print("MCP connected successfully")

        search_query = f"{sujet} {problematique}"
        if contraintes:
            search_query += f" {contraintes}"

        print(f"Searching MCP with query: {search_query}")

        mcp_response = await self.mcp_client.fetch_url_content(
            search_query=search_query,
            max_results=10,
            fetch_content=True
        )

        if not mcp_response.get('success'):
            error_msg = mcp_response.get('error', 'Unknown error')
            print(f"MCP fetch_url_content failed: {error_msg}")
            return {"error": f"MCP search failed: {error_msg}"}

        result_data = mcp_response.get('result', {})
        raw_sources = result_data.get('results', [])

        print(f"MCP found {len(raw_sources)} raw sources")

        if len(raw_sources) == 0:
            return {"error": "No sources found by MCP"}

        sources_text = self._format_sources_for_gemini(raw_sources)

        prompt = f"""
        --- CONTEXTE DE RECHERCHE ---
        Sujet : {sujet}
        Problématique : {problematique}
        Plan : {plan}
        {f"Contraintes : {contraintes}" if contraintes else ""}

        --- SOURCES TROUVÉES PAR MCP ---
        {sources_text}

        --- TA MISSION ---
        Analyse ces sources et retourne UNIQUEMENT les plus pertinentes pour le sujet.

        Pour chaque source :
        - Titre : extrait du contenu
        - Auteur : identifie l'auteur si possible (sinon "Auteur inconnu")
        - Date : extrait la date si possible (sinon "Date inconnue")
        - Lien : URL de la source
        - Résumé : résumé du contenu PERTINENT par rapport au sujet (100-200 mots)
        - Pertinence : score de 1 à 10 selon la pertinence pour le sujet

        Ne garde que les sources avec pertinence >= 6.

        Utilise la fonction 'return_research_results' pour retourner tes résultats.
        """

        try:
            print("Sending to Gemini for analysis...")
            response = await self.model.generate_content_async(prompt)

            if response.candidates and response.candidates[0].content.parts and response.candidates[0].content.parts[0].function_call:
                function_call = response.candidates[0].content.parts[0].function_call

                if function_call.name == "return_research_results":
                    args = dict(function_call.args)

                    sources_list = args.get('sources_trouvees', [])
                    for source in sources_list:
                        if source.get('auteur') is None:
                            source['auteur'] = "Auteur inconnu"
                        if source.get('date') is None:
                            source['date'] = "Date inconnue"

                    result_obj = ResearchResult(**args)
                    print(f"Analysis complete - {result_obj.nombre_sources} relevant sources found")
                    return result_obj
                else:
                    return {"error": f"Unexpected function called: {function_call.name}"}
            else:
                return {"error": "Gemini did not call any function", "text": response.text}

        except Exception as e:
            print(f"Exception in search_sources: {str(e)}")
            import traceback
            traceback.print_exc()
            return {"error": f"Error: {str(e)}"}

    def _format_sources_for_gemini(self, raw_sources: List[Dict]) -> str:
        formatted = []
        for i, source in enumerate(raw_sources, 1):
            title = source.get('title', f'Source {i}')
            url = source.get('url', '')
            content = source.get('content', '')

            formatted.append(f"""
            [SOURCE {i}]
            Title: {title}
            URL: {url}
            Content:
            {content[:2000]}...
            """)

        return "\n".join(formatted)

    async def close(self):
        await self.mcp_client.close()