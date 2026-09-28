import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Search and load .env from workspace root or current directory
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "Meeting Prep Agent"
    APP_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # DATABASE
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./meeting_prep.db")
    
    # LLM & MEMORY
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY", None)
    HINDSIGHT_API_KEY: Optional[str] = os.getenv("HINDSIGHT_API_KEY", None)
    HINDSIGHT_ENDPOINT: str = os.getenv("HINDSIGHT_ENDPOINT", "https://api.hindsight.vectorize.io")
    
    # SECURITY
    CORS_ORIGINS: list = ["*"]

    class Config:
        case_sensitive = True

settings = Settings()
