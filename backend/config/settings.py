from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore" # Permet d'ignorer les variables du .env qui ne sont pas déclarées ici
    )

    # Ces variables DOIVENT être dans le .env (sinon erreur au démarrage)
    SECRET_KEY: str
    GEMINI_API_KEY: str
    DATABASE_URL: str
    HOST: str
    PORT: int
    ALGORITHM: str
    ALLOWED_HOSTS: str = "" # Valeur par défaut vide si absent
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 jour

    # Variables spécifiques à la DB (lues depuis le .env)
    DATABASE_PORT: int
    DATABASE_NAME: str
    DATABASE_USER: str
    DATABASE_PASSWORD: str
    
    # Ce champ n'est pas dans votre .env, on lui donne une valeur par défaut
    DATABASE_HOST: str = "localhost" 
    
    MCP_URL: str = "http://localhost:3000"
    SSL: bool = False
    GEMINI_MODEL_NAME: str
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""

    @property
    def allowed_hosts_list(self) -> List[str]:
        if not self.ALLOWED_HOSTS:
            return ["*"]
        return [h.strip() for h in self.ALLOWED_HOSTS.split(",") if h.strip()]

settings = Settings()