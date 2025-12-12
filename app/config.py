import os
from dotenv import load_dotenv

load_dotenv()

# SQLite database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite+aiosqlite:///./kinovzor.db"
)
DATABASE_ECHO = os.getenv("DATABASE_ECHO", "False").lower() == "true"


def get_db_url():
    return DATABASE_URL
