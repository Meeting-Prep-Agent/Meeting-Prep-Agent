from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any
from backend.api.dependencies import get_db
from backend.services.groq_service import GroqService
from backend.services.hindsight_service import HindsightService
from backend.models.contact import Contact
from backend.models.meeting import Meeting
from backend.utils.logger import logger

router = APIRouter(prefix="/agent", tags=["Intelligence Agent"])

class ChatRequest(BaseModel):
    contact_id: str
    message: str

class ChatResponse(BaseModel):
    role: str
    content: str

@router.post("/chat", response_model=ChatResponse)
async def agent_chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Synthesizes real meeting preparation advice using:
    1. Hindsight long-term memory recall
    2. PostgreSQL recent meeting history
    3. Groq LLM completion
    """
    # 1. Fetch Contact from DB
    contact = db.query(Contact).filter(Contact.id == request.contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # 2. Fetch Recent Meetings from PostgreSQL
    meetings = db.query(Meeting).filter(Meeting.contact_id == request.contact_id)\
                 .order_by(Meeting.date.desc()).limit(5).all()
    
    history_context = "\n".join([f"- {m.date.strftime('%Y-%m-%d')}: {m.summary}" for m in meetings])

    # 3. Perform Hindsight Long-Term Memory Recall
    hindsight = HindsightService()
    hindsight_memories = []
    try:
        recalled = await hindsight.recall(str(contact.id), request.message, limit=5)
        if isinstance(recalled, list):
            hindsight_memories = recalled
    except Exception as e:
        logger.warning(f"Hindsight recall notice: {e}")

    memory_context = ""
    if hindsight_memories:
        memory_context = "\n".join([
            f"- Memory: {m.get('content', m.get('memory', str(m)))}" 
            if isinstance(m, dict) else f"- Memory: {m}" 
            for m in hindsight_memories
        ])
    
    # 4. Construct AI System Prompt
    prompt = f"""
    You are the "Hindsight Strategic Agent". You have access to the following historical intelligence for {contact.name} ({contact.title or ''} at {contact.company or ''}):
    
    Behavioral Profile:
    {contact.behavioral_profile}
    
    Recent Meeting History (PostgreSQL):
    {history_context if history_context else "No previous meetings recorded."}
    
    Long-Term Relationship Memories (Hindsight Memory Bank):
    {memory_context if memory_context else "No long-term memories recalled yet."}
    
    Your goal is to answer the user's question with strategic, high-leverage meeting preparation advice.
    Ground your recommendations directly in the historical facts, preferences, commitments, and concerns available above.
    Format your response cleanly using GitHub Markdown (use headers, bullet points, and bold text for readability).
    Keep it professional, concise, and tactical.
    """
    
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": request.message}
    ]
    
    # 5. Get Real AI Response via Groq
    groq = GroqService()
    try:
        ai_content = await groq._run_completion(messages, model_key="STRATEGIC", json_mode=False)
    except Exception as e:
        logger.error(f"Groq agent chat completion failed: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Groq AI Service Error: {str(e)}"
        )
    
    return ChatResponse(role="assistant", content=ai_content)
