from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from Back.models.admin_model import Administrator

class AdminRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, admin_id: int) -> Optional[Administrator]:
        result = await self.session.execute(select(Administrator).where(Administrator.admin_id == admin_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[Administrator]:
        result = await self.session.execute(select(Administrator).where(Administrator.email == email.lower().strip()))
        return result.scalar_one_or_none()

    async def create(self, admin: Administrator) -> Administrator:
        self.session.add(admin)
        await self.session.flush()
        return admin
