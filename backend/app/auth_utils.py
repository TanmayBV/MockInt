# backend/app/auth_utils.py

from datetime import datetime, timedelta
from jose import JWTError, jwt
import os
from dotenv import load_dotenv
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.supabase_client import supabase

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

security = HTTPBearer()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise ValueError("Invalid token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        
        # For demo purposes, extract user ID from simple token format
        if token.startswith("token_"):
            user_id = token.replace("token_", "")
        else:
            # Try to decode as JWT
            payload = decode_token(token)
            user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Fetch user from database
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=401, detail="User not found")
        
        return response.data[0]
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
