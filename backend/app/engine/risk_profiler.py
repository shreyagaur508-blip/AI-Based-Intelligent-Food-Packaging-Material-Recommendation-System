"""Food Risk Classification Engine for PackWise AI.

Evaluates intrinsic food attributes and storage conditions to calculate
spoilage pathways, degradation kinetics, and physical vulnerability risks.
"""

from typing import Dict, Any
from app.schemas.recommendation import RiskProfile


class RiskProfiler:
    """Calculates multidimensional food degradation and handling risks."""

    @staticmethod
    def evaluate(food_context: Dict[str, Any]) -> RiskProfile:
        """Evaluate food context and return a structured RiskProfile."""
        category = food_context.get("commodity_category", "").lower()
        moisture = food_context.get("moisture_percent", 10.0)
        oil_fat = food_context.get("oil_fat_level", "none").lower()
        respiration = food_context.get("respiration_rate", "none").lower()
        storage_type = food_context.get("storage_type", "ambient").lower()
        storage_temp = food_context.get("storage_temperature", 20.0)
        transit_days = food_context.get("transportation_duration", 2.0)
        shelf_life = food_context.get("desired_shelf_life_days", 30)

        # 1. Moisture Risk
        if category in ("dry crisp foods", "dry crisp") or (moisture < 5.0 and oil_fat == "high"):
            moisture_risk = "Critical"
        elif moisture < 5.0 or category in ("powders & grains", "powder"):
            moisture_risk = "High"
        elif category in ("fresh produce", "produce") and moisture > 70.0:
            moisture_risk = "High"  # Desiccation / wilting risk
        elif category in ("perishable dairy", "dairy") or moisture > 50.0:
            moisture_risk = "Moderate"
        elif storage_type == "frozen":
            moisture_risk = "Moderate"
        else:
            moisture_risk = "Low"

        # 2. Oxidation Risk
        if oil_fat == "high" and shelf_life > 60:
            oxidation_risk = "Critical"
        elif oil_fat == "high":
            oxidation_risk = "High"
        elif oil_fat == "moderate":
            oxidation_risk = "Moderate"
        else:
            oxidation_risk = "Low"

        # 3. Microbial Spoilage Risk
        if storage_type == "frozen":
            microbial_risk = "Low"
        elif moisture > 50.0 and storage_temp > 8.0:
            microbial_risk = "Critical"
        elif moisture > 50.0 or category in ("perishable dairy", "fresh produce"):
            microbial_risk = "High"
        elif moisture > 15.0 and storage_type == "ambient":
            microbial_risk = "Moderate"
        else:
            microbial_risk = "Low"

        # 4. Respiration Risk
        if respiration == "very_high":
            respiration_risk = "Very High"
        elif respiration == "high":
            respiration_risk = "High"
        elif respiration == "moderate":
            respiration_risk = "Moderate"
        elif respiration == "low":
            respiration_risk = "Low"
        else:
            respiration_risk = "None"

        # 5. Mechanical Damage Risk
        if category in ("dry crisp foods", "fresh produce") or transit_days > 4.0:
            mechanical_risk = "High"
        elif transit_days > 2.0 or category in ("powders & grains", "frozen foods"):
            mechanical_risk = "Moderate"
        else:
            mechanical_risk = "Low"

        # 6. Freezer Burn Risk
        if storage_type == "frozen" or storage_temp < 0.0:
            freezer_burn_risk = "High"
        else:
            freezer_burn_risk = "None"

        # Summary compilation
        summary_points = []
        if moisture_risk in ("High", "Critical"):
            summary_points.append("Moisture sensitivity requiring strict vapor barrier")
        if oxidation_risk in ("High", "Critical"):
            summary_points.append("Lipid oxidation susceptibility requiring low oxygen permeability")
        if respiration_risk in ("Moderate", "High", "Very High"):
            summary_points.append("Active postharvest respiration requiring controlled equilibrium atmosphere")
        if freezer_burn_risk == "High":
            summary_points.append("Sub-zero crystal sublimation risk (freezer burn)")
        if mechanical_risk == "High":
            summary_points.append("Vulnerability to crushing/flex-cracking during distribution")

        risk_summary = "; ".join(summary_points) if summary_points else "Standard ambient shelf-stable profile"

        return RiskProfile(
            moisture_risk=moisture_risk,
            oxidation_risk=oxidation_risk,
            microbial_spoilage_risk=microbial_risk,
            respiration_risk=respiration_risk,
            mechanical_damage_risk=mechanical_risk,
            freezer_burn_risk=freezer_burn_risk,
            risk_summary=risk_summary,
        )


risk_profiler = RiskProfiler()
