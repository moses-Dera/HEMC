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
