"""RecommendationRule ORM model."""

from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, func
from app.db.base import Base


class RecommendationRule(Base):
    """Scientific gatekeeping heuristics and MCDA scoring rules."""

    __tablename__ = "recommendation_rules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rule_code = Column(String(60), unique=True, index=True, nullable=False)
    name = Column(String(120), nullable=False)
    category = Column(String(60), nullable=False, index=True)
    condition_description = Column(Text, nullable=False)
    action_type = Column(String(40), nullable=False)  # DISQUALIFY, PENALIZE, BOOST, REQUIRE_FEATURE
    priority = Column(Integer, default=1, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    explanation_template = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<RecommendationRule(code='{self.rule_code}', action='{self.action_type}', active={self.is_active})>"
