"""MaterialProperty ORM model."""

from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class MaterialProperty(Base):
    """Standardized ASTM barrier and physical property measurements."""

    __tablename__ = "material_properties"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    material_id = Column(
        Integer,
        ForeignKey("packaging_materials.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    test_temperature_celsius = Column(Float, default=23.0, nullable=False)
    relative_humidity_percent = Column(Float, default=0.0, nullable=False)
    otr_value = Column(Float, nullable=False)
    otr_unit = Column(String(50), default="cm3/(m2.24h.atm)", nullable=False)
    wvtr_value = Column(Float, nullable=False)
    wvtr_unit = Column(String(50), default="g/(m2.24h)", nullable=False)
    thickness_microns = Column(Float, nullable=False)
    co2_transmission_rate = Column(Float, nullable=True)
    tensile_strength = Column(Float, nullable=True)
    seal_temperature_min = Column(Float, nullable=True)
    seal_temperature_max = Column(Float, nullable=True)
    test_condition_notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to parent material
    material = relationship("PackagingMaterial", back_populates="properties")

    def __repr__(self) -> str:
        return f"<MaterialProperty(id={self.id}, material_id={self.material_id}, OTR={self.otr_value}, WVTR={self.wvtr_value})>"
