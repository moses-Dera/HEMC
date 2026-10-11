from sqlalchemy.orm import Session
from .model import TriageRule

class TriageRuleRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(TriageRule).all()

    def get_by_id(self, rule_id: int):
        return self.db.query(TriageRule).filter(TriageRule.rule_id == rule_id).first()

    def create(self, data: dict, user_id: int):
        db_obj = TriageRule(**data, updated_by=user_id)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: TriageRule, data: dict, user_id: int):
        for key, value in data.items():
            setattr(db_obj, key, value)
        db_obj.updated_by = user_id
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, db_obj: TriageRule):
        self.db.delete(db_obj)
        self.db.commit()
