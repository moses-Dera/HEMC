from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EmailRequest(BaseModel):
    to_email: str
    subject: str
    body: str

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True
