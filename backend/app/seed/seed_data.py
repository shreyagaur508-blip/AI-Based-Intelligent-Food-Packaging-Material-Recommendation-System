"""Database seeder populating initial food commodities, packaging materials, ASTM properties, and rules.

Note: All property and barrier metrics are reference / demo values provided for scientific decision-support
and engineering prototyping. Commercial packaging design requires empirical test verification.
"""

from sqlalchemy.orm import Session
from sqlalchemy import select
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.commodity import Commodity
from app.models.packaging_material import PackagingMaterial
from app.models.material_property import MaterialProperty
from app.models.recommendation_rule import RecommendationRule

DEMO_DISCLAIMER_NOTE = "[Reference standard test values for academic and decision support prototyping. Not certified for commercial production without empirical lab testing.]"

COMMODITIES_DATA = [
    {
        "name": "Banana",
        "category": "Fresh Produce",
        "default_moisture_percent": 74.0,
        "oil_fat_level": "none",
        "default_ph": 5.0,
        "respiration_class": "high",
        "base_shelf_life_days": 14,
        "recommended_storage_type": "ambient",
        "minimum_storage_temperature": 12.0,
        "maximum_storage_temperature": 15.0,
        "notes": "Climacteric fruit with high ethylene sensitivity. Susceptible to chilling injury below 12°C and anaerobic fermentation if packaged in hermetic non-breathable films.",
    },
    {
        "name": "Tomato",
        "category": "Fresh Produce",
        "default_moisture_percent": 94.0,
        "oil_fat_level": "none",
        "default_ph": 4.3,
        "respiration_class": "moderate",
        "base_shelf_life_days": 18,
        "recommended_storage_type": "ambient",
        "minimum_storage_temperature": 10.0,
        "maximum_storage_temperature": 15.0,
        "notes": "Chill-sensitive produce requiring breathable packaging or EMAP to prevent moisture condensation and mold development.",
    },
    {
        "name": "Mango",
        "category": "Fresh Produce",
        "default_moisture_percent": 83.0,
        "oil_fat_level": "none",
        "default_ph": 4.5,
        "respiration_class": "moderate",
        "base_shelf_life_days": 15,
        "recommended_storage_type": "ambient",
        "minimum_storage_temperature": 12.0,
        "maximum_storage_temperature": 14.0,
        "notes": "Tropical climacteric fruit subject to chilling injury at temperatures below 10°C; requires moderate gas permeability.",
    },
    {
        "name": "Leafy Vegetables (Spinach)",
        "category": "Fresh Produce",
        "default_moisture_percent": 92.0,
        "oil_fat_level": "none",
        "default_ph": 6.0,
        "respiration_class": "very_high",
        "base_shelf_life_days": 10,
        "recommended_storage_type": "chilled",
        "minimum_storage_temperature": 1.0,
        "maximum_storage_temperature": 4.0,
        "notes": "Very high respiration and transpiration rates. Requires high relative humidity and anti-fog micro-perforated film to prevent wilting and yellowing.",
    },
    {
        "name": "Potato Chips",
        "category": "Dry Crisp Foods",
        "default_moisture_percent": 1.8,
        "oil_fat_level": "high",
        "default_ph": 6.0,
        "respiration_class": "none",
        "base_shelf_life_days": 180,
        "recommended_storage_type": "ambient",
        "minimum_storage_temperature": 15.0,
        "maximum_storage_temperature": 25.0,
        "notes": "Highly prone to moisture uptake (loss of crispness at water activity > 0.4) and lipid oxidation rancidity. Requires nitrogen flushing and high moisture/light barrier.",
    },
    {
        "name": "Biscuits",
        "category": "Dry Crisp Foods",
        "default_moisture_percent": 3.0,
        "oil_fat_level": "moderate",
        "default_ph": 6.5,
        "respiration_class": "none",
        "base_shelf_life_days": 210,
        "recommended_storage_type": "ambient",
        "minimum_storage_temperature": 15.0,
        "maximum_storage_temperature": 25.0,
        "notes": "Baked dry snack sensitive to humidity pickup leading to sogginess and secondary fat oxidation.",
    },
    {
        "name": "Roasted Nuts",
        "category": "High-Fat Snacks",
        "default_moisture_percent": 3.5,
        "oil_fat_level": "high",
        "default_ph": 6.2,
        "respiration_class": "none",
        "base_shelf_life_days": 240,
        "recommended_storage_type": "ambient",
        "minimum_storage_temperature": 15.0,
        "maximum_storage_temperature": 22.0,
        "notes": "Contains high concentration of unsaturated fatty acids vulnerable to oxidative rancidity and off-flavor synthesis; requires high OTR barrier and light exclusion.",
    },
    {
        "name": "Milk Powder (Full Cream)",
        "category": "Powders & Grains",
        "default_moisture_percent": 3.0,
        "oil_fat_level": "high",
        "default_ph": 6.6,
        "respiration_class": "none",
        "base_shelf_life_days": 365,
        "recommended_storage_type": "ambient",
        "minimum_storage_temperature": 15.0,
        "maximum_storage_temperature": 22.0,
        "notes": "Hygroscopic powder vulnerable to caking, Maillard non-enzymatic browning, and lipid oxidation. Requires ultra-high barrier hermetic packaging.",
    },
    {
        "name": "Rice",
        "category": "Powders & Grains",
        "default_moisture_percent": 13.0,
        "oil_fat_level": "low",
        "default_ph": 6.5,
        "respiration_class": "none",
        "base_shelf_life_days": 365,
        "recommended_storage_type": "ambient",
        "minimum_storage_temperature": 15.0,
        "maximum_storage_temperature": 25.0,
        "notes": "Stable low-moisture cereal grain requiring mechanical containment, puncture resistance, and protection from insect infestation and dampness.",
    },
    {
        "name": "Wheat Flour",
        "category": "Powders & Grains",
        "default_moisture_percent": 13.5,
        "oil_fat_level": "low",
        "default_ph": 6.2,
        "respiration_class": "none",
        "base_shelf_life_days": 270,
        "recommended_storage_type": "ambient",
        "minimum_storage_temperature": 15.0,
        "maximum_storage_temperature": 25.0,
        "notes": "Hygroscopic milled powder prone to agglomeration, moisture absorption, and mold growth if storage relative humidity exceeds safe limits.",
    },
    {
        "name": "Paneer (Fresh Cottage Cheese)",
        "category": "Perishable Dairy",
        "default_moisture_percent": 55.0,
        "oil_fat_level": "high",
        "default_ph": 5.6,
        "respiration_class": "none",
        "base_shelf_life_days": 21,
        "recommended_storage_type": "chilled",
        "minimum_storage_temperature": 1.0,
        "maximum_storage_temperature": 4.0,
        "notes": "High moisture perishable dairy product prone to spoilage microorganisms and syneresis. Requires vacuum or MAP barrier packaging and strict cold chain maintenance.",
    },
    {
        "name": "Frozen Peas (IQF)",
        "category": "Frozen Foods",
        "default_moisture_percent": 78.0,
        "oil_fat_level": "none",
        "default_ph": 6.5,
        "respiration_class": "none",
        "base_shelf_life_days": 365,
        "recommended_storage_type": "frozen",
        "minimum_storage_temperature": -25.0,
        "maximum_storage_temperature": -18.0,
        "notes": "Individually quick frozen vegetables susceptible to surface dehydration (freezer burn) and moisture sublimation; requires cold flex-crack resistance and low WVTR.",
    },
]

