from sqlalchemy.orm import Session
from datetime import datetime
from .repository import DashboardRepository
from .dto import (
    HandoverCreate, 
    PatientAssignmentResponse, 
    DoctorOverviewResponse, 
    DoctorShiftDTO,
    AppointmentStatusUpdateReq,
    AvailabilityUpdateReq
)
from app.modules.doctors.models.doctor import Doctor
from app.modules.doctors.models.duty_shift import DutyShift
from app.modules.appointments.model import Appointment, AppointmentStatusEnum
from app.modules.users.model import User
from app.modules.symptom_check.model import SymptomCheck
from app.modules.chat.models.chat_session import ChatSession
from app.modules.chat.models.chat_message import ChatMessage
from .models.patient_assignment import PatientAssignment

class DashboardService:
    def __init__(self, db: Session):
        self.repo = DashboardRepository(db)
        self.db = db

    def _resolve_doctor(self, current_user_id: int, target_doctor_id: int = None):
        if target_doctor_id is not None:
            doc = self.db.query(Doctor).filter(Doctor.doctor_id == target_doctor_id).first()
            if doc:
                return doc

        doc = self.db.query(Doctor).filter(Doctor.user_id == current_user_id).first()
        if not doc:
            # If current user is an admin previewing without specific ID, default to first doctor
            user = self.db.query(User).filter(User.id == current_user_id).first()
            if user and user.role == "admin":
                doc = self.db.query(Doctor).first()
        return doc

    def get_my_patients(self, current_user_id: int, target_doctor_id: int = None):
        doc = self._resolve_doctor(current_user_id, target_doctor_id)
        if not doc:
            return []

        assignments = self.db.query(PatientAssignment).filter(
            PatientAssignment.doctor_id == doc.doctor_id
        ).all()

        results = []
        for asgn in assignments:
            appt = self.db.query(Appointment).filter(Appointment.appointment_id == asgn.appointment_id).first()
            patient = self.db.query(User).filter(User.id == appt.user_id).first() if appt else None
            
            # Check for latest symptom triage check
            latest_check = None
            red_flags_list = []
            fever_duration_val = None
            check_id_val = None

            if patient:
                latest_check = self.db.query(SymptomCheck).filter(
                    SymptomCheck.user_id == patient.id
                ).order_by(SymptomCheck.timestamp.desc()).first()

            if latest_check:
                check_id_val = latest_check.check_id
                fever_duration_val = latest_check.fever_duration
                if latest_check.red_flags:
                    red_flags_list = latest_check.red_flags if isinstance(latest_check.red_flags, list) else [str(latest_check.red_flags)]

            is_urgent = False
            if latest_check:
                outcome_val = latest_check.outcome.value if hasattr(latest_check.outcome, "value") else str(latest_check.outcome)
                if outcome_val == "urgent" or (red_flags_list and len(red_flags_list) > 0):
                    is_urgent = True

            triage_urgency = "Urgent / Emergency" if is_urgent else "Routine Consultation"
            triage_summary = f"Fever: {latest_check.fever_duration}" if (latest_check and latest_check.fever_duration) else "Clinical consultation booking"

            # Fetch recent AI chat messages for clinical context
            recent_chat_messages = []
            if patient:
                latest_session = self.db.query(ChatSession).filter(
                    ChatSession.user_id == patient.id
                ).order_by(ChatSession.started_at.desc()).first()

                if latest_session:
                    msgs = self.db.query(ChatMessage).filter(
                        ChatMessage.session_id == latest_session.session_id
                    ).order_by(ChatMessage.created_at.asc()).limit(15).all()

                    for m in msgs:
                        role_str = m.role.value if hasattr(m.role, "value") else str(m.role)
                        recent_chat_messages.append({
                            "role": role_str,
                            "content": m.content,
                            "time": m.created_at.strftime("%I:%M %p") if m.created_at else ""
                        })

            appt_status = appt.status.value if (appt and hasattr(appt.status, "value")) else (str(appt.status) if appt else "pending")

            results.append(
                PatientAssignmentResponse(
                    assignment_id=asgn.assignment_id,
                    appointment_id=asgn.appointment_id,
                    doctor_id=asgn.doctor_id,
                    assigned_at=asgn.assigned_at,
                    status=asgn.status.value if hasattr(asgn.status, "value") else str(asgn.status),
                    patient_id=patient.id if patient else appt.user_id if appt else 0,
                    patient_name=patient.name if patient else "Student Patient",
                    patient_email=patient.email if patient else "",
                    patient_department=patient.department if patient else None,
                    patient_level=patient.level if patient else None,
                    patient_reg_number=patient.reg_number if patient else None,
                    patient_phone=patient.phone_number if patient else None,
                    patient_blood_group=patient.blood_group if patient else None,
                    patient_genotype=patient.genotype if patient else None,
                    patient_allergies=patient.allergies if patient else None,
                    patient_hostel=patient.hostel if patient else None,
                    patient_emergency_contact=patient.emergency_contact if patient else None,
                    appointment_date=appt.appointment_date if appt else asgn.assigned_at,
                    appointment_status=appt_status,
                    triage_urgency=triage_urgency,
                    triage_summary=triage_summary,
                    red_flags=red_flags_list,
                    fever_duration=fever_duration_val,
                    recent_chat_messages=recent_chat_messages,
                    symptom_check_id=check_id_val,
                    prescription=appt.prescription if appt else None,
                    clinical_notes=appt.clinical_notes if appt else None,
                )
            )
        return results

    def get_doctor_overview(self, current_user_id: int, target_doctor_id: int = None):
        doc = self._resolve_doctor(current_user_id, target_doctor_id)
        if not doc:
            raise ValueError("No clinical doctor profile found for this user account")

        user = self.db.query(User).filter(User.id == doc.user_id).first()
        patients = self.get_my_patients(current_user_id, target_doctor_id)
        
        pending_count = sum(1 for p in patients if p.appointment_status in ("pending", "active"))
        confirmed_count = sum(1 for p in patients if p.appointment_status == "confirmed")
        completed_count = sum(1 for p in patients if p.appointment_status == "completed")

        # Shifts
        raw_shifts = self.db.query(DutyShift).filter(
            DutyShift.doctor_id == doc.doctor_id
        ).order_by(DutyShift.shift_date.desc()).all()

        shifts = [
            DoctorShiftDTO(
                shift_id=s.shift_id,
                doctor_id=s.doctor_id,
                shift_date=s.shift_date,
                start_time=s.start_time.strftime("%H:%M") if hasattr(s.start_time, "strftime") else str(s.start_time),
                end_time=s.end_time.strftime("%H:%M") if hasattr(s.end_time, "strftime") else str(s.end_time),
                status=s.status.value if hasattr(s.status, "value") else str(s.status),
            )
            for s in raw_shifts
        ]

        return DoctorOverviewResponse(
            doctor_id=doc.doctor_id,
            user_id=doc.user_id,
            name=user.name if user else "Dr. Physician",
            email=user.email if user else "",
            specialization=doc.specialization or "General Medicine",
            is_available=doc.is_available,
            total_assigned=len(patients),
            pending_count=pending_count,
            confirmed_count=confirmed_count,
            completed_count=completed_count,
            shifts=shifts
        )

    def toggle_availability(self, current_user_id: int, is_available: bool):
        doc = self._resolve_doctor(current_user_id)
        if not doc:
            raise ValueError("Doctor profile not found")
        doc.is_available = is_available
        self.db.commit()
        self.db.refresh(doc)
        return {"success": True, "is_available": doc.is_available}

    def update_appointment_status(self, current_user_id: int, req: AppointmentStatusUpdateReq):
        doc = self._resolve_doctor(current_user_id)
        appt = self.db.query(Appointment).filter(Appointment.appointment_id == req.appointment_id).first()
        if not appt:
            raise ValueError("Appointment not found")

        valid_statuses = {"pending": AppointmentStatusEnum.pending, "confirmed": AppointmentStatusEnum.confirmed, "completed": AppointmentStatusEnum.completed, "cancelled": AppointmentStatusEnum.cancelled}
        if req.status.lower() in valid_statuses:
            appt.status = valid_statuses[req.status.lower()]

        if req.prescription is not None:
            appt.prescription = req.prescription
        if req.clinical_notes is not None:
            appt.clinical_notes = req.clinical_notes

        from .models.patient_assignment import AssignmentStatusEnum
        asgn = self.db.query(PatientAssignment).filter(PatientAssignment.appointment_id == appt.appointment_id).first()
        if asgn and req.status.lower() in ("completed", "cancelled"):
            asgn.status = AssignmentStatusEnum.completed

        self.db.commit()
        self.db.refresh(appt)

        # Notify student in-app and background email
        try:
            import threading
            from app.modules.notifications.service import NotificationService
            from app.modules.notifications.repository import NotificationRepository
            
            student = self.db.query(User).filter(User.id == appt.user_id).first()
            if student:
                notif_repo = NotificationRepository(self.db)
                doctor_user = self.db.query(User).filter(User.id == doc.user_id).first() if doc else None
                doc_name = f"Dr. {doctor_user.name}" if doctor_user else "Your Attending Doctor"
                
                notif_repo.create_notification(
                    user_id=student.id,
                    title=f"Appointment {req.status.capitalize()}",
                    message=f"{doc_name} marked your appointment as {req.status.upper()}.",
                    link="/history?tab=appointments"
                )
                
                if student.email:
                    date_str = appt.appointment_date.strftime("%b %d, %Y at %I:%M %p") if hasattr(appt.appointment_date, "strftime") else str(appt.appointment_date)
                    status_str = req.status.capitalize()
                    def _send_doctor_status_email():
                        try:
                            notifier = NotificationService()
                            notifier.notify_appointment_status(
                                email=student.email,
                                name=student.name,
                                date=date_str,
                                status=status_str,
                                doctor_name=doc_name
                            )
                        except Exception as err:
                            print(f"Background email error: {err}")
                    threading.Thread(target=_send_doctor_status_email, daemon=True).start()
        except Exception as e:
            print(f"Failed to send appointment status notification: {e}")

        return {"success": True, "appointment_id": appt.appointment_id, "status": req.status}

    def request_handover(self, current_user_id: int, req: HandoverCreate):
        doc = self._resolve_doctor(current_user_id)
        assignment = self.repo.get_assignment_by_id(req.assignment_id)
        if not assignment:
            raise ValueError("Assignment not found")
            
        handover = self.repo.create_handover(req.assignment_id, doc.doctor_id, req.to_doctor_id, req.reason, req.notes)
        
        # Transfer the assignment to the new doctor
        assignment.doctor_id = req.to_doctor_id
        self.db.commit()

        try:
            from app.modules.notifications.repository import NotificationRepository
            from app.modules.notifications.service import NotificationService
            notif_repo = NotificationRepository(self.db)
            
            # Find receiving doctor's user_id
            target_doc = self.db.query(Doctor).filter(Doctor.doctor_id == req.to_doctor_id).first()
            if target_doc:
                target_user = self.db.query(User).filter(User.id == target_doc.user_id).first()
                notif_repo.create_notification(
                    user_id=target_doc.user_id,
                    title="New Patient Handover",
                    message=f"A patient clinical case has been transferred to your care. Reason: {req.reason.value if hasattr(req.reason, 'value') else req.reason}",
                    link="/doctor/dashboard"
                )
                if target_user and target_user.email:
                    notifier = NotificationService()
                    appt = self.db.query(Appointment).filter(Appointment.appointment_id == assignment.appointment_id).first()
                    student = self.db.query(User).filter(User.id == appt.user_id).first() if appt else None
                    notifier.notify_doctor_handover(
                        email=target_user.email,
                        doctor_name=target_user.name,
                        patient_name=student.name if student else "Student Patient",
                        reason=req.reason.value if hasattr(req.reason, 'value') else str(req.reason)
                    )
        except Exception as e:
            print(f"Failed to create handover notification: {e}")

        return handover
