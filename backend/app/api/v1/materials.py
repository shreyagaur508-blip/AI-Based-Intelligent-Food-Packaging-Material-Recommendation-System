"""Packaging Materials API endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.packaging_material import PackagingMaterialResponse
from app.services.material_service import material_service

router = APIRouter()


@router.get(
    "",
    response_model=List[PackagingMaterialResponse],
    summary="List all packaging materials",
    description="Retrieve packaging materials with standardized ASTM barrier values (OTR, WVTR), mechanical ratings, and sustainability scores.",
)
def list_materials(
    material_type: Optional[str] = Query(None, description="Filter by material type / polymer family"),
    cost_level: Optional[str] = Query(None, description="Filter by cost tier (Budget, Moderate, Premium)"),
    food_grade_only: bool = Query(False, description="Filter only food-grade certified materials"),
    search: Optional[str] = Query(None, description="Keyword search across material names and descriptions"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(100, ge=1, le=100, description="Pagination limit"),
    db: Session = Depends(get_db),
):
    """List packaging materials endpoint."""
    return material_service.get_all(
        db=db,
        skip=skip,
        limit=limit,
        material_type=material_type,
        cost_level=cost_level,
        food_grade_only=food_grade_only,
        search=search,
    )


@router.get(
    "/{material_id}",
    response_model=PackagingMaterialResponse,
    summary="Get packaging material by ID",
    description="Retrieve comprehensive technical specification, ASTM D3985 OTR, ASTM F1249 WVTR, sealability, and environmental profile.",
)
def get_material(
    material_id: int,
    db: Session = Depends(get_db),
):
    """Get packaging material by ID endpoint."""
    material = material_service.get_by_id(db=db, material_id=material_id)
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Packaging material with ID {material_id} not found.",
        )
    return material
