import os
from groq import Groq
import json
from typing import List, Dict, Any, Optional
from backend.config import settings
from backend.utils.logger import logger

class GroqService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.GROQ_API_KEY
        if not self.api_key:
            logger.error("GROQ_API_KEY not found in settings")
            raise ValueError("GROQ_API_KEY is not set")
        self.client = Groq(api_key=self.api_key)
        self.models = {
            "FAST": "qwen-2.5-32b",
            "STRATEGIC": "llama-3.3-70b-specdec"
        }

    async def _run_completion(self, messages: List[Dict[str, str]], model_key: str = "FAST", json_mode: bool = True):
        model = self.models.get(model_key, self.models["FAST"])
        response = self.client.chat.completions.create(
            messages=messages,
            model=model,
            response_format={"type": "json_object"} if json_mode else None,
            temperature=0.1
        )
        content = response.choices[0].message.content
        return json.loads(content) if json_mode else content

    async def extract_meeting_data(self, transcript: str):
        prompt = """
        You are an expert business analyst. Extract structured data from this meeting transcript.
        Return ONLY a JSON object with:
        - summary: Concise recap
        - sentiment_score: -1.0 to 1.0
        - key_topics: List of strings
        - tone_analysis: Descriptive string (e.g. "Collaborative but slightly stressed")
        - commitments: List of { owner: "User"|"ContactName", description, due_date: ISO 8601 or null, priority: "High"|"Medium"|"Low" }
        - behavioral_signals: { 
            communication_style: "Analytical"|"Assertive"|"Amiable"|"Expressive",
            decision_pattern: "Descriptive string",
            hot_button_topics: ["topic1", ...],
            preferred_communication: "Email"|"Call"|"In-person"
          }
        """
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"Transcript: {transcript}"}
        ]
        return await self._run_completion(messages, model_key="FAST")

    async def generate_prep_brief(self, contact_profile: Dict, open_commitments: List, meeting_history: List, context: str = ""):
        prompt = """
        You are a professional meeting strategist. Generate a tactical preparation brief.
        Return ONLY a JSON object with:
        - last_meeting_summary: recap
        - recommended_strategy: 2-3 sentence approach
        - talking_points: ["Point 1", ...]
        - red_flags: ["Flag 1", ...] (e.g. overdue items)
        - success_factors: ["Factor 1", ...]
        """
        data_packet = {
            "contact_profile": contact_profile,
            "open_commitments": open_commitments,
            "meeting_history": meeting_history,
            "meeting_context": context
        }
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"Context Data: {json.dumps(data_packet)}"}
        ]
        return await self._run_completion(messages, model_key="STRATEGIC")
