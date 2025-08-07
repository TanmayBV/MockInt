# app/routers/emotion.py

from fastapi import APIRouter, UploadFile, File
from fer import FER
import numpy as np
import cv2

router = APIRouter()
emotion_detector = FER(mtcnn=True)

@router.post("/detect_emotion/")
async def detect_emotion(file: UploadFile = File(...)):
    contents = await file.read()
    np_array = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

    result = emotion_detector.detect_emotions(frame)

    if result:
        emotions = result[0]["emotions"]
        top_emotion = max(emotions, key=emotions.get)
        return {
            "emotion": top_emotion,
            "confidence": emotions[top_emotion]
        }
    return {"emotion": "No face detected", "confidence": 0.0}
