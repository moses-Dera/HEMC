from sqlalchemy.orm import Session
from app.modules.users.model import User

class AuthRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> User:
        return self.db.query(User).filter(User.email == email).first()

    def create_user(self, name: str, email: str, hashed_password: str, role: str = "student", **kwargs) -> User:
        db_user = User(
            name=name,
            email=email,
            hashed_password=hashed_password,
            role=role,
            **kwargs
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
