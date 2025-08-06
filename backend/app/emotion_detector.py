from deepface import DeepFace
import numpy as np
import cv2
from PIL import Image
import io

def detect_emotion_from_frame(image_bytes):
    try:
        # Convert image bytes to a numpy array
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Failed to decode image.")

        # Analyze the image with DeepFace (disable strict face detection)
        result = DeepFace.analyze(
            img_path=img,
            actions=['emotion'],
            enforce_detection=False
        )

        # Extract and return the dominant emotion
        return result[0]["dominant_emotion"]

    except Exception as e:
        print(f"[Emotion Detection Error] {str(e)}")
        return "error"
