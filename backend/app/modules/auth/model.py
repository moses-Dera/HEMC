from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime, timezone
from app.core.base import Base

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    token_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    token_hash = Column(String, nullable=False, unique=True)
    expires_at = Column(DateTime, index=True, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, index=True, default=lambda: datetime.now(timezone.utc))
