"""Recommendation ORM model."""

from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Recommendation(Base):
    """Historical recommendation log / evaluation session master record."""

    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    commodity_id = Column(
        Integer,
        ForeignKey("commodities.id", ondelete="SET NULL"),
        nullable=True,
    )
    session_id = Column(String(80), nullable=True, index=True)
    commodity_name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    storage_temperature = Column(Float, nullable=False)
    relative_humidity = Column(Float, nullable=False)
    target_shelf_life_days = Column(Integer, nullable=False)
    packaging_format = Column(String(80), nullable=True)
    priority_profile = Column(String(50), default="balanced", nullable=False)
    custom_notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    commodity = relationship("Commodity")
    items = relationship(
        "RecommendationItem",
        back_populates="recommendation",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Recommendation(id={self.id}, commodity='{self.commodity_name}', created_at='{self.created_at}')>"
