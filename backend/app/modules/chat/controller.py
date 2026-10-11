from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.users.model import User
from .dto import ChatMessageRequest, ChatSessionResponse
from .service import ChatService
from .repository import ChatRepository
from .models.chat_session import ChatSession
from .models.chat_message import ChatMessage

router = APIRouter()

def get_chat_service(db: Session = Depends(get_db)):
    return ChatService(db)

def get_chat_repo(db: Session = Depends(get_db)):
    return ChatRepository(db)

@router.post("/message", response_model=ChatSessionResponse)
def send_message(req: ChatMessageRequest, user: User = Depends(get_current_user), service: ChatService = Depends(get_chat_service)):
    return service.process_message(user.id, req)

@router.post("/end")
def end_session(user: User = Depends(get_current_user), service: ChatService = Depends(get_chat_service)):
    return service.end_current_session(user.id)

@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_my_sessions(user: User = Depends(get_current_user), repo: ChatRepository = Depends(get_chat_repo)):
    """Return all chat sessions for the current user (for history page)."""
    sessions = repo.db.query(ChatSession).filter(
        ChatSession.user_id == user.id
    ).order_by(ChatSession.last_active_at.desc()).all()
    
    # Attach messages to each session
    for session in sessions:
        session.messages = repo.db.query(ChatMessage).filter(
            ChatMessage.session_id == session.session_id
        ).order_by(ChatMessage.created_at.asc()).all()
    
    return sessions

@router.post("/new")
def new_session(user: User = Depends(get_current_user), repo: ChatRepository = Depends(get_chat_repo)):
    """Start a fresh chat session."""
    from .models.chat_session import ChatSession, ActiveFlowEnum
    session = ChatSession(user_id=user.id)
    repo.db.add(session)
    repo.db.commit()
    repo.db.refresh(session)
    session.messages = []
    return session
