from sqlmodel import Session, select
import json
from app.database import engine, create_db_and_tables
from app.models import User, Skill, UserSkill, Internship, Application, CurriculumRecommendation
from app.auth import get_password_hash

def seed_database():
    create_db_and_tables()
    with Session(engine) as session:
        # Check if already seeded
        if session.exec(select(User)).first():
            print("Database already contains data. Skipping seed.")
            return

        print("Seeding initial data for SIH26044 SkillBridge Portal...")

        # 1. Create Users for all 4 roles
        users_data = [
            {
                "email": "student@demo.com",
                "password_hash": get_password_hash("password123"),
                "role": "student",
                "full_name": "Aarav Sharma",
                "institution_or_company": "Delhi Technological University",
                "department_or_field": "Computer Science & Bio-Tech",
                "bio": "Enthusiastic 3rd year B.Tech student specializing in AI, Data Science, and Botanical Data Modeling."
            },
            {
                "email": "industry@demo.com",
                "password_hash": get_password_hash("password123"),
                "role": "industry",
                "full_name": "Dr. Rajesh Varma",
                "institution_or_company": "Dabur Ayush Research & Tech",
                "department_or_field": "Head of Talent Acquisition & R&D",
                "bio": "Leading innovation in natural formulation tech and AI-assisted bio-analytics."
            },
            {
                "email": "academia@demo.com",
                "password_hash": get_password_hash("password123"),
                "role": "academia",
                "full_name": "Prof. Sunita Rao",
                "institution_or_company": "IIT Delhi",
                "department_or_field": "Department of Interdisciplinary Sciences & Engineering",
                "bio": "Dean of Academic Partnerships and Industry Collaboration."
            },
            {
                "email": "admin@demo.com",
                "password_hash": get_password_hash("password123"),
                "role": "admin",
                "full_name": "Portal Administrator",
                "institution_or_company": "Ministry of Ayush / SIH",
                "department_or_field": "National Skill Mapping Council",
                "bio": "Overseeing national academia-industry collaboration initiatives."
            }
        ]

        created_users = []
        for u in users_data:
            user_obj = User(**u)
            session.add(user_obj)
            created_users.append(user_obj)

        session.commit()
        for u in created_users:
            session.refresh(u)

        student_user = created_users[0]
        industry_user = created_users[1]

        # 2. Create Skills Catalog
        skills_data = [
            {"name": "Python & FastAPI", "category": "Technical", "description": "Backend API development using Python"},
            {"name": "Machine Learning & AI", "category": "Technical", "description": "Predictive modeling, scikit-learn, PyTorch"},
            {"name": "React.js & Web UI", "category": "Technical", "description": "Modern frontend single page applications"},
            {"name": "SQL & Data Modeling", "category": "Technical", "description": "Relational database design and queries"},
            {"name": "Phytochemistry & Herbal Extraction", "category": "Ayush", "description": "Analysis of botanical active compounds"},
            {"name": "Good Manufacturing Practice (GMP)", "category": "Ayush", "description": "Quality assurance and safety standards"},
            {"name": "Quality Control & Standardization", "category": "Ayush", "description": "Ayush drug and compound testing"},
            {"name": "Communication & Pitching", "category": "Soft", "description": "Effective verbal, presentation, and team skills"},
            {"name": "Agile & Project Management", "category": "Management", "description": "Scrum methodology and execution"}
        ]

        created_skills = {}
        for s in skills_data:
            skill_obj = Skill(**s)
            session.add(skill_obj)
            session.commit()
            session.refresh(skill_obj)
            created_skills[skill_obj.name] = skill_obj

        # 3. Assess Student Skills
        student_skills_levels = {
            "Python & FastAPI": 4,
            "Machine Learning & AI": 3,
            "React.js & Web UI": 4,
            "SQL & Data Modeling": 3,
            "Phytochemistry & Herbal Extraction": 2,
            "Good Manufacturing Practice (GMP)": 1,
            "Quality Control & Standardization": 2,
            "Communication & Pitching": 4,
            "Agile & Project Management": 3
        }

        for s_name, level in student_skills_levels.items():
            if s_name in created_skills:
                u_skill = UserSkill(
                    user_id=student_user.id,
                    skill_id=created_skills[s_name].id,
                    proficiency_level=level,
                    is_verified=(level >= 3),
                    verified_by_company="IIT Delhi Assessment" if level >= 3 else None
                )
                session.add(u_skill)

        # 4. Create Internships
        internships_data = [
            {
                "company_id": industry_user.id,
                "company_name": "Dabur Ayush R&D",
                "title": "AI & Herbal Formulation Data Analyst Intern",
                "description": "Work with our R&D team to analyze phytochemistry datasets using Python and Machine Learning to optimize natural formulation stability.",
                "required_skills_json": json.dumps({
                    "Python & FastAPI": 4,
                    "Machine Learning & AI": 3,
                    "Phytochemistry & Herbal Extraction": 2,
                    "SQL & Data Modeling": 3
                }),
                "location": "New Delhi / Hybrid",
                "stipend": "₹25,000/month",
                "type": "Internship",
                "duration": "6 Months"
            },
            {
                "company_id": industry_user.id,
                "company_name": "Dabur Ayush R&D",
                "title": "Full-Stack Web Developer - Clinical Trial Portal",
                "description": "Build responsive React dashboard for monitoring nationwide botanical clinical trials and student research submissions.",
                "required_skills_json": json.dumps({
                    "React.js & Web UI": 4,
                    "Python & FastAPI": 3,
                    "SQL & Data Modeling": 3,
                    "Communication & Pitching": 3
                }),
                "location": "Remote",
                "stipend": "₹20,000/month",
                "type": "Internship",
                "duration": "3 Months"
            },
            {
                "company_id": industry_user.id,
                "company_name": "BioHealth Analytics",
                "title": "Ayush Quality Control & Standards Research Associate",
                "description": "Assess formulation purity metrics according to Ministry of Ayush regulatory compliance guidelines.",
                "required_skills_json": json.dumps({
                    "Good Manufacturing Practice (GMP)": 4,
                    "Quality Control & Standardization": 4,
                    "Phytochemistry & Herbal Extraction": 3
                }),
                "location": "Bangalore",
                "stipend": "₹30,000/month",
                "type": "Full-Time",
                "duration": "Permanent"
            }
        ]

        created_internships = []
        for i_data in internships_data:
            i_obj = Internship(**i_data)
            session.add(i_obj)
            created_internships.append(i_obj)

        session.commit()

        # 5. Create Applications
        for i_obj in created_internships[:2]:
            session.refresh(i_obj)
            app_obj = Application(
                internship_id=i_obj.id,
                student_id=student_user.id,
                status="shortlisted" if i_obj.id == 1 else "applied",
                match_score=92.5 if i_obj.id == 1 else 87.5
            )
            session.add(app_obj)

        # 6. Create Curriculum Recommendations
        recs_data = [
            {
                "institution_name": "IIT Delhi",
                "department": "Biotechnology & Bio-informatics",
                "missing_skill_name": "Good Manufacturing Practice (GMP)",
                "industry_demand_count": 18,
                "gap_severity": "High",
                "suggested_action": "Introduce a 2-credit mandatory certification module on GMP and regulatory compliance standards in collaboration with Ministry of Ayush."
            },
            {
                "institution_name": "Delhi Technological University",
                "department": "Computer Science & Engineering",
                "missing_skill_name": "FastAPI & Microservices Architecture",
                "industry_demand_count": 24,
                "gap_severity": "Medium",
                "suggested_action": "Update Web Engineering lab syllabus to include async Python APIs and Docker deployment."
            }
        ]

        for r in recs_data:
            session.add(CurriculumRecommendation(**r))

        session.commit()
        print("Database seeded successfully with demo users, skills, internships, and applications!")

if __name__ == "__main__":
    seed_database()
