"""Pydantic schemas for MaterialProperty API responses and requests."""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class MaterialPropertyBase(BaseModel):
    """Base schema for ASTM material property measurements."""

    test_temperature_celsius: float = Field(23.0, description="Test temperature (°C)")
    relative_humidity_percent: float = Field(0.0, description="Test relative humidity (%)")
    otr_value: float = Field(..., description="Oxygen transmission rate value")
    otr_unit: str = Field("cm3/(m2.24h.atm)", description="OTR standardized unit")
    wvtr_value: float = Field(..., description="Water vapor transmission rate value")
    wvtr_unit: str = Field("g/(m2.24h)", description="WVTR standardized unit")
    thickness_microns: float = Field(..., gt=0.0, description="Tested gauge thickness (µm)")
    co2_transmission_rate: Optional[float] = Field(None, description="CO2 transmission rate (cm3/(m2.24h.atm))")
    tensile_strength: Optional[float] = Field(None, description="Tensile strength (MPa)")
    seal_temperature_min: Optional[float] = Field(None, description="Minimum heat seal temperature (°C)")
    seal_temperature_max: Optional[float] = Field(None, description="Maximum heat seal temperature (°C)")
    test_condition_notes: Optional[str] = Field(None, description="ASTM standard and test methodology notes")


class MaterialPropertyCreate(MaterialPropertyBase):
    """Schema for adding properties to a material."""

    material_id: Optional[int] = None


class MaterialPropertyResponse(MaterialPropertyBase):
    """Response schema for material properties."""

    id: int
    material_id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
