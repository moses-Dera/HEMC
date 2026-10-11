from sqlalchemy.orm import Session
from .model import Reminder
from app.modules.appointments.model import Appointment

class ReminderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: int):
        return self.db.query(Reminder).join(Appointment).filter(Appointment.user_id == user_id).all()
