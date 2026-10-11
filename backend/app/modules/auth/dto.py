from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreateRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    reg_number: Optional[str] = None
    department: Optional[str] = None
    level: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
