from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str  # student | industry | academia | admin
    institution_or_company: Optional[str] = None
    department_or_field: Optional[str] = None
    bio: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str
    email: str

class UserProfile(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    institution_or_company: Optional[str]
    department_or_field: Optional[str]
    bio: Optional[str]
    created_at: datetime

class SkillAssessmentItem(BaseModel):
    skill_id: int
    proficiency_level: int  # 1-5

class SkillAssessmentSubmission(BaseModel):
    assessments: List[SkillAssessmentItem]

class UserSkillResponse(BaseModel):
    skill_id: int
    skill_name: str
    category: str
    proficiency_level: int
    verified_level: int
    is_verified: bool

class SkillRadarResponse(BaseModel):
    categories: List[str]
    student_scores: List[float]
    benchmark_scores: List[float]

class SkillGapItem(BaseModel):
    skill_name: str
    category: str
    current_level: int
    required_level: int
    gap: int
    status: str

class SkillGapAnalysisResponse(BaseModel):
    overall_match_score: float
    gaps: List[SkillGapItem]
    recommended_courses: List[str]

class InternshipCreate(BaseModel):
    title: str
    description: str
    required_skills: Dict[str, int]  # {"Python": 4, "SQL": 3}
    location: Optional[str] = "Remote"
    stipend: Optional[str] = "₹10,000/month"
    type: Optional[str] = "Internship"
    duration: Optional[str] = "3 Months"

class InternshipResponse(BaseModel):
    id: int
    company_id: int
    company_name: str
    title: str
    description: str
    required_skills: Dict[str, int]
    location: str
    stipend: str
    type: str
    duration: str
    is_active: bool
    posted_at: datetime
    match_score: Optional[float] = None

class ApplicationCreate(BaseModel):
    internship_id: int

class ApplicationResponse(BaseModel):
    id: int
    internship_id: int
    internship_title: str
    company_name: str
    student_id: int
    student_name: str
    student_email: str
    status: str
    match_score: float
    applied_at: datetime
