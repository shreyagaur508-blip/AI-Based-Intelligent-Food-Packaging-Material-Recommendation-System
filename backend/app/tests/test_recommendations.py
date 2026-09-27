"""Automated test suite for explainable packaging recommendation engine."""

import pytest


def test_potato_chips_recommendation(client):
    """Test recommendation for Potato Chips (High-fat dry crisp snack)."""
    payload = {
        "commodity_name": "Potato Chips",
        "commodity_category": "Dry Crisp Foods",
        "moisture_percent": 1.8,
        "oil_fat_level": "high",
        "pH": 6.0,
        "respiration_rate": "none",
        "desired_shelf_life_days": 180,
        "storage_type": "ambient",
        "storage_temperature": 22.0,
        "relative_humidity": 50.0,
        "sustainability_preference": "balanced",
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # 1. At least one recommendation exists
    assert "primary_recommendation" in data
    assert data["primary_recommendation"]["material_name"] is not None
    assert len(data["alternative_recommendations"]) >= 1

    # 2. No non-food-grade material is recommended
    assert data["primary_recommendation"]["scores"]["total_score"] > 0
    for alt in data["alternative_recommendations"]:
        assert alt["scores"]["total_score"] > 0

    # 3. Oxygen / moisture barrier advice
    assert data["wvtr_requirement_category"] == "low"
    assert data["otr_requirement_category"] == "low"
    assert "Nitrogen" in data["map_suitability"] or "N2" in data["map_suitability"]

    # 4. Check risk profile
    assert data["risk_profile"]["moisture_risk"] in ("Critical", "High")
    assert data["risk_profile"]["oxidation_risk"] in ("Critical", "High")

    # 5. Check explanatory reasons
    assert len(data["explanatory_reasons"]) >= 3


def test_tomato_recommendation(client):
    """Test recommendation for Fresh Tomatoes (Respiring chill-sensitive produce)."""
    payload = {
        "commodity_name": "Tomato",
        "commodity_category": "Fresh Produce",
        "moisture_percent": 94.0,
        "oil_fat_level": "none",
        "pH": 4.3,
        "respiration_rate": "moderate",
        "desired_shelf_life_days": 18,
        "storage_type": "ambient",
        "storage_temperature": 12.0,
        "relative_humidity": 90.0,
        "sustainability_preference": "compostable",
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # 1. Recommendation exists
    assert data["primary_recommendation"] is not None

    # 2. Respiration-aware advice
    assert data["otr_requirement_category"] == "controlled"
    assert "EMAP" in data["map_suitability"] or "respiration" in data["map_suitability"].lower()
    assert "micro-perforated" in data["breathable_or_microperforated_recommendation"].lower() or "breathable" in data["breathable_or_microperforated_recommendation"].lower()

    # 3. Disqualifies hermetic zero-barrier films like Alu Foil
    disqualified_names = [d["material_name"] for d in data["disqualified_materials"]]
    assert any("Foil" in name for name in disqualified_names)


def test_banana_recommendation(client):
    """Test recommendation for Bananas (High respiration climacteric fruit)."""
    payload = {
        "commodity_name": "Banana",
        "commodity_category": "Fresh Produce",
        "moisture_percent": 74.0,
        "oil_fat_level": "none",
        "pH": 5.0,
        "respiration_rate": "high",
        "desired_shelf_life_days": 14,
        "storage_type": "ambient",
        "storage_temperature": 13.5,
        "relative_humidity": 85.0,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # 1. Respiration-aware advice & EMAP
    assert data["risk_profile"]["respiration_risk"] in ("High", "Very High")
    assert data["otr_requirement_category"] == "controlled"
    assert "micro-perforated" in data["breathable_or_microperforated_recommendation"].lower() or "breathable" in data["breathable_or_microperforated_recommendation"].lower()

    # 2. Check chilling injury logic if tested below 12°C
    sub_payload = dict(payload, storage_temperature=8.0)
    sub_res = client.post("/api/recommendations", json=sub_payload)
    sub_data = sub_res.json()
    assert any("CHILLING INJURY" in w for w in sub_data["warnings"])


def test_milk_powder_recommendation(client):
    """Test recommendation for Full Cream Milk Powder (Hygroscopic & oxidation prone)."""
    payload = {
        "commodity_name": "Milk Powder (Full Cream)",
        "commodity_category": "Powders & Grains",
        "moisture_percent": 3.0,
        "oil_fat_level": "high",
        "pH": 6.6,
        "respiration_rate": "none",
        "desired_shelf_life_days": 365,
        "storage_type": "ambient",
        "storage_temperature": 20.0,
        "relative_humidity": 50.0,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # High barrier requirements
    assert data["otr_requirement_category"] == "low"
    assert data["wvtr_requirement_category"] == "low"
    assert data["risk_profile"]["moisture_risk"] in ("High", "Critical")
    assert data["risk_profile"]["oxidation_risk"] in ("High", "Critical")

    # Primary recommendation is high barrier (e.g. Alu Foil or Met-PET or PET/EVOH/PE)
    primary_name = data["primary_recommendation"]["material_name"]
    assert any(mat in primary_name for mat in ["Alu Foil", "Met-PET", "PET/EVOH/PE"])


def test_frozen_peas_recommendation(client):
    """Test recommendation for Frozen Peas (IQF sub-zero storage)."""
    payload = {
        "commodity_name": "Frozen Peas (IQF)",
        "commodity_category": "Frozen Foods",
        "moisture_percent": 78.0,
        "oil_fat_level": "none",
        "pH": 6.5,
        "respiration_rate": "none",
        "desired_shelf_life_days": 365,
        "storage_type": "frozen",
        "storage_temperature": -18.0,
        "relative_humidity": 95.0,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # 1. Frozen storage advice
    assert data["risk_profile"]["freezer_burn_risk"] == "High"
    assert "Sub-Zero" in data["mechanical_strength_requirement"] or "Puncture" in data["mechanical_strength_requirement"]
    assert "-18" in data["storage_recommendation"]

    # 2. Disqualify brittle polymers like PLA
    disqualified_names = [d["material_name"] for d in data["disqualified_materials"]]
    assert any("PLA" in name for name in disqualified_names)


def test_roasted_nuts_recommendation(client):
    """Test recommendation for Roasted Nuts (High-fat snack requiring oxygen & light barrier)."""
    payload = {
        "commodity_name": "Roasted Nuts",
        "commodity_category": "High-Fat Snacks",
        "moisture_percent": 3.5,
        "oil_fat_level": "high",
        "pH": 6.2,
        "respiration_rate": "none",
        "desired_shelf_life_days": 240,
        "storage_type": "ambient",
        "storage_temperature": 20.0,
        "relative_humidity": 55.0,
        "sustainability_preference": "recyclable",
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Oxygen barrier prioritized
    assert data["otr_requirement_category"] == "low"
    assert data["risk_profile"]["oxidation_risk"] in ("High", "Critical")
    assert len(data["explanatory_reasons"]) >= 3
    assert data["disclaimer"] is not None


def test_recommendation_with_commodity_id(client):
    """Test recommendation using pre-seeded commodity ID lookup."""
    payload = {
        "commodity_id": 1,  # Banana
        "desired_shelf_life_days": 14,
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["commodity_summary"]["name"] == "Banana"
    assert data["primary_recommendation"] is not None
