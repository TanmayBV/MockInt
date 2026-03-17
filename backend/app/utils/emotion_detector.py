from deepface import DeepFace
import cv2
import numpy as np

def detect_emotion_from_image(image_bytes):
    try:
        # Decode image bytes to OpenCV format
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Analyze with DeepFace (emotion only)
        result = DeepFace.analyze(img_path=img, actions=['emotion'], enforce_detection=False)

        dominant_emotion = result[0]['dominant_emotion']
        emotion_score = result[0]['emotion'][dominant_emotion]

        return {
            "emotion": dominant_emotion,
            "confidence": float(round(emotion_score / 100, 2))
        }

    except Exception as e:
        return {
            "emotion": "error",
            "confidence": 0.0,
            "message": str(e)
        }
