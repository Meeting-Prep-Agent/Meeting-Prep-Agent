from fastapi import APIRouter
from backend.config import settings

router = APIRouter()

@router.get("/health", tags=["Infrastructure"])
async def health_check():
    """
    Checks the health of the API service.
    """
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }
