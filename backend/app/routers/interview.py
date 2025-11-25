# backend/app/routers/interview.py

from fastapi import APIRouter, Depends, HTTPException
from app.models import InterviewData, save_interview_data, get_user_interviews
from app.supabase_client import supabase
from app.auth_utils import get_current_user
from uuid import uuid4
from datetime import datetime

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

@router.post("/start")
async def start_interview(payload: dict, current_user: dict = Depends(get_current_user)):
    """
    Create and return a new interview row. Request body should include job_role, interview_name, level, pre-fill as needed.
    """
    try:
        now = datetime.now().isoformat()
        record = {
            # Let Supabase generate the id (uuid default) if configured
            "user_id": str(current_user.get("id")),
            "job_role": (payload or {}).get("job_role") or "Interview",
            "interview_name": (payload or {}).get("interview_name"),
            "level": (payload or {}).get("level"),
            "timestamp": now,
        }
        response = supabase.table("interviews").insert(record).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Insert returned no data from Supabase")
        new_row = response.data[0]
        return {"status": "success", "id": new_row.get("id"), "row": new_row}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")

@router.patch("/{interview_id}")
async def update_interview(interview_id: str, payload: dict, current_user: dict = Depends(get_current_user)):
    """
    Update answer, filler_words, and confidence for an interview by id.
    """
    try:
        update_fields = {}
        for k in ["answer", "filler_words", "confidence"]:
            if k in payload:
                update_fields[k] = payload[k]
        if not update_fields:
            raise HTTPException(status_code=400, detail="No updatable fields provided.")
        resp = supabase.table("interviews").update(update_fields).eq("id", interview_id).execute()
        return {"status": "success", "data": resp.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update interview: {str(e)}")
