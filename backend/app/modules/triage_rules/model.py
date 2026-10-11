from sqlalchemy import Column, JSON, Integer, String, Boolean, DateTime, ForeignKey, Enum
from datetime import datetime, timezone
import enum
from app.core.base import Base

class ConditionTypeEnum(str, enum.Enum):
    red_flag = "red_flag"
    duration_threshold = "duration_threshold"

class RuleOutcomeEnum(str, enum.Enum):
    urgent = "urgent"
    book = "book"
    self_care = "self_care"

class TriageRule(Base):
    __tablename__ = "triage_rules"

    rule_id = Column(Integer, primary_key=True, index=True)
    condition_type = Column(Enum(ConditionTypeEnum), nullable=False)
    label = Column(String, nullable=False)
    value = Column(String, nullable=True)
    outcome = Column(Enum(RuleOutcomeEnum), nullable=False)
    vector = Column(JSON, nullable=True)
    active = Column(Boolean, default=True)
    updated_at = Column(DateTime, index=True, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    updated_by = Column(Integer, ForeignKey("users.id"), index=True)
