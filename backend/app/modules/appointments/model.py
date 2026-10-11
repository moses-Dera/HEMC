from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from datetime import datetime, timezone
import enum
from app.core.base import Base

class AppointmentStatusEnum(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"
    no_show = "no_show"

class Appointment(Base):
    __tablename__ = "appointments"

    appointment_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    appointment_date = Column(DateTime, index=True, nullable=False)
    status = Column(Enum(AppointmentStatusEnum), index=True, default=AppointmentStatusEnum.pending, nullable=False)
    prescription = Column(String, nullable=True)
    clinical_notes = Column(String, nullable=True)
    created_at = Column(DateTime, index=True, default=lambda: datetime.now(timezone.utc))
