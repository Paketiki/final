import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, status
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.users.router import router as router_users
from app.movies.router import router as router_movies
from app import db
import os

# Initialize database if not exists
if not Path(__file__).parent.parent.joinpath('kinovzor.db').exists():
    print("\n📁 Database not found. Creating...")
    from init_db import init_db
    init_db()
    print("\n🍋 Loading seed data...")
    from seed_db import seed_movies_and_reviews
    seed_movies_and_reviews()
    print("\n✅ All ready!\n")

app = FastAPI(
    title="KinoVzor API",
    description="Movie review and rating platform",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the correct path for static files
STATIC_DIR = Path(__file__).parent / "static"

# Mount static files
if STATIC_DIR.exists():
    app.mount('/static', StaticFiles(directory=str(STATIC_DIR)), 'static')
else:
    print(f"\n⚠️ Warning: Static directory not found at {STATIC_DIR}")

# Root redirect
@app.get('/')
async def root():
    return RedirectResponse(url="/static/index.html", status_code=status.HTTP_303_SEE_OTHER)

# Serve index.html for all routes (SPA)
@app.get('/{full_path:path}')
async def serve_spa(full_path: str):
    if full_path.startswith('api/'):
        return {"detail": "Not Found"}
    return FileResponse(str(STATIC_DIR / 'index.html'))

# Include routers
app.include_router(router_users)
app.include_router(router_movies)

if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*50)
    print("🌟 KinoVzor - Movie Review Platform")
    print("="*50)
    print("\n🚀 Starting server...\n")
    
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
