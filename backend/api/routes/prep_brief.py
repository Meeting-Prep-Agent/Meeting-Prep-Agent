from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from backend.api.dependencies import get_db
from backend.schemas.prep_brief import PrepBrief, PrepBriefBase
from backend.services.prep_brief_generator import PrepBriefGenerator
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/prep-brief", tags=["Preparation Briefs"])

class BriefRequest(BaseModel):
    contact_id: UUID
    optional_context: Optional[str] = ""

@router.post("/generate", response_model=PrepBrief, status_code=status.HTTP_201_CREATED)
async def generate_brief(payload: BriefRequest, db: Session = Depends(get_db)):
    """
    Triggers the generation of a tactical preparation brief for a contact.
    """
    generator = PrepBriefGenerator(db)
    try:
        brief = await generator.generate(
            contact_id=payload.contact_id, 
            optional_context=payload.optional_context
        )
        return brief
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@router.get("/{brief_id}", response_model=PrepBrief)
async def get_brief(brief_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieves a previously generated brief.
    """
    from backend.models.prep_brief import PrepBrief as PrepBriefModel
    brief = db.query(PrepBriefModel).filter(PrepBriefModel.id == brief_id).first()
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    return brief
