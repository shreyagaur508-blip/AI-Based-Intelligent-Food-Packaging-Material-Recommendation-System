# PackWise AI — Phased Engineering Build Plan (Phases 1–8)

This document establishes the step-by-step engineering roadmap for building **PackWise AI — Intelligent Food Packaging Material Recommendation System**.

---

## 🗺️ Master Roadmap Summary

```mermaid
gantt
    title PackWise AI Engineering Roadmap
    dateFormat  YYYY-MM-DD
    section Backend & Core Engine
    Phase 1: Blueprint & Architecture       :done, p1, 2026-09-23, 1d
    Phase 2: Database Models & Seeding      :active, p2, after p1, 2d
    Phase 3: Core Rule-Based Decision Engine: p3, after p2, 2d
    Phase 4: FastAPI REST Service Layer     : p4, after p3, 2d
    section Frontend & UI/UX
    Phase 5: Design System & Components     : p5, after p4, 2d
    Phase 6: Recommendation Wizard & Results: p6, after p5, 3d
    Phase 7: Materials Catalog & Comparison : p7, after p6, 2d
    section Quality & Scaffolding
    Phase 8: E2E Testing, ML Hook & Polish  : p8, after p7, 2d
```

---

## 📋 Detailed Phase Breakdown

### 🔹 Phase 1: Blueprint, Architecture & Technical Specifications (Current)
- **Objective:** Establish clean directory layout, comprehensive technical documentation, data models, API schemas, and phased execution roadmap.
- **Key Deliverables:**
  - `README.md` (Project overview, quickstart, domain standards, disclaimer)
  - `docs/architecture.md` (System design, ERD, recommendation pipeline, API specs, frontend architecture)
  - `docs/build-plan.md` (Phases 1–8 roadmap and milestone breakdown)
  - `.gitignore` (Python, Node, SQLite, OS, IDE exclusions)
  - `.env.example` (Backend and frontend configuration template)
- **Verification:** User approval of Phase 1 architecture and roadmap before initiating code implementation.

---

### 🔹 Phase 2: Database Schema, ORM Models & Scientific Data Seeding
- **Objective:** Create the SQLAlchemy database layer, migration scripts, and seed accurate data for all 12 initial commodities and 11 packaging materials with standardized ASTM barrier measurements.
- **Key Tasks:**
  1. Set up backend Python virtual environment and `requirements.txt` (`fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`, `pytest`, `httpx`).
  2. Implement SQLAlchemy declarative models: `Commodity`, `Material`, `PackagingStructure`, `RuleHeuristic`, `RecommendationLog`.
  3. Create JSON seed datasets:
     - `backend/app/db/seed/commodities.json`: 12 commodities (Banana, Tomato, Mango, Leafy vegetables, Potato chips, Biscuits, Roasted nuts, Milk powder, Rice, Wheat flour, Paneer, Frozen peas).
     - `backend/app/db/seed/materials.json`: 11 packaging materials (LDPE, HDPE, PP, PET, BOPP, Met-PET, Alu Foil Laminate, Paper/PE, PLA, Micro-perforated film, PET/EVOH/PE recyclable).
  4. Write `seed_data.py` script to populate the SQLite database.
- **Verification:** Database initializes cleanly and queries return complete ASTM test conditions and commodity respiration parameters.

---

### 🔹 Phase 3: Core Rule-Based Recommendation Engine
- **Objective:** Develop the deterministic 5-stage recommendation engine and Multi-Criteria Decision Analysis (MCDA) scoring system in pure Python.
- **Key Tasks:**
  1. **Commodity Profiler:** Assess storage temperature and relative humidity differentials against optimal product storage limits.
  2. **Barrier Risk Formulator:** Calculate critical target thresholds for $OTR_{\text{max}}$, $WVTR_{\text{max}}$, light barrier, and cold flex crack requirements.
  3. **Hard Constraint Eliminator:**
     - Enforce Food-Grade compliance (`food_grade_certified == True`).
     - Fresh produce anoxia filter (eliminate impermeable barriers without micro-perforations).
     - Moisture sensitivity filter (eliminate high WVTR materials for crisp dry goods).
     - Lipid oxidation filter (eliminate high OTR materials for nuts, chips, milk powder).
     - Sub-zero brittleness filter (eliminate cracking polymers for frozen peas).
  4. **MCDA Scorer:** Implement weighted scoring for Barrier Match, Sustainability/Recyclability, Cost Tier, and Mechanical/Seal Integrity.
  5. **Explainability Engine:** Generate structured scientific reasoning for primary pick, alternative choices, and detailed rejection reasons for disqualified materials.
- **Verification:** Write unit tests (`tests/test_engine.py`) covering fresh produce, high-fat snacks, dry powders, perishable paneer, and frozen vegetables.

---

