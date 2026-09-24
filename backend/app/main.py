"""PackWise AI - FastAPI Application Entry Point.

Intelligent Food Packaging Material Recommendation System Backend.
"""

from contextlib import asynccontextmanager
from typing import Dict, Any
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, get_db
from app.api.router import api_router
from app.seed.seed_data import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler to initialize database schema and seed reference data."""
    # Create all database tables
    Base.metadata.create_all(bind=engine)

    # Seed default data on startup
    db = Session(bind=engine)
    try:
        seed_database(db)
    finally:
        db.close()

    yield


# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description=(
        "PackWise AI Backend API — Intelligent Food Packaging Material Recommendation System.\n\n"
        "Provides REST endpoints for querying food commodity physiological degradation metrics, "
        "ASTM standardized barrier packaging materials, and administrative system indicators."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(
    "/health",
    tags=["System Health"],
    summary="Health check endpoint",
    description="Check the operational status of the FastAPI backend and database connection.",
    response_model=Dict[str, Any],
)
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint to verify service and database connectivity."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "version": "1.0.0",
        "database": db_status,
    }


# Include main API router under /api
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["System Health"], include_in_schema=False)
def root_redirect():
    """Root endpoint greeting and API documentation link."""
    return {
        "message": "Welcome to PackWise AI API",
        "docs": "/docs",
        "health": "/health",
        "api_v1": settings.API_V1_PREFIX,
    }
