from sqlalchemy.orm import Session
from .repository import LogRepository

class InteractionLogsService:
    def __init__(self, db: Session):
        self.repo = LogRepository(db)

    def get_logs(self, urgent: bool):
        return self.repo.get_logs(urgent)
