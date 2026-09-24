"""Commodities API endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.commodity import CommodityResponse
from app.services.commodity_service import commodity_service

router = APIRouter()


@router.get(
    "",
    response_model=List[CommodityResponse],
    summary="List all food commodities",
    description="Retrieve food commodities with optional filtering by category or keyword search.",
)
def list_commodities(
    category: Optional[str] = Query(None, description="Filter by commodity category"),
    search: Optional[str] = Query(None, description="Keyword search across commodity names and notes"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(100, ge=1, le=100, description="Pagination limit"),
    db: Session = Depends(get_db),
):
    """List commodities endpoint."""
    return commodity_service.get_all(
        db=db,
        skip=skip,
        limit=limit,
        category=category,
        search=search,
    )


@router.get(
    "/{commodity_id}",
    response_model=CommodityResponse,
    summary="Get single food commodity by ID",
    description="Retrieve detailed respiration, moisture, lipid level, and storage requirements for a commodity.",
)
def get_commodity(
    commodity_id: int,
    db: Session = Depends(get_db),
):
    """Get commodity by ID endpoint."""
    commodity = commodity_service.get_by_id(db=db, commodity_id=commodity_id)
    if not commodity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Commodity with ID {commodity_id} not found.",
        )
    return commodity
