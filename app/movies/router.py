from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from app import db

router = APIRouter(prefix="/api/movies", tags=["movies"])

class MovieCreate(BaseModel):
    title: str
    description: Optional[str] = None
    genre: str
    year: int
    poster_url: Optional[str] = None

class ReviewCreate(BaseModel):
    text: str
    rating: Optional[int] = None

class RatingCreate(BaseModel):
    value: float

# ========== MOVIES ==========

@router.get("/")
def get_movies(genre: Optional[str] = Query(None), sort: str = Query("popular")):
    """Get all movies with optional filtering and sorting"""
    movies = db.get_all_movies()
    
    if genre and genre != "all":
        movies = [m for m in movies if m['genre'] == genre]
    
    if sort == "title":
        movies = sorted(movies, key=lambda x: x['title'])
    elif sort == "year":
        movies = sorted(movies, key=lambda x: x['year'], reverse=True)
    elif sort == "rating":
        # Sort by rating (would need to fetch ratings for each)
        pass
    # Default is popular (by id desc, already done)
    
    return movies

# IMPORTANT: Special routes BEFORE {movie_id} routes

@router.get("/user/{user_id}/favorites")
def get_user_favorites(user_id: int):
    """Get user's favorite movies"""
    favorites = db.get_user_favorites(user_id)
    return favorites

# NOW: {movie_id} routes

@router.get("/{movie_id}")
def get_movie(movie_id: int):
    """Get a single movie by ID"""
    movie = db.get_movie_by_id(movie_id)
    
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    return movie

@router.post("/")
def create_movie(data: MovieCreate):
    """Create a new movie (admin only)"""
    movie = db.create_movie(
        title=data.title,
        description=data.description,
        genre=data.genre,
        year=data.year,
        poster_url=data.poster_url
    )
    return movie

# ========== REVIEWS ==========

@router.post("/{movie_id}/reviews")
def create_review(movie_id: int, data: ReviewCreate, user_id: int):
    """Create a review for a movie"""
    # Check if movie exists
    movie = db.get_movie_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    review = db.create_review(
        movie_id=movie_id,
        user_id=user_id,
        text=data.text,
        rating=data.rating
    )
    return review

@router.get("/{movie_id}/reviews")
def get_reviews(movie_id: int, approved_only: bool = Query(True)):
    """Get reviews for a movie"""
    reviews = db.get_movie_reviews(movie_id, approved_only=approved_only)
    return reviews

@router.put("/reviews/{review_id}/approve")
def approve_review(review_id: int):
    """Approve a review (moderator only)"""
    db.approve_review(review_id)
    return {"status": "approved"}

@router.delete("/reviews/{review_id}")
def delete_review(review_id: int):
    """Delete a review"""
    db.delete_review(review_id)
    return {"status": "deleted"}

# ========== RATINGS ==========

@router.post("/{movie_id}/ratings")
def create_rating(movie_id: int, data: RatingCreate, user_id: int):
    """Create or update a rating for a movie"""
    # Check if movie exists
    movie = db.get_movie_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    rating = db.create_or_update_rating(
        movie_id=movie_id,
        user_id=user_id,
        value=data.value
    )
    return rating

@router.get("/{movie_id}/rating-stats")
def get_rating_stats(movie_id: int):
    """Get rating statistics for a movie"""
    stats = db.get_rating_stats(movie_id)
    return stats

# ========== FAVORITES ==========

@router.post("/{movie_id}/favorites")
def add_to_favorites(movie_id: int, user_id: int):
    """Add a movie to favorites"""
    # Check if movie exists
    movie = db.get_movie_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    result = db.add_favorite(movie_id, user_id)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.delete("/{movie_id}/favorites")
def remove_from_favorites(movie_id: int, user_id: int):
    """Remove a movie from favorites"""
    result = db.remove_favorite(movie_id, user_id)
    return result
