from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.utils.emotion_detector import detect_emotion_from_image
from app.routers.auth import router as auth_router
from app.routers.interview import router as interview_router
from app.supabase_client import supabase
from datetime import datetime

app = FastAPI()

# Allow frontend (React running on localhost:3000) to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(interview_router)

@app.get("/")
async def root():
    return {"message": "Mock Interview Emotion Detection API running."}

@app.get("/test-db")
async def test_database():
    """Test database connection and table structure"""
    try:
        # Test users table
        users_response = supabase.table("users").select("count", count="exact").execute()
        
        # Test interviews table
        interviews_response = supabase.table("interviews").select("count", count="exact").execute()
        
        return {
            "status": "success",
            "database_connected": True,
            "users_count": users_response.count,
            "interviews_count": interviews_response.count,
            "tables": {
                "users": "exists",
                "interviews": "exists"
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "database_connected": False,
            "error": str(e)
        }

@app.post("/test-insert-interview")
async def test_insert_interview():
    """Test inserting interview data manually"""
    try:
        test_data = {
            "user_id": 1,  # Assuming user ID 1 exists
            "job_role": "Software Engineer",
            "confidence": 85.5,
            "answers": ["Test answer 1", "Test answer 2"],
            "timestamp": datetime.now().isoformat()
        }
        
        print(f"Inserting test data: {test_data}")
        response = supabase.table("interviews").insert(test_data).execute()
        print(f"Insert response: {response}")
        
        return {
            "status": "success",
            "message": "Test interview data inserted",
            "data": response.data
        }
    except Exception as e:
        print(f"Error inserting test data: {str(e)}")
        return {
            "status": "error",
            "error": str(e)
        }

@app.post("/detect_emotion")
async def detect_emotion(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        emotion = detect_emotion_from_image(contents)
        return {"emotion": emotion}
    except Exception as e:
        return {"error": str(e)}
