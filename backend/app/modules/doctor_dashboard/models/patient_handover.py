from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from datetime import datetime, timezone
import enum
from app.core.base import Base

class HandoverReasonEnum(str, enum.Enum):
    shift_end = "shift_end"
    specialist_review = "specialist_review"
    emergency_escalation = "emergency_escalation"
    workload_balancing = "workload_balancing"
    auto_shift_end = "auto_shift_end"
    emergency = "emergency"
    specialization = "specialization"
    other = "other"

class PatientHandover(Base):
    __tablename__ = "patient_handovers"

    handover_id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("patient_assignments.assignment_id"), index=True, nullable=False)
    from_doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), index=True, nullable=False)
    to_doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), index=True, nullable=False)
    reason = Column(Enum(HandoverReasonEnum), nullable=False)
    notes = Column(Text, nullable=True)
    handover_at = Column(DateTime, index=True, default=lambda: datetime.now(timezone.utc))
    acknowledged_at = Column(DateTime, index=True, nullable=True)
