from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from .models.chat_session import ActiveFlowEnum

class ChatMessageRequest(BaseModel):
    content: str
    vector: Optional[List[float]] = None

class ChatMessageResponse(BaseModel):
    message_id: int
    session_id: int
    role: str
    content: str
    vector: Optional[List[float]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    session_id: int
    user_id: int
    active_flow: ActiveFlowEnum
    flow_state: Optional[Dict[str, Any]] = None
    started_at: datetime
    last_active_at: datetime
    messages: List[ChatMessageResponse] = []
    
    class Config:
        from_attributes = True
