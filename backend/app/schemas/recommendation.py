"""Pydantic schemas for Packaging Recommendation API."""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


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
        description="Lipid content level: 'none', 'low', 'moderate', 'high'",
    )
    pH: Optional[float] = Field(None, ge=0.0, le=14.0, description="Product baseline pH")
    respiration_rate: Optional[str] = Field(
        None,
        description="Respiration class: 'none', 'low', 'moderate', 'high', 'very_high'",
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
        description="Transit environment (e.g., 'Ambient Standard', 'Reefer Cold Chain', 'High-Humidity Marine')",
    )
    transportation_duration: Optional[float] = Field(None, ge=0.0, description="Transit duration in days")
    sustainability_preference: Optional[str] = Field(
        "balanced",
        description="Sustainability goal: 'balanced', 'recyclable', 'compostable', 'minimal_carbon'",
    )
    packaging_format_preference: Optional[str] = Field(
        None,
        description="Format: 'Pillow Pouch', 'Stand-up Pouch (Doypack)', 'Perforated Bag / Clamshell', 'Vacuum Skin Packaging (VSP)', 'MAP Tray'",
    )


class RiskProfile(BaseModel):
    """Calculated food vulnerability and degradation risks."""

    moisture_risk: str = Field(..., description="Moisture sorption / loss risk: 'Low', 'Moderate', 'High', 'Critical'")
    oxidation_risk: str = Field(..., description="Lipid oxidation / rancidity risk: 'Low', 'Moderate', 'High', 'Critical'")
    microbial_spoilage_risk: str = Field(..., description="Bacterial / fungal spoilage risk: 'Low', 'Moderate', 'High', 'Critical'")
    respiration_risk: str = Field(..., description="Metabolic respiration / anoxia risk: 'None', 'Low', 'Moderate', 'High', 'Very High'")
    mechanical_damage_risk: str = Field(..., description="Transit shock / abrasion risk: 'Low', 'Moderate', 'High'")
    freezer_burn_risk: str = Field(..., description="Sublimation / frost risk: 'None', 'Low', 'Moderate', 'High'")
    risk_summary: str = Field(..., description="Summary overview of primary degradation pathways")


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


class MaterialRecommendationItem(BaseModel):
    """Detailed recommendation entry for a packaging material."""

    material_id: int
    material_name: str
    material_type: str
    structure: str
    recommendation_type: str = Field(
        ...,
        description="'Primary Recommendation', 'Alternative (Eco Choice)', 'Alternative (Budget Pick)', 'Alternative (High-Barrier Pick)'",
    )
    cost_level: str
    sustainability_score: float
    scores: MaterialScoreBreakdown
    highlight: str
    explanation: str
    properties_summary: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class DisqualifiedMaterial(BaseModel):
    """Material eliminated during hard constraint gatekeeping."""

    material_id: int
    material_name: str
    reason: str


class RecommendationResponse(BaseModel):
    """Comprehensive explainable packaging recommendation response."""

    commodity_summary: Dict[str, Any]
    risk_profile: RiskProfile
    otr_requirement_category: str = Field(..., description="'low', 'medium', 'high', 'controlled'")
    wvtr_requirement_category: str = Field(..., description="'low', 'medium', 'high'")
    suggested_thickness_range_microns: ThicknessRange
    sealability_requirement: str = Field(..., description="Required heat seal integrity standard")
    mechanical_strength_requirement: str = Field(..., description="Required tensile & puncture resistance standard")
    map_suitability: str = Field(..., description="Modified atmosphere packaging suitability and gas mix advice")
    breathable_or_microperforated_recommendation: str = Field(
        ...,
        description="Breathable or laser micro-perforated film recommendation",
    )
    storage_recommendation: str = Field(..., description="Storage temperature and environmental handling instructions")
    cost_class: str = Field(..., description="Cost classification tier: 'Budget', 'Moderate', 'Premium'")
    sustainability_score: float = Field(..., ge=0.0, le=100.0, description="Overall sustainability rating (0-100)")
    recommended_packaging_structure: str = Field(..., description="Engineered multilayer / monolayer structure description")
    primary_recommendation: MaterialRecommendationItem
    alternative_recommendations: List[MaterialRecommendationItem]
    disqualified_materials: List[DisqualifiedMaterial] = []
    explanatory_reasons: List[str] = Field(..., min_length=3, description="At least three structured scientific justifications")
    warnings: List[str] = Field(default_factory=list, description="Critical spoilage, chilling, or handling hazard warnings")
    disclaimer: str = Field(
        ...,
        description="Scientific decision-support disclaimer for empirical validation",
    )
    session_id: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
