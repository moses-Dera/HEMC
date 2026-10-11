from sqlalchemy.orm import Session
from .repository import DoctorRepository
from .dto import DoctorCreate, DoctorUpdate, DutyShiftCreate, DutyShiftUpdate, DutyShiftResponse
from .models.doctor import Doctor
from app.modules.users.model import User

class DoctorService:
    def __init__(self, db: Session):
        self.repo = DoctorRepository(db)

    def get_all(self):
        doctors = self.repo.get_all_doctors()
        for doc in doctors:
            user = self.repo.db.query(User).filter(User.id == doc.user_id).first()
            if user:
                doc.name = user.name
                doc.email = user.email
            else:
                doc.name = "Doctor"
                doc.email = ""
        return doctors

    def create_doctor(self, req: DoctorCreate):
        return self.repo.create_doctor(req.model_dump())

    def update_doctor(self, doctor_id: int, req: DoctorUpdate):
        obj = self.repo.get_doctor(doctor_id)
        if not obj:
            raise ValueError("Doctor not found")
        return self.repo.update_doctor(obj, req.model_dump(exclude_unset=True))

    def get_doctor_shifts(self, doctor_id: int):
        return self.repo.get_shifts(doctor_id)

    def get_all_shifts(self):
        shifts = self.repo.get_all_shifts()
        res = []
        for s in shifts:
            doc = self.repo.db.query(Doctor).filter(Doctor.doctor_id == s.doctor_id).first()
            doc_user = self.repo.db.query(User).filter(User.id == doc.user_id).first() if doc else None
            status_val = s.status.value if hasattr(s.status, "value") else str(s.status)
            res.append(
                DutyShiftResponse(
                    shift_id=s.shift_id,
                    doctor_id=s.doctor_id,
                    doctor_name=f"Dr. {doc_user.name}" if doc_user else f"Doctor #{s.doctor_id}",
                    doctor_specialization=doc.specialization if doc else "General Practitioner",
                    shift_date=s.shift_date,
                    start_time=s.start_time,
                    end_time=s.end_time,
                    status=status_val,
                    created_at=s.created_at,
                )
            )
        return res

    def add_shift(self, req: DutyShiftCreate):
        shift = self.repo.create_shift(req.model_dump(exclude_unset=True))
        doc = self.repo.db.query(Doctor).filter(Doctor.doctor_id == shift.doctor_id).first()
        doc_user = self.repo.db.query(User).filter(User.id == doc.user_id).first() if doc else None
        status_val = shift.status.value if hasattr(shift.status, "value") else str(shift.status)
        return DutyShiftResponse(
            shift_id=shift.shift_id,
            doctor_id=shift.doctor_id,
            doctor_name=f"Dr. {doc_user.name}" if doc_user else f"Doctor #{shift.doctor_id}",
            doctor_specialization=doc.specialization if doc else "General Practitioner",
            shift_date=shift.shift_date,
            start_time=shift.start_time,
            end_time=shift.end_time,
            status=status_val,
            created_at=shift.created_at,
        )

    def update_shift(self, shift_id: int, req: DutyShiftUpdate):
        shift = self.repo.get_shift_by_id(shift_id)
        if not shift:
            raise ValueError("Duty shift not found")
        updated = self.repo.update_shift(shift, req.model_dump(exclude_unset=True))
        doc = self.repo.db.query(Doctor).filter(Doctor.doctor_id == updated.doctor_id).first()
        doc_user = self.repo.db.query(User).filter(User.id == doc.user_id).first() if doc else None
        status_val = updated.status.value if hasattr(updated.status, "value") else str(updated.status)
        return DutyShiftResponse(
            shift_id=updated.shift_id,
            doctor_id=updated.doctor_id,
            doctor_name=f"Dr. {doc_user.name}" if doc_user else f"Doctor #{updated.doctor_id}",
            doctor_specialization=doc.specialization if doc else "General Practitioner",
            shift_date=updated.shift_date,
            start_time=updated.start_time,
            end_time=updated.end_time,
            status=status_val,
            created_at=updated.created_at,
        )

    def delete_shift(self, shift_id: int):
        shift = self.repo.get_shift_by_id(shift_id)
        if not shift:
            raise ValueError("Duty shift not found")
        return self.repo.delete_shift(shift)
