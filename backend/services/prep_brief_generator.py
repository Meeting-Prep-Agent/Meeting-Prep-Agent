from typing import List, Dict, Any
import uuid
import datetime
from sqlalchemy.orm import Session
from backend.models.contact import Contact
from backend.models.commitment import Commitment
from backend.models.prep_brief import PrepBrief
from backend.services.hindsight_service import HindsightService
from backend.services.groq_service import GroqService
from backend.utils.logger import logger

class PrepBriefGenerator:
    def __init__(self, db: Session):
        self.db = db
        self.hindsight = HindsightService()
        self.groq = GroqService()

    async def generate(self, contact_id: uuid.UUID, optional_context: str = "") -> PrepBrief:
        """
        Orchestrates the brief generation process.
        """
        # 1. Fetch Contact
        contact = self.db.query(Contact).filter(Contact.id == contact_id).first()
        if not contact:
            raise ValueError("Contact not found")

        # 2. Recall Historical Context
        logger.info(f"Recalling Hindsight context for {contact.name}")
        memories = await self.hindsight.recall(
            str(contact_id), 
            optional_context or "upcoming meeting strategy"
        )
        
        # 3. Gather Open Commitments
        # Join commitments to meetings to filter by contact_id
        open_commitments = self.db.query(Commitment).join(Commitment.meeting).filter(
            Commitment.meeting.has(contact_id=contact_id),
            Commitment.status == "Pending"
        ).all()
        
        # 4. Synthesize with Groq (Strategic Model)
        logger.info(f"Synthesizing brief via Groq for {contact.name}")
        brief_data = await self.groq.generate_prep_brief(
            contact_profile=contact.behavioral_profile,
            open_commitments=[{"desc": c.description, "owner": c.owner, "status": c.status} for c in open_commitments],
            meeting_history=[{"summary": m.get("summary"), "timestamp": m.get("metadata", {}).get("timestamp")} for m in memories],
            context=optional_context
        )
        
        # 5. Save and Return Brief
        brief = PrepBrief(
            id=uuid.uuid4(),
            contact_id=contact_id,
            meeting_date=datetime.datetime.utcnow(),
            last_meeting_summary=brief_data.get("last_meeting_summary", ""),
            open_commitments=[{"desc": c.description, "id": str(c.id)} for c in open_commitments],
            behavioral_insights=contact.behavioral_profile,
            recommended_strategy=brief_data.get("recommended_strategy", ""),
            talking_points=brief_data.get("talking_points", []),
            red_flags=brief_data.get("red_flags", []),
            generated_at=datetime.datetime.utcnow()
        )
        
        self.db.add(brief)
        self.db.commit()
        self.db.refresh(brief)
        
        return brief
