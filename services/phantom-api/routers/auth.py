from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database import supabase

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(req: RegisterRequest):
    try:
        res = supabase.auth.sign_up({"email": req.email, "password": req.password})
        return {"message": "Registration successful", "user": res.user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(req: LoginRequest):
    try:
        res = supabase.auth.sign_in_with_password({"email": req.email, "password": req.password})
        return {
            "access_token": res.session.access_token,
            "user": res.user.email
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/google")
def google_oauth():
    res = supabase.auth.sign_in_with_oauth({"provider": "google"})
    return {"url": res.url}

@router.post("/logout")
def logout():
    supabase.auth.sign_out()
    return {"message": "Logged out"}
