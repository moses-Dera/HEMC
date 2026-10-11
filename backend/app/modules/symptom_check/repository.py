from sqlalchemy.orm import Session
from .model import SymptomCheck

class SymptomCheckRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, check_id: int):
        return self.db.query(SymptomCheck).filter(SymptomCheck.check_id == check_id).first()

    def create(self, user_id: int, initial_symptom: str):
        db_obj = SymptomCheck(user_id=user_id, fever_duration=initial_symptom, red_flags={})
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: SymptomCheck):
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
