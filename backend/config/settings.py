from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True
    )

    SECRET_KEY: str
    GEMINI_API_KEY: str
    DATABASE_URL: str
    HOST: str
    PORT: int
    ALGORITHM: str
    ALLOWED_HOSTS: str
    MCP_URL: str = "http://localhost:3000"
    DATABASE_HOST: str = "2.tcp.eu.ngrok.io"
    DATABASE_PORT: int = 19655
    DATABASE_NAME: str = "appdb"
    DATABASE_USER: str = "admin"
    DATABASE_PASSWORD: str = "admin"
    SSL: bool = False
    GEMINI_MODEL_NAME: str
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""

    @property
    def allowed_hosts_list(self) -> List[str]:
        return [h.strip() for h in self.ALLOWED_HOSTS.split(",") if h.strip()]


settings = Settings()