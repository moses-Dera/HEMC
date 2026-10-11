from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime, timezone
import enum
from app.core.base import Base

class CheckStatusEnum(str, enum.Enum):
    in_progress = "in_progress"
    completed = "completed"

class OutcomeEnum(str, enum.Enum):
    urgent = "urgent"
    book = "book"
    self_care = "self_care"

class SymptomCheck(Base):
    __tablename__ = "symptom_checks"

    check_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    status = Column(Enum(CheckStatusEnum), index=True, default=CheckStatusEnum.in_progress, nullable=False)
    fever_duration = Column(String, nullable=True)
    red_flags = Column(JSONB, nullable=True)
    outcome = Column(Enum(OutcomeEnum), nullable=True)
    timestamp = Column(DateTime, index=True, default=lambda: datetime.now(timezone.utc))
    notified_at = Column(DateTime, index=True, nullable=True)
    reviewed = Column(Boolean, default=False)
    reviewed_by = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    reviewed_at = Column(DateTime, index=True, nullable=True)
    contacted = Column(Boolean, default=False)
