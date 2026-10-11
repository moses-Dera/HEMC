from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class LogResponse(BaseModel):
    log_id: int
    user_id: int
    action: str
    intent: Optional[str] = None
    structured_payload: Optional[Dict[str, Any]] = None
    urgent_flag: bool
    timestamp: datetime
    
    class Config:
        from_attributes = True
