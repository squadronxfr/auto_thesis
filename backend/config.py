import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    DATABASE_URL = os.getenv("DATABASE_URL", "")
    HOST = os.getenv("HOST", "127.0.0.1")
    PORT = int(os.getenv("PORT", 8000))
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "")
    ALLOWED_HOSTS = ALLOWED_HOSTS.split(",") if ALLOWED_HOSTS else []
    ALGORITHM = os.getenv("ALGORITHM", "")

Config = Config()