from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
from backend.models.base import Base

class Meeting(Base):
    __tablename__ = "meetings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id"))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    transcript_raw = Column(Text)
    summary = Column(Text)
    sentiment_score = Column(Float)
    key_topics = Column(JSON, default=[])
    tone_analysis = Column(String)
    # embedding = Column(Vector(1536)) # requires pgvector extension and type
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    contact = relationship("Contact", back_populates="meetings")
    commitments = relationship("Commitment", back_populates="meeting", cascade="all, delete-orphan")
