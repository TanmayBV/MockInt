import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageWrapper from './PageWrapper';
import Header from './Header';
import API from '../api';

const EmotionCamera = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { interviewName, jobRole, level, questions: initialQuestions } = location.state || {};
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [emotion, setEmotion] = useState("Loading...");
  const [confidence, setConfidence] = useState(0);
  const [confidenceData, setConfidenceData] = useState([]);
  const intervalRef = useRef(null);
  const [questions, setQuestions] = useState(Array.isArray(initialQuestions) ? initialQuestions : []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Generate questions on load if none were provided from the dashboard
  useEffect(() => {
    if (!questions || questions.length === 0) {
      const base = (jobRole && jobRole.trim()) ? jobRole.trim() : 'the role';
      const difficultyHint = level === 'Beginner' ? 'basic' : level === 'Intermediate' ? 'practical' : 'advanced';
      const qs = [
        `Describe your experience relevant to ${base} at a ${difficultyHint} level.`,
        `How would you approach a common challenge in ${base}? Keep it ${difficultyHint}.`,
        `Give an example of a project or task related to ${base} and explain your decisions at a ${difficultyHint} level.`,
      ];
      setQuestions(qs);
      setCurrentQuestionIndex(0);
    }
    // Only depends on role/level so it runs once per session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobRole, level]);

  useEffect(() => {
    // Start webcam
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    const video = videoRef.current;
    video.srcObject = stream;

    // ✅ Play only after metadata is loaded
    video.onloadedmetadata = () => {
      video.play().catch((err) => {
        console.error("Video play error:", err);
      });
    };
  });

    // Set interval to capture frames
    intervalRef.current = setInterval(() => {
      captureAndSendFrame();
    }, 2000); // every 2 seconds

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
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

      try {
        const response = await fetch("http://127.0.0.1:8000/detect_emotion", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log("Received:", data);

        setEmotion(data.emotion.emotion);
        const numericConfidence = Number((data.emotion.confidence * 100).toFixed(2));
        setConfidence(numericConfidence);
        // accumulate confidence data with fixed duration equal to interval period (2s)
        setConfidenceData((prev) => [
          ...prev,
          { confidence: numericConfidence, duration: 2.0 },
        ]);

      } catch (err) {
        console.error("Emotion detection error:", err);
      }
    }, "image/jpeg");
  };

  const handleEndInterview = async () => {
    try {
      // stop interval
      if (intervalRef.current) clearInterval(intervalRef.current);
      // stop camera stream
      const video = videoRef.current;
      if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }

      // Extract pre-interview data from navigation state
      const { interviewName, jobRole, level, questions } = location.state || {};

      // Prepare payload
      const payload = {
        job_role: jobRole || 'Interview',
        confidence_data: confidenceData,
        answers: [],
        timestamp: new Date().toISOString(),
        interview_name: interviewName || undefined,
        level: level || undefined,
      };

      console.log('Submitting interview:', payload);
      await API.post('/interview/', payload);
    } catch (err) {
      console.error('Failed to submit interview:', err);
    } finally {
      navigate('/dashboard');
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <div className="pt-16 px-4 py-8">
          <div className="w-full max-w-6xl mx-auto">
            <div className="bg-gray-900/60 backdrop-blur border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-6 sm:p-8">
              <div className="mb-6 text-center">
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-2">
                  {interviewName || 'Emotion Detection Interview'}
                </h1>
                <p className="text-sm text-gray-400">
                  {jobRole ? `${jobRole}${level ? ` • ${level}` : ''}` : 'Your emotions are being analyzed in real-time'}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Area */}
                <div className="relative lg:col-span-2">
                  <video
                    ref={videoRef}
                    className="w-full h-auto max-w-full rounded-xl shadow-lg border border-white/10"
                    style={{ maxHeight: '480px' }}
                  />
                  <canvas ref={canvasRef} className="hidden" width={640} height={480} />

                  {/* Emotion Overlay Display */}
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur border border-white/20 text-white px-4 py-3 rounded-xl shadow-lg">
                    <div className="text-sm font-medium text-gray-300">Emotion</div>
                    <div className="text-lg font-semibold text-white">{emotion}</div>
                    <div className="text-sm font-medium text-gray-300 mt-1">Confidence</div>
                    <div className="text-lg font-semibold text-blue-400">{confidence}%</div>
                  </div>
                </div>

                {/* Questions Panel */}
                <div className="flex flex-col bg-gray-800/50 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-white font-semibold">Question {Math.min(currentQuestionIndex + 1, questions.length)}/{questions.length || 1}</h2>
                  </div>
                  <div className="flex-1">
                    {questions.length > 0 ? (
                      <p className="text-gray-200 leading-relaxed">{questions[currentQuestionIndex]}</p>
                    ) : (
                      <p className="text-gray-400 text-sm">No questions provided.</p>
                    )}
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 text-sm rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex((i) => Math.min((questions.length - 1), i + 1))}
                      disabled={questions.length === 0 || currentQuestionIndex === questions.length - 1}
                      className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:brightness-110 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleEndInterview}
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium py-3 px-8 rounded-lg shadow-lg shadow-red-500/20 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-600 transition-all duration-200"
                >
                  End Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default EmotionCamera;
