# backend/app/models.py

from pydantic import BaseModel
from typing import List
from datetime import datetime
from app.supabase_client import supabase  # Make sure this file exists

# Request body model
class InterviewData(BaseModel):
    user_id: str
    job_role: str
    confidence: float
    answers: List[str]
    timestamp: datetime

# Function to save interview data
def save_interview_data(data: InterviewData):
    response = supabase.table("interviews").insert(data.dict()).execute()
    return response

# Function to retrieve interviews for a user
def get_user_interviews(user_id: str):
    response = supabase.table("interviews").select("*").eq("user_id", user_id).execute()
    return response.data
