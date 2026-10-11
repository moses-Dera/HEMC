from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db import get_db
from app.modules.auth.dependencies import get_current_user, require_admin
from app.modules.users.model import User
from .dto import DoctorResponse, DoctorCreate, DoctorUpdate, DutyShiftResponse, DutyShiftCreate, DutyShiftUpdate
from .service import DoctorService

router = APIRouter()

def get_doctor_service(db: Session = Depends(get_db)):
    return DoctorService(db)

# ── Public endpoints (any authenticated user) ──────────────────────────────────

@router.get("/", response_model=List[DoctorResponse])
def list_doctors(
    _: User = Depends(get_current_user),
    service: DoctorService = Depends(get_doctor_service)
):
    """List all doctors — accessible to any authenticated user."""
    return service.get_all()

@router.get("/shifts", response_model=List[DutyShiftResponse])
def list_shifts(
    _: User = Depends(get_current_user),
    service: DoctorService = Depends(get_doctor_service)
):
    """List all doctor duty shifts."""
    return service.get_all_shifts()

# ── Admin-only endpoints ───────────────────────────────────────────────────────

@router.post("/", response_model=DoctorResponse, dependencies=[Depends(require_admin)])
def add_doctor(req: DoctorCreate, service: DoctorService = Depends(get_doctor_service)):
    return service.create_doctor(req)

@router.patch("/{id}", response_model=DoctorResponse, dependencies=[Depends(require_admin)])
def update_doctor(id: int, req: DoctorUpdate, service: DoctorService = Depends(get_doctor_service)):
    try:
        return service.update_doctor(id, req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/shifts", response_model=DutyShiftResponse, dependencies=[Depends(require_admin)])
def add_shift(req: DutyShiftCreate, service: DoctorService = Depends(get_doctor_service)):
    return service.add_shift(req)

@router.patch("/shifts/{shift_id}", response_model=DutyShiftResponse, dependencies=[Depends(require_admin)])
def update_shift(shift_id: int, req: DutyShiftUpdate, service: DoctorService = Depends(get_doctor_service)):
    try:
        return service.update_shift(shift_id, req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/shifts/{shift_id}", dependencies=[Depends(require_admin)])
def delete_shift(shift_id: int, service: DoctorService = Depends(get_doctor_service)):
    try:
        service.delete_shift(shift_id)
        return {"status": "success", "message": "Duty shift removed"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
