"""Explainable Food Packaging Recommendation Engine for PackWise AI.

Implements a 7-stage deterministic, explainable decision pipeline:
1. Food input resolution & normalization
2. Food-risk classification (moisture, oxidation, microbial, respiration, mechanical, freezer burn)
3. Technical packaging requirement derivation (ASTM OTR/WVTR tiers, MAP, breathable film, mechanical, sealability)
4. Candidate material filtering (non-negotiable safety, anoxia, sub-zero embrittlement gates)
5. Multi-criteria weighted scoring (MCDA across barrier, sealability, mechanical strength, cost, sustainability, storage/transport)
6. Scientific explanation generation (human-readable justification for material choice)
7. Final recommendation response construction
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
    RiskProfile,
    PackagingRequirements,
    RecommendationItem,
    ThicknessRange,
    MaterialScoreBreakdown,
    DisqualifiedMaterial,
    PlainLanguageSummary,
)

DISCLAIMER_TEXT = (
    "This system provides preliminary packaging decision support. "
    "Final commercial packaging must be validated using food-contact compliance checks, "
    "migration testing, barrier testing, seal integrity testing, transport testing, and actual shelf-life studies."
)


def cost_level_to_class(cost_level: str) -> str:
    """Map database cost tier to standard low/medium/high cost_class."""
    cl = (cost_level or "").strip().lower()
    if cl == "budget":
        return "low"
    elif cl == "moderate":
        return "medium"
    elif cl == "premium":
        return "high"
    return "medium"


# Qualitative category mapping dictionaries for Phase 6 category-based inputs
MOISTURE_CATEGORY_MAP: Dict[str, float] = {
    "very_dry": 2.5,       # 0–10% (e.g., Potato chips, Biscuits, Milk powder, dry snacks)
    "low": 2.5,
    "dry": 14.0,           # 10–30% (e.g., Wheat flour, Rice, Grains, dried foods)
    "semi_dry": 14.0,
    "medium": 14.0,
    "moist": 55.0,         # 30–70% (e.g., Paneer, fresh cottage cheese, bakery with fillings)
    "semi_moist": 55.0,
    "high": 65.0,
    "very_moist": 88.0,    # 70–100% (e.g., Fresh tomatoes, Leafy greens, Bananas, fresh fruit)
    "very_high": 90.0,
    "fresh": 90.0,
}

PH_CATEGORY_MAP: Dict[str, float] = {
    "acidic": 4.2,         # 3.0–4.6 (e.g., Tomato, citrus fruits, berries, fruit products)
    "high_acid": 4.2,
    "low_acid": 5.5,       # 4.7–5.5 (e.g., mild vegetables)
    "neutral": 6.5,        # 4.7–7.0 (e.g., Milk, paneer, most vegetables, grains, pulses)
    "alkaline": 7.8,       # 7.1–8.5 (e.g., alkaline processed foods)
}

OIL_FAT_CATEGORY_MAP: Dict[str, str] = {
    "very_low": "low",     # <1% (e.g., fresh produce, fruits, vegetables)
    "none": "low",
    "low": "low",          # 1–5% (e.g., grains, pulses, low-fat dairy)
    "medium": "medium",    # 5–20% (e.g., baked goods, moderate-fat foods)
    "moderate": "medium",
    "high": "high",        # >20% (e.g., fried chips, namkeen, roasted nuts)
    "very_high": "very_high", # >35% lipid content
}

RESPIRATION_CATEGORY_MAP: Dict[str, str] = {
    "very_low": "very_low", # Non-respiring / processed foods, dry goods
    "none": "very_low",
    "zero": "very_low",
    "low": "low",          # Onions, potatoes
    "medium": "medium",    # Tomato, mango
    "moderate": "medium",
    "high": "high",        # Banana, berries
    "very_high": "very_high", # Spinach, mushrooms, leafy greens
}

SHELF_LIFE_CATEGORY_MAP: Dict[str, int] = {
    "short": 7,           # Short (≤7 days)
    "<=7 days": 7,
    "≤7 days": 7,
    "medium": 21,         # Medium (8–30 days)
    "8-30 days": 21,
    "8–30 days": 21,
    "long": 90,           # Long (>30 days)
    ">30 days": 90,
}


class RecommendationEngine:
    """Deterministic, explainable food packaging recommendation engine."""

    @classmethod
    def resolve_food_context(
        cls,
        db: Session,
        request: RecommendationRequest,
    ) -> Tuple[Dict[str, Any], Optional[Commodity]]:
        """Resolve food inputs and blend with database commodity reference data if available.

        -------------------------------------------------------------------------
        SIMPLE vs ADVANCED MODE FLOW:
        1. SIMPLE MODE (Recommended for farmers, small business owners):
           - User specifies commodity name, storage mode, and simple categories.
           - When `use_defaults=True`, database reference defaults fill missing
             physicochemical metrics (moisture, pH, lipid level, respiration rate).
           - When qualitative category strings are passed (e.g. moisture_category,
             ph_category), they are mapped to standard numeric ranges.

        2. ADVANCED MODE (For packaging engineers, QA labs):
           - User supplies precise laboratory metrics (numeric moisture %, pH,
             exact storage temperature, RH %, desired shelf life days).
           - When `use_defaults=False`, user-supplied parameters are strictly honored
             without commodity default overrides.
        -------------------------------------------------------------------------
        """
        commodity: Optional[Commodity] = None

        # 1. Lookup known commodity in database if ID or name is provided
        if request.commodity_id:
            commodity = db.scalar(select(Commodity).where(Commodity.id == request.commodity_id))
        elif request.commodity_name:
            clean_name = request.commodity_name.strip()
            # Try exact case-insensitive match first
            commodity = db.scalar(
                select(Commodity).where(Commodity.name.ilike(clean_name))
            )
            # Try substring match if exact match not found
            if not commodity:
                commodity = db.scalar(
                    select(Commodity).where(Commodity.name.ilike(f"%{clean_name}%"))
                )
            # Try reverse substring match for plural / descriptive terms
            if not commodity:
                all_commodities = db.scalars(select(Commodity)).all()
                for comm in all_commodities:
                    if comm.name.lower() in clean_name.lower() or clean_name.lower() in comm.name.lower():
                        commodity = comm
                        break

        name = request.commodity_name or (commodity.name if commodity else "Custom Food Product")
        category = request.commodity_category or (commodity.category if commodity else "Other / Custom")

        # 2. Resolve Moisture Content (Numeric -> Qualitative Category -> DB Default -> Safe Fallback)
        if request.moisture_percent is not None:
            moisture = float(request.moisture_percent)
        elif request.moisture_category and request.moisture_category.lower() in MOISTURE_CATEGORY_MAP:
            moisture = MOISTURE_CATEGORY_MAP[request.moisture_category.lower()]
        elif request.use_defaults and commodity and commodity.default_moisture_percent is not None:
            moisture = float(commodity.default_moisture_percent)
        else:
            moisture = 15.0

        # 3. Resolve Oil / Fat Level
        if request.oil_fat_level:
            raw_oil = request.oil_fat_level.strip().lower()
            oil_fat = OIL_FAT_CATEGORY_MAP.get(raw_oil, raw_oil)
        elif request.oil_fat_category and request.oil_fat_category.lower() in OIL_FAT_CATEGORY_MAP:
            oil_fat = OIL_FAT_CATEGORY_MAP[request.oil_fat_category.lower()]
        elif request.use_defaults and commodity and commodity.oil_fat_level:
            raw_oil = commodity.oil_fat_level.strip().lower()
            oil_fat = OIL_FAT_CATEGORY_MAP.get(raw_oil, raw_oil)
        else:
            oil_fat = "low"

        # 4. Resolve Product pH
        if request.ph_value is not None:
            ph = float(request.ph_value)
        elif request.ph_category and request.ph_category.lower() in PH_CATEGORY_MAP:
            ph = PH_CATEGORY_MAP[request.ph_category.lower()]
        elif request.use_defaults and commodity and commodity.default_ph is not None:
            ph = float(commodity.default_ph)
        else:
            ph = 6.0

        # 5. Resolve Respiration Rate Class
        if request.respiration_rate:
            raw_resp = request.respiration_rate.strip().lower()
            respiration = RESPIRATION_CATEGORY_MAP.get(raw_resp, raw_resp)
        elif request.respiration_category and request.respiration_category.lower() in RESPIRATION_CATEGORY_MAP:
            respiration = RESPIRATION_CATEGORY_MAP[request.respiration_category.lower()]
        elif request.use_defaults and commodity and commodity.respiration_class:
            raw_resp = commodity.respiration_class.strip().lower()
            respiration = RESPIRATION_CATEGORY_MAP.get(raw_resp, raw_resp)
        else:
            respiration = "very_low"

        # 6. Resolve Storage Type
        if request.storage_type:
            storage_type = request.storage_type.strip().lower()
        elif request.use_defaults and commodity and commodity.recommended_storage_type:
            storage_type = commodity.recommended_storage_type.strip().lower()
        else:
            storage_type = "ambient"

        # 7. Resolve Target Shelf Life Days
        if request.desired_shelf_life_days is not None:
            shelf_life = int(request.desired_shelf_life_days)
        elif request.shelf_life_category:
            cat_key = request.shelf_life_category.strip().lower()
            if "short" in cat_key or "<=7" in cat_key or "≤7" in cat_key:
                shelf_life = 7
            elif "medium" in cat_key or "8-30" in cat_key or "8–30" in cat_key:
                shelf_life = 21
            elif "long" in cat_key or ">30" in cat_key:
                shelf_life = commodity.base_shelf_life_days if (commodity and commodity.base_shelf_life_days) else 90
            else:
                shelf_life = SHELF_LIFE_CATEGORY_MAP.get(cat_key, 30)
        elif request.use_defaults and commodity and commodity.base_shelf_life_days is not None:
            shelf_life = int(commodity.base_shelf_life_days)
        else:
            shelf_life = 30

        # 8. Resolve Storage Temperature
        if request.storage_temperature is not None:
            storage_temp = float(request.storage_temperature)
        elif commodity and (not request.storage_type or request.storage_type.lower() == commodity.recommended_storage_type.lower()):
            storage_temp = (commodity.minimum_storage_temperature + commodity.maximum_storage_temperature) / 2.0
        elif storage_type == "frozen":
            storage_temp = -18.0
        elif storage_type == "chilled":
            storage_temp = 4.0
        else:
            storage_temp = 22.0

        # 9. Resolve Relative Humidity
        if request.relative_humidity is not None:
            rh = float(request.relative_humidity)
        else:
            rh = 90.0 if storage_type in ("chilled", "frozen") else 55.0

        # 10. Resolve Transportation Conditions
        if request.transportation_condition:
            transit_cond = request.transportation_condition.strip().lower()
        elif request.transport_category:
            t_cat = request.transport_category.strip().lower()
            transit_cond = "long_distance" if ("long" in t_cat or "distance" in t_cat) else "local"
        else:
            transit_cond = "local"

        if request.transport_days is not None:
            transit_days = int(request.transport_days)
        elif request.transport_category:
            t_cat = request.transport_category.strip().lower()
            transit_days = 7 if ("long" in t_cat or "distance" in t_cat) else 2
        else:
            transit_days = 2

        # 11. Sustainability & Packaging Format Preferences
        raw_sust = (request.sustainability_preference or "medium").strip().lower()
        if raw_sust in ("low", "budget", "cost"):
            sust_pref = "low"
        elif raw_sust in ("high", "recyclable", "compostable", "eco"):
            sust_pref = "high"
        else:
            sust_pref = "medium"

        pkg_format = request.packaging_format_preference or "pouch"

        food_context = {
            "commodity_name": name,
            "commodity_category": category,
            "moisture_percent": float(moisture),
            "oil_fat_level": oil_fat,
            "ph": float(ph),
            "respiration_rate": respiration,
            "desired_shelf_life_days": int(shelf_life),
            "storage_type": storage_type,
            "storage_temperature": float(storage_temp),
            "relative_humidity": float(rh),
            "transportation_condition": transit_cond,
            "transportation_duration_days": int(transit_days),
            "sustainability_preference": sust_pref,
            "packaging_format_preference": pkg_format,
        }

        return food_context, commodity

    @staticmethod
    def classify_risks(food_context: Dict[str, Any]) -> RiskProfile:
        """Classify food degradation, biological, and transport risks (low, medium, high).

        Calculates:
        1. moisture_risk
        2. oxidation_risk
        3. microbial_risk
        4. respiration_risk
        5. mechanical_damage_risk
        6. freezer_burn_risk
        """
        category = food_context.get("commodity_category", "").lower()
        moisture = food_context.get("moisture_percent", 10.0)
        oil_fat = food_context.get("oil_fat_level", "low").lower()
        ph = food_context.get("ph", 6.0)
        respiration = food_context.get("respiration_rate", "very_low").lower()
        storage_type = food_context.get("storage_type", "ambient").lower()
        storage_temp = food_context.get("storage_temperature", 20.0)
        transit_days = food_context.get("transportation_duration_days", 2)
        transit_cond = food_context.get("transportation_condition", "local").lower()

        # 1. Moisture Risk (Rule 1 & Rule 10)
        # High for high moisture foods (wilting/syneresis) OR very dry foods (hygroscopic caking/loss of crispness)
        if moisture >= 60.0 or moisture <= 4.0 or category in ("fresh produce", "perishable dairy", "dry crisp foods", "powders & grains", "high-fat snacks"):
            moisture_risk = "high"
        elif moisture >= 15.0:
            moisture_risk = "medium"
        else:
            moisture_risk = "low"

        # 2. Oxidation Risk (Rule 2)
        if oil_fat in ("high", "very_high"):
            oxidation_risk = "high"
        elif oil_fat in ("medium", "moderate"):
            oxidation_risk = "medium"
        else:
            oxidation_risk = "low"

        # 3. Microbial Risk (Rule 3)
        if storage_type == "frozen":
            microbial_risk = "low"
        elif ph > 4.6 and moisture >= 60.0:
            microbial_risk = "high"
        elif moisture >= 50.0 or category in ("perishable dairy", "fresh produce"):
            microbial_risk = "high"
        elif moisture >= 15.0:
            microbial_risk = "medium"
        else:
            microbial_risk = "low"

        # 4. Respiration Risk (Rule 4)
        if respiration in ("medium", "high", "very_high") or category in ("fresh produce", "produce"):
            respiration_risk = "high"
        elif respiration in ("low", "very_low"):
            respiration_risk = "medium"
        else:
            respiration_risk = "low"

        # 5. Mechanical Damage Risk (Rule 6)
        if transit_days > 5 or transit_cond == "long_distance" or category in ("dry crisp foods", "fresh produce"):
            mechanical_damage_risk = "high"
        elif transit_days > 2 or transit_cond == "regional":
            mechanical_damage_risk = "medium"
        else:
            mechanical_damage_risk = "low"

        # 6. Freezer Burn Risk (Rule 5)
        if storage_type == "frozen" or storage_temp < 0.0:
            freezer_burn_risk = "high"
        else:
            freezer_burn_risk = "low"

        summary_parts = []
        if moisture_risk == "high":
            summary_parts.append("High moisture vulnerability")
        if oxidation_risk == "high":
            summary_parts.append("High lipid oxidation vulnerability")
        if respiration_risk == "high":
            summary_parts.append("Active respiratory metabolic rate")
        if freezer_burn_risk == "high":
            summary_parts.append("Sub-zero moisture sublimation risk")
        if mechanical_damage_risk == "high":
            summary_parts.append("High transit mechanical fragility")

        risk_summary = "; ".join(summary_parts) if summary_parts else "Standard ambient shelf-stable profile"

        return RiskProfile(
            moisture_risk=moisture_risk,
            oxidation_risk=oxidation_risk,
            microbial_risk=microbial_risk,
            respiration_risk=respiration_risk,
            mechanical_damage_risk=mechanical_damage_risk,
            freezer_burn_risk=freezer_burn_risk,
            risk_summary=risk_summary,
        )

    @staticmethod
    def derive_requirements(
        food_context: Dict[str, Any],
        risk_profile: RiskProfile,
    ) -> PackagingRequirements:
        """Derive explicit ASTM technical barrier and mechanical packaging requirements."""
        category = food_context.get("commodity_category", "").lower()
        respiration = food_context.get("respiration_rate", "very_low").lower()
        oil_fat = food_context.get("oil_fat_level", "low").lower()
        storage_type = food_context.get("storage_type", "ambient").lower()
        shelf_life = food_context.get("desired_shelf_life_days", 30)
        transit_days = food_context.get("transportation_duration_days", 2)
        transit_cond = food_context.get("transportation_condition", "local").lower()
        moisture = food_context.get("moisture_percent", 10.0)

        is_produce = category in ("fresh produce", "produce") or respiration in ("medium", "high", "very_high")

        # 1. Required OTR Category (Rules 8 & 9)
        if is_produce:
            required_otr = "controlled"
        elif oil_fat in ("high", "very_high") or shelf_life > 90 or risk_profile.oxidation_risk == "high":
            required_otr = "very_low"
        elif oil_fat in ("medium", "moderate") or shelf_life > 30:
            required_otr = "low"
        elif shelf_life > 14:
            required_otr = "medium"
        else:
            required_otr = "high"

        # 2. Required WVTR Category (Rules 9, 10 & 11)
        if storage_type == "frozen" or (moisture < 5.0 and shelf_life > 90 and category in ("powders & grains",)):
            required_wvtr = "very_low"
        elif (moisture < 5.0 and category in ("dry crisp foods", "high-fat snacks", "powders & grains")) or risk_profile.moisture_risk == "high" or shelf_life > 90:
            required_wvtr = "low"
        elif moisture < 20.0 or shelf_life > 30:
            required_wvtr = "medium"
        else:
            required_wvtr = "high"

        # 3. MAP Suitability (Rule 8 & 9)
        map_suitable = True
        if category in ("powders & grains",) and shelf_life < 90 and oil_fat == "low":
            map_suitable = False

        # 4. Breathable Film Needed (Rule 8)
        breathable_film_needed = is_produce

        # 5. Mechanical Strength Requirement (Rules 6 & 11)
        if storage_type == "frozen" or transit_days > 5 or transit_cond == "long_distance" or category in ("fresh produce",):
            mechanical_req = "high"
        elif transit_days > 2 or transit_cond == "regional" or category in ("dry crisp foods", "powders & grains"):
            mechanical_req = "medium"
        else:
            mechanical_req = "low"

        # 6. Sealability Requirement (Rules 7 & 11)
        if shelf_life > 90 or storage_type == "frozen" or oil_fat in ("high", "very_high") or category in ("dry crisp foods", "powders & grains"):
            sealability_req = "high"
        elif storage_type == "chilled" or shelf_life > 30:
            sealability_req = "medium"
        else:
            sealability_req = "low"

        return PackagingRequirements(
            required_otr_category=required_otr,
            required_wvtr_category=required_wvtr,
            map_suitable=map_suitable,
            breathable_film_needed=breathable_film_needed,
            mechanical_strength_requirement=mechanical_req,
            sealability_requirement=sealability_req,
        )

    @staticmethod
    def filter_candidates(
        materials: List[PackagingMaterial],
        food_context: Dict[str, Any],
        requirements: PackagingRequirements,
    ) -> Tuple[List[PackagingMaterial], List[DisqualifiedMaterial]]:
        """Filter out incompatible materials based on hard non-negotiable safety and physical constraints."""
        category = food_context.get("commodity_category", "").lower()
        storage_type = food_context.get("storage_type", "ambient").lower()
        storage_temp = food_context.get("storage_temperature", 20.0)
        shelf_life = food_context.get("desired_shelf_life_days", 30)
        oil_fat = food_context.get("oil_fat_level", "low").lower()

        qualified: List[PackagingMaterial] = []
        disqualified: List[DisqualifiedMaterial] = []

        for mat in materials:
            # Rule 12: Exclude non-food-grade compliant materials
            if not mat.food_grade_compliant:
                disqualified.append(
                    DisqualifiedMaterial(
                        material_id=mat.id,
                        material_name=mat.name,
                        reason="Disqualified: Non-food-grade compliant material strictly prohibited for direct food contact.",
                    )
                )
                continue

            # Rule 8: Fresh produce with respiration requires breathable / microperforated packaging
            if requirements.breathable_film_needed:
                if ("Foil" in mat.name or "Met-PET" in mat.name or "PET/EVOH/PE" in mat.name) and not mat.microperforation_supported:
                    disqualified.append(
                        DisqualifiedMaterial(
                            material_id=mat.id,
                            material_name=mat.name,
                            reason="Disqualified: Zero-gas permeability hermetic barrier induces anaerobic respiration, fermentation, and rapid decay in respiring fresh produce.",
                        )
                    )
                    continue

            # Rule 11 & Rule 5: Frozen food storage embrittlement gate
            if storage_type == "frozen" or storage_temp < 0.0:
                if "PLA" in mat.name or "Paper" in mat.name:
                    disqualified.append(
                        DisqualifiedMaterial(
                            material_id=mat.id,
                            material_name=mat.name,
                            reason="Disqualified: Polymer matrix becomes brittle at sub-zero temperatures (-18°C), risking flex-cracking, seal rupture, and freezer burn.",
                        )
                    )
                    continue

            # Rule 10: Dry crisp & powder products moisture sorption gate
            if (category in ("dry crisp foods", "powders & grains", "high-fat snacks") or food_context.get("moisture_percent", 10.0) < 5.0) and shelf_life > 45:
                if "PLA" in mat.name:
                    disqualified.append(
                        DisqualifiedMaterial(
                            material_id=mat.id,
                            material_name=mat.name,
                            reason="Disqualified: High water vapor transmission rate (WVTR > 100 g/m²·day) causes rapid moisture uptake, sogginess, caking, and loss of texture over extended shelf life.",
                        )
                    )
                    continue

            # Rule 9: High-fat snacks oxidation gate
            if oil_fat in ("high", "very_high") and shelf_life > 60 and not requirements.breathable_film_needed:
                if "Paper" in mat.name:
                    disqualified.append(
                        DisqualifiedMaterial(
                            material_id=mat.id,
                            material_name=mat.name,
                            reason="Disqualified: High oxygen permeability accelerates lipid auto-oxidation, free radical formation, and rancidity in high-fat foods.",
                        )
                    )
                    continue

            qualified.append(mat)

        if not qualified:
            # Fallback to all food-grade compliant materials to ensure recommendation availability
            qualified = [m for m in materials if m.food_grade_compliant]

        return qualified, disqualified

    @classmethod
    def score_candidate(
        cls,
        mat: PackagingMaterial,
        food_context: Dict[str, Any],
        requirements: PackagingRequirements,
    ) -> Tuple[float, MaterialScoreBreakdown, float]:
        """Score single candidate using weighted multi-criteria decision formula (MCDA)."""
        category = food_context.get("commodity_category", "").lower()
        storage_type = food_context.get("storage_type", "ambient").lower()
        oil_fat = food_context.get("oil_fat_level", "low").lower()
        sust_pref = food_context.get("sustainability_preference", "medium").lower()

        is_produce = requirements.breathable_film_needed
        is_frozen = storage_type == "frozen"
        is_high_fat = oil_fat in ("high", "very_high")
        is_dry_crisp = category in ("dry crisp foods",)

        # 1. Barrier Compatibility Score (0-100)
        if is_produce:
            if "Micro-perforated" in mat.name:
                barrier_comp = 100.0
            elif mat.microperforation_supported:
                barrier_comp = 90.0
            elif "PLA" in mat.name:
                barrier_comp = 92.0
            elif "LDPE" in mat.name or "PP" in mat.name:
                barrier_comp = 78.0
            else:
                barrier_comp = 60.0
        elif is_frozen:
            if "PET/EVOH/PE" in mat.name:
                barrier_comp = 95.0
            elif "LDPE" in mat.name:
                barrier_comp = 92.0
            elif "HDPE" in mat.name:
                barrier_comp = 88.0
            elif "BOPP" in mat.name:
                barrier_comp = 82.0
            else:
                barrier_comp = 70.0
        elif is_high_fat or is_dry_crisp or "powder" in category:
            if "Alu Foil" in mat.name:
                barrier_comp = 99.0
            elif "Met-PET" in mat.name:
                barrier_comp = 96.0
            elif "PET/EVOH/PE" in mat.name:
                barrier_comp = 94.0
            elif "BOPP" in mat.name:
                barrier_comp = 80.0
            elif "HDPE" in mat.name:
                barrier_comp = 75.0
            else:
                barrier_comp = 55.0
        else:
            barrier_comp = 85.0

        # 2. Sealability Score (0-100)
        seal_score = min(100.0, mat.sealability_score * 10.0)

        # 3. Mechanical Strength Score (0-100)
        mech_score = min(
            100.0,
            (mat.mechanical_strength_score * 6.0) + (mat.puncture_resistance_score * 4.0),
        )

        # 4. Cost Score (0-100)
        cost_level = (mat.cost_level or "budget").lower()
        if cost_level == "budget":
            cost_score = 95.0
        elif cost_level == "moderate":
            cost_score = 80.0
        else:
            cost_score = 60.0

        # 5. Sustainability Score (0-100)
        if "PLA" in mat.name or "Compostable" in mat.biodegradability_level:
            sust_score = 95.0
        elif "PET/EVOH/PE" in mat.name:
            sust_score = 88.0
        elif "Alu Foil" in mat.name or "Foil" in mat.name:
            sust_score = 40.0
        elif "Met-PET" in mat.name:
            sust_score = 65.0
        elif "PET" in mat.name and "Met-" not in mat.name and "Foil" not in mat.name:
            sust_score = 90.0
        elif "HDPE" in mat.name or "LDPE" in mat.name or "PP" in mat.name or "BOPP" in mat.name or "Micro-perforated" in mat.name:
            sust_score = 85.0
        elif "Paper" in mat.name:
            sust_score = 80.0
        else:
            sust_score = 50.0

        # 6. Storage & Transport Compatibility Score (0-100)
        if is_frozen:
            storage_trans_score = 95.0 if ("LDPE" in mat.name or "PET/EVOH/PE" in mat.name or "HDPE" in mat.name) else 75.0
        elif is_produce:
            storage_trans_score = 100.0 if "Micro-perforated" in mat.name else (92.0 if (mat.microperforation_supported or "PLA" in mat.name) else 80.0)
        elif is_high_fat:
            storage_trans_score = 95.0 if mat.map_compatible else 70.0
        else:
            storage_trans_score = 85.0

        # Weights assignment
        if is_produce:
            # Emphasize gas-exchange compatibility and MAP suitability for produce
            w_barrier = 0.35
            w_seal = 0.15
            w_mech = 0.15
            w_cost = 0.10
            w_sust = 0.10
            w_storage = 0.15
        else:
            w_barrier = 0.30
            w_seal = 0.20
            w_mech = 0.15
            w_cost = 0.15
            w_sust = 0.10
            w_storage = 0.10

        # Rule 13: Higher sustainability preference boosts recyclable/biodegradable options
        if sust_pref == "high":
            w_sust += 0.08
            w_cost -= 0.08

        total_packaging_score = (
            (w_barrier * barrier_comp)
            + (w_seal * seal_score)
            + (w_mech * mech_score)
            + (w_cost * cost_score)
            + (w_sust * sust_score)
            + (w_storage * storage_trans_score)
        )

        breakdown = MaterialScoreBreakdown(
            total_score=round(total_packaging_score, 1),
            barrier_score=round(barrier_comp, 1),
            mechanical_score=round(mech_score, 1),
            cost_score=round(cost_score, 1),
            sustainability_score=round(sust_score, 1),
        )

        return round(total_packaging_score, 1), breakdown, round(sust_score, 1)

    @classmethod
    def generate_explanations(
        cls,
        mat: PackagingMaterial,
        food_context: Dict[str, Any],
        risk_profile: RiskProfile,
        requirements: PackagingRequirements,
        score_breakdown: MaterialScoreBreakdown,
    ) -> List[str]:
        """Generate structured explainability bullet points for a recommended material."""
        name = food_context.get("commodity_name", "the food product")
        category = food_context.get("commodity_category", "").lower()
        storage_type = food_context.get("storage_type", "ambient").lower()
        oil_fat = food_context.get("oil_fat_level", "low").lower()
        shelf_life = food_context.get("desired_shelf_life_days", 30)

        reasons: List[str] = []

        # 1. Biological & Barrier Reason
        if requirements.breathable_film_needed:
            reasons.append(
                f"Respiration & MAP Harmony: {mat.name} provides tailored gas permeability / micro-perforation to match the active respiration rate of {name}, preventing anaerobic fermentation while maintaining relative humidity to prevent wilting."
            )
        elif oil_fat in ("high", "very_high") and category in ("dry crisp foods", "high-fat snacks"):
            reasons.append(
                f"Oxidation & Moisture Barrier: High-barrier structure delivers ultra-low oxygen transmission (OTR < 2.0 cm³/m²·day) and moisture protection (low WVTR), preventing lipid auto-oxidation rancidity and loss of crispness across {shelf_life} days."
            )
        elif storage_type == "frozen":
            reasons.append(
                f"Sub-Zero Protection & Freezer Burn Prevention: Engineered for sub-zero polymer flexibility and dart impact resistance, preventing flex-cracking and moisture vapor sublimation (freezer burn) at -18°C frozen storage."
            )
        elif "powder" in category or shelf_life > 180:
            reasons.append(
                f"Extended Shelf-Life Barrier: Hermetic gas and vapor barrier blocks hygroscopic caking, non-enzymatic browning, and lipid degradation across {shelf_life} days of storage."
            )
        else:
            reasons.append(
                f"Barrier Protection: Standardized barrier properties effectively mitigate {risk_profile.risk_summary.lower()} for {name}."
            )

        # 2. Seal & Mechanical Integrity Reason
        reasons.append(
            f"Mechanical & Seal Reliability: Heat sealability rating of {mat.sealability_score:.1f}/10 and puncture resistance of {mat.puncture_resistance_score:.1f}/10 ensure hermetic seam integrity and transport durability."
        )

        # 3. Sustainability & Economic Reason
        reasons.append(
            f"Sustainability & Economics: Achieves a sustainability rating of {score_breakdown.sustainability_score:.0f}/100 ({mat.recyclability_level}) within the {cost_level_to_class(mat.cost_level)} cost tier."
        )

        return reasons

    @classmethod
    def run(
        cls,
        db: Session,
        request: RecommendationRequest,
    ) -> RecommendationResponse:
        """Execute the complete explainable packaging recommendation pipeline."""
        # 1. Food input resolution
        food_context, commodity = cls.resolve_food_context(db, request)

        # 2. Food-risk classification
        risk_profile = cls.classify_risks(food_context)

        # 3. Packaging requirement derivation
        requirements = cls.derive_requirements(food_context, risk_profile)

        # 4. Candidate material filtering
        all_materials = list(db.scalars(select(PackagingMaterial)).all())
        qualified, disqualified = cls.filter_candidates(all_materials, food_context, requirements)

        # 5. Candidate ranking using weighted scoring
        scored_candidates = []
        for mat in qualified:
            tot_score, breakdown, sust_score = cls.score_candidate(mat, food_context, requirements)
            scored_candidates.append((mat, tot_score, breakdown, sust_score))

        # Sort descending by total score
        scored_candidates.sort(key=lambda x: x[1], reverse=True)

        if not scored_candidates:
            raise ValueError("No eligible packaging materials found.")

        # 6. Primary recommendation
        primary_mat, primary_tot, primary_breakdown, primary_sust = scored_candidates[0]
        primary_reasons = cls.generate_explanations(
            primary_mat, food_context, risk_profile, requirements, primary_breakdown
        )

        primary_recommendation = RecommendationItem(
            material_id=primary_mat.id,
            name=primary_mat.name,
            structure=primary_mat.structure,
            reasons=primary_reasons,
            sustainability_score=primary_sust,
            cost_class=cost_level_to_class(primary_mat.cost_level),
            material_name=primary_mat.name,
            material_type=primary_mat.material_type,
            recommendation_type="Primary Recommendation",
            cost_level=primary_mat.cost_level,
            scores=primary_breakdown,
            highlight="Best overall performance across barrier, seal integrity, and economic metrics.",
            explanation=f"Optimal primary choice for {food_context['commodity_name']}.",
        )

        # Build alternative recommendations (at least 2 if candidates exist)
        alternatives: List[RecommendationItem] = []
        remaining = scored_candidates[1:]

        if remaining:
            # Eco Choice: highest sustainability score among remaining
            eco_pick = max(remaining, key=lambda x: x[3])
            eco_mat, eco_tot, eco_breakdown, eco_sust = eco_pick
            eco_reasons = cls.generate_explanations(
                eco_mat, food_context, risk_profile, requirements, eco_breakdown
            )
            alternatives.append(
                RecommendationItem(
                    material_id=eco_mat.id,
                    name=eco_mat.name,
                    structure=eco_mat.structure,
                    reasons=eco_reasons,
                    sustainability_score=eco_sust,
                    cost_class=cost_level_to_class(eco_mat.cost_level),
                    material_name=eco_mat.name,
                    material_type=eco_mat.material_type,
                    recommendation_type="Alternative (Eco Choice)",
                    cost_level=eco_mat.cost_level,
                    scores=eco_breakdown,
                    highlight="Highest sustainability profile among qualified candidate materials.",
                    explanation=f"Eco-friendly alternative for {food_context['commodity_name']}.",
                )
            )

            # Secondary Alternative (Budget or High-Barrier pick)
            other_rem = [c for c in remaining if c[0].id != eco_mat.id]
            if other_rem:
                sec_pick = other_rem[0]
                sec_mat, sec_tot, sec_breakdown, sec_sust = sec_pick
                sec_reasons = cls.generate_explanations(
                    sec_mat, food_context, risk_profile, requirements, sec_breakdown
                )
                rec_type = "Alternative (Budget Pick)" if cost_level_to_class(sec_mat.cost_level) == "low" else "Alternative (High-Barrier Pick)"
                alternatives.append(
                    RecommendationItem(
                        material_id=sec_mat.id,
                        name=sec_mat.name,
                        structure=sec_mat.structure,
                        reasons=sec_reasons,
                        sustainability_score=sec_sust,
                        cost_class=cost_level_to_class(sec_mat.cost_level),
                        material_name=sec_mat.name,
                        material_type=sec_mat.material_type,
                        recommendation_type=rec_type,
                        cost_level=sec_mat.cost_level,
                        scores=sec_breakdown,
                        highlight=f"Alternative option: {sec_mat.structure}",
                        explanation=f"Secondary alternative for {food_context['commodity_name']}.",
                    )
                )

        # 7. Construct output response
        input_summary = {
            "commodity_name": food_context["commodity_name"],
            "commodity_category": food_context["commodity_category"],
            "moisture_percent": food_context["moisture_percent"],
            "oil_fat_level": food_context["oil_fat_level"],
            "ph": food_context["ph"],
            "respiration_rate": food_context["respiration_rate"],
            "desired_shelf_life_days": food_context["desired_shelf_life_days"],
            "storage_type": food_context["storage_type"],
            "storage_temperature": food_context["storage_temperature"],
            "relative_humidity": food_context["relative_humidity"],
            "transportation_condition": food_context["transportation_condition"],
            "transportation_duration_days": food_context["transportation_duration_days"],
            "sustainability_preference": food_context["sustainability_preference"],
            "packaging_format_preference": food_context["packaging_format_preference"],
        }

        # Convenience commodity summary containing both "name" and "commodity_name"
        commodity_summary = dict(input_summary, name=food_context["commodity_name"])

        # Suggested thickness range
        thickness = ThicknessRange(
            min_microns=30.0,
            max_microns=60.0,
            recommended_microns=45.0,
        )
        if food_context["storage_type"] == "frozen":
            thickness = ThicknessRange(min_microns=50.0, max_microns=85.0, recommended_microns=65.0)
        elif requirements.breathable_film_needed:
            thickness = ThicknessRange(min_microns=25.0, max_microns=40.0, recommended_microns=30.0)

        # Temperature warnings
        warnings: List[str] = []
        if "banana" in food_context["commodity_name"].lower() and food_context["storage_temperature"] < 12.0:
            warnings.append("CHILLING INJURY WARNING: Storing bananas below 12°C induces irreversible peel browning.")
        elif "tomato" in food_context["commodity_name"].lower() and food_context["storage_temperature"] < 10.0:
            warnings.append("CHILLING INJURY WARNING: Storing tomatoes below 10°C impairs aroma synthesis and softens tissue.")

        # Plain language summary for farmers and non-technical users
        must_do_points = []
        if requirements.breathable_film_needed:
            must_do_points.append("Allow fresh produce to breathe naturally (controlled oxygen and CO2 exchange) while preventing sweat/condensation buildup to stop decay and mold.")
        else:
            if risk_profile.oxidation_risk == "high" and risk_profile.moisture_risk == "high":
                must_do_points.append("Block outside air (oxygen) and humidity completely to preserve crispness and prevent oils/fats from going rancid.")
            elif risk_profile.moisture_risk == "high":
                must_do_points.append("Provide a strong moisture barrier to prevent humidity uptake, sogginess, and powder caking.")
            elif risk_profile.oxidation_risk == "high":
                must_do_points.append("Provide a tight oxygen barrier and light protection to stop flavor loss and fat rancidity.")
            elif food_context["storage_type"] == "frozen":
                must_do_points.append("Seal against ice sublimation (freezer burn) and resist cracking at sub-zero temperatures.")
            else:
                must_do_points.append("Provide hygienic containment, moderate barrier protection, and distribution strength.")

        plain_must_do = " ".join(must_do_points)

        # Suggested packaging structure in simple, farmer-friendly terms
        if requirements.breathable_film_needed:
            simple_struct = f"Laser Micro-Perforated or Breathable Film Pouch ({primary_mat.name})"
        elif food_context["storage_type"] == "frozen":
            simple_struct = f"Sub-Zero Freeze-Tough Flexible Pouch ({primary_mat.name})"
        elif "metallized" in primary_mat.structure.lower() or "met-pet" in primary_mat.name.lower() or "alu" in primary_mat.name.lower() or "foil" in primary_mat.name.lower():
            simple_struct = f"High-Barrier Foil or Metallized Pouch with Nitrogen Flush ({primary_mat.name})"
        else:
            simple_struct = f"{primary_mat.name} ({primary_mat.structure})"

        plain_storage = f"Store in {food_context['storage_type']} conditions at ~{food_context['storage_temperature']}°C with {food_context['relative_humidity']}% relative humidity."

        plain_summary = PlainLanguageSummary(
            must_do=plain_must_do,
            suggested_structure=simple_struct,
            storage_guidance=plain_storage,
            key_takeaway=f"Optimal choice: {primary_mat.name} provides tailored barrier protection for {food_context['commodity_name']}."
        )

        return RecommendationResponse(
            input_summary=input_summary,
            risk_profile=risk_profile,
            requirements=requirements,
            primary_recommendation=primary_recommendation,
            alternative_recommendations=alternatives,
            disclaimer=DISCLAIMER_TEXT,
            plain_language_summary=plain_summary,
            commodity_summary=commodity_summary,
            otr_requirement_category=requirements.required_otr_category,
            wvtr_requirement_category=requirements.required_wvtr_category,
            suggested_thickness_range_microns=thickness,
            sealability_requirement=requirements.sealability_requirement,
            mechanical_strength_requirement=requirements.mechanical_strength_requirement,
            map_suitability="Equilibrium Modified Atmosphere Packaging (EMAP)" if requirements.breathable_film_needed else ("High-Purity N2 / CO2 Flushing" if requirements.map_suitable else "Standard Ambient Atmosphere"),
            breathable_or_microperforated_recommendation="Recommended: Laser micro-perforated or breathable film" if requirements.breathable_film_needed else "Not recommended: Hermetic solid barrier required",
            storage_recommendation=f"Store at {food_context['storage_temperature']}°C ({food_context['storage_type']}) with relative humidity {food_context['relative_humidity']}%.",
            cost_class=primary_recommendation.cost_class,
            sustainability_score=primary_recommendation.sustainability_score,
            recommended_packaging_structure=f"{primary_mat.name} ({primary_mat.structure})",
            disqualified_materials=disqualified,
            explanatory_reasons=primary_reasons,
            warnings=warnings,
            session_id=str(uuid.uuid4()),
            created_at=datetime.utcnow(),
        )


recommendation_engine = RecommendationEngine()
