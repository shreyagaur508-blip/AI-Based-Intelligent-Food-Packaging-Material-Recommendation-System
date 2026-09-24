"""Admin & Analytics dashboard endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.admin_service import admin_service

router = APIRouter()


@router.get(
    "/dashboard-summary",
    response_model=DashboardSummaryResponse,
    summary="Get admin dashboard overview metrics",
    description="Retrieve high-level system metrics including total commodities, materials, rule counts, food-grade compliance rate, and database status.",
)
def get_dashboard_summary(
    db: Session = Depends(get_db),
):
    """Admin dashboard summary endpoint."""
    return admin_service.get_dashboard_summary(db=db)
