import os
import httpx
from typing import Dict, Any, List, Optional
from backend.config import settings
from backend.utils.logger import logger

class HindsightService:
    def __init__(self, api_key: str = None, endpoint: str = None):
        self.api_key = api_key or settings.HINDSIGHT_API_KEY
        self.endpoint = endpoint or settings.HINDSIGHT_ENDPOINT
        if not self.api_key:
            logger.error("HINDSIGHT_API_KEY not found in settings")
            raise ValueError("HINDSIGHT_API_KEY is not set")
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def retain(self, contact_id: str, content: str, metadata: Dict[str, Any] = None):
        if self.api_key == "your_hindsight_api_key_here" or not self.api_key:
            logger.warning("Hindsight API key not set. Skipping retain.")
            return {"status": "mocked"}
            
        url = f"{self.endpoint}/retain"
        payload = {
            "subject": contact_id,
            "content": content,
            "metadata": metadata or {}
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, headers=self.headers, json=payload, timeout=5.0)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                logger.error(f"Hindsight retain failed: {e}")
                return {"status": "failed", "error": str(e)}

    async def recall(self, contact_id: str, query: str, limit: int = 5):
        if self.api_key == "your_hindsight_api_key_here" or not self.api_key:
            logger.warning("Hindsight API key not set. Skipping recall.")
            return []
            
        url = f"{self.endpoint}/recall"
        payload = {
            "subject": contact_id,
            "query": query,
            "limit": limit
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, headers=self.headers, json=payload, timeout=5.0)
                response.raise_for_status()
                return response.json().get("memories", [])
            except Exception as e:
                logger.error(f"Hindsight recall failed: {e}")
                return []

    async def reflect(self, contact_id: str, query: Optional[str] = None):
        if self.api_key == "your_hindsight_api_key_here" or not self.api_key:
            logger.warning("Hindsight API key not set. Skipping reflect.")
            return {"profile": "Mocked Profile Data"}
            
        url = f"{self.endpoint}/reflect"
        payload = {
            "subject": contact_id,
            "query": query or "Synthesize behavioral patterns and strategic preferences."
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, headers=self.headers, json=payload, timeout=5.0)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                logger.error(f"Hindsight reflect failed: {e}")
                return {"profile": "Mocked Profile Data"}
