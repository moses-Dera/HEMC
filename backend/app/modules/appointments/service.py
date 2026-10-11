from sqlalchemy.orm import Session
from .repository import AppointmentRepository
from .dto import AppointmentCreate, AppointmentUpdate
from app.modules.users.model import User

class AppointmentService:
    def __init__(self, db: Session):
        self.repo = AppointmentRepository(db)

    def _enrich_appointment(self, appt):
        from app.modules.doctor_dashboard.models.patient_assignment import PatientAssignment
        from app.modules.doctors.models.doctor import Doctor
        from app.modules.users.model import User
        
        doc_name = None
        doc_spec = None
        try:
            asgn = self.repo.db.query(PatientAssignment).filter(
                PatientAssignment.appointment_id == appt.appointment_id
            ).first()
            if asgn:
                doc = self.repo.db.query(Doctor).filter(Doctor.doctor_id == asgn.doctor_id).first()
                if doc:
                    doc_spec = doc.specialization
                    doc_user = self.repo.db.query(User).filter(User.id == doc.user_id).first()
                    if doc_user:
                        doc_name = f"Dr. {doc_user.name}"
        except Exception as e:
            print(f"Error enriching appointment: {e}")
                    
        return {
            "appointment_id": appt.appointment_id,
            "user_id": appt.user_id,
            "appointment_date": appt.appointment_date,
            "status": appt.status.value if hasattr(appt.status, "value") else str(appt.status),
            "prescription": appt.prescription,
            "clinical_notes": appt.clinical_notes,
            "doctor_name": doc_name,
            "doctor_specialization": doc_spec,
            "created_at": appt.created_at,
        }

    def get_user_appointments(self, user_id: int):
        appts = self.repo.get_by_user(user_id)
        return [self._enrich_appointment(a) for a in appts]
        
    def get_all_appointments(self):
        appts = self.repo.get_all()
        return [self._enrich_appointment(a) for a in appts]

    def create_appointment(self, user_id: int, req: AppointmentCreate):
        appt = self.repo.create(user_id, {"appointment_date": req.appointment_date})
        
        # Automatically assign to specified or on-duty/available doctor
        try:
            from app.modules.doctors.models.doctor import Doctor
            from app.modules.doctor_dashboard.models.patient_assignment import PatientAssignment, AssignmentStatusEnum
            
            doc = None
            if getattr(req, "doctor_id", None):
                doc = self.repo.db.query(Doctor).filter(Doctor.doctor_id == req.doctor_id).first()
            if not doc:
                doc = self.repo.db.query(Doctor).filter(Doctor.is_available == True).first()
            if not doc:
                doc = self.repo.db.query(Doctor).first()
                
            if doc:
                assignment = PatientAssignment(
                    appointment_id=appt.appointment_id,
                    doctor_id=doc.doctor_id,
                    status=AssignmentStatusEnum.active
                )
                self.repo.db.add(assignment)
                self.repo.db.commit()
        except Exception as e:
            print(f"Failed to auto-assign doctor: {e}")

        try:
            from app.modules.notifications.repository import NotificationRepository
            notif_repo = NotificationRepository(self.repo.db)
            formatted_date = appt.appointment_date.strftime("%b %d, %Y at %I:%M %p") if hasattr(appt.appointment_date, "strftime") else str(appt.appointment_date)
            notif_repo.create_notification(
                user_id=user_id,
                title="Appointment Requested",
                message=f"Your appointment request for {formatted_date} has been submitted (Status: Pending).",
                link="/history"
            )
        except Exception as e:
            print(f"Failed to create appointment notification: {e}")
        return appt

    def update_appointment(self, user: User, appointment_id: int, req: AppointmentUpdate):
        obj = self.repo.get_by_id(appointment_id)
        if not obj:
            raise ValueError("Not found")
            
        # Security check: only admin, assigned doctor, or the user themselves can edit
        if user.role == "student" and obj.user_id != user.id:
            raise ValueError("Not authorized")
            
        updated = self.repo.update(obj, req.model_dump(exclude_unset=True))

        if "status" in req.model_dump(exclude_unset=True):
            try:
                from app.modules.notifications.repository import NotificationRepository
                notif_repo = NotificationRepository(self.repo.db)
                formatted_date = updated.appointment_date.strftime("%b %d, %Y at %I:%M %p") if hasattr(updated.appointment_date, "strftime") else str(updated.appointment_date)
                status_val = updated.status.value if hasattr(updated.status, 'value') else str(updated.status)
                doctor_prefix = f"Dr. {user.name}" if user.role == "doctor" else "The Medical Centre"
                notif_repo.create_notification(
                    user_id=updated.user_id,
                    title=f"Appointment {status_val.capitalize()}",
                    message=f"{doctor_prefix} marked your appointment for {formatted_date} as {status_val.upper()}.",
                    link="/history"
                )
            except Exception as e:
                print(f"Failed to create appointment status notification: {e}")

        return updated
