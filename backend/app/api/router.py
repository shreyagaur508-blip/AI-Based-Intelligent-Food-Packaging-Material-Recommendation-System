"""Master API router aggregating sub-routers."""

from fastapi import APIRouter
from app.api.v1.commodities import router as commodities_router
from app.api.v1.materials import router as materials_router
from app.api.v1.admin import router as admin_router
from app.api.v1.recommendations import router as recommendations_router

api_router = APIRouter()


@api_router.get("/health", tags=["System Health"], include_in_schema=False)
def api_health():
    """API health status endpoint."""
    return {
        "status": "ok",
        "service": "PackWise AI API",
    }

api_router.include_router(
    commodities_router,
    prefix="/commodities",
    tags=["Commodities"],
)

api_router.include_router(
    materials_router,
    prefix="/materials",
    tags=["Packaging Materials"],
)

api_router.include_router(
    recommendations_router,
    prefix="/recommendations",
    tags=["Recommendations"],
)

api_router.include_router(
    admin_router,
    prefix="/admin",
    tags=["Admin & Analytics"],
)
