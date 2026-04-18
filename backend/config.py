import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "Meeting Prep Agent"
    APP_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # DATABASE
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/meeting_prep")
    
    # LLM & MEMORY
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    HINDSIGHT_API_KEY: str = os.getenv("HINDSIGHT_API_KEY")
    HINDSIGHT_ENDPOINT: str = os.getenv("HINDSIGHT_ENDPOINT", "https://api.hindsight.vectorize.io")
    
    # SECURITY
    CORS_ORIGINS: list = ["*"]

    class Config:
        case_sensitive = True

settings = Settings()
