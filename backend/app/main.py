from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_db_and_tables
from app.seed import seed_database
from app.routes.auth_routes import router as auth_router
from app.routes.skill_routes import router as skill_router
from app.routes.internship_routes import router as internship_router
from app.routes.analytics_routes import router as analytics_router

app = FastAPI(
    title="SkillBridge API - Academia Industry Collaboration Portal (SIH26044)",
    description="Backend API powering automated skill assessment, radar-chart gap analysis, internship matching, and curriculum alignment recommendations.",
    version="1.0.0"
)

# CORS setup for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    seed_database()

# Include routers
app.include_router(auth_router)
app.include_router(skill_router)
app.include_router(internship_router)
app.include_router(analytics_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "SkillBridge - Academia Industry Collaboration Portal",
        "sih_problem_statement": "SIH26044",
        "docs_url": "/docs"
    }
