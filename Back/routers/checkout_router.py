import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis
from Back.core.database import get_db_session
from Back.core.redis_client import get_redis
from Back.core.dependencies import get_current_client, get_optional_current_client
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
from Back.dtos.error_dto import ErrorResponseDTO, COMMON_RESPONSES

router = APIRouter(prefix="/api/checkout", tags=["Checkout"])

def get_checkout_service(
    db: AsyncSession = Depends(get_db_session),
    redis: aioredis.Redis = Depends(get_redis)
) -> CheckoutService:
    stock_lock = StockLockService(redis)
    payment_svc = PaymentService()
    return CheckoutService(db, redis, stock_lock, payment_svc)

@router.post(
    "",
    response_model=CheckoutResponseDTO,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Processar checkout completo com reserva atômica de estoque",
    description="""
Finaliza a compra dos itens do carrinho para a cliente autenticada:
1. **Idempotência Garantida**: Valida o cabeçalho `Idempotency-Key` no Redis (TTL de 24h) prevenindo duplicidade de cobranças em retentativas de rede.
2. **Reserva Atômica Anti-Overselling**: Bloqueia os estoques dos cosméticos via **Lua Script Atômico no Redis** (TTL de 30 minutos). Em caso de concorrência simultânea sem saldo, falha imediatamente com `409 Conflict / Esgotado`.
3. **Criação do Pedido**: Registra o pedido no PostgreSQL com status `pending`.
4. **Geração de Pagamento**: Emite o pagamento (Pix Copia e Cola / QR Code ou sessão Stripe) com tempo limite de 30 minutos.
""",
    responses={
        202: {
            "model": CheckoutResponseDTO,
            "description": "Pedido aceito e processado com reserva atômica de estoque e dados de pagamento gerados."
        },
        400: COMMON_RESPONSES[400],
        401: COMMON_RESPONSES[401],
        404: {
            "model": ErrorResponseDTO,
            "description": "Um ou mais produtos solicitados não foram encontrados no catálogo."
        },
        409: {
            "model": ErrorResponseDTO,
            "description": "Estoque esgotado no milissegundo da compra (Anti-Overselling Redis Lock)."
        },
        422: COMMON_RESPONSES[422]
    }
)
async def process_checkout(
    req: CheckoutRequestDTO,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key", description="Chave única de idempotência (UUID) para garantir que cobranças ou pedidos duplicados não sejam executados acidentalmente."),
    current_client: Optional[Client] = Depends(get_optional_current_client),
    service: CheckoutService = Depends(get_checkout_service)
):
    key = idempotency_key or str(uuid.uuid4())
    client_id = current_client.client_id if current_client else None
    return await service.process_checkout(client_id, req, key)

@router.post(
    "/direct",
    response_model=CheckoutResponseDTO,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Checkout direto de 1 clique ('Comprar Agora')",
    description="""
Executa a finalização instantânea de 1 clique para um único cosmético sem passar pelo carrinho de compras:
- Obtém reserva atômica imediata via Redis.
- Cria o pedido e gera o QR Code / instrução de pagamento em milissegundos.
- Otimizado para conversão móvel na Product Detail Page (PDP).
""",
    responses={
        202: {
            "model": CheckoutResponseDTO,
            "description": "Pedido direto gerado com sucesso e reserva de estoque efetuada."
        },
        400: COMMON_RESPONSES[400],
        401: COMMON_RESPONSES[401],
        404: {
            "model": ErrorResponseDTO,
            "description": "Produto inexistente ou inativo."
        },
        409: {
            "model": ErrorResponseDTO,
            "description": "Estoque esgotado para o produto solicitado."
        },
        422: COMMON_RESPONSES[422]
    }
)
async def direct_checkout(
    req: DirectCheckoutRequestDTO,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key", description="Chave única de idempotência para o checkout de 1 clique."),
    current_client: Optional[Client] = Depends(get_optional_current_client),
    service: CheckoutService = Depends(get_checkout_service)
):
    key = idempotency_key or str(uuid.uuid4())
    client_id = current_client.client_id if current_client else None
    checkout_req = CheckoutRequestDTO(
        items=[CheckoutItemDTO(product_id=req.product_id, quantity=req.quantity)],
        shipping_address=req.shipping_address,
        payment_method=req.payment_method
    )
    return await service.process_checkout(client_id, checkout_req, key)
