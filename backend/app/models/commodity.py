"""Commodity ORM model."""

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, func
from app.db.base import Base


class Commodity(Base):
    """Food commodity entity with intrinsic degradation and storage parameters."""

    __tablename__ = "commodities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    default_moisture_percent = Column(Float, nullable=False)
    oil_fat_level = Column(String(30), nullable=False)
    default_ph = Column(Float, nullable=False)
    respiration_class = Column(String(30), nullable=False)
    base_shelf_life_days = Column(Integer, nullable=False)
    recommended_storage_type = Column(String(50), nullable=False)
    minimum_storage_temperature = Column(Float, nullable=False)
    maximum_storage_temperature = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<Commodity(id={self.id}, name='{self.name}', category='{self.category}')>"
