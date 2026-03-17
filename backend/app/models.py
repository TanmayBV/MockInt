# backend/app/models.py

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from app.supabase_client import supabase  # Make sure this file exists

# Confidence data point model
class ConfidenceDataPoint(BaseModel):
    confidence: float  # 0-100
    duration: float    # in seconds

# Request body model
class InterviewData(BaseModel):
    user_id: Optional[UUID] = None
    job_role: str
    interview_name: Optional[str] = None
    level: Optional[str] = None  # Beginner | Intermediate | Hard
    confidence_data: List[ConfidenceDataPoint]  # Array of confidence data points
    answers: List[str]
    timestamp: datetime

    def calculate_overall_confidence(self) -> float:
        """
        Calculate overall confidence using weighted average formula:
        overall_confidence = sum(confidence_i * duration_i) / sum(duration_i)
        """
        if not self.confidence_data:
            return 0.0
        
        total_weighted_confidence = 0.0
        total_duration = 0.0
        
        for data_point in self.confidence_data:
            # Ensure confidence is within 0-100 range
            confidence = max(0.0, min(100.0, data_point.confidence))
            duration = max(0.0, data_point.duration)
            
            total_weighted_confidence += confidence * duration
            total_duration += duration
        
        if total_duration == 0:
            return 0.0
        
        return total_weighted_confidence / total_duration

# Function to save interview data
def save_interview_data(data: InterviewData):
    try:
        # Calculate overall confidence
        overall_confidence = data.calculate_overall_confidence()

        # Prepare data for database (exclude confidence_data, add calculated confidence)
        db_data = {
            "user_id": str(data.user_id),  # store as UUID string
            "job_role": data.job_role,
            "interview_name": data.interview_name,
            "level": data.level,
            "confidence": overall_confidence,  # Store calculated overall confidence
            "answers": data.answers,
            "timestamp": data.timestamp.isoformat() if isinstance(data.timestamp, datetime) else data.timestamp,
        }

        print(f"Saving interview data to database: {db_data}")
        response = supabase.table("interviews").insert(db_data).execute()
        print(f"Database response: {response}")
        return response
    except Exception as e:
        print(f"Error saving interview data: {str(e)}")
        raise e

# Function to retrieve interviews for a user
def get_user_interviews(user_id: UUID | str):
    try:
        uid = str(user_id)
        print(f"Fetching interviews for user_id: {uid}")
        response = supabase.table("interviews").select("*").eq("user_id", uid).execute()
        print(f"Retrieved interviews: {response.data}")
        return response.data
    except Exception as e:
        print(f"Error retrieving interviews: {str(e)}")
        raise e