MATERIALS_DATA = [
    {
        "material": {
            "name": "LDPE (Low-Density Polyethylene)",
            "material_type": "Polyolefin",
            "structure": "Monolayer Extruded Film",
            "food_grade_compliant": True,
            "recyclability_level": "High (RIC 4)",
            "biodegradability_level": "Non-biodegradable",
            "cost_level": "Budget",
            "sealability_score": 9.0,
            "mechanical_strength_score": 6.5,
            "puncture_resistance_score": 6.0,
            "transparency": "Translucent / Clear",
            "printability": "Moderate (Corona treatment required)",
            "map_compatible": True,
            "microperforation_supported": True,
            "description": "Flexible thermoplastic film widely used for produce bags, frozen food packaging, and heat-seal inner sealant webs.",
        },
        "property": {
            "test_temperature_celsius": 23.0,
            "relative_humidity_percent": 0.0,
            "otr_value": 4500.0,
            "otr_unit": "cm3/(m2.24h.atm)",
            "wvtr_value": 18.0,
            "wvtr_unit": "g/(m2.24h)",
            "thickness_microns": 30.0,
            "co2_transmission_rate": 18000.0,
            "tensile_strength": 25.0,
            "seal_temperature_min": 105.0,
            "seal_temperature_max": 140.0,
            "test_condition_notes": f"ASTM D3985 OTR (23°C, 0% RH); ASTM F1249 WVTR (38°C, 90% RH). {DEMO_DISCLAIMER_NOTE}",
        },
    },
    {
        "material": {
            "name": "HDPE (High-Density Polyethylene)",
            "material_type": "Polyolefin",
            "structure": "Monolayer / Co-extruded Film",
            "food_grade_compliant": True,
            "recyclability_level": "High (RIC 2)",
            "biodegradability_level": "Non-biodegradable",
            "cost_level": "Budget",
            "sealability_score": 7.5,
            "mechanical_strength_score": 8.0,
            "puncture_resistance_score": 7.0,
            "transparency": "Translucent / Semi-opaque",
            "printability": "Moderate",
            "map_compatible": True,
            "microperforation_supported": False,
            "description": "Rigid polyolefin with superior moisture barrier and high tensile modulus, suitable for cereal liners and dry grain sacks.",
        },
        "property": {
            "test_temperature_celsius": 23.0,
            "relative_humidity_percent": 0.0,
            "otr_value": 2000.0,
            "otr_unit": "cm3/(m2.24h.atm)",
            "wvtr_value": 6.5,
            "wvtr_unit": "g/(m2.24h)",
            "thickness_microns": 25.0,
            "co2_transmission_rate": 8000.0,
            "tensile_strength": 38.0,
            "seal_temperature_min": 125.0,
            "seal_temperature_max": 155.0,
            "test_condition_notes": f"ASTM D3985 OTR; ASTM F1249 WVTR. {DEMO_DISCLAIMER_NOTE}",
        },
    },
    {
        "material": {
            "name": "PP (Polypropylene)",
            "material_type": "Polyolefin",
            "structure": "Cast / Extruded Film",
            "food_grade_compliant": True,
            "recyclability_level": "High (RIC 5)",
            "biodegradability_level": "Non-biodegradable",
            "cost_level": "Budget",
            "sealability_score": 8.0,
            "mechanical_strength_score": 7.5,
            "puncture_resistance_score": 6.5,
            "transparency": "High Transparency",
            "printability": "Good",
            "map_compatible": True,
            "microperforation_supported": True,
            "description": "Thermally resistant polymer film capable of hot-fill and microwave reheating; excellent clarity for bakery goods.",
        },
        "property": {
            "test_temperature_celsius": 23.0,
            "relative_humidity_percent": 0.0,
            "otr_value": 1800.0,
            "otr_unit": "cm3/(m2.24h.atm)",
            "wvtr_value": 5.0,
            "wvtr_unit": "g/(m2.24h)",
            "thickness_microns": 30.0,
            "co2_transmission_rate": 7200.0,
            "tensile_strength": 35.0,
            "seal_temperature_min": 130.0,
            "seal_temperature_max": 165.0,
            "test_condition_notes": f"ASTM D3985 OTR; ASTM F1249 WVTR. {DEMO_DISCLAIMER_NOTE}",
        },
    },
    {
        "material": {
            "name": "PET (Polyethylene Terephthalate)",
            "material_type": "Polyester",
            "structure": "Biaxially Oriented Monolayer Film",
            "food_grade_compliant": True,
            "recyclability_level": "Very High (RIC 1)",
            "biodegradability_level": "Non-biodegradable",
            "cost_level": "Moderate",
            "sealability_score": 6.0,
            "mechanical_strength_score": 9.0,
            "puncture_resistance_score": 8.0,
            "transparency": "Crystal Clear",
            "printability": "Excellent",
            "map_compatible": True,
            "microperforation_supported": False,
            "description": "High mechanical strength and optical clarity polyester; standard for thermoformed trays and outer printable web in laminates.",
        },
        "property": {
            "test_temperature_celsius": 23.0,
            "relative_humidity_percent": 0.0,
            "otr_value": 75.0,
            "otr_unit": "cm3/(m2.24h.atm)",
            "wvtr_value": 20.0,
            "wvtr_unit": "g/(m2.24h)",
            "thickness_microns": 12.0,
            "co2_transmission_rate": 300.0,
            "tensile_strength": 190.0,
            "seal_temperature_min": 140.0,
            "seal_temperature_max": 180.0,
            "test_condition_notes": f"ASTM D3985 OTR; ASTM F1249 WVTR. {DEMO_DISCLAIMER_NOTE}",
        },
    },
    {
        "material": {
            "name": "BOPP (Biaxially Oriented Polypropylene)",
            "material_type": "Polyolefin",
            "structure": "Biaxially Oriented Monolayer Film",
            "food_grade_compliant": True,
            "recyclability_level": "High (RIC 5)",
            "biodegradability_level": "Non-biodegradable",
            "cost_level": "Budget",
            "sealability_score": 7.5,
            "mechanical_strength_score": 8.5,
            "puncture_resistance_score": 7.0,
            "transparency": "High Gloss Clear",
            "printability": "Excellent",
            "map_compatible": True,
            "microperforation_supported": True,
            "description": "Oriented film with high stiffness, gloss, and water vapor barrier, ideal for biscuits, confectionery, and snack overwraps.",
        },
        "property": {
            "test_temperature_celsius": 23.0,
            "relative_humidity_percent": 0.0,
            "otr_value": 1600.0,
            "otr_unit": "cm3/(m2.24h.atm)",
            "wvtr_value": 4.5,
            "wvtr_unit": "g/(m2.24h)",
            "thickness_microns": 20.0,
            "co2_transmission_rate": 6400.0,
            "tensile_strength": 160.0,
            "seal_temperature_min": 110.0,
            "seal_temperature_max": 140.0,
            "test_condition_notes": f"ASTM D3985 OTR; ASTM F1249 WVTR. {DEMO_DISCLAIMER_NOTE}",
        },
    },
    {
        "material": {
            "name": "Met-PET (Metallized PET)",
            "material_type": "Barrier Film",
            "structure": "Vacuum Metallized PET Film",
            "food_grade_compliant": True,
            "recyclability_level": "Low / Mixed",
            "biodegradability_level": "Non-biodegradable",
            "cost_level": "Moderate",
            "sealability_score": 7.0,
            "mechanical_strength_score": 8.5,
            "puncture_resistance_score": 7.5,
            "transparency": "Reflective / Opaque (Light Barrier)",
            "printability": "Good",
            "map_compatible": True,
            "microperforation_supported": False,
            "description": "Aluminium-vapor-deposited PET film offering high barrier against oxygen, moisture, and UV light degradation for potato chips and roasted snacks.",
        },
        "property": {
            "test_temperature_celsius": 23.0,
            "relative_humidity_percent": 0.0,
            "otr_value": 1.2,
            "otr_unit": "cm3/(m2.24h.atm)",
            "wvtr_value": 1.0,
            "wvtr_unit": "g/(m2.24h)",
            "thickness_microns": 12.0,
            "co2_transmission_rate": 5.0,
            "tensile_strength": 180.0,
            "seal_temperature_min": 130.0,
            "seal_temperature_max": 170.0,
            "test_condition_notes": f"ASTM D3985 OTR; ASTM F1249 WVTR. {DEMO_DISCLAIMER_NOTE}",
        },
    },
    {
        "material": {
            "name": "Alu Foil Laminate (PET/Alu/PE)",
            "material_type": "Multilayer Foil Laminate",
            "structure": "Tri-laminate (PET 12µm / Al 7µm / PE 50µm)",
            "food_grade_compliant": True,
            "recyclability_level": "Low (Non-recyclable multi-material)",
            "biodegradability_level": "Non-biodegradable",
            "cost_level": "Premium",
            "sealability_score": 9.0,
            "mechanical_strength_score": 9.0,
            "puncture_resistance_score": 8.5,
            "transparency": "Fully Opaque (100% Light Barrier)",
            "printability": "Excellent",
            "map_compatible": True,
            "microperforation_supported": False,
            "description": "Absolute gas, vapor, and light barrier structure engineered for long shelf-life dairy powders, retort pouches, and military rations.",
        },
        "property": {
            "test_temperature_celsius": 23.0,
            "relative_humidity_percent": 0.0,
            "otr_value": 0.05,
            "otr_unit": "cm3/(m2.24h.atm)",
            "wvtr_value": 0.05,
            "wvtr_unit": "g/(m2.24h)",
            "thickness_microns": 70.0,
            "co2_transmission_rate": 0.1,
            "tensile_strength": 60.0,
            "seal_temperature_min": 135.0,
            "seal_temperature_max": 180.0,
            "test_condition_notes": f"ASTM D3985 OTR; ASTM F1249 WVTR. Absolute hermetic barrier. {DEMO_DISCLAIMER_NOTE}",
        },
    },
    {
        "material": {
            "name": "Paper/PE (Kraft Paper Poly-coated)",
            "material_type": "Paper Composite",
            "structure": "Bleached Kraft Paper / Extrusion Polyethylene",
            "food_grade_compliant": True,
            "recyclability_level": "Moderate (Repulpable in specialized mills)",
            "biodegradability_level": "Partially Biodegradable",
            "cost_level": "Budget",
            "sealability_score": 7.0,
            "mechanical_strength_score": 7.0,
            "puncture_resistance_score": 5.5,
            "transparency": "Opaque Natural Kraft",
            "printability": "Excellent",
            "map_compatible": False,
            "microperforation_supported": True,
            "description": "Renewable fiber-based flexible substrate with polyolefin sealant layer for dry bakery, flour, and grain applications.",
        },
        "property": {
            "test_temperature_celsius": 23.0,
            "relative_humidity_percent": 0.0,
            "otr_value": 800.0,
            "otr_unit": "cm3/(m2.24h.atm)",
            "wvtr_value": 15.0,
            "wvtr_unit": "g/(m2.24h)",
            "thickness_microns": 60.0,
            "co2_transmission_rate": 3200.0,
            "tensile_strength": 45.0,
            "seal_temperature_min": 110.0,
            "seal_temperature_max": 145.0,
            "test_condition_notes": f"ASTM D3985 OTR; ASTM F1249 WVTR. {DEMO_DISCLAIMER_NOTE}",
        },
    },
    {
        "material": {
            "name": "PLA (Polylactic Acid Bio-film)",
            "material_type": "Biopolymer",
            "structure": "Corn-starch Derived Bio-based Monolayer Film",
            "food_grade_compliant": True,
            "recyclability_level": "Industrially Compostable (EN 13432)",
            "biodegradability_level": "Compostable (Bio-degradable under industrial composting)",
            "cost_level": "Moderate",
            "sealability_score": 6.5,
            "mechanical_strength_score": 7.0,
            "puncture_resistance_score": 5.5,
            "transparency": "Clear / Glossy",
            "printability": "Good",
            "map_compatible": True,
            "microperforation_supported": True,
            "description": "Bio-based compostable film with natural high moisture permeability, suitable for short shelf-life fresh produce and organic goods.",
        },
        "property": {
            "test_temperature_celsius": 23.0,
            "relative_humidity_percent": 0.0,
            "otr_value": 750.0,
            "otr_unit": "cm3/(m2.24h.atm)",
            "wvtr_value": 120.0,
            "wvtr_unit": "g/(m2.24h)",
            "thickness_microns": 25.0,
            "co2_transmission_rate": 3000.0,
            "tensile_strength": 55.0,
            "seal_temperature_min": 80.0,
            "seal_temperature_max": 110.0,
            "test_condition_notes": f"ASTM D3985 OTR; ASTM F1249 WVTR. {DEMO_DISCLAIMER_NOTE}",
        },
    },
    {
        "material": {
            "name": "Micro-perforated Film (Perforated LDPE/BOPP)",
            "material_type": "Engineered Breathable Film",
            "structure": "Laser / Mechanical Micro-vented Film",
            "food_grade_compliant": True,
            "recyclability_level": "High (RIC 4 / RIC 5 mono-material)",
            "biodegradability_level": "Non-biodegradable",
            "cost_level": "Moderate",
            "sealability_score": 8.5,
            "mechanical_strength_score": 7.0,
            "puncture_resistance_score": 6.5,
            "transparency": "Clear",
            "printability": "Good",
            "map_compatible": True,
            "microperforation_supported": True,
            "description": "Equilibrium Modified Atmosphere Packaging (EMAP) film with calibrated micro-holes to match produce respiration and avoid anoxia.",
        },
        "property": {
            "test_temperature_celsius": 23.0,
            "relative_humidity_percent": 0.0,
            "otr_value": 3500.0,
            "otr_unit": "cm3/(m2.24h.atm)",
            "wvtr_value": 22.0,
            "wvtr_unit": "g/(m2.24h)",
            "thickness_microns": 30.0,
            "co2_transmission_rate": 14000.0,
            "tensile_strength": 24.0,
            "seal_temperature_min": 105.0,
            "seal_temperature_max": 135.0,
            "test_condition_notes": f"Targeted laser micro-vented transmission profile. {DEMO_DISCLAIMER_NOTE}",
        },
    },
    {
        "material": {
            "name": "PET/EVOH/PE recyclable (High-Barrier Recyclable Co-ex)",
            "material_type": "Recyclable Barrier Laminate",
            "structure": "High-Barrier Co-extrusion with Compatibilized EVOH Layer (<5%)",
            "food_grade_compliant": True,
            "recyclability_level": "High (RecyClass Certified Stream)",
            "biodegradability_level": "Non-biodegradable",
            "cost_level": "Premium",
            "sealability_score": 8.5,
            "mechanical_strength_score": 8.5,
            "puncture_resistance_score": 8.0,
            "transparency": "High Transparency",
            "printability": "Excellent",
            "map_compatible": True,
            "microperforation_supported": False,
            "description": "Next-generation circular economy high-barrier structure providing EVOH gas barrier while remaining compatible with polyolefin recycling streams.",
        },
        "property": {
            "test_temperature_celsius": 23.0,
            "relative_humidity_percent": 0.0,
            "otr_value": 2.0,
            "otr_unit": "cm3/(m2.24h.atm)",
            "wvtr_value": 2.5,
            "wvtr_unit": "g/(m2.24h)",
            "thickness_microns": 65.0,
            "co2_transmission_rate": 8.0,
            "tensile_strength": 70.0,
            "seal_temperature_min": 120.0,
            "seal_temperature_max": 160.0,
            "test_condition_notes": f"ASTM D3985 OTR (23°C, 0% RH); ASTM F1249 WVTR (38°C, 90% RH). {DEMO_DISCLAIMER_NOTE}",
        },
    },
]

