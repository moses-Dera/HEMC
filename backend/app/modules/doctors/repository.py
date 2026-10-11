from sqlalchemy.orm import Session
from .models.doctor import Doctor
from .models.duty_shift import DutyShift

class DoctorRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_doctors(self):
        return self.db.query(Doctor).all()

    def get_doctor(self, doctor_id: int):
        return self.db.query(Doctor).filter(Doctor.doctor_id == doctor_id).first()

    def create_doctor(self, data: dict):
        db_obj = Doctor(**data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update_doctor(self, db_obj: Doctor, data: dict):
        for key, value in data.items():
            setattr(db_obj, key, value)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def get_shifts(self, doctor_id: int):
        return self.db.query(DutyShift).filter(DutyShift.doctor_id == doctor_id).order_by(DutyShift.shift_date.desc()).all()

    def get_all_shifts(self):
        return self.db.query(DutyShift).order_by(DutyShift.shift_date.asc(), DutyShift.start_time.asc()).all()

    def get_shift_by_id(self, shift_id: int):
        return self.db.query(DutyShift).filter(DutyShift.shift_id == shift_id).first()

    def create_shift(self, data: dict):
        shift = DutyShift(**data)
        self.db.add(shift)
        self.db.commit()
        self.db.refresh(shift)
        return shift

    def update_shift(self, shift_obj: DutyShift, data: dict):
        for key, value in data.items():
            setattr(shift_obj, key, value)
        self.db.commit()
        self.db.refresh(shift_obj)
        return shift_obj

    def delete_shift(self, shift_obj: DutyShift):
        self.db.delete(shift_obj)
        self.db.commit()
        return True
