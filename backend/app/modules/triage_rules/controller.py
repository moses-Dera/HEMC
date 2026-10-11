from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db import get_db
from app.modules.auth.dependencies import require_admin
from app.modules.users.model import User
from .dto import RuleResponse, RuleCreate, RuleUpdate
from .service import TriageRulesService

router = APIRouter(dependencies=[Depends(require_admin)])

def get_rule_service(db: Session = Depends(get_db)):
    return TriageRulesService(db)

@router.get("/", response_model=List[RuleResponse])
def list_rules(service: TriageRulesService = Depends(get_rule_service)):
    return service.get_all()

@router.post("/", response_model=RuleResponse)
def create_rule(req: RuleCreate, admin: User = Depends(require_admin), service: TriageRulesService = Depends(get_rule_service)):
    return service.create_rule(req, admin.id)

@router.patch("/{id}", response_model=RuleResponse)
def update_rule(id: int, req: RuleUpdate, admin: User = Depends(require_admin), service: TriageRulesService = Depends(get_rule_service)):
    try:
        return service.update_rule(id, req, admin.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{id}")
def delete_rule(id: int, service: TriageRulesService = Depends(get_rule_service)):
    try:
        service.delete_rule(id)
        return {"ok": True}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
