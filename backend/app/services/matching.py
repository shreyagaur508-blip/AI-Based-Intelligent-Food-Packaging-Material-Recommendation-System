import json
from typing import Dict, List, Tuple
from app.models import UserSkill, Skill

def calculate_skill_match(student_skills: Dict[str, int], required_skills: Dict[str, int]) -> Tuple[float, List[dict]]:
    """
    Computes weighted skill match index (0 - 100%) and identifies specific skill gaps.
    student_skills: {"Python": 4, "SQL": 3}
    required_skills: {"Python": 5, "Machine Learning": 4}
    """
    if not required_skills:
        return 100.0, []

    total_weight = 0
    earned_weight = 0
    gaps = []

    for req_skill, req_level in required_skills.items():
        total_weight += req_level
        student_level = student_skills.get(req_skill, 0)
        
        # Credit given up to the required level
        earned = min(student_level, req_level)
        earned_weight += earned

        if student_level < req_level:
            gap_diff = req_level - student_level
            gaps.append({
                "skill_name": req_skill,
                "category": "Required",
                "current_level": student_level,
                "required_level": req_level,
                "gap": gap_diff,
                "status": "Critical Gap" if gap_diff >= 2 else "Moderate Gap"
            })

    match_percentage = round((earned_weight / total_weight) * 100, 1) if total_weight > 0 else 100.0
    return match_percentage, gaps

def calculate_radar_scores(user_skills: List[Tuple[Skill, UserSkill]]) -> dict:
    """
    Groups skills by category and returns average score for Radar Chart visualization.
    """
    categories = ["Technical", "Soft", "Domain", "Ayush & Health", "Management"]
    cat_scores = {c: [] for c in categories}

    for skill, u_skill in user_skills:
        cat = skill.category if skill.category in cat_scores else "Technical"
        cat_scores[cat].append(u_skill.proficiency_level)

    student_scores = []
    benchmark_scores = []

    for cat in categories:
        scores = cat_scores[cat]
        avg = sum(scores) / len(scores) if scores else 1.0
        student_scores.append(round(avg, 1))
        benchmark_scores.append(4.0)  # Standard industry benchmark

    return {
        "categories": categories,
        "student_scores": student_scores,
        "benchmark_scores": benchmark_scores
    }
