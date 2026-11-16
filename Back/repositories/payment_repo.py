import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from Back.models.payment_model import Payment

class PaymentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_order_id(self, order_id: uuid.UUID) -> Optional[Payment]:
        query = select(Payment).where(Payment.order_id == order_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_gateway_trans_id(self, trans_id: str) -> Optional[Payment]:
        query = select(Payment).where(Payment.gateway_transaction_id == trans_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def create(self, payment: Payment) -> Payment:
        self.session.add(payment)
        await self.session.flush()
        return payment
