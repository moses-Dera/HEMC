from sqlalchemy.orm import Session
from .model import User

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(User).order_by(User.id.desc()).all()

    def update_user(self, user: User, update_data: dict):
        for key, value in update_data.items():
            if value is not None:
                setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user
