from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from backend.api.dependencies import get_db
from backend.models.contact import Contact as ContactModel
from backend.schemas.contact import Contact, ContactCreate, ContactUpdate
from backend.utils.logger import logger

router = APIRouter(prefix="/contacts", tags=["Contacts"])

@router.get("/", response_model=List[Contact])
async def list_contacts(db: Session = Depends(get_db)):
    """
    Retrieves all contacts.
    """
    return db.query(ContactModel).all()

@router.post("/", response_model=Contact, status_code=status.HTTP_201_CREATED)
async def create_contact(payload: ContactCreate, db: Session = Depends(get_db)):
    """
    Registers a new contact profile.
    """
    contact = ContactModel(**payload.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    logger.info(f"Created new contact: {contact.name}")
    return contact

@router.get("/{contact_id}", response_model=Contact)
async def get_contact(contact_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieves a specific contact by ID.
    """
    contact = db.query(ContactModel).filter(ContactModel.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@router.patch("/{contact_id}", response_model=Contact)
async def update_contact(contact_id: UUID, payload: ContactUpdate, db: Session = Depends(get_db)):
    """
    Updates a contact's profile.
    """
    contact = db.query(ContactModel).filter(ContactModel.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(contact, key, value)
    
    db.commit()
    db.refresh(contact)
    return contact
