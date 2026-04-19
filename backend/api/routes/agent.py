from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict
from backend.api.dependencies import get_db
from backend.services.groq_service import GroqService
from backend.services.hindsight_service import HindsightService
from backend.models.contact import Contact
from backend.models.meeting import Meeting

router = APIRouter(prefix="/agent", tags=["Intelligence Agent"])

class ChatRequest(BaseModel):
    contact_id: str
    message: str

class ChatResponse(BaseModel):
    role: str
    content: str

@router.post("/chat", response_model=ChatResponse)
async def agent_chat(request: ChatRequest, db: Session = Depends(get_db)):
    # 1. Fetch context
    contact = db.query(Contact).filter(Contact.id == request.contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    meetings = db.query(Meeting).filter(Meeting.contact_id == request.contact_id)\
                 .order_by(Meeting.date.desc()).limit(5).all()
    
    history_context = "\n".join([f"- {m.date.strftime('%Y-%m-%d')}: {m.summary}" for m in meetings])
    
    # 2. Prepare AI Prompt
    prompt = f"""
    You are the "Hindsight Strategic Agent". You have access to the following historical intelligence for {contact.name} ({contact.title} at {contact.company}):
    
    Behavioral Profile: {contact.behavioral_profile}
    
    Past Meeting History:
    {history_context}
    
    Your goal is to answer the user's question with strategic, high-leverage advice. 
    Keep it concise and professional. Use historical facts when possible.
    """
    
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": request.message}
    ]
    
    # 3. Get AI Response
    groq = GroqService()
    try:
        ai_content = await groq._run_completion(messages, model_key="STRATEGIC", json_mode=False)
    except Exception as e:
        ai_content = "Mocked AI Response: I'm currently operating in offline mode due to an API authentication error. However, based on the context, I advise preparing a structured overview of the past meetings."
    
    return ChatResponse(role="assistant", content=ai_content)
