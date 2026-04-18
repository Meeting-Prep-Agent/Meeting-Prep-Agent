from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from backend.api.dependencies import get_db
from backend.models.commitment import Commitment as CommitmentModel
from backend.schemas.commitment import Commitment, CommitmentUpdate
from backend.utils.logger import logger

router = APIRouter(prefix="/commitments", tags=["Commitments"])

@router.get("/", response_model=List[Commitment])
async def list_commitments(
    status: Optional[str] = None, 
    contact_id: Optional[UUID] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieves commitments with optional filtering by status and contact.
    """
    query = db.query(CommitmentModel)
    
    if status:
        query = query.filter(CommitmentModel.status == status)
    
    if contact_id:
        # Need to join with meeting to filter by contact_id
        from backend.models.meeting import Meeting as MeetingModel
        query = query.join(MeetingModel).filter(MeetingModel.contact_id == contact_id)
        
    return query.all()

@router.patch("/{commitment_id}", response_model=Commitment)
async def update_commitment(
    commitment_id: UUID, 
    payload: CommitmentUpdate, 
    db: Session = Depends(get_db)
):
    """
    Updates a commitment's status, due date, or priority.
    """
    commitment = db.query(CommitmentModel).filter(CommitmentModel.id == commitment_id).first()
    if not commitment:
        raise HTTPException(status_code=404, detail="Commitment not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(commitment, key, value)
        
    db.commit()
    db.refresh(commitment)
    return commitment
