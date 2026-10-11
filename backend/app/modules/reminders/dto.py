from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReminderResponse(BaseModel):
    reminder_id: int
    appointment_id: int
    reminder_time: datetime
    message: str
    is_sent: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
