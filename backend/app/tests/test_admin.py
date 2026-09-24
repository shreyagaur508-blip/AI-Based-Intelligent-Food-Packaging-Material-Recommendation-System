"""Tests for Admin Dashboard summary API."""


def test_get_dashboard_summary(client):
    """Test retrieving admin dashboard aggregate metrics."""
    response = client.get("/api/admin/dashboard-summary")
    assert response.status_code == 200
    data = response.json()

    assert data["total_commodities"] == 12
    assert data["total_materials"] == 11
    assert data["total_material_properties"] >= 11
    assert data["total_active_rules"] >= 6
    assert data["food_grade_compliance_rate"] == 100.0
    assert data["system_status"] == "Operational"
    assert "database_type" in data
    assert len(data["supported_categories"]) > 0
    assert len(data["polymer_families"]) > 0
