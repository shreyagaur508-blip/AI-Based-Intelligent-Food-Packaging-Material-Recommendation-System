import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.database import create_db_and_tables
from app.seed import seed_database

# Explicitly create tables and seed data for tests
create_db_and_tables()
seed_database()

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["sih_problem_statement"] == "SIH26044"

def test_login_demo_student():
    response = client.post("/api/auth/login", json={
        "email": "student@demo.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "student"

def test_skills_catalog():
    response = client.get("/api/skills/catalog")
    assert response.status_code == 200
    skills = response.json()
    assert len(skills) > 0

def test_internships_list():
    response = client.get("/api/internships")
    assert response.status_code == 200
    internships = response.json()
    assert len(internships) > 0
