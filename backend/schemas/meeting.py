from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime

class MeetingBase(BaseModel):
    contact_id: UUID
    date: Optional[datetime] = None
    transcript_raw: str

class MeetingCreate(MeetingBase):
    pass

class MeetingInDB(MeetingBase):
    id: UUID
    summary: Optional[str] = None
    sentiment_score: Optional[float] = None
    key_topics: List[str] = []
    tone_analysis: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Meeting(MeetingInDB):
    pass
