from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from emotion_detector import detect_emotion_from_image

app = FastAPI()

# Allow all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/detect_emotion")
async def detect_emotion(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = detect_emotion_from_image(image_bytes)
    return result
