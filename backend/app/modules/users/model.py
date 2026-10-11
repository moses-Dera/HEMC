from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="student", nullable=False) # student, doctor, admin
    # Student specific
    reg_number = Column(String, unique=True, index=True, nullable=True)
    department = Column(String, nullable=True)
    level = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    genotype = Column(String, nullable=True)
    allergies = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True)
    hostel = Column(String, nullable=True)
    
    # Doctor specific
    specialization = Column(String, nullable=True)
    is_on_duty = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
