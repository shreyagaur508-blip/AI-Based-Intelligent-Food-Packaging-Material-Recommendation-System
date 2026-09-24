"""TraceabilityBatch ORM model."""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class TraceabilityBatch(Base):
    """Food package batch traceability and compliance provenance record."""

    __tablename__ = "traceability_batches"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    batch_code = Column(String(60), unique=True, index=True, nullable=False)
    commodity_id = Column(
        Integer,
        ForeignKey("commodities.id", ondelete="SET NULL"),
        nullable=True,
    )
    material_id = Column(
        Integer,
        ForeignKey("packaging_materials.id", ondelete="SET NULL"),
        nullable=True,
    )
    production_date = Column(DateTime, nullable=True)
    packager_name = Column(String(100), nullable=True)
    destination_market = Column(String(100), nullable=True)
    status = Column(String(30), default="ACTIVE", nullable=False)
    qr_payload = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    commodity = relationship("Commodity")
    material = relationship("PackagingMaterial")

    def __repr__(self) -> str:
        return f"<TraceabilityBatch(batch_code='{self.batch_code}', status='{self.status}')>"
