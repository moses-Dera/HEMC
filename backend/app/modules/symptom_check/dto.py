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
