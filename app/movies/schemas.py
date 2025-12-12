from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MovieCreate(BaseModel):
    title: str
    description: Optional[str] = None
    genre: str
    year: int
    poster_url: Optional[str] = None


class MovieResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    genre: str
    year: int
    poster_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    text: str
    rating: Optional[int] = None  # 1-5


class ReviewResponse(BaseModel):
    id: int
    movie_id: int
    user_id: int
    text: str
    rating: Optional[int]
    approved: bool
    created_at: datetime

    class Config:
        from_attributes = True


class RatingCreate(BaseModel):
    value: float  # 1-5


class RatingResponse(BaseModel):
    id: int
    movie_id: int
    user_id: int
    value: float
    created_at: datetime

    class Config:
        from_attributes = True
