from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime, timezone
from app.core.base import Base

class Doctor(Base):
    __tablename__ = "doctors"

    doctor_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, unique=True, nullable=False)
    specialization = Column(String, nullable=False)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, index=True, default=lambda: datetime.now(timezone.utc))
