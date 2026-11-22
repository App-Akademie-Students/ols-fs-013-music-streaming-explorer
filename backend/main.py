import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from presenter.end_points.analyses_endpoints import end_point as analyses_end_point
from persistance.services.sql_shema_service import get_sql_schema, has_records
from persistance.db.database import init_db
from infrastructure.seed.seed_data import seed_db


init_db()

if not has_records():
    seed_db()


app = FastAPI(
    title="Music Streaming Explorer API",
    description="API für die Analyse von Musik-Streaming-Daten"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyses_end_point, prefix="/api")

@app.get("/api/schema")
async def database_schema():
    return {"schema": get_sql_schema()}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# if __name__ == "__main__":
#     uvicorn.run(app, host="127.0.0.1", port=8000)
