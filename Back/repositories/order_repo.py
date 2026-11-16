import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from Back.models.order_model import Order, OrderStatusEnum

class OrderRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, order_id: uuid.UUID) -> Optional[Order]:
        query = (
            select(Order)
            .options(
                selectinload(Order.items),
                selectinload(Order.payments),
                selectinload(Order.client)
            )
            .where(Order.order_id == order_id)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_idempotency_key(self, key: str) -> Optional[Order]:
        query = (
            select(Order)
            .options(
                selectinload(Order.items),
                selectinload(Order.payments)
            )
            .where(Order.idempotency_key == key)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def list_by_client(self, client_id: int) -> List[Order]:
        query = (
            select(Order)
            .options(selectinload(Order.items), selectinload(Order.payments))
            .where(Order.client_id == client_id)
            .order_by(desc(Order.created_at))
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def list_all(
        self,
        status: Optional[OrderStatusEnum] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Order]:
        query = (
            select(Order)
            .options(selectinload(Order.items), selectinload(Order.payments), selectinload(Order.client))
            .order_by(desc(Order.created_at))
        )
        if status:
            query = query.where(Order.status == status)
        query = query.offset(offset).limit(limit)

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def create(self, order: Order) -> Order:
        self.session.add(order)
        await self.session.flush()
        return order
