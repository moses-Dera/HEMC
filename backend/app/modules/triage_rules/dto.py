from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .model import ConditionTypeEnum, RuleOutcomeEnum

class RuleBase(BaseModel):
    condition_type: ConditionTypeEnum
    label: str
    value: Optional[str] = None
    vector: Optional[List[float]] = None
    outcome: RuleOutcomeEnum
    active: bool = True

class RuleCreate(RuleBase):
    pass

class RuleUpdate(BaseModel):
    condition_type: Optional[ConditionTypeEnum] = None
    label: Optional[str] = None
    value: Optional[str] = None
    vector: Optional[List[float]] = None
    outcome: Optional[RuleOutcomeEnum] = None
    active: Optional[bool] = None

class RuleResponse(RuleBase):
    rule_id: int
    updated_at: datetime
    updated_by: Optional[int] = None
    
    class Config:
        from_attributes = True
