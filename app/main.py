from fastapi import FastAPI, status
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.users.router import router as router_users
from app.movies.router import router as router_movies

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

# Mount static files
app.mount('/static', StaticFiles(directory='app/static'), 'static')

# Root redirect
@app.get('/')
async def root():
    return RedirectResponse(url="/static/index.html", status_code=status.HTTP_303_SEE_OTHER)

# Serve index.html for all routes (SPA)
@app.get('/{full_path:path}')
async def serve_spa(full_path: str):
    if full_path.startswith('api/'):
        return {"detail": "Not Found"}
    return FileResponse('app/static/index.html')

# Include routers
app.include_router(router_users)
app.include_router(router_movies)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
