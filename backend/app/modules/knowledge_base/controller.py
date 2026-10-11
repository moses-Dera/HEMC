from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db import get_db
from app.modules.auth.dependencies import require_admin
from app.modules.users.model import User
from .dto import KBResponse, KBCreate, KBUpdate
from .service import KnowledgeBaseService

router = APIRouter(dependencies=[Depends(require_admin)])

def get_kb_service(db: Session = Depends(get_db)):
    return KnowledgeBaseService(db)

@router.get("/", response_model=List[KBResponse])
def list_kb(service: KnowledgeBaseService = Depends(get_kb_service)):
    return service.get_all()

@router.post("/", response_model=KBResponse)
def create_kb(req: KBCreate, admin: User = Depends(require_admin), service: KnowledgeBaseService = Depends(get_kb_service)):
    return service.create_kb(req, admin.id)

@router.patch("/{id}", response_model=KBResponse)
def update_kb(id: int, req: KBUpdate, admin: User = Depends(require_admin), service: KnowledgeBaseService = Depends(get_kb_service)):
    try:
        return service.update_kb(id, req, admin.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{id}")
def delete_kb(id: int, service: KnowledgeBaseService = Depends(get_kb_service)):
    try:
        service.delete_kb(id)
        return {"ok": True}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
