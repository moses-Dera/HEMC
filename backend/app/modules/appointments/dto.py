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

class AppointmentResponse(BaseModel):
    appointment_id: int
    user_id: int
    appointment_date: datetime
    status: str
    prescription: Optional[str] = None
    clinical_notes: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_specialization: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
