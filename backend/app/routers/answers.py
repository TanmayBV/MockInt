from fastapi import APIRouter, Depends, HTTPException
from app.auth_utils import get_current_user
from app.supabase_client import supabase


router = APIRouter(prefix="/answers", tags=["answers"])


@router.get("/")
def list_answers(current_user: dict = Depends(get_current_user)):
    try:
        data = supabase.table("answers").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).execute()
        return {"status": "success", "answers": data.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{answer_id}/filler_words")
def get_filler_words(answer_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # optional join-like behavior if separate table exists
        data = supabase.table("filler_words").select("*").eq("answer_id", answer_id).execute()
        return {"status": "success", "filler_words": data.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




