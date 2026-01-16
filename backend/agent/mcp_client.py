import httpx
from typing import List, Dict, Any, Optional
from backend.config.settings import settings

class MCPClient:
    def __init__(self, base_url: str = settings.MCP_URL):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=600.0)  #10 minutes timeout

    async def health_check(self) -> bool:
        try:
            response = await self.client.get(f"{self.base_url}/health")
            return response.status_code == 200
        except Exception:
            return False

    async def fetch_url_content(
            self,
            search_query: str,
            max_results: int = 5,
            fetch_content: bool = True
    ) -> Dict[str, Any]:
        try:
            response = await self.client.post(
                f"{self.base_url}/tools/fetch_url_content",
                json={
                    "search_query": search_query,
                    "max_results": max_results,
                    "fetch_content": fetch_content
                }
            )
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def read_pdf(self, file_path: str) -> Dict[str, Any]:
        try:
            response = await self.client.post(
                f"{self.base_url}/tools/read_pdf",
                json={"file_path": file_path}
            )
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def append_to_file(self, file_path: str, content: str) -> Dict[str, Any]:
        try:
            response = await self.client.post(
                f"{self.base_url}/tools/append_to_file",
                json={"file_path": file_path, "content": content}
            )
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def generate_pdf(
            self,
            file_path: str,
            content: str,
            title: str = "Document"
    ) -> Dict[str, Any]:
        """Generate PDF from markdown content"""
        try:
            response = await self.client.post(
                f"{self.base_url}/tools/generate_pdf",
                json={
                    "file_path": file_path,
                    "content": content,
                    "title": title
                }
            )
            return response.json()
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def close(self):
        await self.client.aclose()