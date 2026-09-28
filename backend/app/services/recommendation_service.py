"""Recommendation Service layer bridging engine execution and database persistence."""

from sqlalchemy.orm import Session
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
)
from app.services.recommendation_engine import recommendation_engine
from app.models.recommendation import Recommendation
from app.models.recommendation_item import RecommendationItem


class RecommendationService:
    """Service providing packaging recommendation calculation and audit persistence."""

    @staticmethod
    def generate_recommendation(
        db: Session,
        request: RecommendationRequest,
    ) -> RecommendationResponse:
        """Run explainable decision engine and persist log record."""
        # 1. Execute recommendation engine pipeline
        response = recommendation_engine.run(db=db, request=request)

        # 2. Persist historical recommendation log
        try:
            food_summary = response.commodity_summary or response.input_summary or {}
            commodity_name = food_summary.get("commodity_name") or food_summary.get("name", "Custom Food")
            category = food_summary.get("commodity_category") or food_summary.get("category", "Other")
            storage_temp = food_summary.get("storage_temperature") or food_summary.get("storage_temperature_celsius", 20.0)
            rel_humidity = food_summary.get("relative_humidity") or food_summary.get("relative_humidity_percent", 55.0)
            shelf_life = food_summary.get("desired_shelf_life_days", 30)

            rec_db = Recommendation(
                session_id=response.session_id,
                commodity_name=commodity_name,
                category=category,
                storage_temperature=storage_temp,
                relative_humidity=rel_humidity,
                target_shelf_life_days=shelf_life,
                packaging_format=request.packaging_format_preference,
                priority_profile=request.sustainability_preference or "balanced",
                custom_notes=response.risk_profile.risk_summary if response.risk_profile else None,
            )
            db.add(rec_db)
            db.flush()

            # Add primary item
            primary = response.primary_recommendation
            if primary:
                item_db = RecommendationItem(
                    recommendation_id=rec_db.id,
                    material_id=primary.material_id,
                    rank=1,
                    recommendation_type=primary.recommendation_type or "PRIMARY",
                    total_score=primary.scores.total_score if primary.scores else 85.0,
                    barrier_score=primary.scores.barrier_score if primary.scores else None,
                    sustainability_score=primary.scores.sustainability_score if primary.scores else primary.sustainability_score,
                    cost_score=primary.scores.cost_score if primary.scores else None,
                    mechanical_score=primary.scores.mechanical_score if primary.scores else None,
                    is_disqualified=False,
                    scientific_explanation=primary.explanation or ("; ".join(primary.reasons) if primary.reasons else None),
                )
                db.add(item_db)

            # Add alternative items
            for idx, alt in enumerate(response.alternative_recommendations or [], start=2):
                alt_db = RecommendationItem(
                    recommendation_id=rec_db.id,
                    material_id=alt.material_id,
                    rank=idx,
                    recommendation_type=alt.recommendation_type or f"ALTERNATIVE_{idx-1}",
                    total_score=alt.scores.total_score if alt.scores else 80.0,
                    barrier_score=alt.scores.barrier_score if alt.scores else None,
                    sustainability_score=alt.scores.sustainability_score if alt.scores else alt.sustainability_score,
                    cost_score=alt.scores.cost_score if alt.scores else None,
                    mechanical_score=alt.scores.mechanical_score if alt.scores else None,
                    is_disqualified=False,
                    scientific_explanation=alt.explanation or ("; ".join(alt.reasons) if alt.reasons else None),
                )
                db.add(alt_db)

            # Add disqualified items
            for dis in response.disqualified_materials or []:
                dis_db = RecommendationItem(
                    recommendation_id=rec_db.id,
                    material_id=dis.material_id,
                    rank=99,
                    recommendation_type="DISQUALIFIED",
                    total_score=0.0,
                    is_disqualified=True,
                    disqualification_reason=dis.reason,
                )
                db.add(dis_db)

            db.commit()
        except Exception:
            db.rollback()

        return response


recommendation_service = RecommendationService()
