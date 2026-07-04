from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.routers import auth, users, reports, stations, readings, alerts, collaborations, analytics

app = FastAPI(
    title="WaterWatch API",
    description="Real-time water quality monitoring, citizen reports, and contamination alerts.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded report photos
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(reports.router)
app.include_router(stations.router)
app.include_router(readings.router)
app.include_router(alerts.router)
app.include_router(collaborations.router)
app.include_router(analytics.router)


@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok"}
