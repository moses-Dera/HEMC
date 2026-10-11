from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .dto import EmailRequest, NotificationResponse
from .service import NotificationService
from .repository import NotificationRepository
from app.modules.auth.dependencies import require_admin, get_current_user
from app.core.db import get_db
from app.modules.users.model import User

# This router has different dependencies per endpoint now
router = APIRouter()

def get_notification_service():
    return NotificationService()

@router.post("/send-email", dependencies=[Depends(require_admin)])
def send_email(req: EmailRequest, service: NotificationService = Depends(get_notification_service)):
    success = service.send_email(req.to_email, req.subject, req.body)
    return {"ok": success}

@router.get("/my", response_model=List[NotificationResponse])
def get_my_notifications(skip: int = 0, limit: int = 50, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = NotificationRepository(db)
    return repo.get_user_notifications(current_user.id, skip, limit)

@router.get("/unread-count")
def get_unread_count(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = NotificationRepository(db)
    count = repo.get_unread_count(current_user.id)
    return {"count": count}

@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(notification_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = NotificationRepository(db)
    notif = repo.mark_as_read(notification_id, current_user.id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif

@router.post("/read-all")
def mark_all_notifications_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = NotificationRepository(db)
    repo.mark_all_as_read(current_user.id)
    return {"ok": True}
