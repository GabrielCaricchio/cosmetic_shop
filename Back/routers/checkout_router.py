import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis
from Back.core.database import get_db_session
from Back.core.redis_client import get_redis
from Back.core.dependencies import get_current_client
from Back.models.client_model import Client
from Back.services.stock_lock_service import StockLockService
from Back.services.payment_service import PaymentService
from Back.services.checkout_service import CheckoutService
from Back.dtos.checkout_dto import (
    CheckoutRequestDTO,
    DirectCheckoutRequestDTO,
    CheckoutItemDTO,
    CheckoutResponseDTO
)

router = APIRouter(prefix="/api/checkout", tags=["Checkout"])

def get_checkout_service(
    db: AsyncSession = Depends(get_db_session),
    redis: aioredis.Redis = Depends(get_redis)
) -> CheckoutService:
    stock_lock = StockLockService(redis)
    payment_svc = PaymentService()
    return CheckoutService(db, redis, stock_lock, payment_svc)

@router.post("", response_model=CheckoutResponseDTO, status_code=status.HTTP_202_ACCEPTED)
async def process_checkout(
    req: CheckoutRequestDTO,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    current_client: Client = Depends(get_current_client),
    service: CheckoutService = Depends(get_checkout_service)
):
    key = idempotency_key or str(uuid.uuid4())
    return await service.process_checkout(current_client.client_id, req, key)

@router.post("/direct", response_model=CheckoutResponseDTO, status_code=status.HTTP_202_ACCEPTED)
async def direct_checkout(
    req: DirectCheckoutRequestDTO,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    current_client: Client = Depends(get_current_client),
    service: CheckoutService = Depends(get_checkout_service)
):
    key = idempotency_key or str(uuid.uuid4())
    checkout_req = CheckoutRequestDTO(
        items=[CheckoutItemDTO(product_id=req.product_id, quantity=req.quantity)],
        shipping_address=req.shipping_address,
        payment_method=req.payment_method
    )
    return await service.process_checkout(current_client.client_id, checkout_req, key)
