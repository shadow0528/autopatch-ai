from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "AutoPatch AI Agent"
    API_V1_STR: str = "/api/v1"
    
    # Environment variable overrides
    SERVER_HOST: str = os.getenv("AUTOPATCH_SERVER_HOST", "0.0.0.0")
    SERVER_PORT: int = int(os.getenv("AUTOPATCH_SERVER_PORT", 8000))
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./autopatch.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback-dev-key")
    
    class Config:
        case_sensitive = True

settings = Settings()
