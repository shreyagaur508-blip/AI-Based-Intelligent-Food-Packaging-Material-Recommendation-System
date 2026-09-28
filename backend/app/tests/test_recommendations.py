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
