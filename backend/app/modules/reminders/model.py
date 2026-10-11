from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime, timezone
from app.core.base import Base

class Reminder(Base):
    __tablename__ = "reminders"

    reminder_id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id"), index=True, nullable=False)
    message = Column(Text, nullable=False)
    scheduled_time = Column(DateTime, index=True, nullable=False)
    sent_at = Column(DateTime, index=True, nullable=True)
    channel = Column(String, default="email", nullable=False)
