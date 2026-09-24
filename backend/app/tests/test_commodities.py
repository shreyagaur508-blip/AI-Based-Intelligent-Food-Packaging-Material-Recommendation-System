"""Tests for Commodity API endpoints."""


def test_get_commodities_list(client):
    """Test retrieving all seeded food commodities."""
    response = client.get("/api/commodities")
    assert response.status_code == 200
    commodities = response.json()
    assert isinstance(commodities, list)
    assert len(commodities) == 12

    # Check required fields exist in every commodity
    first = commodities[0]
    required_fields = [
        "id",
        "name",
        "category",
        "default_moisture_percent",
        "oil_fat_level",
        "default_ph",
        "respiration_class",
        "base_shelf_life_days",
        "recommended_storage_type",
        "minimum_storage_temperature",
        "maximum_storage_temperature",
        "notes",
    ]
    for field in required_fields:
        assert field in first, f"Missing field '{field}' in commodity"


def test_get_commodity_by_id(client):
    """Test retrieving a single commodity by valid ID."""
    response = client.get("/api/commodities/1")
    assert response.status_code == 200
    commodity = response.json()
    assert commodity["id"] == 1
    assert commodity["name"] == "Banana"
    assert commodity["category"] == "Fresh Produce"
    assert commodity["respiration_class"] == "high"


def test_get_commodity_not_found(client):
    """Test 404 error when querying a non-existent commodity ID."""
    response = client.get("/api/commodities/9999")
    assert response.status_code == 404
    error = response.json()
    assert "detail" in error


def test_filter_commodities_by_category(client):
    """Test filtering commodities by category."""
    response = client.get("/api/commodities?category=Fresh+Produce")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 3
    for item in items:
        assert item["category"] == "Fresh Produce"


def test_search_commodities(client):
    """Test search keyword filtering on commodities."""
    response = client.get("/api/commodities?search=chips")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 1
    assert "Potato Chips" in items[0]["name"]
