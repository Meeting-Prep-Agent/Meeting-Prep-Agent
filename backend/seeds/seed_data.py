from backend.models.base import SessionLocal
from backend.models.contact import Contact
from backend.models.meeting import Meeting
from backend.models.commitment import Commitment
import uuid
import datetime

def seed():
    db = SessionLocal()
    try:
        # 1. Create Sample Contact
        contact = Contact(
            id=uuid.uuid4(),
            name="John Doe",
            title="CEO",
            company="Innovate Solutions",
            email="john@innovate.com",
            behavioral_profile={
                "communication_style": "Assertive",
                "decision_pattern": "Prefers data-driven summaries but makes quick final calls.",
                "hot_button_topics": ["Q3 growth", "customer retention"],
                "intelligence_confidence": 0.8
            }
        )
        db.add(contact)
        db.commit()
        db.refresh(contact)

        # 2. Create Sample Meeting
        meeting = Meeting(
            id=uuid.uuid4(),
            contact_id=contact.id,
            date=datetime.datetime.utcnow() - datetime.timedelta(days=7),
            transcript_raw="John: We need to scale the team. User: Agreed, I'll send the budget. John: Priority is HR tech.",
            summary="Strategic alignment on team scaling and HR tech priorities.",
            sentiment_score=0.6,
            key_topics=["scaling", "HR tech", "budget"],
            tone_analysis="Collaborative & Focused"
        )
        db.add(meeting)
        db.commit()
        db.refresh(meeting)

        # 3. Create Sample Commitment
        commitment = Commitment(
            id=uuid.uuid4(),
            meeting_id=meeting.id,
            owner="User",
            owner_name="Agent User",
            description="Send Q3 budget proposal for HR tech scaling.",
            status="Pending",
            due_date=datetime.datetime.utcnow() + datetime.timedelta(days=2),
            priority="High",
            is_critical=True
        )
        db.add(commitment)
        db.commit()

        print("Database successfully seeded with sample data.")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
