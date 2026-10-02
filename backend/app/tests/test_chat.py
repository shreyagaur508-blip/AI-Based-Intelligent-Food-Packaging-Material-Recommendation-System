"""Tests for the Voice & Text Chat Assistant API (/api/chat)."""

def test_chat_english_tomato_query(client):
    """Test chat with an English query about tomatoes."""
    response = client.post(
        "/api/chat",
        json={
            "message": "I need packaging for fresh tomatoes for 15 days in ambient storage",
            "language": "en",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 0
    assert data["language"] == "en"
    assert data["suggested_form_values"] is not None
    assert data["suggested_form_values"]["commodity_name"] == "Tomato"
    assert data["suggested_form_values"]["desired_shelf_life_days"] == 15
    assert data["suggested_form_values"]["storage_type"] == "ambient"


def test_chat_hindi_tamatar_query(client):
    """Test chat with a Hindi query about tomatoes."""
    response = client.post(
        "/api/chat",
        json={
            "message": "टमाटर को 20 दिन तक रखने के लिए कौन सा पाउच सही रहेगा?",
            "language": "hi",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["language"] == "hi"
    assert data["suggested_form_values"] is not None
    assert data["suggested_form_values"]["commodity_name"] == "Tomato"
    assert data["suggested_form_values"]["desired_shelf_life_days"] == 20


def test_chat_hindi_greeting(client):
    """Test chat greeting in Hindi."""
    response = client.post(
        "/api/chat",
        json={
            "message": "नमस्ते, आप कैसे मदद कर सकते हैं?",
            "language": "hi",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "नमस्ते" in data["reply"] or "PackWise" in data["reply"]


def test_chat_kannada_query(client):
    """Test chat with Kannada language code."""
    response = client.post(
        "/api/chat",
        json={
            "message": "ಟೊಮೆಟೊ ಪ್ಯಾಕಿಂಗ್ ಹೇಗೆ ಮಾಡುವುದು?",
            "language": "kn",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "kn"
    assert data["suggested_form_values"]["commodity_name"] == "Tomato"


def test_chat_potato_chips_query(client):
    """Test chat for crispy potato chips with moisture barrier needs."""
    response = client.post(
        "/api/chat",
        json={
            "message": "What packaging should I use for potato chips to keep them crisp for 6 months?",
            "language": "en",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["suggested_form_values"] is not None
    assert data["suggested_form_values"]["commodity_name"] == "Potato Chips"
    assert data["suggested_form_values"]["desired_shelf_life_days"] == 180


def test_chat_paneer_chilled_query(client):
    """Test chat for perishable paneer in chilled storage."""
    response = client.post(
        "/api/chat",
        json={
            "message": "ताजा पनीर को कोल्ड स्टोरेज में 14 दिन रखने की पैकिंग",
            "language": "hi",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["suggested_form_values"]["commodity_name"] == "Paneer"
    assert data["suggested_form_values"]["storage_type"] == "chilled"
    assert data["suggested_form_values"]["desired_shelf_life_days"] == 14


def test_chat_prefix_without_api_v1(client):
    """Test that chat endpoint also responds at /chat as fallback."""
    response = client.post(
        "/chat",
        json={
            "message": "Hello PackWise",
            "language": "en",
        },
    )
    assert response.status_code == 200
