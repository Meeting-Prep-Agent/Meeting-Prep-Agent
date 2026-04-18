from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from backend.api.dependencies import get_db
from backend.models.contact import Contact as ContactModel
from backend.models.meeting import Meeting as MeetingModel
from backend.models.commitment import Commitment as CommitmentModel
from backend.schemas.meeting import Meeting, MeetingCreate
from backend.services.groq_service import GroqService
from backend.services.hindsight_service import HindsightService
from backend.services.commitment_extractor import CommitmentExtractor
from backend.services.behavioral_analyzer import BehavioralAnalyzer
from backend.utils.logger import logger
import uuid

router = APIRouter(prefix="/meetings", tags=["Meetings"])

@router.post("/upload", response_model=Meeting, status_code=status.HTTP_201_CREATED)
async def upload_meeting(
    payload: MeetingCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Processes a meeting transcript, extracts intelligence, and stores in memory.
    """
    # 1. Verify contact
    contact = db.query(ContactModel).filter(ContactModel.id == payload.contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # 2. Intelligence Extraction (LLM)
    groq = GroqService()
    extractor = CommitmentExtractor()
    analyzer = BehavioralAnalyzer()
    hindsight = HindsightService()
    
    logger.info(f"Extracting intelligence for meeting with {contact.name}")
    extracted = await groq.extract_meeting_data(payload.transcript_raw)
    
    # 3. Create Meeting
    meeting = MeetingModel(
        id=uuid.uuid4(),
        contact_id=payload.contact_id,
        date=payload.date,
        transcript_raw=payload.transcript_raw,
        summary=extracted.get("summary"),
        sentiment_score=extracted.get("sentiment_score"),
        key_topics=extracted.get("key_topics", []),
        tone_analysis=extracted.get("tone_analysis")
    )
    db.add(meeting)
    
    # 4. Extract and Store Commitments
    commitments_data = extractor.parse_commitments(extracted.get("commitments", []), meeting.id)
    for c_data in commitments_data:
        db.add(CommitmentModel(**c_data))

    # 5. Update Contact Behavioral Profile
    signals = extracted.get("behavioral_signals", {})
    contact.behavioral_profile = analyzer.update_profile(contact.behavioral_profile, signals)
    contact.interaction_count += 1
    
    db.commit()
    db.refresh(meeting)

    # 6. Retain in Hindsight (Background)
    background_tasks.add_task(
        hindsight.retain, 
        str(contact.id), 
        payload.transcript_raw, 
        {"meeting_id": str(meeting.id), "summary": meeting.summary}
    )

    logger.info(f"Meeting {meeting.id} successfully processed for {contact.name}")
    return meeting

@router.get("/history/{contact_id}", response_model=List[Meeting])
async def get_meeting_history(contact_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieves historical meetings for a contact.
    """
    return db.query(MeetingModel).filter(MeetingModel.contact_id == contact_id).order_by(MeetingModel.date.desc()).all()

@router.get("/{meeting_id}", response_model=Meeting)
async def get_meeting(meeting_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieves a specific meeting record.
    """
    meeting = db.query(MeetingModel).filter(MeetingModel.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting
