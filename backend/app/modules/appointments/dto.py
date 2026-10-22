from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .model import AppointmentStatusEnum

class AppointmentCreate(BaseModel):
    appointment_date: datetime
    doctor_id: Optional[int] = None

class AppointmentUpdate(BaseModel):
    status: Optional[AppointmentStatusEnum] = None
    prescription: Optional[str] = None
    clinical_notes: Optional[str] = None
    doctor_id: Optional[int] = None

class AppointmentResponse(BaseModel):
    appointment_id: int
    user_id: int
    appointment_date: datetime
    status: str
    prescription: Optional[str] = None
    clinical_notes: Optional[str] = None
    doctor_id: Optional[int] = None
    doctor_name: Optional[str] = None
    doctor_specialization: Optional[str] = None
    patient_name: Optional[str] = None
    patient_email: Optional[str] = None
    patient_reg_number: Optional[str] = None
    patient_department: Optional[str] = None
    patient_phone: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
