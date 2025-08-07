from pydantic import BaseModel ,EmailStr 

class SignupRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class InterviewResultCreate(BaseModel):
    username: str
    confidence_score: float
    emotion_score: float
    voice_score: float

class InterviewResultResponse(InterviewResultCreate):
    id: int

    class Config:
        orm_mode = True
