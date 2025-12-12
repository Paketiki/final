"""Initialize database without Alembic"""
import asyncio
import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.ext.asyncio import create_async_engine
from app.database import Base
from app.users.models import User
from app.movies.models import Movie, Review, Rating, Favorite
from app.config import get_db_url


async def init_db():
    """Create all tables"""
    engine = create_async_engine(
        get_db_url(),
        echo=True,
        connect_args={"check_same_thread": False},
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("✅ Database initialized successfully!")
    print("📁 File: kinovzor.db")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(init_db())
