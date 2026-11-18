
from fastapi import FastAPI
from app.routers.analyses_router import router as analyses_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Music Streaming Explorer API",
    description="API für die Analyse von Musik-Streaming-Daten",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,# FIXME: Configure CORS properly for production
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
    )




app.include_router(analyses_router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "healthy"}