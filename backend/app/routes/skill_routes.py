from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.database import get_session
from app.models import User, Skill, UserSkill, Internship
from app.schemas import (
    SkillAssessmentSubmission, UserSkillResponse, SkillRadarResponse, 
    SkillGapAnalysisResponse, SkillGapItem
)
from app.auth import get_current_user, require_roles
from app.services.matching import calculate_radar_scores, calculate_skill_match
import json

router = APIRouter(prefix="/api/skills", tags=["Skills"])

@router.get("/catalog", response_model=List[Skill])
def get_skills_catalog(session: Session = Depends(get_session)):
    statement = select(Skill)
    return session.exec(statement).all()

@router.get("/my-skills", response_model=List[UserSkillResponse])
def get_my_skills(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(Skill, UserSkill).where(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_id == Skill.id
    )
    results = session.exec(statement).all()
    
    response = []
    for skill, u_skill in results:
        response.append(UserSkillResponse(
            skill_id=skill.id,
            skill_name=skill.name,
            category=skill.category,
            proficiency_level=u_skill.proficiency_level,
            verified_level=u_skill.verified_level,
            is_verified=u_skill.is_verified
        ))
    return response

@router.post("/assess")
def submit_skill_assessment(
    submission: SkillAssessmentSubmission,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    for item in submission.assessments:
        if item.proficiency_level < 1 or item.proficiency_level > 5:
            raise HTTPException(status_code=400, detail=f"Proficiency level for skill {item.skill_id} must be 1-5")
        
        statement = select(UserSkill).where(
            UserSkill.user_id == current_user.id,
            UserSkill.skill_id == item.skill_id
        )
        existing = session.exec(statement).first()
        if existing:
            existing.proficiency_level = item.proficiency_level
            session.add(existing)
        else:
            new_u_skill = UserSkill(
                user_id=current_user.id,
                skill_id=item.skill_id,
                proficiency_level=item.proficiency_level
            )
            session.add(new_u_skill)
    session.commit()
    return {"message": "Skill assessment recorded successfully"}

@router.get("/radar", response_model=SkillRadarResponse)
def get_skill_radar(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(Skill, UserSkill).where(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_id == Skill.id
    )
    user_skills = session.exec(statement).all()
    radar_data = calculate_radar_scores(user_skills)
    return SkillRadarResponse(**radar_data)

@router.get("/gap-analysis", response_model=SkillGapAnalysisResponse)
def get_skill_gap_analysis(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Fetch user's current skills map
    statement = select(Skill, UserSkill).where(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_id == Skill.id
    )
    user_skills_raw = session.exec(statement).all()
    student_skills_map = {skill.name: u_skill.proficiency_level for skill, u_skill in user_skills_raw}

    # Compare against active internships to synthesize industry standard
    internships = session.exec(select(Internship).where(Internship.is_active == True)).all()
    
    industry_requirements = {}
    for i in internships:
        try:
            req_dict = json.loads(i.required_skills_json)
            for s_name, level in req_dict.items():
                industry_requirements[s_name] = max(industry_requirements.get(s_name, 0), level)
        except Exception:
            pass

    overall_score, gaps_list = calculate_skill_match(student_skills_map, industry_requirements)
    
    gaps_response = [
        SkillGapItem(
            skill_name=g["skill_name"],
            category=g["category"],
            current_level=g["current_level"],
            required_level=g["required_level"],
            gap=g["gap"],
            status=g["status"]
        ) for g in gaps_list
    ]

    recommendations = [
        f"Complete '{g['skill_name']}' Masterclass to boost proficiency to level {g['required_level']}"
        for g in gaps_list[:3]
    ]

    return SkillGapAnalysisResponse(
        overall_match_score=overall_score,
        gaps=gaps_response,
        recommended_courses=recommendations if recommendations else ["Your profile matches top industry benchmarks!"]
    )
