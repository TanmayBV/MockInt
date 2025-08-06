from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class InterviewResult(Base):
    __tablename__ = "interview_results"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    confidence_score = Column(Float)
    emotion_score = Column(Float)
    voice_score = Column(Float)
