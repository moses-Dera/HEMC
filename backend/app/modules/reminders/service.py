from sqlalchemy.orm import Session
from .repository import ReminderRepository

class ReminderService:
    def __init__(self, db: Session):
        self.repo = ReminderRepository(db)

    def get_my_reminders(self, user_id: int):
        return self.repo.get_by_user(user_id)
