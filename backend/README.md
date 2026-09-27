# PackWise AI — Backend Service Layer (Phases 2 & 3)

FastAPI REST backend service for **PackWise AI — Intelligent Food Packaging Material Recommendation System**.

Provides high-performance endpoints for querying food commodity degradation characteristics, ASTM-standardized barrier packaging materials, administrative system indicators, and the deterministic **6-stage Explainable Packaging Recommendation Engine**.

---

## 🏗️ Architecture & Technology Stack

- **Runtime:** Python 3.10+ / 3.11+
- **Web Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous REST API)
- **ASGI Server:** [Uvicorn](https://www.uvicorn.org/)
- **ORM & Data Layer:** [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **Validation & Serialization:** [Pydantic v2](https://docs.pydantic.dev/latest/)
- **Recommendation Engine:** Pure Python Deterministic MCDA + Rule-based Barrier Risk Engine
- **Database:** SQLite (local development) / PostgreSQL (production-ready)
- **Environment Management:** `python-dotenv` & `.env`
- **Testing:** `pytest` & `httpx` (FastAPI TestClient)

---

## 📁 Directory Structure

```text
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── admin.py            # GET /api/admin/dashboard-summary
│   │   │   ├── commodities.py      # GET /api/commodities, GET /api/commodities/{id}
│   │   │   ├── materials.py        # GET /api/materials, GET /api/materials/{id}
│   │   │   └── recommendations.py  # POST /api/recommendations
│   │   └── router.py               # Master API router
│   ├── core/
│   │   ├── config.py               # Environment & CORS configuration
│   ├── db/
│   │   ├── base.py                 # SQLAlchemy DeclarativeBase
│   │   └── session.py              # Engine, SessionLocal, get_db dependency
│   ├── engine/                     # Core Explainable Recommendation Engine (Phase 3)
│   │   ├── candidate_filter.py     # Hard constraint elimination (Safety, Anoxia, Low Temp)
│   │   ├── explainability.py       # Scientific reasoning & alternative pick assembly
│   │   ├── recommender.py          # 6-Stage pipeline orchestrator
│   │   ├── requirement_formulator.py # ASTM barrier, seal, and MAP derivation
│   │   ├── risk_profiler.py        # Food degradation risk classifier
│   │   └── scorer.py               # Multi-Criteria Decision Analysis (MCDA) scorer
│   ├── models/
│   │   ├── commodity.py            # Commodity ORM model
│   │   ├── packaging_material.py   # PackagingMaterial ORM model
│   │   ├── material_property.py    # MaterialProperty (ASTM OTR/WVTR) model
│   │   ├── recommendation_rule.py  # RecommendationRule model
│   │   ├── recommendation.py       # Recommendation model
│   │   ├── recommendation_item.py  # RecommendationItem model
│   │   └── traceability_batch.py   # TraceabilityBatch model
│   ├── schemas/
│   │   ├── commodity.py            # Pydantic schemas for Commodity
│   │   ├── packaging_material.py   # Pydantic schemas for PackagingMaterial
│   │   ├── material_property.py    # Pydantic schemas for MaterialProperty
│   │   ├── dashboard.py            # Pydantic schema for Admin Dashboard
│   │   └── recommendation.py       # Pydantic schemas for Recommendation Engine
│   ├── seed/
│   │   └── seed_data.py            # Seed script (12 commodities, 11 materials, ASTM rules)
│   ├── services/
│   │   ├── admin_service.py        # Dashboard metrics computation
│   │   ├── commodity_service.py    # Commodity data access & search
│   │   ├── material_service.py     # Material data access & filtering
│   │   └── recommendation_service.py # Recommendation execution & DB logging
│   ├── tests/
│   │   ├── conftest.py             # Pytest in-memory database fixtures
│   │   ├── test_admin.py           # Dashboard API tests
│   │   ├── test_commodities.py     # Commodity API tests
│   │   ├── test_health.py          # Health check API tests
│   │   ├── test_materials.py       # Packaging materials API tests
│   │   └── test_recommendations.py # Recommendation engine verification suite
│   └── main.py                     # Application entry point & CORS
├── .env.example                    # Environment template
├── .env                            # Local environment configuration
├── requirements.txt                # Python package dependencies
└── README.md                       # Documentation
```

---

## 🚀 Setup & Installation Guide

### 1. Create and Activate a Virtual Environment

Open a terminal in the `backend/` directory:

#### On Windows (PowerShell):
```powershell
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1
```

*(If script execution is restricted on Windows PowerShell, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`)*

#### On Linux / macOS:
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

---

### 2. Install Dependencies

With the virtual environment activated, install all required packages:

```bash
pip install -r requirements.txt
```

---

### 3. Environment Configuration

Copy `.env.example` to `.env` (or configure as needed):

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Default `.env` configuration:
```env
APP_NAME="PackWise AI Backend"
APP_ENV="development"
DEBUG=True
API_V1_PREFIX="/api"
DATABASE_URL="sqlite:///./packwise.db"
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173","http://localhost:3000","http://127.0.0.1:3000"]
```

---

### 4. Seed the Database

Populate the database with all **12 food commodities**, **11 packaging materials** with ASTM properties, and **6 expert gatekeeping rules**:

```bash
# From the backend directory
python -m app.seed.seed_data
```

Expected output:
```text
[INFO] Initializing PackWise AI Database & Seeding Data...
[SUCCESS] Seeding Complete! Details: {'commodities_seeded': 12, 'materials_seeded': 11, 'rules_seeded': 6, 'status': 'success'}
```

*(Note: The database also auto-initializes and seeds automatically on FastAPI startup if the tables are empty).*

---

### 5. Run the Backend Server

Start the development server with hot reload:

```bash
# From the backend directory
uvicorn app.main:app --reload --port 8000
```

The server will start at: `http://localhost:8000`
- **Interactive OpenAPI Documentation (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Alternative Documentation:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check Endpoint:** [http://localhost:8000/health](http://localhost:8000/health)

---

## 📡 API Reference & How to Call Endpoints

### 1. Health Check
- **Endpoint:** `GET /health`
- **Description:** Verifies service health, version, and database connectivity.
- **Example cURL:**
  ```bash
  curl -X GET "http://localhost:8000/health"
  ```
- **Sample Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "service": "PackWise AI Backend",
    "environment": "development",
    "version": "1.0.0",
    "database": "connected"
  }
  ```

---

### 2. List Food Commodities
- **Endpoint:** `GET /api/commodities`
- **Query Parameters:**
  - `category` (optional): Filter by category (e.g. `Fresh Produce`, `Dry Crisp Foods`, `High-Fat Snacks`, `Powders & Grains`, `Perishable Dairy`, `Frozen Foods`)
  - `search` (optional): Keyword search (e.g. `banana`, `chips`)
  - `skip` (default: 0): Pagination offset
  - `limit` (default: 100): Maximum records returned
- **Example cURL:**
  ```bash
  curl -X GET "http://localhost:8000/api/commodities?category=Fresh+Produce"
  ```
- **Sample Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Banana",
      "category": "Fresh Produce",
      "default_moisture_percent": 74.0,
      "oil_fat_level": "none",
      "default_ph": 5.0,
      "respiration_class": "high",
      "base_shelf_life_days": 14,
      "recommended_storage_type": "ambient",
      "minimum_storage_temperature": 12.0,
      "maximum_storage_temperature": 15.0,
      "notes": "Climacteric fruit with high ethylene sensitivity. Susceptible to chilling injury below 12°C and anaerobic fermentation if packaged in hermetic non-breathable films."
    }
  ]
  ```

---

### 3. Get Single Commodity by ID
- **Endpoint:** `GET /api/commodities/{id}`
- **Example cURL:**
  ```bash
  curl -X GET "http://localhost:8000/api/commodities/1"
  ```
- **Sample Response (200 OK):**
  ```json
  {
    "id": 1,
    "name": "Banana",
    "category": "Fresh Produce",
    "default_moisture_percent": 74.0,
    "oil_fat_level": "none",
    "default_ph": 5.0,
    "respiration_class": "high",
    "base_shelf_life_days": 14,
    "recommended_storage_type": "ambient",
    "minimum_storage_temperature": 12.0,
    "maximum_storage_temperature": 15.0,
    "notes": "Climacteric fruit with high ethylene sensitivity..."
  }
  ```

---

### 4. List Packaging Materials
- **Endpoint:** `GET /api/materials`
- **Query Parameters:**
  - `material_type` (optional): Filter by type (e.g. `Polyolefin`, `Polyester`, `Barrier Film`, `Biopolymer`, `Multilayer Foil Laminate`)
  - `cost_level` (optional): Filter by cost tier (`Budget`, `Moderate`, `Premium`)
  - `food_grade_only` (default: false): Boolean filter
  - `search` (optional): Keyword search
- **Example cURL:**
  ```bash
  curl -X GET "http://localhost:8000/api/materials"
  ```
- **Sample Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "LDPE (Low-Density Polyethylene)",
      "material_type": "Polyolefin",
      "structure": "Monolayer Extruded Film",
      "food_grade_compliant": true,
      "recyclability_level": "High (RIC 4)",
      "biodegradability_level": "Non-biodegradable",
      "cost_level": "Budget",
      "sealability_score": 9.0,
      "mechanical_strength_score": 6.5,
      "puncture_resistance_score": 6.0,
      "transparency": "Translucent / Clear",
      "printability": "Moderate (Corona treatment required)",
      "map_compatible": true,
      "microperforation_supported": true,
      "description": "Flexible thermoplastic film widely used for produce bags...",
      "properties": [
        {
          "id": 1,
          "material_id": 1,
          "test_temperature_celsius": 23.0,
          "relative_humidity_percent": 0.0,
          "otr_value": 4500.0,
          "otr_unit": "cm3/(m2.24h.atm)",
          "wvtr_value": 18.0,
          "wvtr_unit": "g/(m2.24h)",
          "thickness_microns": 30.0,
          "co2_transmission_rate": 18000.0,
          "tensile_strength": 25.0,
          "seal_temperature_min": 105.0,
          "seal_temperature_max": 140.0,
          "test_condition_notes": "ASTM D3985 OTR (23°C, 0% RH); ASTM F1249 WVTR (38°C, 90% RH). [Reference standard test values for academic and decision support prototyping.]"
        }
      ]
    }
  ]
  ```

---

### 5. Get Single Packaging Material by ID
- **Endpoint:** `GET /api/materials/{id}`
- **Example cURL:**
  ```bash
  curl -X GET "http://localhost:8000/api/materials/6"
  ```
- **Sample Response (200 OK):**
  ```json
  {
    "id": 6,
    "name": "Met-PET (Metallized PET)",
    "material_type": "Barrier Film",
    "structure": "Vacuum Metallized PET Film",
    "food_grade_compliant": true,
    "recyclability_level": "Low / Mixed",
    "biodegradability_level": "Non-biodegradable",
    "cost_level": "Moderate",
    "sealability_score": 7.0,
    "mechanical_strength_score": 8.5,
    "puncture_resistance_score": 7.5,
    "transparency": "Reflective / Opaque (Light Barrier)",
    "printability": "Good",
    "map_compatible": true,
    "microperforation_supported": false,
    "description": "Aluminium-vapor-deposited PET film offering high barrier...",
    "properties": [
      {
        "id": 6,
        "material_id": 6,
        "test_temperature_celsius": 23.0,
        "relative_humidity_percent": 0.0,
        "otr_value": 1.2,
        "otr_unit": "cm3/(m2.24h.atm)",
        "wvtr_value": 1.0,
        "wvtr_unit": "g/(m2.24h)",
        "thickness_microns": 12.0,
        "co2_transmission_rate": 5.0,
        "tensile_strength": 180.0,
        "seal_temperature_min": 130.0,
        "seal_temperature_max": 170.0,
        "test_condition_notes": "ASTM D3985 OTR; ASTM F1249 WVTR. [Reference standard test values...]"
      }
    ]
  }
  ```

---

### 6. Generate Explainable Packaging Recommendation
- **Endpoint:** `POST /api/recommendations`
- **Description:** Executes the 6-stage deterministic recommendation engine based on food physiology, degradation risks, and storage conditions.
- **Example cURL:**
  ```bash
  curl -X POST "http://localhost:8000/api/recommendations" \
    -H "Content-Type: application/json" \
    -d '{
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
      "sustainability_preference": "balanced"
    }'
  ```
- **Sample Response (200 OK):**
  ```json
  {
    "commodity_summary": {
      "name": "Potato Chips",
      "category": "Dry Crisp Foods",
      "moisture_percent": 1.8,
      "oil_fat_level": "high",
      "respiration_rate": "none",
      "storage_type": "ambient",
      "storage_temperature_celsius": 22.0,
      "relative_humidity_percent": 50.0,
      "desired_shelf_life_days": 180
    },
    "risk_profile": {
      "moisture_risk": "Critical",
      "oxidation_risk": "Critical",
      "microbial_spoilage_risk": "Low",
      "respiration_risk": "None",
      "mechanical_damage_risk": "High",
      "freezer_burn_risk": "None",
      "risk_summary": "Moisture sensitivity requiring strict vapor barrier; Lipid oxidation susceptibility requiring low oxygen permeability; Vulnerability to crushing/flex-cracking during distribution"
    },
    "otr_requirement_category": "low",
    "wvtr_requirement_category": "low",
    "suggested_thickness_range_microns": {
      "min_microns": 25.0,
      "max_microns": 45.0,
      "recommended_microns": 32.0
    },
    "sealability_requirement": "Hermetic High-Integrity Fusion Seal (Zero Micro-channel Leakage)",
    "mechanical_strength_requirement": "High Tensile Modulus & Flex-Crack Resistance to Prevent Pinholing",
    "map_suitability": "Recommended: 100% High-Purity Nitrogen (N2) Gas Flushing (Residual O2 < 1.0%) to prevent oxidative rancidity and provide pillow cushioning.",
    "breathable_or_microperforated_recommendation": "Not recommended: Hermetic solid barrier required to maintain inert gas flush and exclude ambient oxygen.",
    "storage_recommendation": "Store in cool, dry ambient warehouse conditions at 22.0°C and relative humidity <= 60% away from direct UV/sunlight.",
    "cost_class": "Moderate to Premium",
    "sustainability_score": 65.0,
    "recommended_packaging_structure": "Met-PET (Metallized PET) (Vacuum Metallized PET Film) — Designed for Potato Chips preservation.",
    "primary_recommendation": {
      "material_id": 6,
      "material_name": "Met-PET (Metallized PET)",
      "material_type": "Barrier Film",
      "structure": "Vacuum Metallized PET Film",
      "recommendation_type": "Primary Recommendation",
      "cost_level": "Moderate",
      "sustainability_score": 65.0,
      "scores": {
        "total_score": 85.2,
        "barrier_score": 95.0,
        "mechanical_score": 76.5,
        "cost_score": 80.0,
        "sustainability_score": 65.0
      },
      "highlight": "Best Overall Match across Barrier, Mechanical, Cost & Sustainability criteria.",
      "explanation": "Optimal balance for Potato Chips: provides required barrier protection with high processability.",
      "properties_summary": {
        "OTR": "1.20 cm3/(m2.24h.atm)",
        "WVTR": "1.00 g/(m2.24h)",
        "Thickness": "12 µm",
        "Tensile Strength": "180.0 MPa"
      }
    },
    "alternative_recommendations": [
      {
        "material_id": 11,
        "material_name": "PET/EVOH/PE recyclable (High-Barrier Recyclable Co-ex)",
        "material_type": "Recyclable Barrier Laminate",
        "structure": "High-Barrier Co-extrusion with Compatibilized EVOH Layer (<5%)",
        "recommendation_type": "Alternative (Eco Choice)",
        "cost_level": "Premium",
        "sustainability_score": 88.0,
        "scores": {
          "total_score": 83.1,
          "barrier_score": 93.0,
          "mechanical_score": 83.8,
          "cost_score": 60.0,
          "sustainability_score": 88.0
        },
        "highlight": "Highest sustainability and recyclability rating among qualified candidates.",
        "explanation": "Eco-optimized choice: High (RecyClass Certified Stream), Non-biodegradable.",
        "properties_summary": {
          "OTR": "2.00 cm3/(m2.24h.atm)",
          "WVTR": "2.50 g/(m2.24h)",
          "Thickness": "65 µm"
        }
      }
    ],
    "disqualified_materials": [],
    "explanatory_reasons": [
      "Oxidation & Crispness Defense: The structure provides superior oxygen and water vapor barriers (OTR < 2.0 cm³/m²·day, WVTR < 1.5 g/m²·day) to block lipid auto-oxidation rancidity and prevent moisture sorption sogginess.",
      "Mechanical & Seal Reliability: Scored 76.5/100 in mechanical integrity, delivering strong hermetic sealability (score 7.0/10) and puncture resistance (score 7.5/10) to withstand distribution stress without pinholing.",
      "Sustainability & Economics: Achieves a composite sustainability rating of 65.0/100 (Low / Mixed) within a Moderate cost tier, balancing environmental circularity with industrial feasibility."
    ],
    "warnings": [],
    "disclaimer": "PackWise AI provides scientific decision support based on ASTM D3985 (OTR) and ASTM F1249 (WVTR) reference standards..."
  }
  ```

---

### 7. Admin Dashboard Summary
- **Endpoint:** `GET /api/admin/dashboard-summary`
- **Example cURL:**
  ```bash
  curl -X GET "http://localhost:8000/api/admin/dashboard-summary"
  ```
- **Sample Response (200 OK):**
  ```json
  {
    "total_commodities": 12,
    "total_materials": 11,
    "total_material_properties": 11,
    "total_active_rules": 6,
    "total_recommendations": 0,
    "total_traceability_batches": 0,
    "food_grade_compliance_rate": 100.0,
    "system_status": "Operational",
    "database_type": "SQLite",
    "supported_categories": [
      "Fresh Produce",
      "Dry Crisp Foods",
      "High-Fat Snacks",
      "Powders & Grains",
      "Perishable Dairy",
      "Frozen Foods"
    ],
    "polymer_families": [
      "Polyolefin",
      "Polyester",
      "Barrier Film",
      "Multilayer Foil Laminate",
      "Paper Composite",
      "Biopolymer",
      "Engineered Breathable Film",
      "Recyclable Barrier Laminate"
    ]
  }
  ```

---

## 🧪 Running Automated Tests

Run the full pytest suite:

```bash
# From workspace root
python -m pytest backend/app/tests -v

# Or from backend directory
cd backend
python -m pytest app/tests -v
```

All tests execute in-memory against an isolated SQLite test database with automated schema creation and seeding fixtures.

---

## 🛡️ Scientific Decision Support Disclaimer

> **Academic & Decision Support Notice:** PackWise AI provides scientific engineering decision support and indicative baseline calculations based on standard polymer physics and ASTM reference literature (ASTM D3985 for OTR, ASTM F1249 for WVTR). Values are reference standard figures for rapid design iterations and educational purposes. Commercial production requires physical laboratory shelf-life and barrier testing under actual storage conditions.
