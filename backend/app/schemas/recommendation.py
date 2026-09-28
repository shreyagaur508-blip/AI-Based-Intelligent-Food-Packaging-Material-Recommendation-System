"""Pydantic schemas for Packaging Recommendation API."""

from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, model_validator


class RecommendationRequest(BaseModel):
    """Input payload for generating a packaging recommendation."""

    commodity_name: Optional[str] = Field(None, description="Name of the food commodity (e.g., 'Potato Chips', 'Banana')")
    commodity_id: Optional[int] = Field(None, description="Database ID of known commodity to pre-populate defaults")
    commodity_category: Optional[str] = Field(
        None,
        description="Category: 'Fresh Produce', 'Dry Crisp Foods', 'High-Fat Snacks', 'Powders & Grains', 'Perishable Dairy', 'Frozen Foods', 'Other / Custom'",
    )
    moisture_percent: Optional[float] = Field(None, ge=0.0, le=100.0, description="Product moisture content percentage")
    oil_fat_level: Optional[str] = Field(
        None,
        description="Lipid content level: 'low', 'medium', 'high', 'very_high', 'none', 'moderate'",
    )
    ph: Optional[float] = Field(None, ge=0.0, le=14.0, description="Product baseline pH")
    pH: Optional[float] = Field(None, ge=0.0, le=14.0, description="Product baseline pH (alias)")
    respiration_rate: Optional[str] = Field(
        None,
        description="Respiration class: 'very_low', 'low', 'medium', 'high', 'very_high', 'none'",
    )
    desired_shelf_life_days: Optional[int] = Field(None, gt=0, description="Target preservation shelf life in days")
    storage_type: Optional[str] = Field(
        None,
        description="Storage mode: 'ambient', 'chilled', 'frozen'",
    )
    storage_temperature: Optional[float] = Field(None, description="Storage temperature in Celsius")
    relative_humidity: Optional[float] = Field(None, ge=0.0, le=100.0, description="Storage relative humidity percentage")
    transportation_condition: Optional[str] = Field(
        None,
        description="Transit environment: 'local', 'regional', 'long_distance'",
    )
    transportation_duration_days: Optional[int] = Field(None, ge=0, description="Transit duration in days")
    transportation_duration: Optional[float] = Field(None, ge=0.0, description="Transit duration in days (alias)")
    sustainability_preference: Optional[str] = Field(
        None,
        description="Sustainability goal: 'low', 'medium', 'high', 'balanced', 'recyclable', 'compostable'",
    )
    packaging_format_preference: Optional[str] = Field(
        None,
        description="Format: 'pouch', 'bottle', 'tray', 'box', 'other'",
    )

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    @property
    def ph_value(self) -> Optional[float]:
        """Resolve pH value regardless of casing."""
        if self.ph is not None:
            return self.ph
        return self.pH

    @property
    def transport_days(self) -> Optional[int]:
        """Resolve transportation days regardless of field name."""
        if self.transportation_duration_days is not None:
            return self.transportation_duration_days
        if self.transportation_duration is not None:
            return int(self.transportation_duration)
        return None


