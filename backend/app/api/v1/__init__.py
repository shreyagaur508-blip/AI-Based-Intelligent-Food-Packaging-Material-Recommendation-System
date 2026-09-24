"""API v1 routers."""

from app.api.v1.commodities import router as commodities_router
from app.api.v1.materials import router as materials_router
from app.api.v1.admin import router as admin_router

__all__ = ["commodities_router", "materials_router", "admin_router"]
