from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from app.database import async_session_maker
from app.movies.models import Movie, Review, Rating, Favorite
from app.movies.schemas import MovieCreate, MovieResponse, ReviewCreate, ReviewResponse, RatingCreate, RatingResponse
from typing import List, Optional

router = APIRouter(prefix="/api/movies", tags=["movies"])


async def get_db() -> AsyncSession:
    async with async_session_maker() as session:
        yield session


# ========== MOVIES ==========

@router.get("/", response_model=List[MovieResponse])
async def get_movies(
    genre: Optional[str] = Query(None),
    sort: str = Query("popular"),
    db: AsyncSession = Depends(get_db)
):
    """Get all movies with optional filtering and sorting"""
    query = select(Movie)

    if genre and genre != "all":
        query = query.where(Movie.genre == genre)

    if sort == "title":
        query = query.order_by(Movie.title)
    elif sort == "year":
        query = query.order_by(Movie.year.desc())
    elif sort == "rating":
        # Will need to join with ratings and calculate average
        query = query.order_by(Movie.id)  # Placeholder
    else:  # popular
        query = query.order_by(Movie.id.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{movie_id}", response_model=MovieResponse)
async def get_movie(movie_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single movie by ID"""
    stmt = select(Movie).where(Movie.id == movie_id)
    result = await db.execute(stmt)
    movie = result.scalar_one_or_none()

    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    return movie


@router.post("/", response_model=MovieResponse)
async def create_movie(data: MovieCreate, db: AsyncSession = Depends(get_db)):
    """Create a new movie (admin only)"""
    new_movie = Movie(
        title=data.title,
        description=data.description,
        genre=data.genre,
        year=data.year,
        poster_url=data.poster_url
    )
    db.add(new_movie)
    await db.commit()
    await db.refresh(new_movie)
    return new_movie


# ========== REVIEWS ==========

@router.post("/{movie_id}/reviews", response_model=ReviewResponse)
async def create_review(
    movie_id: int,
    data: ReviewCreate,
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Create a review for a movie"""
    # Check if movie exists
    stmt = select(Movie).where(Movie.id == movie_id)
    result = await db.execute(stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Movie not found")

    new_review = Review(
        movie_id=movie_id,
        user_id=user_id,
        text=data.text,
        rating=data.rating,
        approved=False
    )
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    return new_review


@router.get("/{movie_id}/reviews", response_model=List[ReviewResponse])
async def get_reviews(
    movie_id: int,
    approved_only: bool = Query(True),
    db: AsyncSession = Depends(get_db)
):
    """Get reviews for a movie"""
    query = select(Review).where(Review.movie_id == movie_id)

    if approved_only:
        query = query.where(Review.approved == True)

    query = query.order_by(Review.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/reviews/{review_id}/approve")
async def approve_review(review_id: int, db: AsyncSession = Depends(get_db)):
    """Approve a review (moderator only)"""
    stmt = select(Review).where(Review.id == review_id)
    result = await db.execute(stmt)
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.approved = True
    await db.commit()
    return {"status": "approved"}


@router.delete("/reviews/{review_id}")
async def delete_review(review_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a review"""
    stmt = select(Review).where(Review.id == review_id)
    result = await db.execute(stmt)
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    await db.delete(review)
    await db.commit()
    return {"status": "deleted"}


# ========== RATINGS ==========

@router.post("/{movie_id}/ratings", response_model=RatingResponse)
async def create_rating(
    movie_id: int,
    data: RatingCreate,
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Create or update a rating for a movie"""
    # Check if movie exists
    stmt = select(Movie).where(Movie.id == movie_id)
    result = await db.execute(stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Movie not found")

    # Check if rating already exists
    stmt = select(Rating).where(
        and_(Rating.movie_id == movie_id, Rating.user_id == user_id)
    )
    result = await db.execute(stmt)
    existing_rating = result.scalar_one_or_none()

    if existing_rating:
        existing_rating.value = data.value
        await db.commit()
        await db.refresh(existing_rating)
        return existing_rating

    new_rating = Rating(
        movie_id=movie_id,
        user_id=user_id,
        value=data.value
    )
    db.add(new_rating)
    await db.commit()
    await db.refresh(new_rating)
    return new_rating


@router.get("/{movie_id}/rating-stats")
async def get_rating_stats(movie_id: int, db: AsyncSession = Depends(get_db)):
    """Get rating statistics for a movie"""
    stmt = select(
        func.count(Rating.id).label("count"),
        func.avg(Rating.value).label("average")
    ).where(Rating.movie_id == movie_id)

    result = await db.execute(stmt)
    row = result.first()

    return {
        "count": row[0] or 0,
        "average": round(float(row[1]), 1) if row[1] else None
    }


# ========== FAVORITES ==========

@router.post("/{movie_id}/favorites")
async def add_to_favorites(
    movie_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Add a movie to favorites"""
    # Check if movie exists
    stmt = select(Movie).where(Movie.id == movie_id)
    result = await db.execute(stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Movie not found")

    # Check if already in favorites
    stmt = select(Favorite).where(
        and_(Favorite.movie_id == movie_id, Favorite.user_id == user_id)
    )
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already in favorites")

    new_favorite = Favorite(
        movie_id=movie_id,
        user_id=user_id
    )
    db.add(new_favorite)
    await db.commit()
    return {"status": "added to favorites"}


@router.delete("/{movie_id}/favorites")
async def remove_from_favorites(
    movie_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Remove a movie from favorites"""
    stmt = select(Favorite).where(
        and_(Favorite.movie_id == movie_id, Favorite.user_id == user_id)
    )
    result = await db.execute(stmt)
    favorite = result.scalar_one_or_none()

    if not favorite:
        raise HTTPException(status_code=404, detail="Not in favorites")

    await db.delete(favorite)
    await db.commit()
    return {"status": "removed from favorites"}


@router.get("/user/{user_id}/favorites", response_model=List[MovieResponse])
async def get_user_favorites(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get user's favorite movies"""
    stmt = select(Movie).join(Favorite).where(Favorite.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalars().all()
