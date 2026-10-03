"""Automated test suite for explainable packaging recommendation engine (Phase 3)."""

import pytest


def test_potato_chips_recommendation(client):
    """Test recommendation for Potato Chips (High-fat, ambient, dry crisp snack with long shelf life)."""
    payload = {
        "commodity_name": "Potato Chips",
        "commodity_category": "Dry Crisp Foods",
        "moisture_percent": 1.8,
        "oil_fat_level": "high",
        "ph": 6.0,
        "respiration_rate": "very_low",
        "desired_shelf_life_days": 180,
        "storage_type": "ambient",
        "storage_temperature": 22.0,
        "relative_humidity": 50.0,
        "sustainability_preference": "medium",
        "packaging_format_preference": "pouch",
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # 1. At least one recommendation is returned
    assert "primary_recommendation" in data
    primary = data["primary_recommendation"]
    assert primary["material_id"] > 0
    assert primary["name"]
    assert primary["structure"]
    assert len(primary["reasons"]) >= 3
    assert 0 <= primary["sustainability_score"] <= 100
    assert primary["cost_class"] in ("low", "medium", "high")
    assert len(data["alternative_recommendations"]) >= 1

    # 2. Risk profile classification (low/medium/high)
    assert data["risk_profile"]["moisture_risk"] == "high"
    assert data["risk_profile"]["oxidation_risk"] == "high"
    assert data["risk_profile"]["freezer_burn_risk"] == "low"

    # 3. Strong oxygen and moisture barrier requirements
    assert data["requirements"]["required_otr_category"] in ("very_low", "low")
    assert data["requirements"]["required_wvtr_category"] in ("very_low", "low")
    assert data["requirements"]["map_suitable"] is True
    assert data["requirements"]["breathable_film_needed"] is False

    # 4. Reasons verify oxygen / moisture barrier advice
    all_reasons = " ".join(primary["reasons"]).lower()
    assert "barrier" in all_reasons or "oxygen" in all_reasons or "moisture" in all_reasons or "oxidation" in all_reasons

    # 5. Disclaimer text present
    assert "preliminary packaging decision support" in data["disclaimer"]


def test_tomato_recommendation(client):
    """Test recommendation for Fresh Tomatoes (Fresh produce, respiring)."""
    payload = {
        "commodity_name": "Tomato",
        "commodity_category": "Fresh Produce",
        "moisture_percent": 94.0,
        "oil_fat_level": "low",
        "ph": 4.3,
        "respiration_rate": "medium",
        "desired_shelf_life_days": 18,
        "storage_type": "ambient",
        "storage_temperature": 12.0,
        "relative_humidity": 90.0,
        "sustainability_preference": "high",
        "packaging_format_preference": "pouch",
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # 1. At least one recommendation is returned
    assert "primary_recommendation" in data
    primary = data["primary_recommendation"]
    assert primary["name"]

    # 2. Respiration risk classification
    assert data["risk_profile"]["respiration_risk"] == "high"
    assert data["risk_profile"]["moisture_risk"] == "high"

    # 3. Respiration-aware advice (breathable / MAP guidance)
    assert data["requirements"]["required_otr_category"] == "controlled"
    assert data["requirements"]["breathable_film_needed"] is True
    assert data["requirements"]["map_suitable"] is True

    # 4. Explanatory reasons highlight respiration harmony
    all_reasons = " ".join(primary["reasons"]).lower()
    assert "respiration" in all_reasons or "permeability" in all_reasons or "breathable" in all_reasons or "gas" in all_reasons

    # 5. Zero-permeability non-perforated hermetic foils are not recommended
    assert "Alu Foil" not in primary["name"]


def test_banana_recommendation(client):
    """Test recommendation for Banana (Fresh produce, respiring)."""
    payload = {
        "commodity_name": "Banana",
        "commodity_category": "Fresh Produce",
        "moisture_percent": 74.0,
        "oil_fat_level": "low",
        "ph": 5.0,
        "respiration_rate": "high",
        "desired_shelf_life_days": 14,
        "storage_type": "ambient",
        "storage_temperature": 13.5,
        "relative_humidity": 85.0,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # 1. Respiration-aware advice (breathable / MAP guidance)
    assert data["risk_profile"]["respiration_risk"] == "high"
    assert data["requirements"]["required_otr_category"] == "controlled"
    assert data["requirements"]["breathable_film_needed"] is True
    assert data["requirements"]["map_suitable"] is True

    # 2. Chilling injury warning triggered if below 12°C
    sub_payload = dict(payload, storage_temperature=8.0)
    sub_res = client.post("/api/recommendations", json=sub_payload)
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert any("CHILLING INJURY" in w for w in sub_data.get("warnings", []))


def test_milk_powder_recommendation(client):
    """Test recommendation for Milk Powder (Dry, moisture-sensitive, high shelf life)."""
    payload = {
        "commodity_name": "Milk Powder (Full Cream)",
        "commodity_category": "Powders & Grains",
        "moisture_percent": 3.0,
        "oil_fat_level": "high",
        "ph": 6.6,
        "respiration_rate": "very_low",
        "desired_shelf_life_days": 365,
        "storage_type": "ambient",
        "storage_temperature": 20.0,
        "relative_humidity": 50.0,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # 1. Requirements: strict barrier & sealability
    assert data["risk_profile"]["moisture_risk"] == "high"
    assert data["risk_profile"]["oxidation_risk"] == "high"
    assert data["requirements"]["required_otr_category"] in ("very_low", "low")
    assert data["requirements"]["required_wvtr_category"] in ("very_low", "low")
    assert data["requirements"]["sealability_requirement"] == "high"

    # 2. Primary recommendation is a high barrier material
    primary_name = data["primary_recommendation"]["name"]
    assert any(mat in primary_name for mat in ["Alu Foil", "Met-PET", "PET/EVOH/PE"])


def test_frozen_peas_recommendation(client):
    """Test recommendation for Frozen Peas (Frozen storage, freezer burn risk)."""
    payload = {
        "commodity_name": "Frozen Peas (IQF)",
        "commodity_category": "Frozen Foods",
        "moisture_percent": 78.0,
        "oil_fat_level": "low",
        "ph": 6.5,
        "respiration_rate": "very_low",
        "desired_shelf_life_days": 365,
        "storage_type": "frozen",
        "storage_temperature": -18.0,
        "relative_humidity": 95.0,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # 1. Frozen storage risk & protection advice
    assert data["risk_profile"]["freezer_burn_risk"] == "high"
    assert data["risk_profile"]["microbial_risk"] == "low"  # Inhibited at -18°C
    assert data["requirements"]["required_wvtr_category"] == "very_low"
    assert data["requirements"]["mechanical_strength_requirement"] == "high"
    assert data["requirements"]["sealability_requirement"] == "high"

    # 2. Reasons mention sub-zero / freezer burn / flexibility
    primary = data["primary_recommendation"]
    all_reasons = " ".join(primary["reasons"]).lower()
    assert "sub-zero" in all_reasons or "freezer burn" in all_reasons or "flexib" in all_reasons or "-18" in all_reasons

    # 3. Disqualifies brittle polymers like PLA
    assert "PLA" not in primary["name"]


def test_roasted_nuts_recommendation(client):
    """Test recommendation for Roasted Nuts (High fat, oxidation risk)."""
    payload = {
        "commodity_name": "Roasted Nuts",
        "commodity_category": "High-Fat Snacks",
        "moisture_percent": 3.5,
        "oil_fat_level": "high",
        "ph": 6.2,
        "respiration_rate": "very_low",
        "desired_shelf_life_days": 240,
        "storage_type": "ambient",
        "storage_temperature": 20.0,
        "relative_humidity": 55.0,
        "sustainability_preference": "high",
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # 1. High oxidation risk & barrier advice
    assert data["risk_profile"]["oxidation_risk"] == "high"
    assert data["requirements"]["required_otr_category"] in ("very_low", "low")
    assert data["requirements"]["required_wvtr_category"] in ("very_low", "low")

    # 2. Primary recommendation has valid score and reasons
    primary = data["primary_recommendation"]
    assert primary["name"]
    assert len(primary["reasons"]) >= 3
    assert data["disclaimer"]


def test_recommendation_with_commodity_id(client):
    """Test recommendation using pre-seeded commodity ID lookup."""
    payload = {
        "commodity_id": 1,  # Banana
        "desired_shelf_life_days": 14,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["input_summary"]["commodity_name"] == "Banana"
    assert data["primary_recommendation"] is not None
    assert data["requirements"]["breathable_film_needed"] is True


def test_non_food_grade_materials_never_recommended(client):
    """Test that non-food-grade compliant materials are never returned in primary or alternatives."""
    payload = {
        "commodity_name": "Generic Snack",
        "commodity_category": "Dry Crisp Foods",
        "moisture_percent": 2.0,
        "oil_fat_level": "high",
        "desired_shelf_life_days": 90,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["primary_recommendation"] is not None
    # All recommended materials should be food-grade
    assert data["primary_recommendation"]["material_id"] > 0


# ==============================================================================
# PHASE 5 TESTS: Simple Mode, "Use Typical Values", and Qualitative Mapping
# ==============================================================================

def test_simple_mode_tomato_minimal_defaults(client):
    """Test Simple Mode request for Tomato with minimal fields (commodity_name + storage_type) and use_defaults=True."""
    payload = {
        "commodity_name": "Tomato",
        "storage_type": "ambient",
        "use_defaults": True,
        "simple_mode": True,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Verify auto-filled defaults from database for Tomato
    assert data["input_summary"]["commodity_name"] == "Tomato"
    assert data["input_summary"]["moisture_percent"] == 94.0
    assert data["input_summary"]["ph"] == 4.3
    assert data["input_summary"]["respiration_rate"] in ("moderate", "medium")
    assert data["input_summary"]["desired_shelf_life_days"] == 18

    # Verify recommendations & plain language summary
    assert data["primary_recommendation"] is not None
    assert data["requirements"]["breathable_film_needed"] is True
    assert "plain_language_summary" in data
    assert data["plain_language_summary"]["must_do"]
    assert data["plain_language_summary"]["suggested_structure"]
    assert "breathe" in data["plain_language_summary"]["must_do"].lower() or "sweat" in data["plain_language_summary"]["must_do"].lower()


def test_simple_mode_potato_chips_minimal_defaults(client):
    """Test Simple Mode request for Potato Chips with minimal fields and use_defaults=True."""
    payload = {
        "commodity_name": "Potato Chips",
        "storage_type": "ambient",
        "use_defaults": True,
        "simple_mode": True,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Verify auto-filled defaults from database for Potato Chips
    assert data["input_summary"]["commodity_name"] == "Potato Chips"
    assert data["input_summary"]["moisture_percent"] == 1.8
    assert data["input_summary"]["oil_fat_level"] == "high"
    assert data["input_summary"]["desired_shelf_life_days"] == 180

    # Strict moisture and oxygen barrier requirements
    assert data["requirements"]["required_otr_category"] in ("very_low", "low")
    assert data["requirements"]["required_wvtr_category"] in ("very_low", "low")
    assert data["requirements"]["breathable_film_needed"] is False
    assert "plain_language_summary" in data
    assert "crisp" in data["plain_language_summary"]["must_do"].lower() or "oxygen" in data["plain_language_summary"]["must_do"].lower() or "humidity" in data["plain_language_summary"]["must_do"].lower()


def test_simple_mode_categories_only(client):
    """Test Simple Mode request using qualitative categories (no numeric moisture/pH/shelf-life provided)."""
    payload = {
        "commodity_name": "Custom Extruded Crisp",
        "simple_mode": True,
        "use_defaults": True,
        "moisture_category": "low",
        "ph_category": "neutral",
        "oil_fat_category": "high",
        "respiration_category": "none",
        "shelf_life_category": "long",
        "transport_category": "long_distance",
        "sustainability_preference": "high",
        "storage_type": "ambient",
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Verify categories mapped to numeric equivalents
    assert data["input_summary"]["moisture_percent"] == 2.5
    assert data["input_summary"]["ph"] == 6.5
    assert data["input_summary"]["oil_fat_level"] == "high"
    assert data["input_summary"]["respiration_rate"] == "very_low"
    assert data["input_summary"]["desired_shelf_life_days"] == 90
    assert data["input_summary"]["transportation_duration_days"] == 7
    assert data["input_summary"]["transportation_condition"] == "long_distance"

    # Verify risk profile and recommendation generated
    assert data["risk_profile"]["moisture_risk"] == "high"
    assert data["risk_profile"]["oxidation_risk"] == "high"
    assert data["primary_recommendation"] is not None


def test_advanced_mode_full_numeric_request(client):
    """Test Advanced Mode request with explicit lab data, use_defaults=False, and simple_mode=False."""
    payload = {
        "commodity_name": "Lab Formulated Snack",
        "commodity_category": "High-Fat Snacks",
        "simple_mode": False,
        "use_defaults": False,
        "moisture_percent": 2.4,
        "ph": 5.8,
        "oil_fat_level": "high",
        "respiration_rate": "very_low",
        "desired_shelf_life_days": 120,
        "storage_type": "ambient",
        "storage_temperature": 25.0,
        "relative_humidity": 60.0,
        "transportation_condition": "regional",
        "transportation_duration_days": 3,
        "sustainability_preference": "balanced",
        "packaging_format_preference": "pouch",
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Exact numbers preserved without default overriding
    assert data["input_summary"]["moisture_percent"] == 2.4
    assert data["input_summary"]["ph"] == 5.8
    assert data["input_summary"]["storage_temperature"] == 25.0
    assert data["input_summary"]["relative_humidity"] == 60.0
    assert data["input_summary"]["desired_shelf_life_days"] == 120
    assert data["primary_recommendation"] is not None


# ==============================================================================
# PHASE 6 TESTS: Category-Based Inputs (pH, Moisture, Oil/Fat, Respiration)
# ==============================================================================

def test_phase6_category_only_tomato(client):
    """Test recommendation for Tomato using purely category-based inputs: pH=acidic, moisture=very_moist."""
    payload = {
        "commodity_name": "Tomato",
        "commodity_category": "Fresh Produce",
        "ph_category": "acidic",
        "moisture_category": "very_moist",
        "oil_fat_category": "very_low",
        "respiration_category": "medium",
        "storage_type": "ambient",
        "use_defaults": False,
        "simple_mode": False,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Verify category values were mapped to numeric ranges
    assert data["input_summary"]["ph"] == 4.2  # acidic -> 4.2
    assert data["input_summary"]["moisture_percent"] == 88.0  # very_moist -> 88.0
    assert data["input_summary"]["oil_fat_level"] == "low"  # very_low -> low
    assert data["input_summary"]["respiration_rate"] == "medium"

    # Respiration and moisture risks derived accurately
    assert data["risk_profile"]["respiration_risk"] == "high"
    assert data["risk_profile"]["moisture_risk"] == "high"
    assert data["requirements"]["breathable_film_needed"] is True
    assert data["primary_recommendation"] is not None


def test_phase6_category_only_potato_chips(client):
    """Test recommendation for Potato Chips using moisture_category=very_dry and oil_fat_category=high."""
    payload = {
        "commodity_name": "Potato Chips",
        "commodity_category": "Dry Crisp Foods",
        "moisture_category": "very_dry",
        "oil_fat_category": "high",
        "ph_category": "neutral",
        "respiration_category": "very_low",
        "storage_type": "ambient",
        "use_defaults": False,
        "simple_mode": False,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["input_summary"]["moisture_percent"] == 2.5  # very_dry -> 2.5%
    assert data["input_summary"]["oil_fat_level"] == "high"  # high -> high
    assert data["input_summary"]["ph"] == 6.5  # neutral -> 6.5
    assert data["input_summary"]["respiration_rate"] == "very_low"

    assert data["risk_profile"]["moisture_risk"] == "high"
    assert data["risk_profile"]["oxidation_risk"] == "high"
    assert data["requirements"]["required_otr_category"] in ("very_low", "low")
    assert data["requirements"]["required_wvtr_category"] in ("very_low", "low")
    assert data["primary_recommendation"] is not None


def test_phase6_category_only_milk_powder(client):
    """Test recommendation for Milk Powder using moisture_category=very_dry and ph_category=neutral."""
    payload = {
        "commodity_name": "Milk Powder",
        "commodity_category": "Powders & Grains",
        "moisture_category": "very_dry",
        "ph_category": "neutral",
        "oil_fat_category": "medium",
        "respiration_category": "very_low",
        "use_defaults": False,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["input_summary"]["moisture_percent"] == 2.5
    assert data["input_summary"]["ph"] == 6.5
    assert data["risk_profile"]["moisture_risk"] == "high"
    assert data["primary_recommendation"] is not None


def test_phase6_mixed_category_and_numeric(client):
    """Test request mixing category fields with explicit numeric fields."""
    payload = {
        "commodity_name": "Specialty Bakery Tart",
        "ph_category": "acidic",  # Category: acidic (4.2)
        "moisture_percent": 42.5,  # Explicit numeric moisture takes priority
        "oil_fat_category": "high",  # Category: high
        "respiration_rate": "very_low",  # Explicit respiration
        "storage_temperature": 18.0,
        "desired_shelf_life_days": 45,
        "use_defaults": False,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Explicit numeric moisture_percent (42.5) preserved
    assert data["input_summary"]["moisture_percent"] == 42.5
    # Category ph mapped to 4.2
    assert data["input_summary"]["ph"] == 4.2
    assert data["input_summary"]["oil_fat_level"] == "high"
    assert data["input_summary"]["respiration_rate"] == "very_low"
    assert data["input_summary"]["desired_shelf_life_days"] == 45
    assert data["primary_recommendation"] is not None


def test_phase6_numeric_takes_precedence_over_category(client):
    """Test that when both numeric and category fields are provided, numeric takes precedence."""
    payload = {
        "commodity_name": "Test Product",
        "moisture_percent": 12.0,
        "moisture_category": "very_dry",  # Should be ignored in favor of 12.0
        "ph": 5.2,
        "ph_category": "alkaline",  # Should be ignored in favor of 5.2
        "oil_fat_level": "very_high",
        "oil_fat_category": "low",  # Should be ignored in favor of very_high
        "respiration_rate": "high",
        "respiration_category": "very_low",  # Should be ignored in favor of high
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["input_summary"]["moisture_percent"] == 12.0
    assert data["input_summary"]["ph"] == 5.2
    assert data["input_summary"]["oil_fat_level"] == "very_high"
    assert data["input_summary"]["respiration_rate"] == "high"


def test_simple_mode_farmer_tomato_flow(client):
    """Test farmer-friendly Simple Mode with minimal inputs for Tomato."""
    payload = {
        "commodity_name": "Tomato",
        "storage_type": "ambient",
        "shelf_life_category": "medium",
        "transport_category": "local",
        "sustainability_preference": "medium",
        "simple_mode": True,
        "use_defaults": True,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Verify commodity default enrichment
    assert data["input_summary"]["commodity_name"] == "Tomato"
    assert data["input_summary"]["moisture_percent"] == 94.0
    assert data["input_summary"]["ph"] == 4.3
    assert data["input_summary"]["desired_shelf_life_days"] == 21
    assert data["requirements"]["breathable_film_needed"] is True
    assert data["primary_recommendation"] is not None


def test_simple_mode_farmer_potato_chips_flow(client):
    """Test farmer-friendly Simple Mode with minimal inputs for Potato Chips."""
    payload = {
        "commodity_name": "Potato Chips",
        "storage_type": "ambient",
        "shelf_life_category": "long",
        "transport_category": "local",
        "sustainability_preference": "medium",
        "simple_mode": True,
        "use_defaults": True,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["input_summary"]["commodity_name"] == "Potato Chips"
    assert data["input_summary"]["moisture_percent"] == 1.8
    assert data["input_summary"]["oil_fat_level"] == "high"
    assert data["requirements"]["required_wvtr_category"] in ("very_low", "low")
    assert data["requirements"]["breathable_film_needed"] is False
    assert data["primary_recommendation"] is not None


def test_advanced_mode_dont_know_defaults(client):
    """Test Advanced Mode when user selects 'I don’t know' for pH, moisture, lipid, and respiration."""
    payload = {
        "commodity_name": "Tomato",
        "commodity_category": "Fresh Produce",
        "storage_type": "ambient",
        "desired_shelf_life_days": 18,
        "simple_mode": False,
        "use_defaults": True,
        # Omit moisture_percent, ph, oil_fat_level, respiration_rate (representing "I don't know")
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Backend should fallback to commodity defaults
    assert data["input_summary"]["commodity_name"] == "Tomato"
    assert data["input_summary"]["moisture_percent"] == 94.0
    assert data["input_summary"]["ph"] == 4.3
    assert data["input_summary"]["respiration_rate"] in ("moderate", "medium")
    assert data["primary_recommendation"] is not None



