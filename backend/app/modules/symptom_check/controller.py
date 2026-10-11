from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.users.model import User
from .dto import SymptomCheckResponse, SymptomCheckStart, SymptomCheckAnswer
from .service import SymptomCheckService

router = APIRouter()

def get_symptom_service(db: Session = Depends(get_db)):
    return SymptomCheckService(db)

@router.post("/start", response_model=SymptomCheckResponse)
def start_check(req: SymptomCheckStart, user: User = Depends(get_current_user), service: SymptomCheckService = Depends(get_symptom_service)):
    return service.start_check(user.id, req)

@router.post("/{id}/answer", response_model=SymptomCheckResponse)
def answer_question(id: int, req: SymptomCheckAnswer, user: User = Depends(get_current_user), service: SymptomCheckService = Depends(get_symptom_service)):
    try:
        return service.answer_question(id, user.id, req)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
        
@router.post("/{id}/complete", response_model=SymptomCheckResponse)
def complete_check(id: int, user: User = Depends(get_current_user), service: SymptomCheckService = Depends(get_symptom_service)):
    try:
        return service.complete_check(id, user.id)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