RULES_DATA = [
    {
        "rule_code": "FOOD_SAFETY_GATE",
        "name": "Food Contact Compliance Gate",
        "category": "Safety Gate",
        "condition_description": "Material must possess verified food contact compliance (food_grade_compliant == True).",
        "action_type": "DISQUALIFY",
        "priority": 100,
        "is_active": True,
        "explanation_template": "Eliminated: Material is non-compliant with food-grade regulatory safety standards (FDA 21 CFR / EU 10/2011).",
    },
    {
        "rule_code": "FRESH_PRODUCE_ANOXIA_GATE",
        "name": "Produce Anoxia & Fermentation Gate",
        "category": "Anoxia Prevention",
        "condition_description": "Fresh produce with high/moderate respiration packaged in zero-permeability barrier without micro-perforations.",
        "action_type": "DISQUALIFY",
        "priority": 90,
        "is_active": True,
        "explanation_template": "Eliminated: Hermetic zero-gas permeability induces severe anaerobic respiration in fresh produce, triggering ethanol fermentation, tissue breakdown, and spoilage.",
    },
    {
        "rule_code": "SUB_ZERO_BRITTLENESS_GATE",
        "name": "Sub-Zero Crack & Flex Resistance Gate",
        "category": "Low Temp Gate",
        "condition_description": "Frozen food storage (T < 0°C) with materials susceptible to cold flex-cracking and brittle impact failure.",
        "action_type": "DISQUALIFY",
        "priority": 85,
        "is_active": True,
        "explanation_template": "Eliminated: Material polymer matrix becomes brittle at sub-zero temperatures, risking seal rupture and flex-cracking during cold-chain transport.",
    },
    {
        "rule_code": "MOISTURE_CRISP_GATE",
        "name": "Dry Food Moisture Sorption Gate",
        "category": "Moisture Gate",
        "condition_description": "Dry crisp products (moisture < 5%) require WVTR <= 2.0 g/(m2.day) to preserve texture.",
        "action_type": "DISQUALIFY",
        "priority": 80,
        "is_active": True,
        "explanation_template": "Eliminated: High water vapor permeability (WVTR > 2.0) allows rapid ambient moisture ingress, causing irreversible loss of crispness and texture sogginess.",
    },
    {
        "rule_code": "LIPID_OXIDATION_GATE",
        "name": "High-Fat Oxidation Protection Rule",
        "category": "Oxidation Gate",
        "condition_description": "High-fat foods (oil_fat_level == 'high') require strict oxygen barrier (OTR <= 5.0).",
        "action_type": "PENALIZE",
        "priority": 70,
        "is_active": True,
        "explanation_template": "Penalized: Insufficient oxygen barrier accelerates free radical lipid oxidation and rancidity in high-fat snack foods.",
    },
    {
        "rule_code": "LIGHT_SENSITIVITY_RULE",
        "name": "Photodegradation & UV Protection Rule",
        "category": "Light Barrier Gate",
        "condition_description": "Photo-sensitive foods (milk powder, roasted nuts) require opaque or metallized barriers.",
        "action_type": "REQUIRE_FEATURE",
        "priority": 60,
        "is_active": True,
        "explanation_template": "Enhanced light barrier required to prevent riboflavin degradation, photo-oxidation, and off-flavor generation.",
    },
]


