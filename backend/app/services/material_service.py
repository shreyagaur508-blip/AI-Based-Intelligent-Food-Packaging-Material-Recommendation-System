"""Packaging material data access and query services."""

from typing import List, Optional
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, func, or_
from app.models.packaging_material import PackagingMaterial
from app.models.material_property import MaterialProperty
from app.schemas.packaging_material import PackagingMaterialCreate


class MaterialService:
    """Service providing query operations for packaging materials and ASTM properties."""

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        material_type: Optional[str] = None,
        cost_level: Optional[str] = None,
        food_grade_only: bool = False,
        search: Optional[str] = None,
    ) -> List[PackagingMaterial]:
        """Fetch all packaging materials with optional type, cost, and search filtering."""
        query = select(PackagingMaterial).options(selectinload(PackagingMaterial.properties))

        if material_type:
            query = query.where(func.lower(PackagingMaterial.material_type) == material_type.lower())

        if cost_level:
            query = query.where(func.lower(PackagingMaterial.cost_level) == cost_level.lower())

        if food_grade_only:
            query = query.where(PackagingMaterial.food_grade_compliant == True)

        if search:
            search_pattern = f"%{search.lower()}%"
            query = query.where(
                or_(
                    func.lower(PackagingMaterial.name).like(search_pattern),
                    func.lower(PackagingMaterial.material_type).like(search_pattern),
                    func.lower(PackagingMaterial.structure).like(search_pattern),
                    func.lower(PackagingMaterial.description).like(search_pattern),
                )
            )

        query = query.order_by(PackagingMaterial.id.asc()).offset(skip).limit(limit)
        result = db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    def count(
        db: Session,
        material_type: Optional[str] = None,
        food_grade_only: bool = False,
        search: Optional[str] = None,
    ) -> int:
        """Count total matching packaging materials."""
        query = select(func.count(PackagingMaterial.id))

        if material_type:
            query = query.where(func.lower(PackagingMaterial.material_type) == material_type.lower())

        if food_grade_only:
            query = query.where(PackagingMaterial.food_grade_compliant == True)

        if search:
            search_pattern = f"%{search.lower()}%"
            query = query.where(
                or_(
                    func.lower(PackagingMaterial.name).like(search_pattern),
                    func.lower(PackagingMaterial.material_type).like(search_pattern),
                )
            )

        result = db.execute(query)
        return result.scalar_one() or 0

    @staticmethod
    def get_by_id(db: Session, material_id: int) -> Optional[PackagingMaterial]:
        """Fetch single packaging material by ID including ASTM properties."""
        query = (
            select(PackagingMaterial)
            .options(selectinload(PackagingMaterial.properties))
            .where(PackagingMaterial.id == material_id)
        )
        result = db.execute(query)
        return result.scalars().first()

    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[PackagingMaterial]:
        """Fetch single packaging material by name."""
        query = select(PackagingMaterial).where(func.lower(PackagingMaterial.name) == name.lower())
        result = db.execute(query)
        return result.scalars().first()

    @staticmethod
    def create(db: Session, material_in: PackagingMaterialCreate) -> PackagingMaterial:
        """Create a new packaging material record with optional nested properties."""
        material_data = material_in.model_dump(exclude={"properties"})
        db_material = PackagingMaterial(**material_data)
        db.add(db_material)
        db.flush()

        if material_in.properties:
            for prop_in in material_in.properties:
                prop_data = prop_in.model_dump()
                prop_data["material_id"] = db_material.id
                db_prop = MaterialProperty(**prop_data)
                db.add(db_prop)

        db.commit()
        db.refresh(db_material)
        return db_material


material_service = MaterialService()
