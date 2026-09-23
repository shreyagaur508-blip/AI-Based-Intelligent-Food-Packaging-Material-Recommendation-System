from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import json

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    role: str = Field(description="student | industry | academia | admin")
    full_name: str
    institution_or_company: Optional[str] = None
    department_or_field: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Skill(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    category: str = Field(default="Technical", description="Technical | Soft | Domain | Ayush | Management")
    description: Optional[str] = None

class UserSkill(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    skill_id: int = Field(foreign_key="skill.id", index=True)
    proficiency_level: int = Field(default=1, description="1 to 5 rating scale")
    verified_level: int = Field(default=0)
    is_verified: bool = Field(default=False)
    verified_by_company: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Internship(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    company_id: int = Field(foreign_key="user.id", index=True)
    company_name: str
    title: str
    description: str
    required_skills_json: str = Field(default="{}", description="JSON map of skill_name: min_level")
    location: str = Field(default="Remote")
    stipend: str = Field(default="₹10,000/month")
    type: str = Field(default="Internship", description="Internship | Full-Time | Live Project")
    duration: str = Field(default="3 Months")
    is_active: bool = Field(default=True)
    posted_at: datetime = Field(default_factory=datetime.utcnow)

class Application(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    internship_id: int = Field(foreign_key="internship.id", index=True)
    student_id: int = Field(foreign_key="user.id", index=True)
    status: str = Field(default="applied", description="applied | shortlisted | hired | rejected")
    match_score: float = Field(default=0.0)
    applied_at: datetime = Field(default_factory=datetime.utcnow)

class CurriculumRecommendation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    institution_name: str
    department: str
    missing_skill_name: str
    industry_demand_count: int = Field(default=1)
    gap_severity: str = Field(default="High")
    suggested_action: str
