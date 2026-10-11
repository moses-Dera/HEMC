from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime, timezone
from app.core.base import Base

class InteractionLog(Base):
    __tablename__ = "interaction_logs"

    log_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    action = Column(String(100), nullable=False)
    intent = Column(String, nullable=True)
    structured_payload = Column(JSONB, nullable=True)
    urgent_flag = Column(Boolean, default=False)
    timestamp = Column(DateTime, index=True, default=lambda: datetime.now(timezone.utc))
