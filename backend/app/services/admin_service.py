"""Admin dashboard and aggregate statistics service."""

from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import select, func, distinct
from app.models.commodity import Commodity
from app.models.packaging_material import PackagingMaterial
from app.models.material_property import MaterialProperty
from app.models.recommendation_rule import RecommendationRule
from app.models.recommendation import Recommendation
from app.models.traceability_batch import TraceabilityBatch
from app.schemas.dashboard import DashboardSummaryResponse
from app.core.config import settings


class AdminService:
    """Service providing aggregate statistics and operational health indicators."""

    @staticmethod
    def get_dashboard_summary(db: Session) -> DashboardSummaryResponse:
        """Compute aggregated system metrics."""
        # Total counts
        total_commodities = db.scalar(select(func.count(Commodity.id))) or 0
        total_materials = db.scalar(select(func.count(PackagingMaterial.id))) or 0
        total_properties = db.scalar(select(func.count(MaterialProperty.id))) or 0
        total_active_rules = db.scalar(
            select(func.count(RecommendationRule.id)).where(RecommendationRule.is_active == True)
        ) or 0
        total_recommendations = db.scalar(select(func.count(Recommendation.id))) or 0
        total_batches = db.scalar(select(func.count(TraceabilityBatch.id))) or 0

        # Food grade compliance rate
        compliant_materials = db.scalar(
            select(func.count(PackagingMaterial.id)).where(PackagingMaterial.food_grade_compliant == True)
        ) or 0

        compliance_rate = (
            (compliant_materials / total_materials * 100.0)
            if total_materials > 0
            else 100.0
        )

        # Distinct categories and polymer families
        categories = db.scalars(select(distinct(Commodity.category))).all()
        polymer_families = db.scalars(select(distinct(PackagingMaterial.material_type))).all()

        db_type = "SQLite" if "sqlite" in settings.DATABASE_URL.lower() else "PostgreSQL"

        return DashboardSummaryResponse(
            total_commodities=total_commodities,
            total_materials=total_materials,
            total_material_properties=total_properties,
            total_active_rules=total_active_rules,
            total_recommendations=total_recommendations,
            total_traceability_batches=total_batches,
            food_grade_compliance_rate=round(compliance_rate, 1),
            system_status="Operational",
            database_type=db_type,
            supported_categories=list(categories),
            polymer_families=list(polymer_families),
        )


admin_service = AdminService()
