"""Candidate Material Filtering Module (Hard Constraint Gatekeeping).

Evaluates candidate materials against non-negotiable food safety, biological anoxia,
sub-zero brittleness, moisture vulnerability, and lipid oxidation gates.
"""

from typing import List, Dict, Any, Tuple
from app.models.packaging_material import PackagingMaterial
from app.schemas.recommendation import DisqualifiedMaterial


class CandidateFilter:
    """Applies deterministic elimination gates to exclude scientifically incompatible materials."""

    @staticmethod
    def filter_candidates(
        materials: List[PackagingMaterial],
        food_context: Dict[str, Any],
    ) -> Tuple[List[PackagingMaterial], List[DisqualifiedMaterial]]:
        """Filter list of materials into qualified candidates and disqualified records with rationale."""
        category = food_context.get("commodity_category", "").lower()
        respiration = food_context.get("respiration_rate", "none").lower()
        oil_fat = food_context.get("oil_fat_level", "none").lower()
        storage_type = food_context.get("storage_type", "ambient").lower()
        storage_temp = food_context.get("storage_temperature", 20.0)
        shelf_life = food_context.get("desired_shelf_life_days", 30)
        moisture = food_context.get("moisture_percent", 10.0)

        qualified: List[PackagingMaterial] = []
        disqualified: List[DisqualifiedMaterial] = []

        for mat in materials:
            # Get primary ASTM property if available
            prop = mat.properties[0] if mat.properties else None
            otr = prop.otr_value if prop else 1000.0
            wvtr = prop.wvtr_value if prop else 10.0

            # Rule 6: Food Safety Compliance Gate (Non-negotiable)
            if not mat.food_grade_compliant:
                disqualified.append(
                    DisqualifiedMaterial(
                        material_id=mat.id,
                        material_name=mat.name,
                        reason="Eliminated: Non-compliant with food-contact regulatory safety standards (FDA 21 CFR / EU 10/2011 / FSSAI).",
                    )
                )
                continue

            # Rule 3 & 4: Fresh Produce Anoxia & Gas Exchange Gate
            is_fresh_produce = category in ("fresh produce", "produce") or respiration in ("moderate", "high", "very_high")
            if is_fresh_produce:
                # Disqualify hermetic zero-gas barriers that don't support microperforation or breathability
                if (otr < 10.0 or "Foil" in mat.name) and not mat.microperforation_supported:
                    disqualified.append(
                        DisqualifiedMaterial(
                            material_id=mat.id,
                            material_name=mat.name,
                            reason="Eliminated: Zero-permeability hermetic barrier induces severe anaerobic respiration in fresh produce, triggering ethanol fermentation, tissue breakdown, and off-odors.",
                        )
                    )
                    continue

            # Rule 5: Sub-Zero Brittleness & Freezer Burn Gate
            is_frozen = storage_type == "frozen" or storage_temp < 0.0
            if is_frozen:
                # PLA biopolymer shatters below 0°C, and Paper/PE lacks puncture & sub-zero flex resistance
                if "PLA" in mat.name or "Paper" in mat.name:
                    disqualified.append(
                        DisqualifiedMaterial(
                            material_id=mat.id,
                            material_name=mat.name,
                            reason="Eliminated: Polymer becomes brittle at sub-zero temperatures (-18°C), resulting in flex-cracking, seal shatter, and severe freezer burn.",
                        )
                    )
                    continue

            # Rule 2: Dry Crisp Food Moisture Sorption Gate
            is_dry_crisp = category in ("dry crisp foods", "dry crisp") or (moisture < 5.0 and "snack" in category)
            if is_dry_crisp and shelf_life > 45:
                # PLA has WVTR 120, LDPE has WVTR 18
                if wvtr > 15.0 or "PLA" in mat.name:
                    disqualified.append(
                        DisqualifiedMaterial(
                            material_id=mat.id,
                            material_name=mat.name,
                            reason=f"Eliminated: High water vapor permeability (WVTR {wvtr:.1f} g/m²·day) allows rapid moisture sorption, causing loss of crispness and sogginess.",
                        )
                    )
                    continue

            # Rule 1: High Lipid Oxidation Gate for Long Shelf Life
            if oil_fat == "high" and shelf_life > 90 and not is_fresh_produce:
                # Plain LDPE, HDPE, or Paper without metallization/barrier allows excessive oxygen
                if otr > 1500.0 and "Foil" not in mat.name and "Met-" not in mat.name and "EVOH" not in mat.name:
                    disqualified.append(
                        DisqualifiedMaterial(
                            material_id=mat.id,
                            material_name=mat.name,
                            reason=f"Eliminated: High oxygen transmission rate (OTR {otr:.0f} cm³/m²·day) allows oxygen permeation that triggers lipid oxidation and rancidity.",
                        )
                    )
                    continue

            # Material passed all hard gates
            qualified.append(mat)

        return qualified, disqualified


candidate_filter = CandidateFilter()
