from sqlalchemy.orm import Session
from .repository import KBRepository
from .dto import KBCreate, KBUpdate

class KnowledgeBaseService:
    def __init__(self, db: Session):
        self.repo = KBRepository(db)

    def get_all(self):
        return self.repo.get_all()

    def create_kb(self, req: KBCreate, user_id: int):
        return self.repo.create(req.model_dump(), user_id)

    def update_kb(self, topic_id: int, req: KBUpdate, user_id: int):
        obj = self.repo.get_by_id(topic_id)
        if not obj:
            raise ValueError("Not found")
        return self.repo.update(obj, req.model_dump(exclude_unset=True), user_id)

    def delete_kb(self, topic_id: int):
        obj = self.repo.get_by_id(topic_id)
        if not obj:
            raise ValueError("Not found")
        self.repo.delete(obj)
