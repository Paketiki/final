"""Initialize SQLite database"""
import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).parent / "kinovzor.db"

def init_db():
    """Create all tables"""
    
    # Remove old db if exists
    if DB_PATH.exists():
        os.remove(DB_PATH)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        username TEXT NOT NULL,
        is_user BOOLEAN DEFAULT 1,
        is_moderator BOOLEAN DEFAULT 0,
        is_admin BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Movies table
    cursor.execute("""
    CREATE TABLE movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        genre TEXT NOT NULL,
        year INTEGER NOT NULL,
        poster_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Reviews table - user_id is nullable now
    cursor.execute("""
    CREATE TABLE reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movie_id INTEGER NOT NULL,
        user_id INTEGER,
        text TEXT NOT NULL,
        rating INTEGER,
        approved BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (movie_id) REFERENCES movies(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)
    
    # Ratings table
    cursor.execute("""
    CREATE TABLE ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movie_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        value REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (movie_id) REFERENCES movies(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)
    
    # Favorites table
    cursor.execute("""
    CREATE TABLE favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movie_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (movie_id) REFERENCES movies(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)
    
    conn.commit()
    conn.close()
    
    print(f"✅ Database initialized successfully!")
    print(f"📁 File: {DB_PATH}")
    print(f"🗓️ Tables: users, movies, reviews, ratings, favorites")

if __name__ == "__main__":
    init_db()
