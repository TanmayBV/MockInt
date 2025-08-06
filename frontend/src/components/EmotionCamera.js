import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

const EmotionCamera = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [intervalId, setIntervalId] = useState(null);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
  };

  const captureAndSend = async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.getScreenshot
    ) {
      const imageSrc = webcamRef.current.getScreenshot();

      const blob = await (await fetch(imageSrc)).blob();
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      try {
        const res = await fetch('http://127.0.0.1:8000/detect_emotion', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.faces) {
          drawBoundingBoxes(data.faces);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    }
  };

  const drawBoundingBoxes = (faces) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.font = '16px Arial';
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red';

    faces.forEach((face) => {
      const { x, y, w, h } = face.box;
      ctx.strokeRect(x, y, w, h);
      ctx.fillText(
        `${face.emotion} (${Math.round(face.confidence)}%)`,
        x,
        y > 20 ? y - 5 : y + 20
      );
    });
  };

  useEffect(() => {
    const id = setInterval(captureAndSend, 1000); // every 1 sec
    setIntervalId(id);

    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: 640, height: 480 }}>
      <Webcam
        ref={webcamRef}
        audio={false}
        width={640}
        height={480}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        style={{ position: 'absolute' }}
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
};

export default EmotionCamera;
