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

@router.post(
    "/payment",
    status_code=status.HTTP_200_OK,
    summary="Webhook de notificação de pagamento (Pix / Gateway)",
    description="""
Recebe notificações assíncronas de liquidação de pagamento enviadas pelo gateway financeiro:
- Se o status for `approved`: o pedido avança para `paid`, as reservas de estoque no Redis são confirmadas e o estoque físico no PostgreSQL é decrementado definitivamente.
- Se o status for `rejected` ou `cancelled`: o pedido é cancelado e as reservas temporárias no Redis são liberadas imediatamente de volta para a vitrine.
""",
    responses={
        200: {
            "description": "Notificação processada com sucesso.",
            "content": {
                "application/json": {
                    "example": {
                        "received": True,
                        "order_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                        "status": "approved"
                    }
                }
            }
        }
    }
)
async def payment_webhook(
    payload: dict[str, Any] = Body(
        ...,
        description="Payload do webhook contendo o order_id e o status do pagamento.",
        examples=[
            {
                "order_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "status": "approved"
            }
        ]
    ),
    service: CheckoutService = Depends(get_checkout_service)
):
    order_id = payload.get("order_id")
    payment_status = payload.get("status", "approved")

    if order_id:
        await service.handle_payment_status_update(order_id, payment_status)

    return {"received": True, "order_id": order_id, "status": payment_status}
