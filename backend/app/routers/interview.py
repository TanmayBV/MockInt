# backend/app/routes/interview.py

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from app.models import InterviewData, save_interview_data, get_user_interviews
from app.auth_utils import decode_token 

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post("/interview")
async def save_interview(interview: InterviewData, token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    interview.user_id = user["user_id"]
    response = save_interview_data(interview)
    return {"status": "success", "data": response.data}

@router.get("/interview")
async def get_interviews(token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    data = get_user_interviews(user["user_id"])
    return {"status": "success", "interviews": data}
