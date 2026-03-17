from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Tuple
import tempfile
import os
import logging
import subprocess
from app.supabase_client import supabase
from app.auth_utils import get_current_user
import speech_recognition as sr

try:
    from pydub import AudioSegment
    try:
        import imageio_ffmpeg  # provides a bundled ffmpeg binary path
        AudioSegment.converter = imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        pass  # Will rely on system ffmpeg if available
except Exception:
    AudioSegment = None

foreign_class = None


router = APIRouter(tags=["voice"])


_classifier = None
_asr_model = None


def _load_classifier():
    raise RuntimeError("Voice emotion classification is disabled.")


def ensure_model_ready() -> bool:
    return True


def _load_asr_model():
    global _asr_model
    if _asr_model is not None:
        return _asr_model
    try:
        from faster_whisper import WhisperModel
    except Exception as e:
        raise RuntimeError("faster-whisper not installed. Please add 'faster-whisper' to requirements.txt")
    _asr_model = WhisperModel("base", device="cpu", compute_type="float32")
    return _asr_model


def ensure_asr_ready() -> bool:
    try:
        _ = _load_asr_model()
        return True
    except Exception as e:
        logging.warning(f"ASR model warmup failed: {e}")
        return False


def _write_temp_file(data: bytes, suffix: str) -> str:
    tmp = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
    try:
        tmp.write(data)
        tmp.flush()
    finally:
        tmp.close()
    return tmp.name


def _ensure_wav(input_path: str) -> Tuple[str, bool]:
    """
    Ensure we have a wav file on disk. If input is already .wav, return it.
    If webm/other, convert using pydub+ffmpeg. Returns (wav_path, created_temp).
    """
    base, ext = os.path.splitext(input_path)
    ext = ext.lower()
    if ext == ".wav":
        return input_path, False

    if AudioSegment is None:
        raise RuntimeError("pydub is not installed. Please install 'pydub' and ensure ffmpeg is available in PATH.")

    wav_path = base + ".wav"
    # Convert using pydub (requires ffmpeg installed in environment)
    # Help decoder by providing format for webm files
    try:
        if ext == ".webm":
            audio = AudioSegment.from_file(input_path, format="webm")
        else:
            audio = AudioSegment.from_file(input_path)
        audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
        audio.export(wav_path, format="wav")
    except Exception as e:
        # Fallback: use ffmpeg CLI directly if decoding via pydub failed
        try:
            import imageio_ffmpeg
            ffmpeg_bin = imageio_ffmpeg.get_ffmpeg_exe()
            cmd = [
                ffmpeg_bin,
                "-y",
                "-i", input_path,
                "-ar", "16000",
                "-ac", "1",
                "-f", "wav",
                wav_path,
            ]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception as fferr:
            raise RuntimeError(f"Audio conversion failed: {str(e)}; ffmpeg fallback also failed: {str(fferr)}")
    return wav_path, True


@router.post("/detect_voice_emotion/")
async def detect_voice_emotion(file: UploadFile = File(...)):
    raise HTTPException(status_code=410, detail="Voice emotion endpoint removed. Use /transcribe_voice/ instead.")


@router.post("/transcribe_voice/")
async def transcribe_voice(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        data = await file.read()
        if not data:
            raise HTTPException(status_code=400, detail="Empty audio payload")

        original_suffix = ".wav" if file.filename and file.filename.lower().endswith(".wav") else ".webm"
        src_path = _write_temp_file(data, original_suffix)
        wav_path, created_wav = _ensure_wav(src_path)

        r = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = r.record(source)
            try:
                transcript_text = r.recognize_sphinx(audio_data)  # Offline Sphinx
            except sr.UnknownValueError:
                transcript_text = "(Could not understand audio)"
            except sr.RequestError as e:
                transcript_text = f"(Sphinx error: {e})"

        # Compute filler words
        filler_list = [
            "um", "uh", "like", "you know", "so", "actually", "basically", "literally",
            "right", "okay", "well", "hmm", "erm", "ah", "eh"
        ]
        text_lower = transcript_text.lower()
        filler_counts = {}
        for fw in filler_list:
            count = text_lower.count(fw)
            if count > 0:
                filler_counts[fw] = count

        # interview_record = {
        #     "user_id": current_user["id"],
        #     "answer": transcript_text,
        #     "filler_words": filler_counts,
        # }
        # try:
        #     supabase.table("interviews").insert(interview_record).execute()
        # except Exception as db_err:
        #     logging.warning(f"Supabase insert failed for interviews (answer/filler_words): {db_err}")

        return {
            "status": "success",
            "transcript": {
                "text": transcript_text,
                "filler_words": filler_counts,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice transcription failed: {str(e)}")
    finally:
        try:
            if 'src_path' in locals() and os.path.exists(src_path):
                os.remove(src_path)
        except Exception:
            pass
        try:
            if 'created_wav' in locals() and created_wav and os.path.exists(wav_path):
                os.remove(wav_path)
        except Exception:
            pass

