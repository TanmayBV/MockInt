import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user"
};

const CameraComponent = () => {
  const webcamRef = useRef(null);
  const [emotion, setEmotion] = useState("");

  // Auto-capture every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      capture();
    }, 1000); // 1000ms = 1 second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const capture = async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const blob = await fetch(imageSrc).then(res => res.blob());
    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    try {
      const response = await fetch("http://127.0.0.1:8000/detect_emotion", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to fetch emotion");
      }

      const data = await response.json();
      setEmotion(data.emotion);
    } catch (error) {
      console.error("Error detecting emotion:", error);
      setEmotion("Error");
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <Webcam
        audio={false}
        height={480}
        width={640}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      />

      {emotion && (
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            border: "3px solid #00FF00",
            padding: "10px 20px",
            color: "#00FF00",
            fontSize: "18px",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderRadius: "10px"
          }}
        >
          {emotion}
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
