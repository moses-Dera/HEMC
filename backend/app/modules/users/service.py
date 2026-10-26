from sqlalchemy.orm import Session
from .repository import UserRepository
from .dto import UserUpdateRequest, AdminUserUpdateRequest, AdminUserCreateRequest
from app.core.security import get_password_hash
from .model import User

class UsersService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def get_all_users(self):
        return self.repo.get_all()

    def update_me(self, user: User, req: UserUpdateRequest):
        data = req.model_dump(exclude_unset=True)
        password_changed = False
        if "password" in data:
            data["hashed_password"] = get_password_hash(data.pop("password"))
            password_changed = True
            
        updated = self.repo.update_user(user, data)
        
        if password_changed:
            try:
                from app.modules.notifications.repository import NotificationRepository
                notif_repo = NotificationRepository(self.repo.db)
                notif_repo.create_notification(
                    user_id=user.id,
                    title="Security Alert: Password Changed",
                    message="Your HEMC account password was recently updated. If you did not make this change, please contact UNN Medical IT support immediately.",
                    link="/profile"
                )
            except Exception as e:
                print(f"Failed to create security notification: {e}")

        return updated
        
    def admin_create_user(self, req: AdminUserCreateRequest, db: Session):
        existing = db.query(User).filter(User.email == req.email).first()
        if existing:
            raise ValueError("Email already registered")
        
        data = req.model_dump()
        raw_password = data.pop("password")
        data["hashed_password"] = get_password_hash(raw_password)
        
        user = User(**data)
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # If doctor role, ensure entry in doctors table
        if user.role == "doctor":
            from app.modules.doctors.models.doctor import Doctor
            doc_entry = db.query(Doctor).filter(Doctor.user_id == user.id).first()
            if not doc_entry:
                doc_entry = Doctor(
                    user_id=user.id,
                    specialization=user.specialization or "General Medicine",
                    is_available=True
                )
                db.add(doc_entry)
                db.commit()
                
        return user

    def admin_update_user(self, user_id: int, req: AdminUserUpdateRequest, current_user_id: int, db: Session):
        target_user = db.query(User).filter(User.id == user_id).first()
        if not target_user:
            raise ValueError("User not found")
        if user_id == current_user_id and req.role and req.role != "admin":
            raise ValueError("You cannot change your own role away from admin to prevent accidental lockout.")
        data = req.model_dump(exclude_unset=True)
        if "password" in data and data["password"]:
            data["hashed_password"] = get_password_hash(data.pop("password"))
        elif "password" in data:
            data.pop("password")
            
        updated = self.repo.update_user(target_user, data)
        
        # If role is doctor, ensure entry in doctors table
        if updated.role == "doctor":
            from app.modules.doctors.models.doctor import Doctor
            doc_entry = db.query(Doctor).filter(Doctor.user_id == updated.id).first()
            if not doc_entry:
                doc_entry = Doctor(
                    user_id=updated.id,
                    specialization=updated.specialization or "General Medicine",
                    is_available=True
                )
                db.add(doc_entry)
                db.commit()
            elif updated.specialization:
                doc_entry.specialization = updated.specialization
                db.commit()
                
        return updated

    def admin_delete_user(self, user_id: int, current_user_id: int, db: Session):
        if user_id == current_user_id:
            raise ValueError("You cannot delete your own admin account")
        target_user = db.query(User).filter(User.id == user_id).first()
        if not target_user:
            raise ValueError("User not found")
            
        # Clean up Doctor entry if exists
        from app.modules.doctors.models.doctor import Doctor
        db.query(Doctor).filter(Doctor.user_id == user_id).delete()
        
        db.delete(target_user)
        db.commit()
        return {"success": True, "message": "User deleted successfully"}
