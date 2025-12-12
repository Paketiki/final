import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/kinovzor"
)
DATABASE_ECHO = os.getenv("DATABASE_ECHO", "True").lower() == "true"


def get_db_url():
    return DATABASE_URL
