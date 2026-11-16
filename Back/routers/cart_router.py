import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Header, Response, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis
from Back.core.database import get_read_db_session
from Back.core.redis_client import get_redis
from Back.repositories.product_repo import ProductRepository
from Back.services.cart_service import CartService
from Back.dtos.cart_dto import CartDTO, AddCartItemRequest, UpdateCartItemRequest
from Back.dtos.error_dto import ErrorResponseDTO, COMMON_RESPONSES

router = APIRouter(prefix="/api/cart", tags=["Cart"])

def get_cart_service(
    redis: aioredis.Redis = Depends(get_redis),
    session: AsyncSession = Depends(get_read_db_session)
) -> CartService:
    return CartService(redis, ProductRepository(session))

def get_or_create_cart_id(
    x_cart_id: Optional[str] = Header(None, alias="X-Cart-ID", description="UUID identificador da sessão de carrinho no Redis. Se não enviado, um novo é gerado e retornado no cabeçalho X-Cart-ID da resposta."),
    x_guest_cart_id: Optional[str] = Header(None, alias="X-Guest-Cart-Id", description="Alias de cabeçalho para carrinho de visitante."),
    response: Response = None
) -> str:
    cart_id = x_cart_id or x_guest_cart_id or str(uuid.uuid4())
    if response and not (x_cart_id or x_guest_cart_id):
        response.headers["X-Cart-ID"] = cart_id
    return cart_id

@router.get(
    "",
    response_model=CartDTO,
    status_code=status.HTTP_200_OK,
    summary="Obter carrinho de compras da sessão",
    description="""
Recupera os itens, quantidades, subtotais calculados e valor total consolidado do carrinho de compras armazenado em cache volátil no Redis (TTL de 7 dias).
Identificado pelo cabeçalho `X-Cart-ID`.
""",
    responses={
        200: {
            "model": CartDTO,
            "description": "Estado atual do carrinho de compras retornado com sucesso."
        }
    }
)
async def view_cart(
    response: Response,
    cart_id: str = Depends(get_or_create_cart_id),
    service: CartService = Depends(get_cart_service)
):
    return await service.get_cart(cart_id)

@router.post(
    "/items",
    response_model=CartDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Adicionar produto ao carrinho",
    description="""
Insere ou incrementa a quantidade de um cosmético no carrinho de compras no Redis:
- Valida a existência do produto no catálogo ativo.
- Verifica se a quantidade solicitada não excede o estoque disponível.
- Recalcula automaticamente os subtotais e valor total da sacola.
""",
    responses={
        201: {
            "model": CartDTO,
            "description": "Item adicionado com sucesso ao carrinho e estado atualizado retornado."
        },
        400: COMMON_RESPONSES[400],
        404: {
            "model": ErrorResponseDTO,
            "description": "Produto inexistente ou inativo no catálogo."
        },
        422: COMMON_RESPONSES[422]
    }
)
async def add_item(
    req: AddCartItemRequest,
    response: Response,
    cart_id: str = Depends(get_or_create_cart_id),
    service: CartService = Depends(get_cart_service)
):
    return await service.add_item(cart_id, req.product_id, req.quantity)

@router.put(
    "/items/{product_id}",
    response_model=CartDTO,
    status_code=status.HTTP_200_OK,
    summary="Atualizar quantidade de um item no carrinho",
    description="""
Atualiza a quantidade de um cosmético específico presente no carrinho.
Se a quantidade informada for zero ou negativa, o item é removido automaticamente da sacola.
""",
    responses={
        200: {
            "model": CartDTO,
            "description": "Quantidade atualizada e novo total do carrinho calculado."
        },
        400: COMMON_RESPONSES[400],
        404: {
            "model": ErrorResponseDTO,
            "description": "Produto não encontrado no catálogo para validação."
        },
        422: COMMON_RESPONSES[422]
    }
)
async def update_item(
    product_id: int = Path(..., description="ID do cosmético a ter a quantidade alterada.", examples=[1]),
    req: UpdateCartItemRequest = ...,
    cart_id: str = Depends(get_or_create_cart_id),
    service: CartService = Depends(get_cart_service)
):
    return await service.update_item_quantity(cart_id, product_id, req.quantity)

@router.delete(
    "/items/{product_id}",
    response_model=CartDTO,
    status_code=status.HTTP_200_OK,
    summary="Remover produto do carrinho",
    description="""
Remove integralmente uma linha de produto do carrinho no Redis e retorna a sacola atualizada com novos subtotais.
""",
    responses={
        200: {
            "model": CartDTO,
            "description": "Item excluído com sucesso e carrinho recalculado."
        },
        404: {
            "model": ErrorResponseDTO,
            "description": "Produto não encontrado."
        }
    }
)
async def remove_item(
    product_id: int = Path(..., description="ID do produto a ser removido do carrinho.", examples=[1]),
    cart_id: str = Depends(get_or_create_cart_id),
    service: CartService = Depends(get_cart_service)
):
    return await service.remove_item(cart_id, product_id)