### 🔹 Phase 4: FastAPI REST Service Layer & API Endpoints
- **Objective:** Expose the recommendation engine and knowledge database through high-performance, validated REST endpoints.
- **Key Tasks:**
  1. Build Pydantic v2 schemas for all request payloads and response models with strict typing and validations.
  2. Implement REST routers:
     - `/api/v1/commodities` (List, Get by ID)
     - `/api/v1/materials` (List, Get by ID, Filter by polymer/barrier)
     - `/api/v1/recommendations/analyze` (Main recommendation pipeline)
     - `/api/v1/shelf-life/estimate` (Storage kinetic shelf-life hook)
     - `/api/v1/health` & `/api/v1/rules`
  3. Implement global exception handlers and CORS middleware.
- **Verification:** Automated API integration tests (`tests/test_api.py`) verifying 200 OK responses, input validation errors (422), and response formats.

---

### 🔹 Phase 5: Frontend Design System & Component Library
- **Objective:** Set up a clean, modern React 18 + Vite application with Tailwind CSS, custom design tokens, and reusable UI components.
- **Key Tasks:**
  1. Initialize React + Vite frontend and configure Tailwind CSS.
  2. Establish color palette (Emerald green eco accents, Slate/Indigo dark & light themes, modern cards with subtle glassmorphism).
  3. Build atomic UI components:
     - `Button`, `Card`, `Badge`, `Slider`, `Select`, `Modal`, `Tooltip`, `Alert`.
  4. Create responsive `Navbar`, `Footer`, and `DisclaimerBanner`.
  5. Configure client-side routing with React Router.
- **Verification:** Frontend compiles cleanly, responsiveness tested across desktop and mobile viewports.

---

### 🔹 Phase 6: Interactive Recommendation Wizard & Results Dashboard
- **Objective:** Build the core user experience: a multi-step guided recommendation wizard and rich visualization dashboard.
- **Key Tasks:**
  1. **Wizard Step 1 — Commodity Selection:** Searchable commodity selector with degradation badges, custom food attribute toggle.
  2. **Wizard Step 2 — Storage & Shelf-Life Input:** Interactive sliders for Temperature (°C), RH (%), Target Shelf Life (days), and Packaging Format.
  3. **Wizard Step 3 — Priority & Weights Customizer:** Select priority profile (*Balanced*, *Eco-First*, *Cost-First*, *Max Protection*) or customize weights.
  4. **Results Dashboard:**
     - Primary Recommendation Hero Card (Material name, recommended thickness, cost tier, sustainability badge, MAP advice).
     - Radar Comparison Chart (Recharts comparing Barrier, Recyclability, Cost, Strength against ideal baseline).
     - Alternative Recommendations Cards (Eco Choice, Budget Pick, Extended Shelf-Life Choice).
     - Disqualified Materials Inspector (Collapsible table with exact scientific rejection rationale).
     - Human-Readable Scientific Explanation Accordion.
     - Specification Export (Printable / PDF summary).
- **Verification:** End-to-end user workflow tested with realistic scenarios (e.g. Banana vs Potato Chips vs Frozen Peas).

---

### 🔹 Phase 7: Materials Catalog, Commodity Knowledge Base & Comparison Tool
- **Objective:** Provide self-service research tools for packaging engineers and students.
- **Key Tasks:**
  1. **Materials Catalog (`/materials`):** Filterable, searchable table displaying ASTM barrier data, polymer structure, cost index, and recycling codes. Material detail drawer with full ASTM test conditions.
  2. **Commodity Knowledge Base (`/commodities`):** Interactive library explaining degradation kinetics, respiration rates, critical water activity thresholds, and recommended MAP atmospheres.
  3. **Side-by-Side Comparison Tool (`/compare`):** Multi-material comparison table and superimposed radar chart for up to 4 selected materials.
  4. **Methodology & Science Page (`/methodology`):** Detailed breakdown of ASTM standards (D3985, F1249), scoring formulas, and decision-support disclaimer.
- **Verification:** Navigation between pages is seamless; filters and comparison tools function without layout shifts or bugs.

---

### 🔹 Phase 8: Integration, Testing, Future ML Scaffolding & Final Polish
- **Objective:** Conduct end-to-end verification, add future ML shelf-life scaffolding, optimize performance, and finalize documentation.
- **Key Tasks:**
  1. End-to-end testing across backend and frontend.
  2. Scikit-learn shelf-life baseline module scaffolding (`backend/app/core/ml_shelflife.py`).
  3. Comprehensive error boundary and loading states in the frontend.
  4. Build optimization and production bundle validation.
  5. Final walkthrough documentation and user demonstration guide.
- **Verification:** Zero console errors, all test suites passing, and clean demo flow.

---

## 🛡️ Risk Management & Mitigation

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| Inaccurate barrier units or missing test conditions | High | Standardize all database records to ASTM D3985 (OTR) and ASTM F1249 (WVTR) with explicit temperature and RH fields. |
| Inappropriate produce packaging recommendation (anaerobic spoilage) | Critical | Enforce strict rule-based gatekeeping that rejects hermetic barriers for fresh produce unless micro-perforated. |
| Black-box / unexplainable scoring | Medium | Build deterministic explainability engine that explicitly outputs rule triggers and scoring sub-components. |
| Misinterpretation as commercial certification | High | Prominently display the scientific decision-support disclaimer across the UI, reports, and API responses. |
