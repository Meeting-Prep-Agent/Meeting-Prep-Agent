from sqlalchemy import Column, String, Integer, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
from backend.models.base import Base

class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    title = Column(String)
    company = Column(String, nullable=False)
    email = Column(String, unique=True)
    phone = Column(String)
    behavioral_profile = Column(JSON, default={})
    interaction_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    meetings = relationship("Meeting", back_populates="contact", cascade="all, delete-orphan")
    prep_briefs = relationship("PrepBrief", back_populates="contact", cascade="all, delete-orphan")
