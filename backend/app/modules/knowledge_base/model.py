from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from datetime import datetime, timezone
import enum
from app.core.base import Base

class DiseaseEnum(str, enum.Enum):
    malaria = "malaria"
    typhoid = "typhoid"

class CategoryEnum(str, enum.Enum):
    symptom = "symptom"
    cause = "cause"
    prevention = "prevention"
    general = "general"

class SourceEnum(str, enum.Enum):
    WHO = "WHO"
    NCDC = "NCDC"

class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"

    topic_id = Column(Integer, primary_key=True, index=True)
    disease = Column(Enum(DiseaseEnum), nullable=False)
    category = Column(Enum(CategoryEnum), nullable=False)
    content = Column(Text, nullable=False)
    source = Column(Enum(SourceEnum), nullable=False)
    source_url = Column(String, nullable=True)
    updated_at = Column(DateTime, index=True, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    updated_by = Column(Integer, ForeignKey("users.id"), index=True)
