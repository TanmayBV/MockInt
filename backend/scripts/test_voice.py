from fastapi.testclient import TestClient
from app.main import app
import io
import wave
import json


def main():
    # Create a 1-second mono 16kHz silence WAV in-memory
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        wf.writeframes(b"\x00\x00" * 16000)
    buf.seek(0)

    client = TestClient(app)
    files = { 'file': ('test.wav', buf, 'audio/wav') }
    resp = client.post('/detect_voice_emotion/', files=files)
    print('status', resp.status_code)
    try:
        print(json.dumps(resp.json()))
    except Exception:
        print(resp.text)


if __name__ == '__main__':
    main()




