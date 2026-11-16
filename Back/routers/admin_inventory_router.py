from typing import List
from fastapi import APIRouter, Depends
import redis.asyncio as aioredis
from Back.core.redis_client import get_redis
from Back.core.dependencies import require_admin_role
from Back.dtos.admin_dto import StockReservationItemDTO

router = APIRouter(prefix="/api/admin/inventory", tags=["Admin Inventory"])

@router.get("/reservations", response_model=List[StockReservationItemDTO])
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
                reservations.append(StockReservationItemDTO(
                    order_id=order_id,
                    product_id=product_id,
                    quantity=int(qty_raw) if qty_raw else 0,
                    ttl_remaining=ttl if ttl > 0 else 0
                ))
        if cursor == 0:
            break

    return reservations
