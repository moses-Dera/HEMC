from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from datetime import datetime, timezone
import enum
from app.core.base import Base

class RoleEnum(str, enum.Enum):
    user = "user"
    bot = "bot"

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    message_id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.session_id"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    content = Column(Text, nullable=False)
    intent = Column(String, nullable=True)
    created_at = Column(DateTime, index=True, default=lambda: datetime.now(timezone.utc))
