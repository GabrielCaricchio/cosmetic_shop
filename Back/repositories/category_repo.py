from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from Back.models.category_model import Category

class CategoryRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_all(self) -> List[Category]:
        result = await self.session.execute(select(Category).order_by(Category.name.asc()))
        return list(result.scalars().all())

    async def get_by_id(self, category_id: int) -> Optional[Category]:
        result = await self.session.execute(select(Category).where(Category.category_id == category_id))
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Optional[Category]:
        result = await self.session.execute(select(Category).where(Category.slug == slug))
        return result.scalar_one_or_none()

    async def create(self, category: Category) -> Category:
        self.session.add(category)
        await self.session.flush()
        return category
