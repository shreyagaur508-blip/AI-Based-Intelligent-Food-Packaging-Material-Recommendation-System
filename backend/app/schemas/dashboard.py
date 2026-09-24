"""Pydantic schemas for Admin Dashboard and System Summary."""

from typing import List
from pydantic import BaseModel, ConfigDict


class DashboardSummaryResponse(BaseModel):
    """Aggregate statistics and health overview for administrative / reporting dashboard."""

    total_commodities: int
    total_materials: int
    total_material_properties: int
    total_active_rules: int
    total_recommendations: int
    total_traceability_batches: int
    food_grade_compliance_rate: float
    system_status: str
    database_type: str
    supported_categories: List[str] = []
    polymer_families: List[str] = []

    model_config = ConfigDict(from_attributes=True)
