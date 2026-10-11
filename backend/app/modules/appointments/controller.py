from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db import get_db
from app.modules.auth.dependencies import get_current_user, require_admin, require_doctor
from app.modules.users.model import User
from .dto import AppointmentResponse, AppointmentCreate, AppointmentUpdate
from .service import AppointmentService

router = APIRouter()

def get_appointment_service(db: Session = Depends(get_db)):
    return AppointmentService(db)

@router.get("/my", response_model=List[AppointmentResponse])
def get_my_appointments(user: User = Depends(get_current_user), service: AppointmentService = Depends(get_appointment_service)):
    return service.get_user_appointments(user.id)
    
@router.get("/all", response_model=List[AppointmentResponse], dependencies=[Depends(require_doctor)])
def get_all_appointments(service: AppointmentService = Depends(get_appointment_service)):
    return service.get_all_appointments()

@router.post("/", response_model=AppointmentResponse)
def book_appointment(req: AppointmentCreate, user: User = Depends(get_current_user), service: AppointmentService = Depends(get_appointment_service)):
    return service.create_appointment(user.id, req)

@router.patch("/{id}", response_model=AppointmentResponse)
def update_appointment(id: int, req: AppointmentUpdate, user: User = Depends(get_current_user), service: AppointmentService = Depends(get_appointment_service)):
    try:
        return service.update_appointment(user, id, req)
    except ValueError as e:
        raise HTTPException(status_code=403 if "authorized" in str(e) else 404, detail=str(e))
