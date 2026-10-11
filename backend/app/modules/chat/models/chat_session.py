from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime, timezone
import enum
from sqlalchemy import Enum
from app.core.base import Base

class ActiveFlowEnum(str, enum.Enum):
    none = "none"
    symptom_check = "symptom_check"
    booking = "booking"

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    session_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    active_flow = Column(Enum(ActiveFlowEnum), default=ActiveFlowEnum.none, nullable=False)
    flow_state = Column(JSONB, nullable=True)
    started_at = Column(DateTime, index=True, default=lambda: datetime.now(timezone.utc))
    last_active_at = Column(DateTime, index=True, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
