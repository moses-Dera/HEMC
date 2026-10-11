from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .model import DiseaseEnum, CategoryEnum, SourceEnum

class KBBase(BaseModel):
    disease: DiseaseEnum
    category: CategoryEnum
    content: str
    source: SourceEnum
    source_url: Optional[str] = None

class KBCreate(KBBase):
    pass

class KBUpdate(BaseModel):
    disease: Optional[DiseaseEnum] = None
    category: Optional[CategoryEnum] = None
    content: Optional[str] = None
    source: Optional[SourceEnum] = None
    source_url: Optional[str] = None

class KBResponse(KBBase):
    topic_id: int
    updated_at: datetime
    updated_by: Optional[int] = None
    
    class Config:
        from_attributes = True
