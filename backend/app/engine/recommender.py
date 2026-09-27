"""Main Recommendation Pipeline Orchestrator.

Executes deterministic 6-stage explainable packaging recommendation pipeline:
1. Food Input Resolution & Context Normalization
2. Food-Risk Classification (RiskProfiler)
3. Technical Packaging Requirement Derivation (RequirementFormulator)
4. Candidate Material Filtering & Hard Gatekeeping (CandidateFilter)
5. Multi-Criteria Weighted Scoring & Ranking (MCDAScorer)
6. Scientific Explanation & Output Assembly (ExplainabilityEngine)
"""

import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.commodity import Commodity
from app.models.packaging_material import PackagingMaterial
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
)
from app.engine.risk_profiler import risk_profiler
from app.engine.requirement_formulator import requirement_formulator
from app.engine.candidate_filter import candidate_filter
from app.engine.scorer import mcda_scorer
from app.engine.explainability import explainability_engine, DISCLAIMER_TEXT


class RecommendationEngine:
    """Core recommendation pipeline coordinator."""

    @classmethod
    def resolve_food_context(
        cls,
        db: Session,
        request: RecommendationRequest,
    ) -> Tuple[Dict[str, Any], Optional[Commodity]]:
        """Merge user inputs with database commodity defaults if available."""
        commodity: Optional[Commodity] = None

        if request.commodity_id:
            commodity = db.scalar(select(Commodity).where(Commodity.id == request.commodity_id))
        elif request.commodity_name:
            commodity = db.scalar(
                select(Commodity).where(Commodity.name.ilike(f"%{request.commodity_name.strip()}%"))
            )

        name = request.commodity_name or (commodity.name if commodity else "Custom Food Product")
        category = (
            request.commodity_category
            or (commodity.category if commodity else "Other / Custom")
        )
        moisture = (
            request.moisture_percent
            if request.moisture_percent is not None
            else (commodity.default_moisture_percent if commodity else 15.0)
        )
        oil_fat = (
            request.oil_fat_level
            or (commodity.oil_fat_level if commodity else "none")
        )
        ph = request.pH if request.pH is not None else (commodity.default_ph if commodity else 6.0)
        respiration = (
            request.respiration_rate
            or (commodity.respiration_class if commodity else "none")
        )
        shelf_life = (
            request.desired_shelf_life_days
            if request.desired_shelf_life_days is not None
            else (commodity.base_shelf_life_days if commodity else 30)
        )
        storage_type = (
            request.storage_type
            or (commodity.recommended_storage_type if commodity else "ambient")
        )

        # Default temperature based on storage type if not provided
        if request.storage_temperature is not None:
            storage_temp = request.storage_temperature
        elif commodity:
            storage_temp = (commodity.minimum_storage_temperature + commodity.maximum_storage_temperature) / 2.0
        elif storage_type == "frozen":
            storage_temp = -18.0
        elif storage_type == "chilled":
            storage_temp = 4.0
        else:
            storage_temp = 22.0

        rh = (
            request.relative_humidity
            if request.relative_humidity is not None
            else (90.0 if storage_type in ("chilled", "frozen") else 55.0)
        )
        transit_cond = request.transportation_condition or "Ambient Standard (Truck / Rail)"
        transit_duration = request.transportation_duration if request.transportation_duration is not None else 3.0
        sust_pref = request.sustainability_preference or "balanced"
        pkg_format = request.packaging_format_preference or "Pillow Pouch"

        food_context = {
            "commodity_name": name,
            "commodity_category": category,
            "moisture_percent": moisture,
            "oil_fat_level": oil_fat,
            "pH": ph,
            "respiration_rate": respiration,
            "desired_shelf_life_days": shelf_life,
            "storage_type": storage_type,
            "storage_temperature": storage_temp,
            "relative_humidity": rh,
            "transportation_condition": transit_cond,
            "transportation_duration": transit_duration,
            "sustainability_preference": sust_pref,
            "packaging_format_preference": pkg_format,
        }

        return food_context, commodity

    @classmethod
    def run(
        cls,
        db: Session,
        request: RecommendationRequest,
    ) -> RecommendationResponse:
        """Execute the full 6-stage recommendation engine pipeline."""
        # 1. Food Input Resolution
        food_context, commodity = cls.resolve_food_context(db, request)

        # 2. Food-Risk Classification
        risk_profile = risk_profiler.evaluate(food_context)

        # 3. Packaging Requirement Derivation
        derived_reqs = requirement_formulator.derive(food_context, risk_profile)

        # 4. Candidate Material Filtering
        all_materials = list(db.scalars(select(PackagingMaterial)).all())
        qualified, disqualified = candidate_filter.filter_candidates(all_materials, food_context)

        if not qualified:
            # Fallback: if all were disqualified, include food_grade compliant materials
            qualified = [m for m in all_materials if m.food_grade_compliant]

        # 5. Candidate Ranking using Weighted Scoring
        ranked = mcda_scorer.rank_candidates(qualified, food_context)

        # 6. Explanation Generation & Output Assembly
        primary_item, alternatives, structure_desc = explainability_engine.assemble_recommendations(
            ranked_candidates=ranked,
            food_context=food_context,
            risk_profile=risk_profile,
        )

        reasons = explainability_engine.generate_reasons(
            food_context=food_context,
            risk_profile=risk_profile,
            primary_mat=ranked[0][0],
            primary_scores=ranked[0][1],
        )

        warnings = explainability_engine.generate_warnings(food_context)

        session_id = str(uuid.uuid4())
        created_at = datetime.utcnow()

        commodity_summary = {
            "name": food_context["commodity_name"],
            "category": food_context["commodity_category"],
            "moisture_percent": food_context["moisture_percent"],
            "oil_fat_level": food_context["oil_fat_level"],
            "respiration_rate": food_context["respiration_rate"],
            "storage_type": food_context["storage_type"],
            "storage_temperature_celsius": food_context["storage_temperature"],
            "relative_humidity_percent": food_context["relative_humidity"],
            "desired_shelf_life_days": food_context["desired_shelf_life_days"],
        }

        return RecommendationResponse(
            commodity_summary=commodity_summary,
            risk_profile=risk_profile,
            otr_requirement_category=derived_reqs["otr_requirement_category"],
            wvtr_requirement_category=derived_reqs["wvtr_requirement_category"],
            suggested_thickness_range_microns=derived_reqs["suggested_thickness_range_microns"],
            sealability_requirement=derived_reqs["sealability_requirement"],
            mechanical_strength_requirement=derived_reqs["mechanical_strength_requirement"],
            map_suitability=derived_reqs["map_suitability"],
            breathable_or_microperforated_recommendation=derived_reqs["breathable_or_microperforated_recommendation"],
            storage_recommendation=derived_reqs["storage_recommendation"],
            cost_class=derived_reqs["cost_class"],
            sustainability_score=primary_item.sustainability_score,
            recommended_packaging_structure=structure_desc,
            primary_recommendation=primary_item,
            alternative_recommendations=alternatives,
            disqualified_materials=disqualified,
            explanatory_reasons=reasons,
            warnings=warnings,
            disclaimer=DISCLAIMER_TEXT,
            session_id=session_id,
            created_at=created_at,
        )


recommendation_engine = RecommendationEngine()
