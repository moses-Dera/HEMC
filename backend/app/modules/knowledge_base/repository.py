from sqlalchemy.orm import Session
from .model import KnowledgeBase

class KBRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(KnowledgeBase).all()

    def get_by_id(self, topic_id: int):
        return self.db.query(KnowledgeBase).filter(KnowledgeBase.topic_id == topic_id).first()

    def create(self, data: dict, user_id: int):
        db_obj = KnowledgeBase(**data, updated_by=user_id)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: KnowledgeBase, data: dict, user_id: int):
        for key, value in data.items():
            setattr(db_obj, key, value)
        db_obj.updated_by = user_id
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, db_obj: KnowledgeBase):
        self.db.delete(db_obj)
        self.db.commit()