def seed_commodities(db: Session) -> int:
    """Seed the 12 food commodities."""
    seeded_count = 0
    for item in COMMODITIES_DATA:
        existing = db.scalar(select(Commodity).where(Commodity.name == item["name"]))
        if not existing:
            commodity = Commodity(**item)
            db.add(commodity)
            seeded_count += 1
    db.commit()
    return seeded_count


def seed_materials(db: Session) -> int:
    """Seed the 11 packaging materials and ASTM properties."""
    seeded_count = 0
    for entry in MATERIALS_DATA:
        mat_data = entry["material"]
        prop_data = entry["property"]

        existing = db.scalar(select(PackagingMaterial).where(PackagingMaterial.name == mat_data["name"]))
        if not existing:
            material = PackagingMaterial(**mat_data)
            db.add(material)
            db.flush()

            # Add associated ASTM property
            prop = MaterialProperty(material_id=material.id, **prop_data)
            db.add(prop)
            seeded_count += 1
    db.commit()
    return seeded_count


def seed_rules(db: Session) -> int:
    """Seed default recommendation gatekeeping rules."""
    seeded_count = 0
    for item in RULES_DATA:
        existing = db.scalar(select(RecommendationRule).where(RecommendationRule.rule_code == item["rule_code"]))
        if not existing:
            rule = RecommendationRule(**item)
            db.add(rule)
            seeded_count += 1
    db.commit()
    return seeded_count


def seed_database(db: Session = None) -> dict:
    """Run complete database seeding."""
    close_session = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_session = True

    try:
        commodities_count = seed_commodities(db)
        materials_count = seed_materials(db)
        rules_count = seed_rules(db)

        return {
            "commodities_seeded": commodities_count,
            "materials_seeded": materials_count,
            "rules_seeded": rules_count,
            "status": "success",
        }
    finally:
        if close_session:
            db.close()


if __name__ == "__main__":
    print("[INFO] Initializing PackWise AI Database & Seeding Data...")
    result = seed_database()
    print(f"[SUCCESS] Seeding Complete! Details: {result}")
