from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app import db

router = APIRouter(prefix="/api/users", tags=["users"])

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserLogin(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(data: UserRegister):
    """Register a new user"""
    # Check if user already exists
    existing = db.get_user_by_email(data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    user = db.create_user(data.email, data.password, data.username)
    return user

@router.post("/login")
def login(data: UserLogin):
    """Login user by username"""
    # Get user by username
    user = db.get_user_by_username(data.username)
    
    if not user or user['password'] != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return user

@router.get("/me")
def get_current_user(user_id: int):
    """Get current user info"""
    user = db.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
