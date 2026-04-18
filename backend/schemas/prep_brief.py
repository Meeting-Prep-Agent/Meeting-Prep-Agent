from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from uuid import UUID
from datetime import datetime

class PrepBriefBase(BaseModel):
    contact_id: UUID
    meeting_date: datetime
    last_meeting_summary: str
    recommended_strategy: str
    talking_points: List[str] = []
    red_flags: List[str] = []

class PrepBriefCreate(PrepBriefBase):
    pass

class PrepBriefInDB(PrepBriefBase):
    id: UUID
    open_commitments: List[Dict[str, Any]] = []
    behavioral_insights: Dict[str, Any] = {}
    generated_at: datetime

    class Config:
        from_attributes = True

class PrepBrief(PrepBriefInDB):
    pass
