"""Master API router aggregating sub-routers."""

from fastapi import APIRouter
from app.api.v1.commodities import router as commodities_router
from app.api.v1.materials import router as materials_router
from app.api.v1.admin import router as admin_router

api_router = APIRouter()

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
    admin_router,
    prefix="/admin",
    tags=["Admin & Analytics"],
)
