from fastapi import APIRouter, UploadFile, File
from utils.emotion_detector import detect_emotion_from_image

router = APIRouter()

@router.post("/detect_emotion/")
async def detect_emotion(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = detect_emotion_from_image(image_bytes)
    return result
