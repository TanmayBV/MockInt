from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.utils.emotion_detector import detect_emotion_from_image

app = FastAPI()

# Allow frontend (React running on localhost:3000) to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Mock Interview Emotion Detection API running."}

@app.post("/detect_emotion")
async def detect_emotion(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        emotion = detect_emotion_from_image(contents)
        return {"emotion": emotion}
    except Exception as e:
        return {"error": str(e)}
