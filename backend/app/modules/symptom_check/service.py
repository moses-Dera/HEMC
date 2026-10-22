from sqlalchemy.orm import Session
from .repository import SymptomCheckRepository
from .dto import SymptomCheckStart, SymptomCheckAnswer

class SymptomCheckService:
    def __init__(self, db: Session):
        self.repo = SymptomCheckRepository(db)

    def start_check(self, user_id: int, req: SymptomCheckStart):
        # NLP hook would analyze initial symptom here for urgency
        return self.repo.create(user_id, req.initial_symptom)

    def answer_question(self, check_id: int, user_id: int, req: SymptomCheckAnswer):
        check = self.repo.get_by_id(check_id)
        if not check or check.user_id != user_id:
            raise ValueError("Not found or not authorized")
            
        data = dict(check.symptoms_data)
        if "qa" not in data:
            data["qa"] = []
            
        data["qa"].append({"q": req.question, "a": req.answer})
        
        # Simple heuristic for urgency mock
        if "severe" in req.answer.lower() or "pain" in req.answer.lower():
            check.urgent_flag = True
            
        check.symptoms_data = data
        return self.repo.update(check)
        
    def complete_check(self, check_id: int, user_id: int):
        check = self.repo.get_by_id(check_id)
        if not check or check.user_id != user_id:
            raise ValueError("Not found")
            
        # NLP hook would generate summary here
        check.result_summary = "Based on your symptoms, we recommend resting and booking an appointment if symptoms persist."
        updated = self.repo.update(check)

        if check.urgent_flag:
            try:
                from app.modules.notifications.repository import NotificationRepository
                notif_repo = NotificationRepository(self.repo.db)
                notif_repo.create_notification(
                    user_id=user_id,
                    title="Urgent Symptom Check Alert",
                    message="Your symptom evaluation flagged severe symptoms. Please consult a doctor at the UNN Medical Centre promptly.",
                    link="/history"
                )
            except Exception as e:
                print(f"Failed to create triage notification: {e}")

        return updated

    def get_urgent_checks(self):
        from app.modules.users.model import User
        from .model import OutcomeEnum, SymptomCheck
        
        checks = self.repo.db.query(SymptomCheck).filter(
            (SymptomCheck.outcome == OutcomeEnum.urgent) | (SymptomCheck.outcome == "urgent")
        ).order_by(SymptomCheck.timestamp.desc()).all()

        results = []
        for c in checks:
            user = self.repo.db.query(User).filter(User.id == c.user_id).first()
            outcome_str = c.outcome.value if hasattr(c.outcome, "value") else str(c.outcome)
            
            raw_flags = c.red_flags
            flags_list = []
            if isinstance(raw_flags, list):
                flags_list = raw_flags
            elif isinstance(raw_flags, dict):
                flags_list = list(raw_flags.keys())
            elif isinstance(raw_flags, str):
                flags_list = [raw_flags]

            results.append({
                "check_id": c.check_id,
                "user_id": c.user_id,
                "patient_name": user.name if user else "Student Patient",
                "patient_email": user.email if user else "",
                "patient_phone": getattr(user, "phone_number", None),
                "patient_reg_number": getattr(user, "reg_number", None),
                "patient_department": getattr(user, "department", None),
                "patient_level": getattr(user, "level", None),
                "patient_hostel": getattr(user, "hostel", None),
                "patient_emergency_contact": getattr(user, "emergency_contact", None),
                "fever_duration": c.fever_duration,
                "red_flags": flags_list,
                "outcome": outcome_str,
                "reviewed": bool(c.reviewed),
                "contacted": bool(c.contacted),
                "reviewed_at": c.reviewed_at,
                "timestamp": c.timestamp
            })
        return results

    def update_status(self, check_id: int, req: dict, admin_id: int):
        from datetime import datetime, timezone
        check = self.repo.get_by_id(check_id)
        if not check:
            raise ValueError("Symptom check not found")
        if "reviewed" in req and req["reviewed"] is not None:
            check.reviewed = bool(req["reviewed"])
            check.reviewed_by = admin_id
            check.reviewed_at = datetime.now(timezone.utc) if check.reviewed else None
        if "contacted" in req and req["contacted"] is not None:
            check.contacted = bool(req["contacted"])
        self.repo.db.commit()
        self.repo.db.refresh(check)
        return {"success": True, "check_id": check_id, "reviewed": check.reviewed, "contacted": check.contacted}
