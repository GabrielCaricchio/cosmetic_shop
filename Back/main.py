from contextlib import asynccontextmanager
from typing import Dict, Any
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from sqlalchemy import text

from Back.core.config import settings
from Back.core.exceptions import AppException
from Back.core.database import write_engine
from Back.core.seed import seed_initial_data
from Back.models.base import Base
import Back.models  # Register all models for Base.metadata
from Back.dtos.error_dto import ErrorResponseDTO, COMMON_RESPONSES

# Routers
from Back.routers.auth_router import router as auth_router
from Back.routers.catalog_router import router as catalog_router
from Back.routers.cart_router import router as cart_router
from Back.routers.checkout_router import router as checkout_router
from Back.routers.order_router import router as order_router
from Back.routers.webhook_router import router as webhook_router
from Back.routers.support_router import router as support_router
from Back.routers.admin_auth_router import router as admin_auth_router
from Back.routers.admin_product_router import router as admin_product_router
from Back.routers.admin_order_router import router as admin_order_router
from Back.routers.admin_report_router import router as admin_report_router
from Back.routers.admin_inventory_router import router as admin_inventory_router

API_DESCRIPTION = """
# 💄 Aura Cosméticos — API de E-Commerce & Marketplace de Alta Escala

Plataforma full-stack desacoplada projetada para alta conversão mobile, busca inteligente e resiliência extrema em concorrência de estoque.

---

## 🏛️ Diferenciais Arquiteturais

### 1. 🔍 Busca Fuzzy Inteligente via `pg_trgm` (PostgreSQL)
Cosméticos possuem nomes técnicos, estrangeiros e variações ortográficas frequentes (ex: *"batom vermêlho"*, *"shampô hidratante"*, *"serum hialuronico"*). 
A plataforma utiliza a extensão `pg_trgm` com índices **GiST Trigram Ops**, garantindo buscas instantâneas com tolerância a erros tipográficos e acentuação.

### 2. ⚡ Reserva Atômica Anti-Overselling com Redis Lua Script
Para evitar *race conditions* quando múltiplos clientes tentam comprar a última unidade do produto:
- O estoque é reservado no **Redis via Lua Script Atômico**.
- Em compras simultâneas, exatamente um cliente obtém a reserva e os demais recebem imediatamente `409 Conflict / Esgotado`.
- As reservas possuem TTL de 30 minutos (1800s), sendo confirmadas no pagamento ou liberadas no cancelamento/expiração.

### 3. 🛡️ Idempotência de Pagamentos e Compras
O endpoint de checkout aceita o cabeçalho `Idempotency-Key` (UUID). Requisições repetidas com a mesma chave em uma janela de 24 horas retornam o resultado original cacheado no Redis sem duplicar pedidos ou débitos.

### 4. 🔐 Autenticação Robusta & RBAC
- **Clientes**: Registro com consentimento LGPD, senhas com hash **Argon2id** e tokens **JWT (Bearer)** com 24 horas de validade.
- **Backoffice**: Acesso restrito a gestores com roles `Admin` e `SuperAdmin`.

---

## 📋 Códigos e Convenções de Erro HTTP

Todos os erros da aplicação seguem o formato padronizado:

```json
{
  "error": "NOME_DO_ERRO",
  "message": "Descrição amigável em português",
  "details": null
}
```

| Código | Significado | Exemplo de Causa |
|---|---|---|
| `400 Bad Request` | Requisição malformada | Parâmetros inválidos ou incompatíveis |
| `401 Unauthorized` | Autenticação necessária | Token JWT ausente, expirado ou inválido |
| `403 Forbidden` | Permissão insuficiente | Cliente tentando acessar rota administrativa |
| `404 Not Found` | Recurso não localizado | Produto, pedido ou categoria inexistente |
| `409 Conflict` | Conflito de estado / Concorrência | Estoque esgotado via trava Redis ou e-mail já cadastrado |
| `422 Unprocessable` | Validação de Schema | Campo obrigatório não enviado ou tipo incorreto |
"""

