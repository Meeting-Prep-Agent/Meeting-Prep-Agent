from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
from backend.models.base import Base

class Commitment(Base):
    __tablename__ = "commitments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id"))
    owner = Column(String) # "User" or "Contact"
    owner_name = Column(String)
    description = Column(Text)
    status = Column(String, default="Pending") # Pending, Completed, Overdue, Cancelled
    due_date = Column(DateTime, nullable=True)
    priority = Column(String) # High, Medium, Low
    is_critical = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    meeting = relationship("Meeting", back_populates="commitments")
