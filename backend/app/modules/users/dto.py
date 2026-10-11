from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    reg_number: Optional[str] = None
    department: Optional[str] = None
    level: Optional[str] = None
    phone_number: Optional[str] = None
    blood_group: Optional[str] = None
    genotype: Optional[str] = None
    allergies: Optional[str] = None
    emergency_contact: Optional[str] = None
    hostel: Optional[str] = None
    specialization: Optional[str] = None
    is_on_duty: Optional[bool] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    level: Optional[str] = None
    reg_number: Optional[str] = None
    phone_number: Optional[str] = None
    blood_group: Optional[str] = None
    genotype: Optional[str] = None
    allergies: Optional[str] = None
    emergency_contact: Optional[str] = None
    hostel: Optional[str] = None
    password: Optional[str] = None

class AdminUserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    department: Optional[str] = None
    level: Optional[str] = None
    reg_number: Optional[str] = None
    phone_number: Optional[str] = None
    blood_group: Optional[str] = None
    genotype: Optional[str] = None
    allergies: Optional[str] = None
    emergency_contact: Optional[str] = None
    hostel: Optional[str] = None
    specialization: Optional[str] = None
    password: Optional[str] = None

class AdminUserCreateRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"
    department: Optional[str] = None
    level: Optional[str] = None
    reg_number: Optional[str] = None
    phone_number: Optional[str] = None
    blood_group: Optional[str] = None
    genotype: Optional[str] = None
    allergies: Optional[str] = None
    emergency_contact: Optional[str] = None
    hostel: Optional[str] = None
    specialization: Optional[str] = None
