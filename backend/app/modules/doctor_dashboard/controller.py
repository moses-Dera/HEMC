from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.db import get_db
from app.modules.auth.dependencies import require_staff, get_current_user
from app.modules.users.model import User
from .dto import (
    PatientAssignmentResponse, 
    HandoverCreate, 
    HandoverResponse, 
    DoctorOverviewResponse,
    AppointmentStatusUpdateReq,
    AvailabilityUpdateReq
)
from .service import DashboardService

router = APIRouter(dependencies=[Depends(require_staff)])

def get_dashboard_service(db: Session = Depends(get_db)):
    return DashboardService(db)

@router.get("/overview", response_model=DoctorOverviewResponse)
def get_overview(
    doctor_id: Optional[int] = Query(None),
    user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    try:
        return service.get_doctor_overview(user.id, target_doctor_id=doctor_id if user.role == "admin" else None)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/patients", response_model=List[PatientAssignmentResponse])
def get_patients(
    doctor_id: Optional[int] = Query(None),
    user: User = Depends(get_current_user),
    service: DashboardService = Depends(get_dashboard_service)
):
    return service.get_my_patients(user.id, target_doctor_id=doctor_id if user.role == "admin" else None)

@router.patch("/appointment-status")
def update_appointment_status(req: AppointmentStatusUpdateReq, user: User = Depends(get_current_user), service: DashboardService = Depends(get_dashboard_service)):
    try:
        return service.update_appointment_status(user.id, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/availability")
def toggle_availability(req: AvailabilityUpdateReq, user: User = Depends(get_current_user), service: DashboardService = Depends(get_dashboard_service)):
    try:
        return service.toggle_availability(user.id, req.is_available)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/handover", response_model=HandoverResponse)
def request_handover(req: HandoverCreate, user: User = Depends(get_current_user), service: DashboardService = Depends(get_dashboard_service)):
    try:
        return service.request_handover(user.id, req)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
