from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date, time

class DoctorBase(BaseModel):
    user_id: int
    specialization: Optional[str] = None
    is_available: bool = True

class DoctorCreate(DoctorBase):
    pass

class DoctorUpdate(BaseModel):
    specialization: Optional[str] = None
    is_available: Optional[bool] = None

class DoctorResponse(DoctorBase):
    doctor_id: int
    name: Optional[str] = None
    email: Optional[str] = None
    
    class Config:
        from_attributes = True

class DutyShiftCreate(BaseModel):
    doctor_id: int
    shift_date: date
    start_time: time
    end_time: time
    status: Optional[str] = "scheduled"

class DutyShiftUpdate(BaseModel):
    doctor_id: Optional[int] = None
    shift_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    status: Optional[str] = None

class DutyShiftResponse(BaseModel):
    shift_id: int
    doctor_id: int
    doctor_name: Optional[str] = None
    doctor_specialization: Optional[str] = None
    shift_date: date
    start_time: time
    end_time: time
    status: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
