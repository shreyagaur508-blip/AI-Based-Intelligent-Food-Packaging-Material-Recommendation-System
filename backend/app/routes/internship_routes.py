from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
import json
from app.database import get_session
from app.models import User, Internship, Application, Skill, UserSkill
from app.schemas import InternshipCreate, InternshipResponse, ApplicationCreate, ApplicationResponse
from app.auth import get_current_user, get_current_user_optional, require_roles
from app.services.matching import calculate_skill_match

router = APIRouter(prefix="/api/internships", tags=["Internships & Applications"])

@router.get("", response_model=List[InternshipResponse])
def list_internships(
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: Session = Depends(get_session)
):
    internships = session.exec(select(Internship).where(Internship.is_active == True)).all()
    
    # Get student skills if student
    student_skills_map = {}
    if current_user and current_user.role == "student":
        statement = select(Skill, UserSkill).where(
            UserSkill.user_id == current_user.id,
            UserSkill.skill_id == Skill.id
        )
        u_skills = session.exec(statement).all()
        student_skills_map = {skill.name: us.proficiency_level for skill, us in u_skills}

    result = []
    for i in internships:
        try:
            req_skills = json.loads(i.required_skills_json)
        except Exception:
            req_skills = {}

        match_pct = None
        if current_user and current_user.role == "student":
            match_pct, _ = calculate_skill_match(student_skills_map, req_skills)

        result.append(InternshipResponse(
            id=i.id,
            company_id=i.company_id,
            company_name=i.company_name,
            title=i.title,
            description=i.description,
            required_skills=req_skills,
            location=i.location,
            stipend=i.stipend,
            type=i.type,
            duration=i.duration,
            is_active=i.is_active,
            posted_at=i.posted_at,
            match_score=match_pct
        ))

    # Sort student view by highest match score
    if current_user and current_user.role == "student":
        result.sort(key=lambda x: x.match_score or 0.0, reverse=True)

    return result

@router.post("", response_model=InternshipResponse)
def post_internship(
    data: InternshipCreate,
    current_user: User = Depends(require_roles(["industry", "admin"])),
    session: Session = Depends(get_session)
):
    new_internship = Internship(
        company_id=current_user.id,
        company_name=current_user.institution_or_company or current_user.full_name,
        title=data.title,
        description=data.description,
        required_skills_json=json.dumps(data.required_skills),
        location=data.location or "Remote",
        stipend=data.stipend or "₹10,000/month",
        type=data.type or "Internship",
        duration=data.duration or "3 Months"
    )
    session.add(new_internship)
    session.commit()
    session.refresh(new_internship)

    return InternshipResponse(
        id=new_internship.id,
        company_id=new_internship.company_id,
        company_name=new_internship.company_name,
        title=new_internship.title,
        description=new_internship.description,
        required_skills=data.required_skills,
        location=new_internship.location,
        stipend=new_internship.stipend,
        type=new_internship.type,
        duration=new_internship.duration,
        is_active=new_internship.is_active,
        posted_at=new_internship.posted_at
    )

@router.post("/apply", response_model=ApplicationResponse)
def apply_for_internship(
    payload: ApplicationCreate,
    current_user: User = Depends(require_roles(["student"])),
    session: Session = Depends(get_session)
):
    internship = session.get(Internship, payload.internship_id)
    if not internship or not internship.is_active:
        raise HTTPException(status_code=404, detail="Internship listing not found or inactive")

    # Check existing application
    statement = select(Application).where(
        Application.student_id == current_user.id,
        Application.internship_id == payload.internship_id
    )
    existing = session.exec(statement).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this position")

    # Calculate match score
    statement_skills = select(Skill, UserSkill).where(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_id == Skill.id
    )
    u_skills = session.exec(statement_skills).all()
    student_skills_map = {skill.name: us.proficiency_level for skill, us in u_skills}

    try:
        req_skills = json.loads(internship.required_skills_json)
    except Exception:
        req_skills = {}

    match_pct, _ = calculate_skill_match(student_skills_map, req_skills)

    app_record = Application(
        internship_id=internship.id,
        student_id=current_user.id,
        status="applied",
        match_score=match_pct
    )
    session.add(app_record)
    session.commit()
    session.refresh(app_record)

    return ApplicationResponse(
        id=app_record.id,
        internship_id=internship.id,
        internship_title=internship.title,
        company_name=internship.company_name,
        student_id=current_user.id,
        student_name=current_user.full_name,
        student_email=current_user.email,
        status=app_record.status,
        match_score=app_record.match_score,
        applied_at=app_record.applied_at
    )

@router.get("/applications/my", response_model=List[ApplicationResponse])
def get_my_applications(
    current_user: User = Depends(require_roles(["student"])),
    session: Session = Depends(get_session)
):
    statement = select(Application, Internship).where(
        Application.student_id == current_user.id,
        Application.internship_id == Internship.id
    )
    results = session.exec(statement).all()

    output = []
    for app_rec, internship in results:
        output.append(ApplicationResponse(
            id=app_rec.id,
            internship_id=internship.id,
            internship_title=internship.title,
            company_name=internship.company_name,
            student_id=current_user.id,
            student_name=current_user.full_name,
            student_email=current_user.email,
            status=app_rec.status,
            match_score=app_rec.match_score,
            applied_at=app_rec.applied_at
        ))
    return output

@router.get("/applications/company", response_model=List[ApplicationResponse])
def get_company_applicants(
    current_user: User = Depends(require_roles(["industry", "admin"])),
    session: Session = Depends(get_session)
):
    statement = select(Application, Internship, User).where(
        Internship.company_id == current_user.id,
        Application.internship_id == Internship.id,
        Application.student_id == User.id
    )
    results = session.exec(statement).all()

    output = []
    for app_rec, internship, student in results:
        output.append(ApplicationResponse(
            id=app_rec.id,
            internship_id=internship.id,
            internship_title=internship.title,
            company_name=internship.company_name,
            student_id=student.id,
            student_name=student.full_name,
            student_email=student.email,
            status=app_rec.status,
            match_score=app_rec.match_score,
            applied_at=app_rec.applied_at
        ))
    
    output.sort(key=lambda x: x.match_score, reverse=True)
    return output

@router.patch("/applications/{application_id}/status")
def update_application_status(
    application_id: int,
    status_value: str,
    current_user: User = Depends(require_roles(["industry", "admin"])),
    session: Session = Depends(get_session)
):
    app_record = session.get(Application, application_id)
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")

    valid_statuses = ["applied", "shortlisted", "hired", "rejected"]
    if status_value not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    app_record.status = status_value
    session.add(app_record)
    session.commit()
    return {"message": f"Application status updated to {status_value}"}
