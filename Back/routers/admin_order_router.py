import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from Back.core.database import get_db_session
from Back.core.dependencies import require_admin_role
from Back.repositories.order_repo import OrderRepository
from Back.models.order_model import OrderStatusEnum
from Back.dtos.order_dto import OrderDetailResponse, OrderItemDetailDTO
from Back.dtos.admin_dto import UpdateOrderStatusRequest
from Back.core.exceptions import NotFoundException

router = APIRouter(prefix="/api/admin/orders", tags=["Admin Orders"])

def get_order_repo(session: AsyncSession = Depends(get_db_session)) -> OrderRepository:
    return OrderRepository(session)

@router.get("", response_model=List[OrderDetailResponse])
async def list_all_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    order_repo: OrderRepository = Depends(get_order_repo),
    _admin = Depends(require_admin_role())
):
    parsed_status = OrderStatusEnum(status_filter) if status_filter else None
    orders = await order_repo.list_all(status=parsed_status, limit=limit, offset=offset)

    responses = []
    for o in orders:
        items = [
            OrderItemDetailDTO(
                product_id=it.product_id,
                product_name=f"Cosmético #{it.product_id}",
                quantity=it.quantity,
                unit_price=it.unit_price,
                subtotal=it.subtotal
            )
            for it in o.items
        ]
        payment = o.payments[0] if o.payments else None
        responses.append(OrderDetailResponse(
            order_id=str(o.order_id),
            client_id=o.client_id,
            total_amount=o.total_amount,
            status=o.status.value,
            shipping_address=o.shipping_address,
            items=items,
            payment_method=payment.method.value if payment else None,
            pix_qr_code_base64=payment.pix_qr_code_base64 if payment else None,
            pix_copy_paste=payment.pix_copy_paste if payment else None,
            created_at=o.created_at,
            updated_at=o.updated_at
        ))
    return responses

@router.put("/{order_id}/status", response_model=OrderDetailResponse)
async def update_order_status(
    order_id: str,
    req: UpdateOrderStatusRequest,
    order_repo: OrderRepository = Depends(get_order_repo),
    _admin = Depends(require_admin_role())
):
    try:
        parsed_id = uuid.UUID(order_id)
    except ValueError:
        raise NotFoundException(f"ID de pedido inválido: {order_id}")

    order = await order_repo.get_by_id(parsed_id)
    if not order:
        raise NotFoundException(f"Pedido {order_id} não encontrado")

    order.status = OrderStatusEnum(req.status)
    return OrderDetailResponse(
        order_id=str(order.order_id),
        client_id=order.client_id,
        total_amount=order.total_amount,
        status=order.status.value,
        shipping_address=order.shipping_address,
        items=[],
        created_at=order.created_at,
        updated_at=order.updated_at
    )
