from sqlalchemy.orm import Session
from .model import Notification

class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_notifications(self, user_id: int, skip: int = 0, limit: int = 50):
        return self.db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    def get_unread_count(self, user_id: int):
        return self.db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).count()

    def mark_as_read(self, notification_id: int, user_id: int):
        notif = self.db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
        if notif:
            notif.is_read = True
            self.db.commit()
            return notif
        return None

    def mark_all_as_read(self, user_id: int):
        self.db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).update({"is_read": True})
        self.db.commit()

    def create_notification(self, user_id: int, title: str, message: str, link: str = None):
        notif = Notification(user_id=user_id, title=title, message=message, link=link)
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return notif
