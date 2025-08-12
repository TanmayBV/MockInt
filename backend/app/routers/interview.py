# backend/app/routers/interview.py

from fastapi import APIRouter, Depends, HTTPException
from app.models import InterviewData, save_interview_data, get_user_interviews
from app.auth_utils import get_current_user

router = APIRouter(prefix="/interview", tags=["interview"])

@router.post("/")
async def save_interview(interview: InterviewData, current_user: dict = Depends(get_current_user)):
    """
    Save interview data with calculated overall confidence.
    
    Expected request body:
    {
        "job_role": "Software Engineer",
        "confidence_data": [
            {"confidence": 85.5, "duration": 30.0},
            {"confidence": 92.1, "duration": 45.0},
            {"confidence": 78.3, "duration": 25.0}
        ],
        "answers": ["Answer 1", "Answer 2", "Answer 3"],
        "timestamp": "2024-01-01T12:00:00"
    }
    """
    try:
        # Set user_id from authenticated user (UUID)
        interview.user_id = current_user["id"]
        
        # Calculate and save interview data
        response = save_interview_data(interview)
        
        return {
            "status": "success", 
            "message": "Interview data saved successfully",
            "overall_confidence": interview.calculate_overall_confidence(),
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save interview data: {str(e)}")

@router.get("/")
async def get_interviews(current_user: dict = Depends(get_current_user)):
    """
    Retrieve all interviews for the authenticated user.
    """
    try:
        data = get_user_interviews(current_user["id"])
        return {
            "status": "success", 
            "interviews": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve interviews: {str(e)}")
