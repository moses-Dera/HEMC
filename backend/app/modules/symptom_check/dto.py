from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SymptomCheckStart(BaseModel):
    initial_symptom: str

class SymptomCheckResponse(BaseModel):
    check_id: int
    user_id: int
    fever_duration: Optional[str] = None
    status: str
    outcome: Optional[str] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True

class SymptomCheckAnswer(BaseModel):
    question: str
    answer: str

class AdminUrgentCheckResponse(BaseModel):
    check_id: int
    user_id: int
    patient_name: str
    patient_email: str
    patient_phone: Optional[str] = None
    patient_reg_number: Optional[str] = None
    patient_department: Optional[str] = None
    patient_level: Optional[str] = None
    patient_hostel: Optional[str] = None
    patient_emergency_contact: Optional[str] = None
    fever_duration: Optional[str] = None
    red_flags: Optional[list] = None
    outcome: str
    reviewed: bool = False
    contacted: bool = False
    reviewed_at: Optional[datetime] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class UrgentStatusUpdateRequest(BaseModel):
    reviewed: Optional[bool] = None
    contacted: Optional[bool] = None
