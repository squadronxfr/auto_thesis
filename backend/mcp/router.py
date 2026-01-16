"""
MCP Tools Router
Expose all MCP tools in FastAPI Swagger documentation
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import requests
from backend.config import settings

router = APIRouter(
    prefix="/api/v1/mcp",
    tags=["MCP Tools"],
    responses={
        404: {"description": "MCP Server not found"},
        503: {"description": "MCP Server unavailable"}
    }
)

MCP_URL = getattr(settings, "MCP_URL", "http://localhost:3000")


@router.get("/tools", 
    summary="List all available MCP tools",
    description="Returns a list of all available Model Context Protocol tools with their documentation"
)
async def get_mcp_tools() -> Dict[str, Any]:
    """
    Get all available MCP tools
    
    Returns:
        - name: Tool name
        - description: What the tool does
        - parameters: Tool parameters and their types
    """
    try:
        response = requests.get(f"{MCP_URL}/tools", timeout=5)
        if response.status_code == 200:
            tools = response.json()
            return {
                "success": True,
                "tools_count": len(tools),
                "tools": tools,
                "mcp_url": MCP_URL
            }
        else:
            raise HTTPException(status_code=503, detail="MCP Server returned an error")
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503, 
            detail=f"MCP Server not accessible at {MCP_URL}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tools/{tool_name}",
    summary="Get specific MCP tool documentation",
    description="Returns detailed documentation for a specific MCP tool"
)
async def get_tool_detail(tool_name: str) -> Dict[str, Any]:
    """
    Get details for a specific MCP tool
    
    Args:
        tool_name: Name of the tool to get details for
        
    Returns:
        Tool documentation with parameters and examples
    """
    try:
        response = requests.get(f"{MCP_URL}/tools/{tool_name}", timeout=5)
        if response.status_code == 200:
            tool = response.json()
            return {
                "success": True,
                "tool": tool
            }
        else:
            raise HTTPException(status_code=404, detail=f"Tool {tool_name} not found")
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="MCP Server not accessible")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health",
    summary="Check MCP Server health",
    description="Verify if the MCP Server is running and accessible"
)
async def mcp_health() -> Dict[str, Any]:
    """
    Check if MCP Server is healthy
    
    Returns:
        status: "healthy" or error message
    """
    try:
        response = requests.get(f"{MCP_URL}/health", timeout=5)
        if response.status_code == 200:
            return {
                "status": "healthy",
                "mcp_url": MCP_URL,
                "response": response.json()
            }
        else:
            return {
                "status": "unhealthy",
                "mcp_url": MCP_URL,
                "code": response.status_code
            }
    except requests.exceptions.ConnectionError:
        return {
            "status": "unreachable",
            "mcp_url": MCP_URL,
            "detail": "Cannot connect to MCP Server"
        }
    except Exception as e:
        return {
            "status": "error",
            "detail": str(e)
        }


@router.post("/tools/{tool_name}/execute",
    summary="Execute an MCP tool",
    description="Execute a specific MCP tool with provided parameters"
)
async def execute_tool(tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute a specific MCP tool
    
    Args:
        tool_name: Name of the tool to execute
        params: Parameters for the tool
        
    Returns:
        Tool execution result
    """
    try:
        response = requests.post(
            f"{MCP_URL}/tools/{tool_name}",
            json=params,
            timeout=30
        )
        result = response.json()
        return result
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Tool execution timed out")
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="MCP Server not accessible")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
