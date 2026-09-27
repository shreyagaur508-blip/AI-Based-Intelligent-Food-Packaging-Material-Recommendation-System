"""Tests for the /health and root endpoints."""


def test_health_check(client):
    """Test that the GET /health endpoint returns 200 OK with expected status and service."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "PackWise AI API"


def test_root_endpoint(client):
    """Test the root greeting endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "docs" in data
