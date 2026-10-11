from sqlalchemy.orm import Session
from .model import InteractionLog

class LogRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_logs(self, urgent_only: bool = False):
        query = self.db.query(InteractionLog)
        if urgent_only:
            query = query.filter(InteractionLog.urgent_flag == True)
        return query.order_by(InteractionLog.timestamp.desc()).all()

    def create_log(self, user_id: int, action: str, intent: str = None, payload: dict = None, urgent: bool = False):
        log = InteractionLog(
            user_id=user_id,
            action=action,
            intent=intent,
            structured_payload=payload,
            urgent_flag=urgent
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log
