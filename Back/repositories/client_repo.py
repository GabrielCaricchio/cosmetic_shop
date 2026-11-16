from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from Back.models.client_model import Client

class ClientRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, client_id: int) -> Optional[Client]:
        result = await self.session.execute(select(Client).where(Client.client_id == client_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[Client]:
        result = await self.session.execute(select(Client).where(Client.email == email.lower().strip()))
        return result.scalar_one_or_none()

    async def create(self, client: Client) -> Client:
        self.session.add(client)
        await self.session.flush()
        return client
