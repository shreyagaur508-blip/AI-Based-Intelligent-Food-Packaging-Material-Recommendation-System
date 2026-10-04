"""Tests for the Voice & Text Chat Assistant API (/api/chat)."""

import pytest


def test_chat_intro_greeting_english(client):
    """Test intro message when English greeting is sent."""
    response = client.post(
        "/api/chat",
        json={
            "message": "hello",
            "language": "en",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "PackWise AI assistant" in data["reply"]
    assert "potato chips, tomato, banana" in data["reply"]


def test_chat_intro_greeting_hindi(client):
    """Test intro message when Hindi greeting is sent."""
    response = client.post(
        "/api/chat",
        json={
            "message": "namaste",
            "language": "hi",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "Main PackWise AI assistant hoon" in data["reply"]
    assert "aloo chips, tamatar, kela" in data["reply"]


def test_chat_multi_turn_flow_hindi(client):
    """Test multi-turn conversation flow in Hindi for Tomato + 15 days + chilled."""
    # Turn 1: Commodity only
    t1 = client.post(
        "/api/chat",
        json={
            "message": "tamatar",
            "language": "hi",
            "history": [],
        },
    )
    assert t1.status_code == 200
    d1 = t1.json()
    assert "Kitne din/mahine tak rakhna chahte hain?" in d1["reply"]

    # Turn 2: Shelf life
    history_t2 = [
        {"role": "user", "content": "tamatar"},
        {"role": "assistant", "content": d1["reply"]},
    ]
    t2 = client.post(
        "/api/chat",
        json={
            "message": "15 din",
            "language": "hi",
            "history": history_t2,
        },
    )
    assert t2.status_code == 200
    d2 = t2.json()
    assert "Kaise store karenge? Ambient, chilled, ya frozen?" in d2["reply"]

    # Turn 3: Storage
    history_t3 = history_t2 + [
        {"role": "user", "content": "15 din"},
        {"role": "assistant", "content": d2["reply"]},
    ]
    t3 = client.post(
        "/api/chat",
        json={
            "message": "chilled",
            "language": "hi",
            "history": history_t3,
        },
    )
    assert t3.status_code == 200
    d3 = t3.json()
    assert "PackWise AI सुझाव" in d3["reply"]
    assert d3["suggested_form_values"] is not None
    assert d3["suggested_form_values"]["commodity_name"] == "Tomato"
    assert d3["suggested_form_values"]["desired_shelf_life_days"] == 15
    assert d3["suggested_form_values"]["storage_type"] == "chilled"


def test_chat_multi_turn_flow_english(client):
    """Test multi-turn conversation flow in English for Potato chips + 6 months + ambient."""
    # Turn 1: Commodity
    t1 = client.post(
        "/api/chat",
        json={
            "message": "potato chips",
            "language": "en",
            "history": [],
        },
    )
    assert t1.status_code == 200
    d1 = t1.json()
    assert "How many days or months do you want to store it?" in d1["reply"]

    # Turn 2: Shelf life
    history_t2 = [
        {"role": "user", "content": "potato chips"},
        {"role": "assistant", "content": d1["reply"]},
    ]
    t2 = client.post(
        "/api/chat",
        json={
            "message": "6 months",
            "language": "en",
            "history": history_t2,
        },
    )
    assert t2.status_code == 200
    d2 = t2.json()
    assert "Ambient, chilled, ya frozen" in d2["reply"] or "store" in d2["reply"]

    # Turn 3: Storage
    history_t3 = history_t2 + [
        {"role": "user", "content": "6 months"},
        {"role": "assistant", "content": d2["reply"]},
    ]
    t3 = client.post(
        "/api/chat",
        json={
            "message": "ambient",
            "language": "en",
            "history": history_t3,
        },
    )
    assert t3.status_code == 200
    d3 = t3.json()
    assert "PackWise AI Recommendation for Potato Chips" in d3["reply"]
    assert d3["suggested_form_values"] is not None
    assert d3["suggested_form_values"]["commodity_name"] == "Potato Chips"
    assert d3["suggested_form_values"]["desired_shelf_life_days"] == 180
    assert d3["suggested_form_values"]["storage_type"] == "ambient"


def test_chat_single_turn_potato_chips_english(client):
    """Test single turn: Potato chips + 6 months + ambient."""
    response = client.post(
        "/api/chat",
        json={
            "message": "Potato chips + 6 months + ambient",
            "language": "en",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["suggested_form_values"]["commodity_name"] == "Potato Chips"
    assert data["suggested_form_values"]["desired_shelf_life_days"] == 180
    assert data["suggested_form_values"]["storage_type"] == "ambient"
    assert "Potato Chips" in data["reply"]


def test_chat_single_turn_tomato_chilled_english(client):
    """Test single turn: Tomato + 15 days + chilled."""
    response = client.post(
        "/api/chat",
        json={
            "message": "Tomato + 15 days + chilled",
            "language": "en",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["suggested_form_values"]["commodity_name"] == "Tomato"
    assert data["suggested_form_values"]["desired_shelf_life_days"] == 15
    assert data["suggested_form_values"]["storage_type"] == "chilled"


def test_chat_single_turn_banana_ambient_english(client):
    """Test single turn: Banana + 5 days + ambient."""
    response = client.post(
        "/api/chat",
        json={
            "message": "Banana + 5 days + ambient",
            "language": "en",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["suggested_form_values"]["commodity_name"] == "Banana"
    assert data["suggested_form_values"]["desired_shelf_life_days"] == 5
    assert data["suggested_form_values"]["storage_type"] == "ambient"


def test_chat_hindi_expanded_commodities(client):
    """Test Hindi keyword matches: aloo chips, tamatar, kela, doodh powder, biscuit, paneer, chawal."""
    test_cases = [
        ("aloo chips 6 mahine kamre ke tapman par", "Potato Chips", 180, "ambient"),
        ("tamatar 15 din thanda", "Tomato", 15, "chilled"),
        ("kela 5 din kamre ke tapman par", "Banana", 5, "ambient"),
        ("doodh powder 1 mahina ambient", "Milk Powder", 30, "ambient"),
        ("biscuit 15 din ambient", "Biscuits", 15, "ambient"),
        ("paneer 15 din thanda", "Paneer", 15, "chilled"),
        ("chawal 1 saal ambient", "Rice", 365, "ambient"),
    ]

    for query, expected_comm, expected_days, expected_storage in test_cases:
        res = client.post("/api/chat", json={"message": query, "language": "hi"})
        assert res.status_code == 200, f"Failed for {query}"
        data = res.json()
        assert data["suggested_form_values"] is not None, f"No form values for {query}"
        assert data["suggested_form_values"]["commodity_name"] == expected_comm, f"Expected {expected_comm} for {query}"
        assert data["suggested_form_values"]["desired_shelf_life_days"] == expected_days, f"Expected {expected_days} for {query}"
        assert data["suggested_form_values"]["storage_type"] == expected_storage, f"Expected {expected_storage} for {query}"


def test_chat_storage_phrases(client):
    """Test various storage phrases (ambient, chilled, frozen)."""
    # kamre ke tapman par -> ambient
    r1 = client.post("/api/chat", json={"message": "tamatar 15 din kamre ke tapman par", "language": "hi"})
    assert r1.json()["suggested_form_values"]["storage_type"] == "ambient"

    # thanda -> chilled
    r2 = client.post("/api/chat", json={"message": "tamatar 15 din thanda", "language": "hi"})
    assert r2.json()["suggested_form_values"]["storage_type"] == "chilled"

    # jamakar -> frozen
    r3 = client.post("/api/chat", json={"message": "matar 1 saal jamakar", "language": "hi"})
    assert r3.json()["suggested_form_values"]["storage_type"] == "frozen"


def test_chat_prefix_without_api_v1(client):
    """Test that chat endpoint also responds at /chat as fallback."""
    response = client.post(
        "/chat",
        json={
            "message": "Potato chips + 6 months + ambient",
            "language": "en",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["suggested_form_values"]["commodity_name"] == "Potato Chips"
