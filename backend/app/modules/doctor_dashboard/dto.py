from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, time
from .models.patient_handover import HandoverReasonEnum

class PatientAssignmentResponse(BaseModel):
    assignment_id: int
    appointment_id: int
    doctor_id: int
    assigned_at: datetime
    status: str
    patient_id: Optional[int] = None
    patient_name: Optional[str] = None
    patient_email: Optional[str] = None
    patient_department: Optional[str] = None
    patient_level: Optional[str] = None
    patient_reg_number: Optional[str] = None
    patient_phone: Optional[str] = None
    patient_blood_group: Optional[str] = None
    patient_genotype: Optional[str] = None
    patient_allergies: Optional[str] = None
    patient_hostel: Optional[str] = None
    patient_emergency_contact: Optional[str] = None
    appointment_date: Optional[datetime] = None
    appointment_status: Optional[str] = None
    triage_urgency: Optional[str] = "Routine"
    triage_summary: Optional[str] = None
    red_flags: Optional[List[str]] = None
    fever_duration: Optional[str] = None
    recent_chat_messages: Optional[List[dict]] = None
    symptom_check_id: Optional[int] = None
    prescription: Optional[str] = None
    clinical_notes: Optional[str] = None
    
    class Config:
        from_attributes = True

class HandoverCreate(BaseModel):
    assignment_id: int
    to_doctor_id: int
    reason: HandoverReasonEnum
    notes: Optional[str] = None

class HandoverResponse(BaseModel):
    handover_id: int
    assignment_id: int
    from_doctor_id: int
    to_doctor_id: int
    reason: HandoverReasonEnum
    notes: Optional[str]
    handover_at: datetime
    acknowledged_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class DoctorShiftDTO(BaseModel):
    shift_id: int
    doctor_id: int
    shift_date: date
    start_time: str
    end_time: str
    status: str

class DoctorOverviewResponse(BaseModel):
    doctor_id: int
    user_id: int
    name: str
    email: str
    specialization: str
    is_available: bool
    total_assigned: int
    pending_count: int
    confirmed_count: int
    completed_count: int
    shifts: List[DoctorShiftDTO] = []

class AppointmentStatusUpdateReq(BaseModel):
    appointment_id: int
    status: str # "confirmed", "completed", "cancelled"
    prescription: Optional[str] = None
    clinical_notes: Optional[str] = None

class AvailabilityUpdateReq(BaseModel):
    is_available: bool

