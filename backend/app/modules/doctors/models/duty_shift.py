from sqlalchemy import Column, Integer, Date, Time, DateTime, ForeignKey, Enum
from datetime import datetime, timezone
import enum
from app.core.base import Base

class ShiftStatusEnum(str, enum.Enum):
    scheduled = "scheduled"
    on_duty = "on_duty"
    completed = "completed"
    absent = "absent"

class DutyShift(Base):
    __tablename__ = "duty_shifts"

    shift_id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), index=True, nullable=False)
    shift_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(Enum(ShiftStatusEnum), index=True, default=ShiftStatusEnum.scheduled, nullable=False)
    created_at = Column(DateTime, index=True, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, index=True, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
