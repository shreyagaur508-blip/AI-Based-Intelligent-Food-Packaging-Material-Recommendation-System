"""Tests for Packaging Materials API endpoints."""


def test_get_materials_list(client):
    """Test retrieving all seeded packaging materials."""
    response = client.get("/api/materials")
    assert response.status_code == 200
    materials = response.json()
    assert isinstance(materials, list)
    assert len(materials) == 11

    # Check required fields exist in every material
    first = materials[0]
    required_fields = [
        "id",
        "name",
        "material_type",
        "structure",
        "food_grade_compliant",
        "recyclability_level",
        "biodegradability_level",
        "cost_level",
        "sealability_score",
        "mechanical_strength_score",
        "puncture_resistance_score",
        "transparency",
        "printability",
        "map_compatible",
        "microperforation_supported",
        "description",
        "properties",
    ]
    for field in required_fields:
        assert field in first, f"Missing field '{field}' in packaging material"

    # Verify ASTM properties are attached
    assert len(first["properties"]) > 0
    prop = first["properties"][0]
    assert "otr_value" in prop
    assert "wvtr_value" in prop
    assert "thickness_microns" in prop
    assert "otr_unit" in prop
    assert "wvtr_unit" in prop


def test_get_material_by_id(client):
    """Test retrieving a single packaging material by ID."""
    response = client.get("/api/materials/1")
    assert response.status_code == 200
    mat = response.json()
    assert mat["id"] == 1
    assert "LDPE" in mat["name"]
    assert mat["food_grade_compliant"] is True
    assert len(mat["properties"]) >= 1


def test_get_material_not_found(client):
    """Test 404 error when querying a non-existent material ID."""
    response = client.get("/api/materials/9999")
    assert response.status_code == 404
    error = response.json()
    assert "detail" in error


def test_filter_materials_by_cost_level(client):
    """Test filtering materials by cost level."""
    response = client.get("/api/materials?cost_level=Budget")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 4
    for item in items:
        assert item["cost_level"] == "Budget"


def test_search_materials(client):
    """Test keyword search on materials."""
    response = client.get("/api/materials?search=Foil")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 1
    assert "Alu Foil" in items[0]["name"]
