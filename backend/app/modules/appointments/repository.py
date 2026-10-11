from sqlalchemy.orm import Session
from .model import Appointment, AppointmentStatusEnum

class AppointmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: int):
        return self.db.query(Appointment).filter(Appointment.user_id == user_id).all()
        
    def get_by_id(self, appointment_id: int):
        return self.db.query(Appointment).filter(Appointment.appointment_id == appointment_id).first()

    def get_all(self):
        return self.db.query(Appointment).all()

    def create(self, user_id: int, data: dict):
        db_obj = Appointment(user_id=user_id, **data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: Appointment, data: dict):
        for key, value in data.items():
            setattr(db_obj, key, value)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
