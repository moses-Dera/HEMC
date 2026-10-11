from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum
from datetime import datetime, timezone
import enum
from app.core.base import Base

class AssignmentStatusEnum(str, enum.Enum):
    active = "active"
    transferred = "transferred"
    completed = "completed"

class PatientAssignment(Base):
    __tablename__ = "patient_assignments"

    assignment_id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id"), index=True, unique=True, nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), index=True, nullable=False)
    assigned_at = Column(DateTime, index=True, default=lambda: datetime.now(timezone.utc))
    status = Column(Enum(AssignmentStatusEnum), index=True, default=AssignmentStatusEnum.active, nullable=False)
