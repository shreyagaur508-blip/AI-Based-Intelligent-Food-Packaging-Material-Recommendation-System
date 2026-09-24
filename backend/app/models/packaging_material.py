"""PackagingMaterial ORM model."""

from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class PackagingMaterial(Base):
    """Packaging material specification and barrier baseline entity."""

    __tablename__ = "packaging_materials"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(120), unique=True, index=True, nullable=False)
    material_type = Column(String(60), nullable=False, index=True)
    structure = Column(String(100), nullable=False)
    food_grade_compliant = Column(Boolean, default=True, nullable=False)
    recyclability_level = Column(String(50), nullable=False)
    biodegradability_level = Column(String(60), nullable=False)
    cost_level = Column(String(30), nullable=False)
    sealability_score = Column(Float, nullable=False)
    mechanical_strength_score = Column(Float, nullable=False)
    puncture_resistance_score = Column(Float, nullable=False)
    transparency = Column(String(50), nullable=False)
    printability = Column(String(50), nullable=False)
    map_compatible = Column(Boolean, default=True, nullable=False)
    microperforation_supported = Column(Boolean, default=False, nullable=False)
    description = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship to physical properties tested under ASTM standards
    properties = relationship(
        "MaterialProperty",
        back_populates="material",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<PackagingMaterial(id={self.id}, name='{self.name}', type='{self.material_type}')>"
