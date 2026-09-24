"""Pydantic schemas for Commodity API responses and requests."""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class CommodityBase(BaseModel):
    """Base schema for Commodity."""

    name: str = Field(..., max_length=100, description="Food commodity name")
    category: str = Field(..., max_length=50, description="Food classification category")
    default_moisture_percent: float = Field(..., ge=0.0, le=100.0, description="Baseline moisture content (%)")
    oil_fat_level: str = Field(..., max_length=30, description="Lipid content level (none, low, moderate, high)")
    default_ph: float = Field(..., ge=0.0, le=14.0, description="Baseline product pH")
    respiration_class: str = Field(..., max_length=30, description="Respiration rate (none, low, moderate, high, very_high)")
    base_shelf_life_days: int = Field(..., gt=0, description="Baseline shelf life in days")
    recommended_storage_type: str = Field(..., max_length=50, description="Storage mode (ambient, chilled, frozen)")
    minimum_storage_temperature: float = Field(..., description="Minimum safe storage temperature (°C)")
    maximum_storage_temperature: float = Field(..., description="Maximum recommended storage temperature (°C)")
    notes: Optional[str] = Field(None, description="Handling notes and biological characteristics")


class CommodityCreate(CommodityBase):
    """Schema for creating a new commodity."""
    pass


class CommodityUpdate(BaseModel):
    """Schema for updating an existing commodity."""

    name: Optional[str] = None
    category: Optional[str] = None
    default_moisture_percent: Optional[float] = None
    oil_fat_level: Optional[str] = None
    default_ph: Optional[float] = None
    respiration_class: Optional[str] = None
    base_shelf_life_days: Optional[int] = None
    recommended_storage_type: Optional[str] = None
    minimum_storage_temperature: Optional[float] = None
    maximum_storage_temperature: Optional[float] = None
    notes: Optional[str] = None


class CommodityResponse(CommodityBase):
    """Response schema for a single commodity."""

    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CommodityListResponse(BaseModel):
    """Paginated / list response wrapper for commodities."""

    total: int
    items: List[CommodityResponse]
