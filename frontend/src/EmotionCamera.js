import React, { useRef, useEffect, useState } from "react";

const EmotionCamera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [emotion, setEmotion] = useState("Loading...");
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    });

    const interval = setInterval(() => {
      captureAndSendFrame();
    }, 1000); // Capture every 1 second

    return () => clearInterval(interval);
  }, []);

  const captureAndSendFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      const response = await fetch("http://127.0.0.1:8000/detect_emotion/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setEmotion(data.emotion);
      setConfidence((data.confidence * 100).toFixed(2));
    }, "image/jpeg");
  };

  return (
    <div style={{ position: "relative", width: 640, height: 480 }}>
      <video ref={videoRef} width={640} height={480} style={{ borderRadius: 10 }} />
      <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }} />
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "10px",
          fontSize: "18px",
        }}
      >
        Emotion: <strong>{emotion}</strong> <br />
        Confidence: <strong>{confidence}%</strong>
      </div>
    </div>
  );
};

export default EmotionCamera;
