from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.auth.routes.router import user_router
from backend.agent.judge.router import judge_router
from backend.agent.research.router import research_router
from backend.mcp.router import router as mcp_router

app = FastAPI(
    title="Auto Thesis API",
    version="0.1.0",
    description="API for automating thesis writing"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_hosts_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(judge_router, prefix="/api/v1/judge", tags=["Agent Judge"])
app.include_router(research_router, prefix="/api/v1/research", tags=["Research"])
app.include_router(mcp_router, prefix="/api/v1/mcp", tags=["MCP Tools"])

@app.get("/")
def root():
    return {
        "message": "Auto Thesis API",
        "version": "0.1.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )