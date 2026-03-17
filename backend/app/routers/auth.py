# app/routers/auth.py

from fastapi import APIRouter, HTTPException, Depends
from supabase import create_client, Client
import os
from app.schemas import SignupRequest, LoginRequest  # <-- include LoginRequest
from app.supabase_client import supabase
from app.auth_utils import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])  # <--- IMPORTANT

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@router.post("/signup")
def signup(user: SignupRequest):
    try:
        print("Signing up user:", user.dict())
        response = supabase.table("users").insert({
            "email": user.email,
            "password": user.password,
            "username": user.name  # Store name in username column
        }).execute()
        print("Signup response:", response)

        return {"message": "User registered successfully"}
    except Exception as e:
        print("Exception in signup:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login")
def login(user: LoginRequest):
    try:
        print("Logging in user:", user.dict())
        response = supabase.table("users").select("*").eq("email", user.email).eq("password", user.password).execute()
        print("Login response:", response)

        # response is a list of records
        if not response.data:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user_data = response.data[0]
        return {
            "message": "Login successful", 
            "user": {
                "id": user_data["id"],
                "name": user_data.get("username", "User"),  # Use username as name
                "email": user_data["email"]
            },
            "access_token": f"token_{user_data['id']}"  # Simple token for demo
        }
    except Exception as e:
        print("Exception in login:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user")
def get_user_profile(current_user: dict = Depends(get_current_user)):
    try:
        return {
            "id": current_user["id"],
            "name": current_user.get("username", "User"),  # Use username as name
            "email": current_user["email"]
        }
    except Exception as e:
        print("Exception in get_user_profile:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
