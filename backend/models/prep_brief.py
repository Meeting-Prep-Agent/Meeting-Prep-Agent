from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
from backend.models.base import Base

class PrepBrief(Base):
    __tablename__ = "prep_briefs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id"))
    meeting_date = Column(DateTime)
    last_meeting_summary = Column(Text)
    open_commitments = Column(JSON, default=[])
    behavioral_insights = Column(JSON, default={})
    recommended_strategy = Column(Text)
    talking_points = Column(JSON, default=[])
    red_flags = Column(JSON, default=[])
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)

    contact = relationship("Contact", back_populates="prep_briefs")
