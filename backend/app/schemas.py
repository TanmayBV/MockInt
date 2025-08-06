from pydantic import BaseModel

class InterviewResultCreate(BaseModel):
    username: str
    confidence_score: float
    emotion_score: float
    voice_score: float

class InterviewResultResponse(InterviewResultCreate):
    id: int

    class Config:
        orm_mode = True
