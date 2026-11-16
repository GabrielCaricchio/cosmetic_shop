import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Header, Response, Cookie, status
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis
from Back.core.database import get_read_db_session
from Back.core.redis_client import get_redis
from Back.repositories.product_repo import ProductRepository
from Back.services.cart_service import CartService
from Back.dtos.cart_dto import CartDTO, AddCartItemRequest, UpdateCartItemRequest

router = APIRouter(prefix="/api/cart", tags=["Cart"])

def get_cart_service(
    redis: aioredis.Redis = Depends(get_redis),
    session: AsyncSession = Depends(get_read_db_session)
) -> CartService:
    return CartService(redis, ProductRepository(session))

def get_or_create_cart_id(
    x_cart_id: Optional[str] = Header(None, alias="X-Cart-ID"),
    response: Response = None
) -> str:
    cart_id = x_cart_id or str(uuid.uuid4())
    if response and not x_cart_id:
        response.headers["X-Cart-ID"] = cart_id
    return cart_id

@router.get("", response_model=CartDTO)
async def view_cart(
    response: Response,
    cart_id: str = Depends(get_or_create_cart_id),
    service: CartService = Depends(get_cart_service)
):
    return await service.get_cart(cart_id)

@router.post("/items", response_model=CartDTO, status_code=status.HTTP_201_CREATED)
async def add_item(
    req: AddCartItemRequest,
    response: Response,
    cart_id: str = Depends(get_or_create_cart_id),
    service: CartService = Depends(get_cart_service)
):
    return await service.add_item(cart_id, req.product_id, req.quantity)

@router.put("/items/{product_id}", response_model=CartDTO)
async def update_item(
    product_id: int,
    req: UpdateCartItemRequest,
    cart_id: str = Depends(get_or_create_cart_id),
    service: CartService = Depends(get_cart_service)
):
    return await service.update_item_quantity(cart_id, product_id, req.quantity)

@router.delete("/items/{product_id}", response_model=CartDTO)
async def remove_item(
    product_id: int,
    cart_id: str = Depends(get_or_create_cart_id),
    service: CartService = Depends(get_cart_service)
):
    return await service.remove_item(cart_id, product_id)