OPENAPI_TAGS = [
    {
        "name": "Health",
        "description": "Verificação de disponibilidade, conectividade e prontidão dos serviços essenciais da API."
    },
    {
        "name": "Auth",
        "description": "Autenticação e cadastro de clientes e revendedoras com suporte a LGPD e tokens Bearer JWT."
    },
    {
        "name": "Catalog",
        "description": "Navegação e busca de produtos de beleza com tolerância a erros e acentos via pg_trgm (PostgreSQL)."
    },
    {
        "name": "Cart",
        "description": "Gerenciamento de carrinho de compras baseado em sessão efêmera e volátil no Redis."
    },
    {
        "name": "Checkout",
        "description": "Finalização de pedidos, reserva atômica de estoque (Redis Lua) e emissão de pagamentos."
    },
    {
        "name": "Orders",
        "description": "Consulta do histórico e acompanhamento de pedidos em tempo real (Order Stepper)."
    },
    {
        "name": "Webhooks",
        "description": "Recepção de notificações assíncronas de gateways de pagamento (Pix / Stripe)."
    },
    {
        "name": "Support",
        "description": "Redirecionamento para atendimento e suporte ao cliente via WhatsApp oficial."
    },
    {
        "name": "Admin Auth",
        "description": "Autenticação restrita e controle de acesso baseado em papéis (RBAC) para gestores."
    },
    {
        "name": "Admin Products",
        "description": "Gestão operacional do catálogo de cosméticos (CRUD, fotos e controle de estoque)."
    },
    {
        "name": "Admin Orders",
        "description": "Operação e avanço no ciclo de vida de pedidos e expedição logística."
    },
    {
        "name": "Admin Reports",
        "description": "Inteligência analítica de vendas, faturamento diário, ticket médio e séries temporais."
    },
    {
        "name": "Admin Inventory",
        "description": "Auditoria em tempo real de travas atômicas e reservas temporárias no Redis."
    }
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup / check database extensions, tables and seed data on startup if reachable
    try:
        async with write_engine.begin() as conn:
            await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
            await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pg_trgm";'))
            await conn.run_sync(Base.metadata.create_all)
        await seed_initial_data(write_engine)
    except Exception as e:
        import logging
        logging.getLogger("uvicorn.error").warning("Database startup notice: %s", e)
    yield
    # Shutdown cleanup
    await write_engine.dispose()

app = FastAPI(
    title="Aura Cosméticos — API de E-Commerce & Marketplace",
    description=API_DESCRIPTION,
    version="1.0.0",
    terms_of_service="https://auracosmeticos.com.br/termos",
    contact={
        "name": "Equipe de Engenharia Aura Cosméticos",
        "url": "https://auracosmeticos.com.br",
        "email": "dev@auracosmeticos.com.br"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    },
    openapi_tags=OPENAPI_TAGS,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    swagger_ui_parameters={
        "defaultModelsExpandDepth": 2,
        "defaultModelExpandDepth": 2,
        "docExpansion": "list",
        "filter": True,
        "displayRequestDuration": True,
        "tryItOutEnabled": True,
        "syntaxHighlight.theme": "monokai"
    },
    servers=[
        {
            "url": "http://localhost:8000",
            "description": "Ambiente de Desenvolvimento Local"
        },
        {
            "url": "https://api.auracosmeticos.com.br",
            "description": "Ambiente de Produção (HTTPS)"
        }
    ],
    lifespan=lifespan
)

# Custom OpenAPI Schema Configuration to properly declare Bearer Auth Security Scheme
def custom_openapi() -> Dict[str, Any]:
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        openapi_version=app.openapi_version,
        description=app.description,
        terms_of_service=app.terms_of_service,
        contact=app.contact,
        license_info=app.license_info,
        routes=app.routes,
        tags=app.openapi_tags,
        servers=app.servers
    )

    # Ensure BearerAuth security scheme is documented
    if "components" not in openapi_schema:
        openapi_schema["components"] = {}
    if "securitySchemes" not in openapi_schema["components"]:
        openapi_schema["components"]["securitySchemes"] = {}

    openapi_schema["components"]["securitySchemes"]["HTTPBearer"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Insira o token JWT no formato: `Bearer <token>` para autenticar requisições protegidas."
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Cart-ID", "Idempotency-Key"]
)

# Custom Exception Handler
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "details": exc.details
        }
    )

# Health Check
@app.get(
    "/api/health",
    tags=["Health"],
    summary="Verificar saúde da API (Health Check)",
    description="Endpoint leve para verificação de liveness e readiness por balanceadores de carga, probes do Kubernetes e monitoramento de uptime.",
    responses={
        200: {
            "description": "Serviço operacional e saudável.",
            "content": {
                "application/json": {
                    "example": {
                        "status": "healthy",
                        "service": "cosmetics-ecommerce",
                        "version": "1.0.0"
                    }
                }
            }
        }
    }
)
async def health_check():
    return {"status": "healthy", "service": "cosmetics-ecommerce"}

# Mount Domain Routers
app.include_router(auth_router)
app.include_router(catalog_router)
app.include_router(cart_router)
app.include_router(checkout_router)
app.include_router(order_router)
app.include_router(webhook_router)
app.include_router(support_router)
app.include_router(admin_auth_router)
app.include_router(admin_product_router)
app.include_router(admin_order_router)
app.include_router(admin_report_router)
app.include_router(admin_inventory_router)
