from sqlalchemy.orm import Session
from .repository import TriageRuleRepository
from .dto import RuleCreate, RuleUpdate

class TriageRulesService:
    def __init__(self, db: Session):
        self.repo = TriageRuleRepository(db)

    def get_all(self):
        return self.repo.get_all()

    def create_rule(self, req: RuleCreate, user_id: int):
        return self.repo.create(req.model_dump(), user_id)

    def update_rule(self, rule_id: int, req: RuleUpdate, user_id: int):
        obj = self.repo.get_by_id(rule_id)
        if not obj:
            raise ValueError("Not found")
        return self.repo.update(obj, req.model_dump(exclude_unset=True), user_id)

    def delete_rule(self, rule_id: int):
        obj = self.repo.get_by_id(rule_id)
        if not obj:
            raise ValueError("Not found")
        self.repo.delete(obj)
