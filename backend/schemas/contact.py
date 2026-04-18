from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

class ContactBase(BaseModel):
    name: str
    title: Optional[str] = None
    company: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    behavioral_profile: Optional[Dict[str, Any]] = None

class ContactInDB(ContactBase):
    id: UUID
    behavioral_profile: Dict[str, Any]
    interaction_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Contact(ContactInDB):
    pass
