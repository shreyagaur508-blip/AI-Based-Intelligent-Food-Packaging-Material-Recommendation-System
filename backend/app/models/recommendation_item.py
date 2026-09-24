"""RecommendationItem ORM model."""

from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class RecommendationItem(Base):
    """Detailed score and match breakdown for a specific packaging material recommendation."""

    __tablename__ = "recommendation_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    recommendation_id = Column(
        Integer,
        ForeignKey("recommendations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    material_id = Column(
        Integer,
        ForeignKey("packaging_materials.id", ondelete="RESTRICT"),
        nullable=False,
    )
    rank = Column(Integer, nullable=False)
    recommendation_type = Column(
        String(40),
        nullable=False,
    )  # PRIMARY, ALTERNATIVE_ECO, ALTERNATIVE_BUDGET, ALTERNATIVE_HIGH_BARRIER, DISQUALIFIED
    total_score = Column(Float, nullable=False)
    barrier_score = Column(Float, nullable=True)
    sustainability_score = Column(Float, nullable=True)
    cost_score = Column(Float, nullable=True)
    mechanical_score = Column(Float, nullable=True)
    is_disqualified = Column(Boolean, default=False, nullable=False)
    disqualification_reason = Column(Text, nullable=True)
    scientific_explanation = Column(Text, nullable=True)

    # Relationships
    recommendation = relationship("Recommendation", back_populates="items")
    material = relationship("PackagingMaterial", lazy="selectin")

    def __repr__(self) -> str:
        return f"<RecommendationItem(id={self.id}, rec_id={self.recommendation_id}, rank={self.rank}, type='{self.recommendation_type}')>"
