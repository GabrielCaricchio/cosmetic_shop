import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from Back.core.database import get_read_db_session
from Back.core.dependencies import get_current_client
from Back.models.client_model import Client
from Back.repositories.order_repo import OrderRepository
from Back.repositories.product_repo import ProductRepository
from Back.dtos.order_dto import OrderDetailResponse, OrderItemDetailDTO
from Back.core.exceptions import NotFoundException

router = APIRouter(prefix="/api/orders", tags=["Orders"])

def get_order_repo(session: AsyncSession = Depends(get_read_db_session)) -> OrderRepository:
    return OrderRepository(session)

@router.get("", response_model=List[OrderDetailResponse])
async def list_client_orders(
    current_client: Client = Depends(get_current_client),
    order_repo: OrderRepository = Depends(get_order_repo)
):
    orders = await order_repo.list_by_client(current_client.client_id)
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

@router.get("/{order_id}", response_model=OrderDetailResponse)
async def get_order_details(
    order_id: str,
    order_repo: OrderRepository = Depends(get_order_repo)
):
    try:
        parsed_id = uuid.UUID(order_id)
    except ValueError:
        raise NotFoundException(f"ID de pedido inválido: {order_id}")

    order = await order_repo.get_by_id(parsed_id)
    if not order:
        raise NotFoundException(f"Pedido {order_id} não encontrado")

    items = [
        OrderItemDetailDTO(
            product_id=it.product_id,
            product_name=f"Cosmético #{it.product_id}",
            quantity=it.quantity,
            unit_price=it.unit_price,
            subtotal=it.subtotal
        )
        for it in order.items
    ]
    payment = order.payments[0] if order.payments else None

    return OrderDetailResponse(
        order_id=str(order.order_id),
        client_id=order.client_id,
        total_amount=order.total_amount,
        status=order.status.value,
        shipping_address=order.shipping_address,
        items=items,
        payment_method=payment.method.value if payment else None,
        pix_qr_code_base64=payment.pix_qr_code_base64 if payment else None,
        pix_copy_paste=payment.pix_copy_paste if payment else None,
        created_at=order.created_at,
        updated_at=order.updated_at
    )
