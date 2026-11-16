from typing import List
from fastapi import APIRouter, Depends, Path, status
import redis.asyncio as aioredis
from Back.core.redis_client import get_redis
from Back.core.dependencies import require_admin_role
from Back.dtos.admin_dto import StockReservationItemDTO
from Back.dtos.error_dto import COMMON_RESPONSES
from Back.services.stock_lock_service import StockLockService

router = APIRouter(prefix="/api/admin/inventory", tags=["Admin Inventory"])

@router.get(
    "/reservations",
    response_model=List[StockReservationItemDTO],
    status_code=status.HTTP_200_OK,
    summary="Auditar travas e reservas atômicas de estoque no Redis",
    description="""
Monitora em tempo real todas as chaves ativas do padrão `stock:reserved:*:*` no Redis:
- Permite verificar quais pedidos detêm travas atômicas anti-overselling.
- Exibe o produto bloqueado, a quantidade retida e a contagem regressiva do TTL em segundos (limite padrão de 1800s).
- Fundamental para diagnóstico de concorrência e integridade de estoque durante campanhas de pico.
Exige autenticação administrativa.
""",
    responses={
        200: {
            "model": List[StockReservationItemDTO],
            "description": "Lista de reservas temporárias ativas no Redis auditadas com sucesso."
        },
        401: COMMON_RESPONSES[401],
        403: COMMON_RESPONSES[403]
    }
)
async def list_active_reservations(
    redis: aioredis.Redis = Depends(get_redis),
    _admin = Depends(require_admin_role())
):
    """Audits active Redis stock reservations and TTLs."""
    pattern = "stock:reserved:*:*"
    cursor = 0
    reservations: list[StockReservationItemDTO] = []

    while True:
        cursor, keys = await redis.scan(cursor, match=pattern, count=100)
        for key in keys:
            parts = key.split(":")
            if len(parts) >= 4:
                order_id = parts[2]
                product_id = int(parts[3])
                qty_raw = await redis.get(key)
                ttl = await redis.ttl(key)
                qty = int(qty_raw) if qty_raw else 0
                ttl_secs = ttl if ttl > 0 else 0
                reservations.append(StockReservationItemDTO(
                    order_id=order_id,
                    product_id=product_id,
                    quantity=qty,
                    ttl_remaining=ttl_secs,
                    key=key,
                    product_name=f"Cosmético #{product_id}",
                    reserved_quantity=qty,
                    ttl_remaining_seconds=ttl_secs
                ))
        if cursor == 0:
            break

    return reservations

@router.delete(
    "/reservations/{key:path}",
    status_code=status.HTTP_200_OK,
    summary="Liberar manualmente trava atômica de estoque no Redis",
    description="""
Remove a reserva temporária retida no Redis e devolve o saldo de unidades de volta ao estoque disponível.
Exige perfil administrativo com permissão de gestão.
""",
    responses={
        200: {
            "description": "Trava liberada com sucesso e estoque restituído ao Redis.",
            "content": {
                "application/json": {
                    "example": {"message": "Trava stock:reserved:order123:1 liberada com sucesso."}
                }
            }
        },
        401: COMMON_RESPONSES[401],
        403: COMMON_RESPONSES[403]
    }
)
async def release_reservation(
    key: str = Path(..., description="Chave completa da reserva no Redis (ex: stock:reserved:order-uuid:1)."),
    redis: aioredis.Redis = Depends(get_redis),
    _admin = Depends(require_admin_role())
):
    parts = key.split(":")
    if len(parts) >= 4 and parts[0] == "stock" and parts[1] == "reserved":
        order_id = parts[2]
        product_id = int(parts[3])
        stock_lock = StockLockService(redis)
        await stock_lock.release_stock_lock(order_id, product_id)
    else:
        await redis.delete(key)

    return {"message": f"Trava {key} liberada com sucesso."}
