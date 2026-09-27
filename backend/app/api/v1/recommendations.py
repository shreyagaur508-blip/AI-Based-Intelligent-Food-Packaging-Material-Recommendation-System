"""Packaging Recommendations API endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
)
from app.services.recommendation_service import recommendation_service

router = APIRouter()


@router.post(
    "",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate explainable food packaging recommendation",
    description=(
        "Executes a deterministic 6-stage scientific decision pipeline:\n"
        "1. Food context normalization\n"
        "2. Food-risk classification (moisture, oxidation, microbial, respiration, mechanical, freezer burn)\n"
        "3. ASTM technical packaging requirement derivation\n"
        "4. Candidate filtering with non-negotiable safety/anoxia/brittleness gates\n"
        "5. Multi-criteria weighted scoring (MCDA) across barrier, mechanical, cost & sustainability\n"
        "6. Human-readable explainability reasoning and risk mitigation warnings"
    ),
)
def generate_packaging_recommendation(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
):
    """Packaging recommendation endpoint."""
    return recommendation_service.generate_recommendation(db=db, request=request)
