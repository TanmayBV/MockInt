## 📄 `README.md`

```markdown
# 🤖 Mock Interview AI Web App

An AI/ML-powered mock interview platform that evaluates user performance in real-time by analyzing:

- 🎥 Facial expressions for **emotion & confidence**
- 🎙️ Voice tone for **confidence & emotion**
- 🧠 Spoken answers for **semantic quality**

---

## 🚀 Features

- 📷 Real-time **facial emotion detection** using webcam
- 🎤 **Voice emotion & confidence analysis**
- 📝 **Answer quality scoring** using NLP models
- 📊 Visual feedback dashboard (confidence, emotions, relevance)
- ⚡ FastAPI backend with Dockerized React frontend
- ✅ CI/CD with GitHub Actions
- 🐳 Docker-based local development setup

---

## 🧱 Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | React.js, MediaRecorder API, HTML/CSS    |
| Backend     | FastAPI (Python), Uvicorn, DeepFace, librosa |
| ML/NLP      | HuggingFace Transformers (BERT), Whisper |
| Audio/Video | OpenCV, PyDub, ffmpeg                    |
| DevOps      | Docker, Docker Compose, GitHub Actions   |

---

## 📁 Project Structure

mock-interview-ai/
├── backend/                      # FastAPI + ML models
│   ├── main.py                   # API entrypoint
│   ├── emotion_detector.py       # Facial expression analysis
│   ├── voice_emotion.py          # Voice analysis
│   └── utils/                    # Utility functions
│
├── frontend/                     # React web UI
│   ├── src/                      # React source files
│   ├── public/                   # Static files
│   └── Dockerfile                # Docker config for frontend
│
├── .github/                      # GitHub workflows
│   └── workflows/
│       └── ci.yml                # CI/CD pipeline config
│
├── docker-compose.yml            # Docker orchestration
├── .env.example                  # Sample environment variables
└── README.md                     # Project documentation
```


---

## 🐳 Docker Setup

> Run both frontend & backend in development mode using Docker.

### 🔧 Step 1: Build and Start

```bash
docker-compose up --build
````

* Backend: [http://localhost:8000/docs](http://localhost:8000/docs)
* Frontend: [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Setup

### 1. Clone the Project

```bash
git clone https://github.com/yourusername/mock-interview-ai.git
cd mock-interview-ai
```

### 2. Create Environment Files

Create a `.env` file based on the example:

```bash
cp .env.example backend/.env
```

### 3. Sample `.env.example`

```env
# === FastAPI / Uvicorn ===
APP_ENV=development
APP_NAME=mock-interview-ai
APP_PORT=8000
DEBUG=true

# === CORS ===
ALLOWED_ORIGINS=http://localhost:3000

# === ML Model Config ===
EMOTION_MODEL_PATH=models/emotion_model.h5
VOICE_MODEL_PATH=models/voice_model.pkl

# === Database (Optional) ===
DB_URL=sqlite:///./interviews.db

# === Secrets ===
SECRET_KEY=your-secret-key
```

---

## 🧠 AI/ML Modules

### 🧍‍♂️ Face Emotion Detection

* Uses `DeepFace` and `OpenCV`
* Estimates emotion (`happy`, `neutral`, etc.)
* Calculates a confidence score based on emotion weight

### 🎙️ Voice Emotion & Confidence

* Uses `librosa` for pitch, energy, MFCC
* Calculates confidence based on audio metrics
* Optional: Use `SpeechBrain` or RAVDESS-trained model for emotion class

### 🗣️ Answer Quality Scoring

* Transcribe answers with OpenAI Whisper
* Compare against expected answers using `BERT` similarity
* Scored based on relevance, coherence, fluency

---

## ✅ GitHub Actions CI/CD

Path: `.github/workflows/ci.yml`

### Features:

* 🧪 Lint and build **backend (Python)**
* 🔧 Build and test **frontend (React)**
* 🐳 Optionally build Docker images on push

---

## 🧪 Local Development

### Frontend

```bash
cd frontend
npm install
npm start
```

* Runs at `http://localhost:3000`

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

* Runs at `http://localhost:8000`

---

## 📦 Backend Requirements

Add this to `backend/requirements.txt`:

```txt
fastapi
uvicorn
deepface
librosa
numpy
opencv-python
transformers
soundfile
scipy
python-multipart
```

---

## 📦 Frontend Requirements

Add these to `frontend/package.json`:

```json
"dependencies": {
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "react-scripts": "5.0.0"
}
```


## 👥 Contributing

1. Fork the repo
2. Create a new branch: `feature/your-feature-name`
3. Commit your changes with clear message
4. Push to GitHub
5. Create a pull request

---

## 📃 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute.

---

## ✨ Credits

* **Tanmay Baravkar** – Backend / AI/ML Engineering
* **Aditya Nawgan** – Frontend Developer
* Inspired by real-world interviews & AI research.

---

## 📬 Questions?

Open an issue or reach out on [LinkedIn](https://linkedin.com).

```


You're ready to push this project live 🚀
```
