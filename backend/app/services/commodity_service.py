"""Commodity data access and query services."""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_
from app.models.commodity import Commodity
from app.schemas.commodity import CommodityCreate, CommodityUpdate


class CommodityService:
    """Service providing query operations for food commodities."""

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Commodity]:
        """Fetch all commodities with optional category and search filtering."""
        query = select(Commodity)

        if category:
            query = query.where(func.lower(Commodity.category) == category.lower())

        if search:
            search_pattern = f"%{search.lower()}%"
            query = query.where(
                or_(
                    func.lower(Commodity.name).like(search_pattern),
                    func.lower(Commodity.category).like(search_pattern),
                    func.lower(Commodity.notes).like(search_pattern),
                )
            )

        query = query.order_by(Commodity.id.asc()).offset(skip).limit(limit)
        result = db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    def count(
        db: Session,
        category: Optional[str] = None,
        search: Optional[str] = None,
    ) -> int:
        """Count total matching commodities."""
        query = select(func.count(Commodity.id))

        if category:
            query = query.where(func.lower(Commodity.category) == category.lower())

        if search:
            search_pattern = f"%{search.lower()}%"
            query = query.where(
                or_(
                    func.lower(Commodity.name).like(search_pattern),
                    func.lower(Commodity.category).like(search_pattern),
                )
            )

        result = db.execute(query)
        return result.scalar_one() or 0

    @staticmethod
    def get_by_id(db: Session, commodity_id: int) -> Optional[Commodity]:
        """Fetch single commodity by ID."""
        query = select(Commodity).where(Commodity.id == commodity_id)
        result = db.execute(query)
        return result.scalars().first()

    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[Commodity]:
        """Fetch single commodity by name."""
        query = select(Commodity).where(func.lower(Commodity.name) == name.lower())
        result = db.execute(query)
        return result.scalars().first()

    @staticmethod
    def create(db: Session, commodity_in: CommodityCreate) -> Commodity:
        """Create a new commodity record."""
        db_obj = Commodity(**commodity_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


commodity_service = CommodityService()
