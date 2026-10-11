from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.db import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.users.model import User
from .dto import ReminderResponse
from .service import ReminderService

router = APIRouter()

def get_reminder_service(db: Session = Depends(get_db)):
    return ReminderService(db)

@router.get("/my", response_model=List[ReminderResponse])
def get_my_reminders(user: User = Depends(get_current_user), service: ReminderService = Depends(get_reminder_service)):
    return service.get_my_reminders(user.id)
