import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const WebcamEmotions = () => {
  const videoRef = useRef(null);
  const [emotion, setEmotion] = useState('');

  useEffect(() => {
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };
    getVideo();
  }, []);

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    return imageData;
  };

  const detectEmotion = async () => {
    const image = captureImage();
    try {
      const response = await axios.post('http://localhost:8000/detect_face_emotion', {
        image_base64: image,
      });
      setEmotion(response.data.emotion);
    } catch (error) {
      console.error('Detection error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <video ref={videoRef} autoPlay playsInline className="rounded-lg border border-gray-300 w-96" />
      <button
        onClick={detectEmotion}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Detect Emotion
      </button>
      {emotion && (
        <p className="mt-4 text-lg">Detected Emotion: <strong>{emotion}</strong></p>
      )}
    </div>
  );
};

export default WebcamEmotions;