from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session_maker
from app.users.models import User
from app.users.schemas import UserRegister, UserLogin, UserResponse
from sqlalchemy import select

router = APIRouter(prefix="/api/users", tags=["users"])


async def get_db() -> AsyncSession:
    async with async_session_maker() as session:
        yield session


@router.post("/register", response_model=UserResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    stmt = select(User).where(User.email == data.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        email=data.email,
        password=data.password,  # In production, hash the password
        username=data.username
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@router.post("/login", response_model=UserResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user"""
    stmt = select(User).where(User.email == data.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or user.password != data.password:  # In production, use bcrypt
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return user


@router.get("/me", response_model=UserResponse)
async def get_current_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Get current user info"""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
