# app/routers/auth.py

from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
import os
from app.schemas import SignupRequest, LoginRequest  # <-- include LoginRequest
from app.supabase_client import supabase

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
            "password": user.password
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

        return {"message": "Login successful", "user": response.data[0]}
    except Exception as e:
        print("Exception in login:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
