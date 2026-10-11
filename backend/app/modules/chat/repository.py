from sqlalchemy.orm import Session
from .models.chat_session import ChatSession, ActiveFlowEnum
from .models.chat_message import ChatMessage

class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_active_session(self, user_id: int):
        # Just getting the latest session for simplicity, assuming active if recent
        session = self.db.query(ChatSession).filter(
            ChatSession.user_id == user_id
        ).order_by(ChatSession.last_active_at.desc()).first()
        
        if not session:
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
        msg = ChatMessage(session_id=session_id, user_id=user_id, role=role, content=content)
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg
        
    def get_session_with_messages(self, session_id: int):
        session = self.db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
        if session:
            session.messages = self.db.query(ChatMessage).filter(ChatMessage.session_id == session_id).all()
        return session
