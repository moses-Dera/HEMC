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
        doc_id = None
        try:
            asgn = self.repo.db.query(PatientAssignment).filter(
                PatientAssignment.appointment_id == appt.appointment_id
            ).first()
            if asgn:
                doc_id = asgn.doctor_id
                doc = self.repo.db.query(Doctor).filter(Doctor.doctor_id == asgn.doctor_id).first()
                if doc:
                    doc_spec = doc.specialization
                    doc_user = self.repo.db.query(User).filter(User.id == doc.user_id).first()
                    if doc_user:
                        doc_name = f"Dr. {doc_user.name}"
        except Exception as e:
            print(f"Error enriching appointment: {e}")

        patient_name = None
        patient_email = None
        patient_reg = None
        patient_dept = None
        patient_phone = None
        try:
            student = self.repo.db.query(User).filter(User.id == appt.user_id).first()
            if student:
                patient_name = student.name
                patient_email = student.email
                patient_reg = student.reg_number
                patient_dept = student.department
                patient_phone = student.phone_number
        except Exception as e:
            print(f"Error enriching patient info: {e}")
                    
        return {
            "appointment_id": appt.appointment_id,
            "user_id": appt.user_id,
            "appointment_date": appt.appointment_date,
            "status": appt.status.value if hasattr(appt.status, "value") else str(appt.status),
            "prescription": appt.prescription,
            "clinical_notes": appt.clinical_notes,
            "doctor_id": doc_id,
            "doctor_name": doc_name,
            "doctor_specialization": doc_spec,
            "patient_name": patient_name,
            "patient_email": patient_email,
            "patient_reg_number": patient_reg,
            "patient_department": patient_dept,
            "patient_phone": patient_phone,
            "created_at": appt.created_at,
        }

    def get_user_appointments(self, user_id: int):
        appts = self.repo.get_by_user(user_id)
        return [self._enrich_appointment(a) for a in appts]
        
    def get_all_appointments(self):
        appts = self.repo.get_all()
        return [self._enrich_appointment(a) for a in appts]

    def create_appointment(self, user_id: int, req: AppointmentCreate):
        from datetime import datetime, timezone
        now_utc = datetime.now(timezone.utc)
        target_dt = req.appointment_date
        if target_dt.tzinfo is None:
            target_dt = target_dt.replace(tzinfo=timezone.utc)
        if target_dt < now_utc:
            raise ValueError("Appointment date cannot be in the past. Please select an upcoming date and time.")

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
                message=f"Your appointment request for {formatted_date} has been submitted (Status: Pending Clinic Confirmation).",
                link="/history?tab=appointments"
            )
        except Exception as e:
            print(f"Failed to create appointment notification: {e}")
        return self._enrich_appointment(appt)

    def update_appointment(self, user: User, appointment_id: int, req: AppointmentUpdate):
        obj = self.repo.get_by_id(appointment_id)
        if not obj:
            raise ValueError("Not found")
            
        # Security check: only admin, assigned doctor, or the user themselves can edit
        if user.role == "student" and obj.user_id != user.id:
            raise ValueError("Not authorized")

        update_data = req.model_dump(exclude_unset=True)
        doctor_id_to_assign = update_data.pop("doctor_id", None)
            
        updated = self.repo.update(obj, update_data)

        # Handle doctor assignment update if specified
        if doctor_id_to_assign is not None:
            try:
                from app.modules.doctor_dashboard.models.patient_assignment import PatientAssignment, AssignmentStatusEnum
                asgn = self.repo.db.query(PatientAssignment).filter(PatientAssignment.appointment_id == appointment_id).first()
                if asgn:
                    asgn.doctor_id = doctor_id_to_assign
                else:
                    asgn = PatientAssignment(
                        appointment_id=appointment_id,
                        doctor_id=doctor_id_to_assign,
                        status=AssignmentStatusEnum.active
                    )
                    self.repo.db.add(asgn)
                self.repo.db.commit()
            except Exception as e:
                print(f"Failed to update patient doctor assignment: {e}")

        # Update assignment status if completed or cancelled
        if "status" in update_data:
            try:
                from app.modules.doctor_dashboard.models.patient_assignment import PatientAssignment, AssignmentStatusEnum
                asgn = self.repo.db.query(PatientAssignment).filter(PatientAssignment.appointment_id == appointment_id).first()
                if asgn and req.status and req.status.value in ("completed", "cancelled"):
                    asgn.status = AssignmentStatusEnum.completed
                    self.repo.db.commit()
            except Exception as e:
                print(f"Failed to update assignment status: {e}")

        if "status" in update_data:
            try:
                import threading
                from app.modules.notifications.repository import NotificationRepository
                from app.modules.notifications.service import NotificationService
                
                notif_repo = NotificationRepository(self.repo.db)
                formatted_date = updated.appointment_date.strftime("%b %d, %Y at %I:%M %p") if hasattr(updated.appointment_date, "strftime") else str(updated.appointment_date)
                status_val = updated.status.value if hasattr(updated.status, 'value') else str(updated.status)
                doctor_prefix = f"Dr. {user.name}" if user.role == "doctor" else "UNN Medical Centre Administration"
                
                notif_repo.create_notification(
                    user_id=updated.user_id,
                    title=f"Appointment {status_val.capitalize()}",
                    message=f"{doctor_prefix} marked your appointment for {formatted_date} as {status_val.upper()}.",
                    link="/history?tab=appointments"
                )

                # Send email in background thread to avoid blocking request
                student = self.repo.db.query(User).filter(User.id == updated.user_id).first()
                if student and student.email:
                    def _send_mail():
                        try:
                            notifier = NotificationService()
                            notifier.notify_appointment_status(
                                email=student.email,
                                name=student.name,
                                date=formatted_date,
                                status=status_val.capitalize(),
                                doctor_name=doctor_prefix
                            )
                        except Exception as err:
                            print(f"Background email error: {err}")
                    threading.Thread(target=_send_mail, daemon=True).start()
            except Exception as e:
                print(f"Failed to create appointment status notification: {e}")

        return self._enrich_appointment(updated)
