"""Database helper functions using sqlite3"""
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional
import json
from datetime import datetime

DB_PATH = Path(__file__).parent.parent / "kinovzor.db"

def get_db() -> sqlite3.Connection:
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def dict_from_row(row: sqlite3.Row) -> Dict[str, Any]:
    """Convert sqlite3.Row to dict"""
    if row is None:
        return None
    return dict(row)

def dicts_from_rows(rows: List[sqlite3.Row]) -> List[Dict[str, Any]]:
    """Convert list of sqlite3.Row to list of dicts"""
    return [dict(row) for row in rows]

# Users
def get_user_by_email(email: str) -> Optional[Dict]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    return dict_from_row(user)

def get_user_by_id(user_id: int) -> Optional[Dict]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    return dict_from_row(user)

def create_user(email: str, password: str, username: str) -> Dict:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (email, password, username) VALUES (?, ?, ?)",
        (email, password, username)
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return get_user_by_id(user_id)

# Movies
def get_all_movies() -> List[Dict]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM movies ORDER BY id DESC")
    movies = cursor.fetchall()
    conn.close()
    return dicts_from_rows(movies)

def get_movie_by_id(movie_id: int) -> Optional[Dict]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM movies WHERE id = ?", (movie_id,))
    movie = cursor.fetchone()
    conn.close()
    return dict_from_row(movie)

def create_movie(title: str, description: str, genre: str, year: int, poster_url: str = None) -> Dict:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO movies (title, description, genre, year, poster_url) VALUES (?, ?, ?, ?, ?)",
        (title, description, genre, year, poster_url)
    )
    conn.commit()
    movie_id = cursor.lastrowid
    conn.close()
    return get_movie_by_id(movie_id)

# Reviews
def create_review(movie_id: int, user_id: int, text: str, rating: int = None) -> Dict:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO reviews (movie_id, user_id, text, rating, approved) VALUES (?, ?, ?, ?, ?)",
        (movie_id, user_id, text, rating, False)
    )
    conn.commit()
    review_id = cursor.lastrowid
    conn.close()
    return get_review_by_id(review_id)

def get_review_by_id(review_id: int) -> Optional[Dict]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reviews WHERE id = ?", (review_id,))
    review = cursor.fetchone()
    conn.close()
    return dict_from_row(review)

def get_movie_reviews(movie_id: int, approved_only: bool = True) -> List[Dict]:
    conn = get_db()
    cursor = conn.cursor()
    if approved_only:
        cursor.execute("SELECT * FROM reviews WHERE movie_id = ? AND approved = 1 ORDER BY created_at DESC", (movie_id,))
    else:
        cursor.execute("SELECT * FROM reviews WHERE movie_id = ? ORDER BY created_at DESC", (movie_id,))
    reviews = cursor.fetchall()
    conn.close()
    return dicts_from_rows(reviews)

def approve_review(review_id: int) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE reviews SET approved = 1 WHERE id = ?", (review_id,))
    conn.commit()
    conn.close()
    return True

def delete_review(review_id: int) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
    conn.commit()
    conn.close()
    return True

# Ratings
def create_or_update_rating(movie_id: int, user_id: int, value: float) -> Dict:
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if rating exists
    cursor.execute("SELECT * FROM ratings WHERE movie_id = ? AND user_id = ?", (movie_id, user_id))
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute("UPDATE ratings SET value = ? WHERE movie_id = ? AND user_id = ?", (value, movie_id, user_id))
        rating_id = existing['id']
    else:
        cursor.execute(
            "INSERT INTO ratings (movie_id, user_id, value) VALUES (?, ?, ?)",
            (movie_id, user_id, value)
        )
        rating_id = cursor.lastrowid
    
    conn.commit()
    conn.close()
    return get_rating_by_id(rating_id)

def get_rating_by_id(rating_id: int) -> Optional[Dict]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ratings WHERE id = ?", (rating_id,))
    rating = cursor.fetchone()
    conn.close()
    return dict_from_row(rating)

def get_movie_ratings(movie_id: int) -> List[Dict]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ratings WHERE movie_id = ?", (movie_id,))
    ratings = cursor.fetchall()
    conn.close()
    return dicts_from_rows(ratings)

def get_rating_stats(movie_id: int) -> Dict:
    ratings = get_movie_ratings(movie_id)
    if not ratings:
        return {"count": 0, "average": None}
    
    values = [r['value'] for r in ratings]
    avg = sum(values) / len(values)
    return {"count": len(values), "average": round(avg, 1)}

# Favorites
def add_favorite(movie_id: int, user_id: int) -> Dict:
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if already exists
    cursor.execute("SELECT * FROM favorites WHERE movie_id = ? AND user_id = ?", (movie_id, user_id))
    if cursor.fetchone():
        conn.close()
        return {"error": "Already in favorites"}
    
    cursor.execute(
        "INSERT INTO favorites (movie_id, user_id) VALUES (?, ?)",
        (movie_id, user_id)
    )
    conn.commit()
    conn.close()
    return {"status": "added"}

def remove_favorite(movie_id: int, user_id: int) -> Dict:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM favorites WHERE movie_id = ? AND user_id = ?", (movie_id, user_id))
    conn.commit()
    conn.close()
    return {"status": "removed"}

def get_user_favorites(user_id: int) -> List[Dict]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT m.* FROM movies m JOIN favorites f ON m.id = f.movie_id WHERE f.user_id = ?",
        (user_id,)
    )
    movies = cursor.fetchall()
    conn.close()
    return dicts_from_rows(movies)

def is_favorite(movie_id: int, user_id: int) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM favorites WHERE movie_id = ? AND user_id = ?", (movie_id, user_id))
    result = cursor.fetchone()
    conn.close()
    return result is not None
