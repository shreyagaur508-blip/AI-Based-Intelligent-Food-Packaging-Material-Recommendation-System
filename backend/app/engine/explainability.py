"""Explainability and Scientific Reasoning Synthesizer.

Generates human-readable engineering rationale, risk mitigations, trade-off notes,
alternative picks, and critical regulatory disclaimers.
"""

from typing import List, Dict, Any, Tuple
from app.models.packaging_material import PackagingMaterial
from app.schemas.recommendation import (
    RiskProfile,
    MaterialScoreBreakdown,
    MaterialRecommendationItem,
)

DISCLAIMER_TEXT = (
    "PackWise AI provides scientific decision support based on ASTM D3985 (OTR) and ASTM F1249 (WVTR) reference standards. "
    "Indicative specifications are designed for preliminary engineering selection and academic modeling. "
    "Commercial packaging lines require mandatory empirical shelf-life testing, seal integrity validation, and regulatory migration testing under actual supply chain conditions."
)


class ExplainabilityEngine:
    """Generates structured scientific explanations and selects primary and alternative picks."""

    @staticmethod
    def generate_reasons(
        food_context: Dict[str, Any],
        risk_profile: RiskProfile,
        primary_mat: PackagingMaterial,
        primary_scores: MaterialScoreBreakdown,
    ) -> List[str]:
        """Generate at least 3 structured scientific explanatory justifications."""
        category = food_context.get("commodity_category", "").lower()
        respiration = food_context.get("respiration_rate", "none").lower()
        oil_fat = food_context.get("oil_fat_level", "none").lower()
        storage_type = food_context.get("storage_type", "ambient").lower()
        shelf_life = food_context.get("desired_shelf_life_days", 30)
        name = food_context.get("commodity_name", "the food commodity")

        reasons = []

        # Reason 1: Physiological & Degradation Mitigation
        if category in ("fresh produce", "produce") or respiration in ("moderate", "high", "very_high"):
            reasons.append(
                f"Respiration Equilibrium: {primary_mat.name} provides tailored gas permeation (EMAP) that matches the active respiration of {name}, preventing anaerobic fermentation and physiological tissue breakdown while maintaining relative humidity to prevent desiccation."
            )
        elif oil_fat == "high" and category in ("dry crisp foods", "high-fat snacks"):
            reasons.append(
                f"Oxidation & Crispness Defense: The structure provides superior oxygen and water vapor barriers (OTR < 2.0 cm³/m²·day, WVTR < 1.5 g/m²·day) to block lipid auto-oxidation rancidity and prevent moisture sorption sogginess."
            )
        elif storage_type == "frozen":
            reasons.append(
                f"Sub-Zero Integrity: The recommended material exhibits exceptional low-temperature ductile impact strength, preventing flex-cracking and moisture vapor sublimation (freezer burn) at -18°C storage."
            )
        elif "powder" in category or (oil_fat == "high" and shelf_life > 180):
            reasons.append(
                f"Ultra-High Barrier Protection: Hermetic gas and vapor barrier blocks hygroscopic moisture uptake, Maillard non-enzymatic browning, and lipid degradation over extended {shelf_life}-day ambient storage."
            )
        else:
            reasons.append(
                f"Barrier Compatibility: The material barrier properties effectively mitigate {risk_profile.risk_summary.lower()} across the target shelf life of {shelf_life} days."
            )

        # Reason 2: Mechanical & Processing Suitability
        reasons.append(
            f"Mechanical & Seal Reliability: Scored {primary_scores.mechanical_score:.1f}/100 in mechanical integrity, delivering strong hermetic sealability (score {primary_mat.sealability_score}/10) and puncture resistance (score {primary_mat.puncture_resistance_score}/10) to withstand distribution stress without pinholing."
        )

        # Reason 3: Sustainability & Circular Economy Alignment
        reasons.append(
            f"Sustainability & Economics: Achieves a composite sustainability rating of {primary_scores.sustainability_score:.1f}/100 ({primary_mat.recyclability_level}) within a {primary_mat.cost_level} cost tier, balancing environmental circularity with industrial feasibility."
        )

        return reasons

    @staticmethod
    def generate_warnings(food_context: Dict[str, Any]) -> List[str]:
        """Generate critical handling, temperature hazard, and storage warnings."""
        category = food_context.get("commodity_category", "").lower()
        storage_temp = food_context.get("storage_temperature", 20.0)
        storage_type = food_context.get("storage_type", "ambient").lower()
        name = food_context.get("commodity_name", "").lower()
        oil_fat = food_context.get("oil_fat_level", "none").lower()

        warnings = []

        # Chilling injury warnings for sensitive produce
        if "banana" in name and storage_temp < 12.0:
            warnings.append(
                "CHILLING INJURY HAZARD: Bananas stored below 12°C suffer irreversible peel browning, sub-epidermal cell collapse, and loss of ripening capacity."
            )
        elif "tomato" in name and storage_temp < 10.0:
            warnings.append(
                "CHILLING INJURY WARNING: Fresh tomatoes stored below 10°C develop mealy flesh texture, loss of aroma volatiles, and increased susceptibility to alternaria decay."
            )

        # Anaerobic fermentation hazard
        if category in ("fresh produce", "produce") and storage_type == "ambient" and storage_temp > 25.0:
            warnings.append(
                "TEMPERATURE ABUSE: High ambient temperatures dramatically accelerate respiration rates, increasing the risk of in-pack oxygen depletion and anaerobic off-odor fermentation."
            )

        # Oxidation hazard
        if oil_fat == "high" and storage_temp > 25.0:
            warnings.append(
                "ELEVATED OXIDATION RATE: Temperatures above 25°C accelerate fatty acid peroxide formation. Ensure tight nitrogen flushing with residual O2 < 1.0%."
            )

        # Freezer temperature check
        if storage_type == "frozen" and storage_temp > -15.0:
            warnings.append(
                "SUB-OPTIMAL FREEZER TEMPERATURE: Temperatures above -18°C accelerate ice crystal growth, damaging food cellular structure and promoting freezer burn."
            )

        return warnings

    @classmethod
    def assemble_recommendations(
        cls,
        ranked_candidates: List[Tuple[PackagingMaterial, MaterialScoreBreakdown]],
        food_context: Dict[str, Any],
        risk_profile: RiskProfile,
    ) -> Tuple[MaterialRecommendationItem, List[MaterialRecommendationItem], str]:
        """Build primary recommendation and two distinct alternatives (Eco Choice & Budget/High-Barrier Pick)."""
        if not ranked_candidates:
            raise ValueError("No qualified packaging materials available after constraint gatekeeping.")

        primary_mat, primary_scores = ranked_candidates[0]

        # Primary Item
        prop = primary_mat.properties[0] if primary_mat.properties else None
        prop_summary = {
            "OTR": f"{prop.otr_value:.2f} {prop.otr_unit}" if prop else "N/A",
            "WVTR": f"{prop.wvtr_value:.2f} {prop.wvtr_unit}" if prop else "N/A",
            "Thickness": f"{prop.thickness_microns:.0f} µm" if prop else "N/A",
            "Tensile Strength": f"{prop.tensile_strength:.1f} MPa" if prop and prop.tensile_strength else "N/A",
        }

        primary_item = MaterialRecommendationItem(
            material_id=primary_mat.id,
            material_name=primary_mat.name,
            material_type=primary_mat.material_type,
            structure=primary_mat.structure,
            recommendation_type="Primary Recommendation",
            cost_level=primary_mat.cost_level,
            sustainability_score=primary_scores.sustainability_score,
            scores=primary_scores,
            highlight="Best Overall Match across Barrier, Mechanical, Cost & Sustainability criteria.",
            explanation=f"Optimal balance for {food_context.get('commodity_name', 'product')}: provides required barrier protection with high processability.",
            properties_summary=prop_summary,
        )

        # Alternatives
        alternatives: List[MaterialRecommendationItem] = []
        remaining = ranked_candidates[1:]

        if remaining:
            # 1. Eco Choice: Find highest sustainability score among remaining
            eco_pick = max(remaining, key=lambda x: x[1].sustainability_score)
            eco_prop = eco_pick[0].properties[0] if eco_pick[0].properties else None
            eco_summary = {
                "OTR": f"{eco_prop.otr_value:.2f} {eco_prop.otr_unit}" if eco_prop else "N/A",
                "WVTR": f"{eco_prop.wvtr_value:.2f} {eco_prop.wvtr_unit}" if eco_prop else "N/A",
                "Thickness": f"{eco_prop.thickness_microns:.0f} µm" if eco_prop else "N/A",
            }
            alternatives.append(
                MaterialRecommendationItem(
                    material_id=eco_pick[0].id,
                    material_name=eco_pick[0].name,
                    material_type=eco_pick[0].material_type,
                    structure=eco_pick[0].structure,
                    recommendation_type="Alternative (Eco Choice)",
                    cost_level=eco_pick[0].cost_level,
                    sustainability_score=eco_pick[1].sustainability_score,
                    scores=eco_pick[1],
                    highlight="Highest sustainability and recyclability rating among qualified candidates.",
                    explanation=f"Eco-optimized choice: {eco_pick[0].recyclability_level}, {eco_pick[0].biodegradability_level}.",
                    properties_summary=eco_summary,
                )
            )

            # 2. Budget or High-Barrier Alternative (different from eco_pick if possible)
            other_candidates = [c for c in remaining if c[0].id != eco_pick[0].id]
            if other_candidates:
                # Prefer budget if primary is expensive, or high barrier if primary is budget
                if primary_mat.cost_level == "Premium":
                    alt2_pick = max(other_candidates, key=lambda x: x[1].cost_score)
                    alt2_type = "Alternative (Budget Pick)"
                    alt2_highlight = "Cost-optimized candidate with competitive functional barrier properties."
                else:
                    alt2_pick = max(other_candidates, key=lambda x: x[1].barrier_score)
                    alt2_type = "Alternative (High-Barrier Pick)"
                    alt2_highlight = "Maximum barrier protection for extended shelf-life and demanding distribution."

                alt2_prop = alt2_pick[0].properties[0] if alt2_pick[0].properties else None
                alt2_summary = {
                    "OTR": f"{alt2_prop.otr_value:.2f} {alt2_prop.otr_unit}" if alt2_prop else "N/A",
                    "WVTR": f"{alt2_prop.wvtr_value:.2f} {alt2_prop.wvtr_unit}" if alt2_prop else "N/A",
                    "Thickness": f"{alt2_prop.thickness_microns:.0f} µm" if alt2_prop else "N/A",
                }
                alternatives.append(
                    MaterialRecommendationItem(
                        material_id=alt2_pick[0].id,
                        material_name=alt2_pick[0].name,
                        material_type=alt2_pick[0].material_type,
                        structure=alt2_pick[0].structure,
                        recommendation_type=alt2_type,
                        cost_level=alt2_pick[0].cost_level,
                        sustainability_score=alt2_pick[1].sustainability_score,
                        scores=alt2_pick[1],
                        highlight=alt2_highlight,
                        explanation=f"Secondary engineered alternative: {alt2_pick[0].structure}.",
                        properties_summary=alt2_summary,
                    )
                )

        # Recommended Packaging Structure Description
        structure_desc = f"{primary_mat.name} ({primary_mat.structure}) — Designed for {food_context.get('commodity_name', 'food')} preservation."

        return primary_item, alternatives, structure_desc


explainability_engine = ExplainabilityEngine()
