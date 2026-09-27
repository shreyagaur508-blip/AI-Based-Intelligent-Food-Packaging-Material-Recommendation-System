"""Multi-Criteria Decision Analysis (MCDA) Scoring Engine.

Calculates normalized composite scores across Barrier Match, Mechanical Integrity,
Cost Tier, and Sustainability Metrics based on user priorities and product needs.
"""

from typing import List, Dict, Any, Tuple
from app.models.packaging_material import PackagingMaterial
from app.schemas.recommendation import MaterialScoreBreakdown


class MCDAScorer:
    """Computes weighted multi-criteria scores for packaging material candidates."""

    @staticmethod
    def calculate_weights(food_context: Dict[str, Any]) -> Dict[str, float]:
        """Derive normalized weights based on product physiology and user preferences."""
        oil_fat = food_context.get("oil_fat_level", "none").lower()
        category = food_context.get("commodity_category", "").lower()
        shelf_life = food_context.get("desired_shelf_life_days", 30)
        transit_days = food_context.get("transportation_duration", 2.0)
        sust_pref = food_context.get("sustainability_preference", "balanced").lower()

        # Base default weights
        w_barrier = 0.35
        w_mechanical = 0.20
        w_cost = 0.25
        w_sustainability = 0.20

        # Rule 1: High-fat foods prioritize low oxygen transmission
        if oil_fat == "high":
            w_barrier += 0.10
            w_cost -= 0.05

        # Rule 2: Dry crisp foods prioritize low water-vapor transmission
        if category in ("dry crisp foods", "dry crisp") or food_context.get("moisture_percent", 10.0) < 5.0:
            w_barrier += 0.08
            w_cost -= 0.04

        # Rule 8: Long transport duration prioritizes mechanical strength
        if transit_days > 3.0:
            w_mechanical += 0.10
            w_cost -= 0.05

        # Rule 9: Long shelf life prioritizes barrier and sealability
        if shelf_life > 180:
            w_barrier += 0.10
            w_mechanical += 0.05
            w_cost -= 0.05

        # Rule 7: Higher sustainability preference improves ranking of eco-options
        if sust_pref in ("compostable", "recyclable", "minimal_carbon"):
            w_sustainability += 0.15
            w_cost -= 0.10

        # Ensure positive weights and normalize sum to 1.0
        w_barrier = max(0.15, w_barrier)
        w_mechanical = max(0.10, w_mechanical)
        w_cost = max(0.10, w_cost)
        w_sustainability = max(0.10, w_sustainability)

        total_weight = w_barrier + w_mechanical + w_cost + w_sustainability
        return {
            "barrier": w_barrier / total_weight,
            "mechanical": w_mechanical / total_weight,
            "cost": w_cost / total_weight,
            "sustainability": w_sustainability / total_weight,
        }

    @staticmethod
    def score_material(
        mat: PackagingMaterial,
        food_context: Dict[str, Any],
        weights: Dict[str, float],
    ) -> Tuple[float, MaterialScoreBreakdown]:
        """Compute individual and composite scores (0-100) for a candidate material."""
        category = food_context.get("commodity_category", "").lower()
        respiration = food_context.get("respiration_rate", "none").lower()
        oil_fat = food_context.get("oil_fat_level", "none").lower()
        storage_type = food_context.get("storage_type", "ambient").lower()
        shelf_life = food_context.get("desired_shelf_life_days", 30)
        moisture = food_context.get("moisture_percent", 10.0)

        prop = mat.properties[0] if mat.properties else None
        otr = prop.otr_value if prop else 1000.0
        wvtr = prop.wvtr_value if prop else 10.0

        # --- 1. Barrier Score Calculation ---
        is_fresh_produce = category in ("fresh produce", "produce") or respiration in ("moderate", "high", "very_high")
        is_frozen = storage_type == "frozen"
        is_high_fat = oil_fat == "high"
        is_dry_crisp = category in ("dry crisp foods", "dry crisp") or (moisture < 5.0 and "snack" in category)

        if is_fresh_produce:
            # For fresh produce: Micro-perforated or breathable films get top barrier score
            if mat.microperforation_supported or "Micro-perforated" in mat.name:
                barrier_score = 96.0
            elif "PLA" in mat.name:
                barrier_score = 88.0
            elif "LDPE" in mat.name or "PP" in mat.name:
                barrier_score = 75.0
            else:
                barrier_score = 55.0

        elif is_frozen:
            # For frozen: Low WVTR and sub-zero impact resistance
            if "PET/EVOH/PE" in mat.name or "LDPE" in mat.name or "HDPE" in mat.name:
                barrier_score = 92.0
            elif "BOPP" in mat.name or "PP" in mat.name:
                barrier_score = 84.0
            else:
                barrier_score = 70.0

        elif is_high_fat or is_dry_crisp or "powder" in category:
            # High barrier needed: Alu Foil, Met-PET, PET/EVOH/PE
            if "Alu Foil" in mat.name:
                barrier_score = 99.0
            elif "Met-PET" in mat.name:
                barrier_score = 95.0
            elif "PET/EVOH/PE" in mat.name:
                barrier_score = 93.0
            elif "BOPP" in mat.name or "HDPE" in mat.name:
                barrier_score = 78.0
            else:
                barrier_score = 60.0
        else:
            # General food
            if wvtr < 10.0 and otr < 2000.0:
                barrier_score = 88.0
            else:
                barrier_score = 75.0

        # --- 2. Mechanical Score Calculation ---
        # Scale 0-10 ratings to 0-100
        seal_score = min(100.0, mat.sealability_score * 10.0)
        strength_score = min(100.0, mat.mechanical_strength_score * 10.0)
        puncture_score = min(100.0, mat.puncture_resistance_score * 10.0)
        mechanical_score = (seal_score * 0.40) + (strength_score * 0.35) + (puncture_score * 0.25)

        # --- 3. Cost Score Calculation ---
        cost_level = mat.cost_level.lower()
        if cost_level == "budget":
            cost_score = 95.0
        elif cost_level == "moderate":
            cost_score = 80.0
        else:  # Premium
            cost_score = 60.0

        # --- 4. Sustainability Score Calculation ---
        if "PLA" in mat.name or "Compostable" in mat.biodegradability_level:
            sustainability_score = 95.0
        elif "PET/EVOH/PE" in mat.name:
            sustainability_score = 88.0
        elif "PET" in mat.name and "Met-" not in mat.name:
            sustainability_score = 90.0
        elif "HDPE" in mat.name or "LDPE" in mat.name or "PP" in mat.name or "BOPP" in mat.name:
            sustainability_score = 85.0
        elif "Paper" in mat.name:
            sustainability_score = 80.0
        elif "Met-PET" in mat.name:
            sustainability_score = 65.0
        else:  # Multi-layer foil
            sustainability_score = 40.0

        # Composite total score
        total_score = (
            (weights["barrier"] * barrier_score)
            + (weights["mechanical"] * mechanical_score)
            + (weights["cost"] * cost_score)
            + (weights["sustainability"] * sustainability_score)
        )

        breakdown = MaterialScoreBreakdown(
            total_score=round(total_score, 1),
            barrier_score=round(barrier_score, 1),
            mechanical_score=round(mechanical_score, 1),
            cost_score=round(cost_score, 1),
            sustainability_score=round(sustainability_score, 1),
        )

        return round(total_score, 1), breakdown

    @classmethod
    def rank_candidates(
        cls,
        candidates: List[PackagingMaterial],
        food_context: Dict[str, Any],
    ) -> List[Tuple[PackagingMaterial, MaterialScoreBreakdown]]:
        """Rank qualified candidates by composite total score descending."""
        weights = cls.calculate_weights(food_context)
        scored_list = []
        for mat in candidates:
            total_score, breakdown = cls.score_material(mat, food_context, weights)
            scored_list.append((mat, breakdown))

        scored_list.sort(key=lambda x: x[1].total_score, reverse=True)
        return scored_list


mcda_scorer = MCDAScorer()
