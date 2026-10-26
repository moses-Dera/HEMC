from sqlalchemy.orm import Session
from app.core.security import verify_password, get_password_hash, create_access_token
from .repository import AuthRepository
from .exceptions import InvalidCredentials
from .dto import UserCreateRequest, UserLoginRequest

class AuthService:
    def __init__(self, db: Session):
        self.repo = AuthRepository(db)

    def register_user(self, req: UserCreateRequest):
        existing = self.repo.get_user_by_email(req.email)
        if existing:
            raise ValueError("Email already registered")
        
        hashed_pw = get_password_hash(req.password)
        user = self.repo.create_user(
            req.full_name, 
            req.email, 
            hashed_pw, 
            "student",
            reg_number=req.reg_number,
            department=req.department,
            level=req.level
        )
        
        # Trigger Welcome Notification
        try:
            from app.modules.notifications.repository import NotificationRepository
            notif_repo = NotificationRepository(self.repo.db)
            notif_repo.create_notification(
                user_id=user.id,
                title="Welcome to HEMC Health Portal",
                message="Welcome! Your student health profile is ready. You can chat with our AI triage assistant or schedule appointments with UNN Medical Centre doctors.",
                link="/dashboard"
            )
        except Exception as e:
            print(f"Failed to create welcome notification: {e}")

        return user

    def authenticate_user(self, req: UserLoginRequest):
        user = self.repo.get_user_by_email(req.email)
        if not user or not verify_password(req.password, user.hashed_password):
            raise InvalidCredentials()
        
        access_token = create_access_token(data={"sub": user.email, "role": user.role})
        return access_token, user
