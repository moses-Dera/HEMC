from sqlalchemy.orm import Session
from .models.chat_session import ChatSession, ActiveFlowEnum
from .models.chat_message import ChatMessage

class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_active_session(self, user_id: int):
        from datetime import datetime, timezone, timedelta
        
        session = self.db.query(ChatSession).filter(
            ChatSession.user_id == user_id
        ).order_by(ChatSession.last_active_at.desc()).first()
        
        # If a session exists, check if it was active within the last 2 hours
        if session and session.last_active_at:
            last_active = session.last_active_at
            if last_active.tzinfo is None:
                last_active = last_active.replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            if (now - last_active) < timedelta(hours=2):
                return session

        # Automatically start a new session for fresh consultations
        session = ChatSession(user_id=user_id)
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session
        
    def end_session(self, session_id: int):
        # We don't have an ended status, so we just clear the flow
        session = self.db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
        if session:
            session.active_flow = ActiveFlowEnum.none
            session.flow_state = {}
            self.db.commit()
            
    def add_message(self, session_id: int, user_id: int, role: str, content: str):
        from datetime import datetime, timezone
        msg = ChatMessage(session_id=session_id, user_id=user_id, role=role, content=content)
        self.db.add(msg)
        session = self.db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
        if session:
            session.last_active_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(msg)
        return msg
        
    def get_session_with_messages(self, session_id: int):
        session = self.db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
        if session:
            session.messages = self.db.query(ChatMessage).filter(ChatMessage.session_id == session_id).all()
        return session
