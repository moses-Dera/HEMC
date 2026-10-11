from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db import get_db
from app.modules.auth.dependencies import require_admin
from .dto import LogResponse
from .service import InteractionLogsService

router = APIRouter(dependencies=[Depends(require_admin)])

def get_log_service(db: Session = Depends(get_db)):
    return InteractionLogsService(db)

@router.get("/", response_model=List[LogResponse])
def get_logs(urgent: bool = False, service: InteractionLogsService = Depends(get_log_service)):
    return service.get_logs(urgent)
