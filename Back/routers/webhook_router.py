from typing import Any
from fastapi import APIRouter, Depends, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis
from Back.core.database import get_db_session
from Back.core.redis_client import get_redis
from Back.services.stock_lock_service import StockLockService
from Back.services.payment_service import PaymentService
from Back.services.checkout_service import CheckoutService

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])

def get_checkout_service(
    db: AsyncSession = Depends(get_db_session),
    redis: aioredis.Redis = Depends(get_redis)
) -> CheckoutService:
    stock_lock = StockLockService(redis)
    payment_svc = PaymentService()
    return CheckoutService(db, redis, stock_lock, payment_svc)

@router.post("/payment", status_code=status.HTTP_200_OK)
async def payment_webhook(
    payload: dict[str, Any] = Body(...),
    service: CheckoutService = Depends(get_checkout_service)
):
    # Simulated webhook body: {"order_id": "...", "status": "approved" | "rejected" | "cancelled"}
    order_id = payload.get("order_id")
    payment_status = payload.get("status", "approved")

    if order_id:
        await service.handle_payment_status_update(order_id, payment_status)

    return {"received": True, "order_id": order_id, "status": payment_status}
