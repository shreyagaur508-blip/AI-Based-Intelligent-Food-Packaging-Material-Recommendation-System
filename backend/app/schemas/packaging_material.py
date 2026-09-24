"""Pydantic schemas for PackagingMaterial API responses and requests."""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.material_property import MaterialPropertyResponse, MaterialPropertyCreate


class PackagingMaterialBase(BaseModel):
    """Base schema for PackagingMaterial."""

    name: str = Field(..., max_length=120, description="Commercial / chemical material name")
    material_type: str = Field(..., max_length=60, description="Polymer family or classification")
    structure: str = Field(..., max_length=100, description="Layer composition or structure")
    food_grade_compliant: bool = Field(True, description="Food-contact certified flag")
    recyclability_level: str = Field(..., max_length=50, description="Recyclability classification")
    biodegradability_level: str = Field(..., max_length=60, description="Biodegradability rating")
    cost_level: str = Field(..., max_length=30, description="Cost tier (Budget, Moderate, Premium)")
    sealability_score: float = Field(..., ge=0.0, le=10.0, description="Heat sealability score (0-10)")
    mechanical_strength_score: float = Field(..., ge=0.0, le=10.0, description="Mechanical strength score (0-10)")
    puncture_resistance_score: float = Field(..., ge=0.0, le=10.0, description="Puncture resistance score (0-10)")
    transparency: str = Field(..., max_length=50, description="Optical transparency")
    printability: str = Field(..., max_length=50, description="Surface printability")
    map_compatible: bool = Field(True, description="MAP suitability")
    microperforation_supported: bool = Field(False, description="Micro-perforation compatibility")
    description: Optional[str] = Field(None, description="Detailed technical and processing observations")


class PackagingMaterialCreate(PackagingMaterialBase):
    """Schema for creating a new packaging material."""

    properties: Optional[List[MaterialPropertyCreate]] = None


class PackagingMaterialUpdate(BaseModel):
    """Schema for updating a packaging material."""

    name: Optional[str] = None
    material_type: Optional[str] = None
    structure: Optional[str] = None
    food_grade_compliant: Optional[bool] = None
    recyclability_level: Optional[str] = None
    biodegradability_level: Optional[str] = None
    cost_level: Optional[str] = None
    sealability_score: Optional[float] = None
    mechanical_strength_score: Optional[float] = None
    puncture_resistance_score: Optional[float] = None
    transparency: Optional[str] = None
    printability: Optional[str] = None
    map_compatible: Optional[bool] = None
    microperforation_supported: Optional[bool] = None
    description: Optional[str] = None


class PackagingMaterialResponse(PackagingMaterialBase):
    """Detailed response schema for a single packaging material with ASTM properties."""

    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    properties: List[MaterialPropertyResponse] = []

    model_config = ConfigDict(from_attributes=True)


class PackagingMaterialSummaryResponse(PackagingMaterialBase):
    """Summary response schema for materials listing."""

    id: int
    created_at: Optional[datetime] = None
    properties: List[MaterialPropertyResponse] = []

    model_config = ConfigDict(from_attributes=True)


class PackagingMaterialListResponse(BaseModel):
    """Paginated / list response wrapper for materials."""

    total: int
    items: List[PackagingMaterialResponse]