class RiskProfile(BaseModel):
    """Calculated food vulnerability and degradation risks."""

    moisture_risk: str = Field(..., description="Moisture sorption / loss risk: 'low', 'medium', 'high'")
    oxidation_risk: str = Field(..., description="Lipid oxidation / rancidity risk: 'low', 'medium', 'high'")
    microbial_risk: str = Field(..., description="Microbial spoilage risk: 'low', 'medium', 'high'")
    respiration_risk: str = Field(..., description="Metabolic respiration risk: 'low', 'medium', 'high'")
    mechanical_damage_risk: str = Field(..., description="Mechanical damage risk: 'low', 'medium', 'high'")
    freezer_burn_risk: str = Field(..., description="Freezer burn / sublimation risk: 'low', 'medium', 'high'")
    microbial_spoilage_risk: Optional[str] = None
    risk_summary: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def populate_aliases(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if "microbial_spoilage_risk" not in values and "microbial_risk" in values:
                values["microbial_spoilage_risk"] = values["microbial_risk"]
            if "microbial_risk" not in values and "microbial_spoilage_risk" in values:
                values["microbial_risk"] = values["microbial_spoilage_risk"]
        return values


class PackagingRequirements(BaseModel):
    """Derived technical packaging requirements."""

    required_otr_category: str = Field(..., description="'very_low', 'low', 'medium', 'high', 'controlled'")
    required_wvtr_category: str = Field(..., description="'very_low', 'low', 'medium', 'high'")
    map_suitable: bool = Field(..., description="Whether Modified Atmosphere Packaging is suitable")
    breathable_film_needed: bool = Field(..., description="Whether breathable / microperforated film is required")
    mechanical_strength_requirement: str = Field(..., description="'low', 'medium', 'high'")
    sealability_requirement: str = Field(..., description="'low', 'medium', 'high'")


class ThicknessRange(BaseModel):
    """Suggested gauge thickness range."""

    min_microns: float
    max_microns: float
    recommended_microns: float


class MaterialScoreBreakdown(BaseModel):
    """Multi-criteria weighted scoring sub-components."""

    total_score: float = Field(..., ge=0.0, le=100.0)
    barrier_score: float = Field(..., ge=0.0, le=100.0)
    mechanical_score: float = Field(..., ge=0.0, le=100.0)
    cost_score: float = Field(..., ge=0.0, le=100.0)
    sustainability_score: float = Field(..., ge=0.0, le=100.0)


class RecommendationItem(BaseModel):
    """Detailed recommendation entry for a packaging material."""

    material_id: int
    name: str = Field(..., description="Material commercial name")
    structure: str = Field(..., description="Material layer structure")
    reasons: List[str] = Field(default_factory=list, description="Structured explanatory reasons")
    sustainability_score: float = Field(..., ge=0.0, le=100.0, description="Sustainability rating (0-100)")
    cost_class: str = Field(..., description="Cost classification tier: 'low', 'medium', 'high'")

    # Optional extended properties
    material_name: Optional[str] = None
    material_type: Optional[str] = None
    recommendation_type: Optional[str] = None
    cost_level: Optional[str] = None
    scores: Optional[MaterialScoreBreakdown] = None
    highlight: Optional[str] = None
    explanation: Optional[str] = None
    properties_summary: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True, extra="allow")

    @model_validator(mode="before")
    @classmethod
    def sync_names(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if "name" in values and "material_name" not in values:
                values["material_name"] = values["name"]
            elif "material_name" in values and "name" not in values:
                values["name"] = values["material_name"]
        return values


MaterialRecommendationItem = RecommendationItem



class DisqualifiedMaterial(BaseModel):
    """Material eliminated during hard constraint gatekeeping."""

    material_id: int
    material_name: str
    reason: str


class RecommendationResponse(BaseModel):
    """Comprehensive explainable packaging recommendation response."""

    input_summary: Dict[str, Any]
    risk_profile: RiskProfile
    requirements: PackagingRequirements
    primary_recommendation: RecommendationItem
    alternative_recommendations: List[RecommendationItem] = []
    disclaimer: str

    # Optional fields for extended context and backward compatibility
    commodity_summary: Optional[Dict[str, Any]] = None
    otr_requirement_category: Optional[str] = None
    wvtr_requirement_category: Optional[str] = None
    suggested_thickness_range_microns: Optional[ThicknessRange] = None
    sealability_requirement: Optional[str] = None
    mechanical_strength_requirement: Optional[str] = None
    map_suitability: Optional[str] = None
    breathable_or_microperforated_recommendation: Optional[str] = None
    storage_recommendation: Optional[str] = None
    cost_class: Optional[str] = None
    sustainability_score: Optional[float] = None
    recommended_packaging_structure: Optional[str] = None
    disqualified_materials: Optional[List[DisqualifiedMaterial]] = []
    explanatory_reasons: Optional[List[str]] = []
    warnings: Optional[List[str]] = []
    session_id: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, extra="allow")
