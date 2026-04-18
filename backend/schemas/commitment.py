from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class CommitmentBase(BaseModel):
    owner: str
    owner_name: str
    description: str
    status: str = "Pending"
    due_date: Optional[datetime] = None
    priority: str = "Medium"
    is_critical: bool = False

class CommitmentCreate(CommitmentBase):
    meeting_id: UUID

class CommitmentUpdate(BaseModel):
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    is_critical: Optional[bool] = None
    completed_at: Optional[datetime] = None

class CommitmentInDB(CommitmentBase):
    id: UUID
    meeting_id: UUID
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Commitment(CommitmentInDB):
    pass
