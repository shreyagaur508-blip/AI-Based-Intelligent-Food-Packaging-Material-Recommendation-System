"""Packaging Requirement Derivation Module.

Translates commodity physiological metrics and risk profiles into explicit
ASTM barrier specifications, thickness ranges, seal parameters, and MAP instructions.
"""

from typing import Dict, Any
from app.schemas.recommendation import RiskProfile, ThicknessRange


class RequirementFormulator:
    """Formulates technical packaging requirements based on risk profile and food parameters."""

    @staticmethod
    def derive(food_context: Dict[str, Any], risk_profile: RiskProfile) -> Dict[str, Any]:
        """Derive explicit technical specifications and packaging characteristics."""
        category = food_context.get("commodity_category", "").lower()
        respiration = food_context.get("respiration_rate", "none").lower()
        oil_fat = food_context.get("oil_fat_level", "none").lower()
        storage_type = food_context.get("storage_type", "ambient").lower()
        shelf_life = food_context.get("desired_shelf_life_days", 30)
        transit_days = food_context.get("transportation_duration", 2.0)
        storage_temp = food_context.get("storage_temperature", 20.0)
        moisture = food_context.get("moisture_percent", 10.0)

        # 1. OTR Requirement Category
        if respiration in ("moderate", "high", "very_high") or category in ("fresh produce", "produce"):
            otr_category = "controlled"
        elif oil_fat == "high" or shelf_life > 120 or risk_profile.oxidation_risk in ("High", "Critical"):
            otr_category = "low"
        elif oil_fat == "moderate" or shelf_life > 60:
            otr_category = "medium"
        else:
            otr_category = "high"

        # 2. WVTR Requirement Category
        if risk_profile.moisture_risk in ("High", "Critical") or storage_type == "frozen" or moisture < 5.0:
            wvtr_category = "low"
        elif moisture < 15.0 or category in ("powders & grains", "perishable dairy"):
            wvtr_category = "medium"
        else:
            wvtr_category = "high"

        # 3. Suggested Thickness Range
        if storage_type == "frozen":
            thickness = ThicknessRange(min_microns=50.0, max_microns=85.0, recommended_microns=65.0)
        elif category in ("powders & grains", "high-fat snacks") and shelf_life > 180:
            thickness = ThicknessRange(min_microns=45.0, max_microns=75.0, recommended_microns=60.0)
        elif category in ("dry crisp foods",):
            thickness = ThicknessRange(min_microns=25.0, max_microns=45.0, recommended_microns=32.0)
        elif category in ("fresh produce", "produce"):
            thickness = ThicknessRange(min_microns=25.0, max_microns=40.0, recommended_microns=30.0)
        else:
            thickness = ThicknessRange(min_microns=30.0, max_microns=55.0, recommended_microns=40.0)

        # 4. Sealability Requirement
        if storage_type == "frozen" or shelf_life > 120 or oil_fat == "high":
            sealability_req = "Hermetic High-Integrity Fusion Seal (Zero Micro-channel Leakage)"
        elif storage_type == "chilled" or category in ("perishable dairy",):
            sealability_req = "Hermetic Vacuum / Gas-tight Peelable or Fusion Seal"
        elif category in ("fresh produce", "produce"):
            sealability_req = "Standard Heat Seal or Vented Clamshell Closure"
        else:
            sealability_req = "Standard Heat Seal with Wide Operating Temperature Range"

        # 5. Mechanical Strength Requirement
        if storage_type == "frozen":
            mech_req = "Sub-Zero Crack-Resistant & High Puncture Strength (Dart Impact >= 350g)"
        elif transit_days > 3.0 or category in ("dry crisp foods", "powders & grains"):
            mech_req = "High Tensile Modulus & Flex-Crack Resistance to Prevent Pinholing"
        else:
            mech_req = "Moderate Tensile Strength & Abrasion Resistance"

        # 6. MAP Suitability & Breathability
        if category in ("fresh produce", "produce") or respiration in ("moderate", "high", "very_high"):
            map_advice = "Equilibrium Modified Atmosphere Packaging (EMAP: 3-5% O2, 5-8% CO2, Balance N2) to suppress respiration without triggering anoxia."
            breathable_rec = "Recommended: Calibrated laser micro-perforated film or breathable biopolymer to match commodity respiration rate and prevent anaerobic fermentation."
        elif oil_fat == "high" or category in ("dry crisp foods", "high-fat snacks"):
            map_advice = "Recommended: 100% High-Purity Nitrogen (N2) Gas Flushing (Residual O2 < 1.0%) to prevent oxidative rancidity and provide pillow cushioning."
            breathable_rec = "Not recommended: Hermetic solid barrier required to maintain inert gas flush and exclude ambient oxygen."
        elif category in ("perishable dairy",):
            map_advice = "Recommended: Gas flush with 20-30% CO2 / 70-80% N2 to inhibit psychrotrophic bacterial growth and mold spoilage."
            breathable_rec = "Not recommended: High-barrier hermetic film required."
        else:
            map_advice = "Optional / Standard Ambient Packaging with dry air headspace."
            breathable_rec = "Not recommended: Solid moisture-barrier film required."

        # 7. Storage Recommendation
        if storage_type == "frozen":
            storage_rec = f"Maintain continuous deep-freeze chain at {storage_temp:.1f}°C (<= -18°C) with RH ~95% to prevent ice crystal recrystallization."
        elif storage_type == "chilled":
            storage_rec = f"Maintain uninterrupted refrigeration at {storage_temp:.1f}°C (1°C to 4°C) with high relative humidity to minimize biological decay."
        elif category in ("fresh produce", "produce") and storage_temp > 10.0:
            storage_rec = f"Store in well-ventilated cool ambient conditions at {storage_temp:.1f}°C to prevent chilling injury (maintain above critical chilling threshold)."
        else:
            storage_rec = f"Store in cool, dry ambient warehouse conditions at {storage_temp:.1f}°C and relative humidity <= 60% away from direct UV/sunlight."

        # 8. Cost Class & Structure Formulation
        if shelf_life > 200 or storage_type == "frozen" or oil_fat == "high" and shelf_life > 120:
            cost_class = "Moderate to Premium"
        else:
            cost_class = "Budget to Moderate"

        return {
            "otr_requirement_category": otr_category,
            "wvtr_requirement_category": wvtr_category,
            "suggested_thickness_range_microns": thickness,
            "sealability_requirement": sealability_req,
            "mechanical_strength_requirement": mech_req,
            "map_suitability": map_advice,
            "breathable_or_microperforated_recommendation": breathable_rec,
            "storage_recommendation": storage_rec,
            "cost_class": cost_class,
        }


requirement_formulator = RequirementFormulator()
