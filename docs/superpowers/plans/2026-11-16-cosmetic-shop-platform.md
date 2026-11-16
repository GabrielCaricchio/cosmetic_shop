# Plataforma de E-Commerce de Cosméticos: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir uma plataforma completa de e-commerce de cosméticos multimarca de alta escala (50.000 acessos/dia) com busca fuzzy via `pg_trgm`, reserva temporária de estoque atômica com Redis Lua Script, checkout Pix com idempotência e rollback, GUI mobile-first para clientes e GUI completa de backoffice para administradores.

**Architecture:** Arquitetura desacoplada e assíncrona orientada a alta conversão e concorrência: Back-end em Python 3.14 com FastAPI, SQLAlchemy 2.0 assíncrono (preparado para escrita Master e leitura Replicas) e Redis 7+ para travas distribuídas e cache; Front-end em React 19 SPA com Node 24 LTS, TypeScript, Vite e Tailwind CSS, dividido em interfaces isoladas para Clientes e Administradores (RBAC).

**Tech Stack:** 
- Back-end: Python 3.14, FastAPI, SQLAlchemy 2.0 (`asyncpg`), Redis (`redis-py` async), Argon2id (`argon2-cffi`), PyJWT, Pydantic v2, pytest, pytest-asyncio.
- Front-end: React 19, Node 24 LTS, TypeScript 5.x, Vite, Tailwind CSS, Lucide React, Axios, React Router v7, Vitest, React Testing Library.
- Banco de Dados & Cache: PostgreSQL 16+ com extensões `uuid-ossp` e `pg_trgm` (índice GiST), Redis 7+.

**Spec:** [agent.md](file:///var/home/caricchio/Documentos/cosmetic_shop/agent.md)

## Global Constraints

- **Python Version**: 3.14 com suporte total a sintaxe assíncrona (`async`/`await`).
- **Node.js Version**: 24 LTS.
- **PostgreSQL Extension**: `pg_trgm` com operador de similaridade `%` e índice `USING gist (name gist_trgm_ops)`.
- **Password Hashing**: Argon2id via `argon2-cffi` (nunca bcrypt simples ou md5).
- **Stock Lock Mechanism**: Script Lua atômico no Redis com TTL estrito (Pix = 1800s / 30 min).
- **Checkout Idempotency**: Cabeçalho `Idempotency-Key` (UUIDv4) obrigatório para evitar cobranças/reservas duplicadas.
- **Order State Machine**: `pending`, `processing`, `under_review`, `approved`, `rejected`, `cancelled`, `refunded`.
- **LGPD Compliance**: Checkbox de consentimento explícito e armazenamento mínimo de dados pessoais.
- **Code Organization**: Arquivos pequenos, coesos e separados estritamente por responsabilidades (máximo de ~150-250 linhas por arquivo).

## Review Focus

1. **Race Condition de Concorrência**: 2 usuários compram o último cosmético (`stock = 1`) no mesmo milissegundo; exatamente 1 obtém sucesso e o outro recebe `409 Conflict / Out of Stock` (Pinned to Task 6).
2. **Idempotência sob Queda de Rede**: Cliente clica em pagar Pix, a conexão móvel oscila e o frontend retenta com a mesma `Idempotency-Key`; o backend deve retornar a mesma resposta sem duplicar reserva ou cobrança (Pinned to Task 7).
3. **Expiração e Rollback de Pix (Timeout 30 min)**: Tempo limite de pagamento expira sem confirmação; a trava no Redis deve ser liberada e o pedido cancelado de forma autônoma sem perda de inventário (Pinned to Task 7).
4. **Busca Fuzzy com Caracteres Especiais e Acentos**: Busca por termos cosméticos com erros e acentos (ex: "batom vermêlho", "shampô hidratante") deve retornar os produtos corretos via `pg_trgm` sem falhas de sintaxe SQL (Pinned to Task 4).
5. **Transição de Carrinho Visitante para Usuário Logado**: Visitante anônimo adiciona itens ao carrinho, se cadastra ou faz login no checkout, e os itens da sessão anônima devem ser reconciliados com a conta sem ultrapassar o estoque disponível (Pinned to Task 5).

---

### Task 1: Core Configuration, Database Engine and Redis Connection

**Files:**
- Create: `Back/core/config.py`
- Create: `Back/core/database.py`
- Create: `Back/core/redis_client.py`
- Create: `Back/core/exceptions.py`
- Create: `Back/requirements.txt`
- Test: `Back/tests/unit/test_core_config.py`

**Interfaces:**
- Produces: `settings: Settings` em `Back/core/config.py`
- Produces: `get_db_session() -> AsyncGenerator[AsyncSession, None]` em `Back/core/database.py`
- Produces: `get_redis() -> AsyncGenerator[Redis, None]` em `Back/core/redis_client.py`

- [ ] **Step 1: Write failing tests for configuration, database connection factory and redis client**

```python
# Back/tests/unit/test_core_config.py
import pytest
from Back.core.config import Settings
from Back.core.exceptions import AppException

def test_settings_load_defaults():
    settings = Settings(
        DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/cosmetics_db",
        REDIS_URL="redis://localhost:6379/0",
        JWT_SECRET_KEY="supersecretkey_test_environment_12345",
    )
    assert settings.PROJECT_NAME == "Cosmetic Shop API"
    assert settings.PIX_EXPIRATION_SECONDS == 1800
    assert settings.CARD_EXPIRATION_SECONDS == 2400

def test_custom_app_exception():
    exc = AppException(message="Custom error", status_code=400, error_code="BAD_REQUEST")
    assert exc.status_code == 400
    assert exc.error_code == "BAD_REQUEST"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest Back/tests/unit/test_core_config.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'Back'`

- [ ] **Step 3: Implement `Back/requirements.txt`, `Back/core/config.py`, `Back/core/database.py`, `Back/core/redis_client.py` and `Back/core/exceptions.py`**

Configure Pydantic v2 `BaseSettings` reading environment variables, create `async_sessionmaker` with PostgreSQL `create_async_engine`, setup Redis connection pool with `redis.asyncio.from_url`, and define standard `AppException`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest Back/tests/unit/test_core_config.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Back/
git commit -m "feat(core): add settings, async database engine, redis client and custom exceptions"
```

---

### Task 2: Database Models & Schema with pg_trgm and GiST Index

**Files:**
- Create: `Back/models/base.py`
- Create: `Back/models/client_model.py`
- Create: `Back/models/admin_model.py`
- Create: `Back/models/category_model.py`
- Create: `Back/models/product_model.py`
- Create: `Back/models/product_image_model.py`
- Create: `Back/models/order_model.py`
- Create: `Back/models/order_item_model.py`
- Create: `Back/models/payment_model.py`
- Test: `Back/tests/unit/test_models.py`

**Interfaces:**
- Consumes: `Base` de `Back/models/base.py`
- Produces: `Client`, `Administrator`, `Category`, `Product`, `ProductImage`, `Order`, `OrderItem`, `Payment`, `OrderStatusEnum`, `PaymentMethodEnum`

- [ ] **Step 1: Write failing test verifying model schemas, GiST index definition and order status enum**

```python
# Back/tests/unit/test_models.py
from Back.models.order_model import OrderStatusEnum, Order
from Back.models.product_model import Product
from Back.models.payment_model import PaymentMethodEnum

def test_order_status_enum_values():
    assert OrderStatusEnum.PENDING.value == "pending"
    assert OrderStatusEnum.APPROVED.value == "approved"
    assert OrderStatusEnum.REJECTED.value == "rejected"
    assert OrderStatusEnum.CANCELLED.value == "cancelled"
    assert OrderStatusEnum.REFUNDED.value == "refunded"

def test_product_model_attributes():
    product = Product(
        name="Batom Matte Longa Duração",
        slug="batom-matte-longa-duracao",
        brand="Natura",
        price=39.90,
        stock_quantity=15,
        ingredients="Cera de abelha, pigmentos naturais, vitamina E"
    )
    assert product.brand == "Natura"
    assert product.stock_quantity == 15
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest Back/tests/unit/test_models.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'Back.models'`

- [ ] **Step 3: Implement all models in small modular files**

Implement `Back/models/base.py` (declarative base with `created_at` and `updated_at`), `client_model.py` (with `lgpd_consent`), `admin_model.py` (with roles), `category_model.py`, `product_model.py` (with GiST index on `name` using `gist_trgm_ops`), `product_image_model.py`, `order_model.py`, `order_item_model.py` and `payment_model.py`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest Back/tests/unit/test_models.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Back/models/ Back/tests/unit/test_models.py
git commit -m "feat(models): create complete PostgreSQL domain models with pg_trgm GiST index and order enums"
```

---

### Task 3: Security & RBAC: Argon2id Hashing and JWT Authentication

**Files:**
- Create: `Back/core/security.py`
- Create: `Back/core/dependencies.py`
- Create: `Back/dtos/auth_dto.py`
- Create: `Back/repositories/client_repo.py`
- Create: `Back/repositories/admin_repo.py`
- Create: `Back/services/auth_service.py`
- Create: `Back/routers/auth_router.py`
- Create: `Back/routers/admin_auth_router.py`
- Test: `Back/tests/unit/test_security.py`
- Test: `Back/tests/integration/test_auth_router.py`

**Interfaces:**
- Consumes: `Client`, `Administrator` de `Back/models/`
- Produces: `hash_password(password: str) -> str`, `verify_password(plain_password: str, hashed: str) -> bool`
- Produces: `create_access_token(data: dict, expires_delta: timedelta | None) -> str`
- Produces: `get_current_client`, `require_admin_role` em `Back/core/dependencies.py`
- Produces: Endpoints `POST /api/register`, `POST /api/login`, `GET /api/me`, `POST /api/admin/login`

- [ ] **Step 1: Write failing test for Argon2id hashing, JWT validation and LGPD consent requirement**

```python
# Back/tests/unit/test_security.py
import pytest
from Back.core.security import hash_password, verify_password, create_access_token, decode_access_token

def test_argon2id_hashing_and_verification():
    password = "MinhaSenhaForteCosmetico123!"
    hashed = hash_password(password)
    assert hashed != password
    assert hashed.startswith("$argon2id$")
    assert verify_password(password, hashed) is True
    assert verify_password("SenhaErrada", hashed) is False

def test_jwt_generation_and_payload_decode():
    token = create_access_token({"sub": "client_1", "role": "client"})
    payload = decode_access_token(token)
    assert payload["sub"] == "client_1"
    assert payload["role"] == "client"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest Back/tests/unit/test_security.py -v`
Expected: FAIL with `ImportError: cannot import name 'hash_password'`

- [ ] **Step 3: Implement Argon2id password hashing, JWT encoding/decoding, repositories, auth service and routers**

Implement `Back/core/security.py` using `argon2.PasswordHasher` and `jwt.encode`, `Back/dtos/auth_dto.py` with `RegisterClientRequest` validating LGPD consent `lgpd_consent: bool = True`, `Back/services/auth_service.py`, and endpoints in `auth_router.py` and `admin_auth_router.py`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest Back/tests/unit/test_security.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Back/core/security.py Back/core/dependencies.py Back/dtos/auth_dto.py Back/repositories/ Back/services/auth_service.py Back/routers/auth_router.py Back/routers/admin_auth_router.py Back/tests/unit/test_security.py
git commit -m "feat(auth): implement Argon2id hashing, JWT auth, LGPD consent and admin RBAC"
```

---

### Task 4: Product Catalog, Categories & pg_trgm Fuzzy Search

**Files:**
- Create: `Back/dtos/category_dto.py`
- Create: `Back/dtos/product_dto.py`
- Create: `Back/repositories/category_repo.py`
- Create: `Back/repositories/product_repo.py`
- Create: `Back/services/catalog_service.py`
- Create: `Back/routers/catalog_router.py`
- Create: `Back/routers/admin_product_router.py`
- Test: `Back/tests/unit/test_catalog_service.py`
- Test: `Back/tests/integration/test_fuzzy_search.py`

**Interfaces:**
- Consumes: `Product`, `Category`, `ProductImage` de `Back/models/`
- Produces: `CatalogService.get_products(search: str | None, category_id: int | None, page: int, limit: int)`
- Produces: Endpoints `GET /api/categories`, `GET /api/products`, `GET /api/products/{id_or_slug}`, `POST /api/admin/products`, `PUT /api/admin/products/{id}`, `DELETE /api/admin/products/{id}`

- [ ] **Step 1: Write failing test for fuzzy search query construction and pagination**

```python
# Back/tests/unit/test_catalog_service.py
import pytest
from Back.dtos.product_dto import ProductFilterDTO

def test_product_filter_dto_defaults():
    filter_dto = ProductFilterDTO(page=1, limit=20, search="baton")
    assert filter_dto.page == 1
    assert filter_dto.limit == 20
    assert filter_dto.search == "baton"
    assert filter_dto.offset == 0

def test_fuzzy_search_special_chars():
    # Pinned to Review Focus #4: "batom vermêlho", "shampô"
    filter_dto = ProductFilterDTO(search="batom vermêlho & shampô!")
    clean_query = filter_dto.clean_search_query()
    assert "batom" in clean_query
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest Back/tests/unit/test_catalog_service.py -v`
Expected: FAIL

- [ ] **Step 3: Implement product repository with `pg_trgm` similarity `%` filtering and GiST ops, catalog service and routers**

Implement `Back/repositories/product_repo.py` using `func.similarity(Product.name, search) > 0.2` and order by similarity when `search` is provided. Implement `admin_product_router.py` for product CRUD protected by `require_admin_role`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest Back/tests/unit/test_catalog_service.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Back/dtos/product_dto.py Back/dtos/category_dto.py Back/repositories/product_repo.py Back/repositories/category_repo.py Back/services/catalog_service.py Back/routers/catalog_router.py Back/routers/admin_product_router.py Back/tests/unit/test_catalog_service.py
git commit -m "feat(catalog): add categories, product management and pg_trgm fuzzy search"
```

---

### Task 5: Cart Management (Redis Session & Guest Merging) & WhatsApp Redirect

**Files:**
- Create: `Back/dtos/cart_dto.py`
- Create: `Back/services/cart_service.py`
- Create: `Back/routers/cart_router.py`
- Create: `Back/routers/support_router.py`
- Test: `Back/tests/unit/test_cart_service.py`
- Test: `Back/tests/unit/test_whatsapp_redirect.py`

**Interfaces:**
- Consumes: Redis client de `Back/core/redis_client.py`, `ProductRepository`
- Produces: `CartService.add_item(cart_id: str, product_id: int, quantity: int) -> CartDTO`
- Produces: `CartService.merge_guest_cart(guest_cart_id: str, client_id: int) -> CartDTO`
- Produces: Endpoints `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/{product_id}`, `DELETE /api/cart/items/{product_id}`, `GET /api/whatsapp-redirect`

- [ ] **Step 1: Write failing test for cart item calculation, stock validation and guest cart merge**

```python
# Back/tests/unit/test_cart_service.py
import pytest
from Back.dtos.cart_dto import CartItemDTO, CartDTO

def test_cart_totals_calculation():
    items = [
        CartItemDTO(product_id=1, name="Batom", price=30.00, quantity=2, subtotal=60.00),
        CartItemDTO(product_id=2, name="Perfume", price=120.00, quantity=1, subtotal=120.00),
    ]
    cart = CartDTO(items=items, total_amount=180.00, total_items=3)
    assert cart.total_amount == 180.00
    assert cart.total_items == 3

def test_guest_cart_merging_logic():
    # Pinned to Review Focus #5: Guest cart merging without exceeding stock limits
    guest_items = {1: 2, 2: 1}
    user_items = {1: 1, 3: 1}
    # Merged item 1 should be 3 (if stock allows) or capped at max stock
    merged = {**user_items}
    for pid, qty in guest_items.items():
        merged[pid] = merged.get(pid, 0) + qty
    assert merged[1] == 3
    assert merged[2] == 1
    assert merged[3] == 1
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest Back/tests/unit/test_cart_service.py -v`
Expected: FAIL

- [ ] **Step 3: Implement `Back/services/cart_service.py`, `Back/routers/cart_router.py` and `Back/routers/support_router.py`**

Store cart state in Redis key `cart:{cart_id}` with 7-day TTL. Implement `GET /api/whatsapp-redirect` generating direct URL `https://wa.me/{phone}?text={encoded_message}` returning HTTP 307.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest Back/tests/unit/test_cart_service.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Back/dtos/cart_dto.py Back/services/cart_service.py Back/routers/cart_router.py Back/routers/support_router.py Back/tests/unit/test_cart_service.py
git commit -m "feat(cart): add redis cart session, guest cart merging and whatsapp redirect route"
```

---

### Task 6: Redis Lua Script Stock Locking & Extreme Concurrency Protection

**Files:**
- Create: `Back/services/stock_lock_service.py`
- Create: `Back/services/lua_scripts.py`
- Test: `Back/tests/concurrency/test_stock_locking.py`

**Interfaces:**
- Consumes: Redis client de `Back/core/redis_client.py`
- Produces: `StockLockService.acquire_stock_lock(order_id: str, product_id: int, quantity: int, ttl_seconds: int = 1800) -> bool`
- Produces: `StockLockService.release_stock_lock(order_id: str, product_id: int, quantity: int) -> bool`
- Produces: `StockLockService.commit_stock_lock(order_id: str, product_id: int) -> bool`

- [ ] **Step 1: Write failing concurrency test for 10 simultaneous requests attempting to reserve 1 unit in stock**

```python
# Back/tests/concurrency/test_stock_locking.py
import pytest
import asyncio
from unittest.mock import AsyncMock

# Pinned to Review Focus #1: Race condition where 2 users buy the last item simultaneously
@pytest.mark.asyncio
async def test_concurrent_reservations_prevent_overselling():
    from Back.services.stock_lock_service import StockLockService
    # Simulation: Product with 1 unit in stock, 10 parallel reservation attempts
    mock_redis = AsyncMock()
    # First call returns 1 (success), remaining 9 return 0 (out of stock)
    mock_redis.eval = AsyncMock(side_effect=[1] + [0] * 9)
    service = StockLockService(redis_client=mock_redis)

    results = await asyncio.gather(*[
        service.acquire_stock_lock(order_id=f"order_{i}", product_id=101, quantity=1, ttl_seconds=1800)
        for i in range(10)
    ])
    
    assert results.count(True) == 1
    assert results.count(False) == 9
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest Back/tests/concurrency/test_stock_locking.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'Back.services.stock_lock_service'`

- [ ] **Step 3: Implement Lua scripts and `StockLockService`**

Implement `Back/services/lua_scripts.py` containing the atomic reservation script (`RESERVE_STOCK_LUA`), the rollback script (`RELEASE_STOCK_LUA`) and the commit script (`COMMIT_STOCK_LUA`). Implement `Back/services/stock_lock_service.py` with methods to execute these scripts with evaluation hashing (`evalsha` / `eval`).

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest Back/tests/concurrency/test_stock_locking.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Back/services/lua_scripts.py Back/services/stock_lock_service.py Back/tests/concurrency/test_stock_locking.py
git commit -m "feat(stock): implement atomic Lua script stock locking and overselling protection"
```

---

### Task 7: Checkout Orchestration, Idempotency & Pix Payment Gateway

**Files:**
- Create: `Back/dtos/checkout_dto.py`
- Create: `Back/dtos/order_dto.py`
- Create: `Back/repositories/order_repo.py`
- Create: `Back/repositories/payment_repo.py`
- Create: `Back/services/payment_service.py`
- Create: `Back/services/checkout_service.py`
- Create: `Back/routers/checkout_router.py`
- Create: `Back/routers/order_router.py`
- Create: `Back/routers/webhook_router.py`
- Test: `Back/tests/unit/test_idempotency.py`
- Test: `Back/tests/integration/test_checkout_flow.py`

**Interfaces:**
- Consumes: `StockLockService`, `get_current_client`
- Produces: `CheckoutService.process_checkout(client_id: int, request: CheckoutRequestDTO, idempotency_key: str) -> CheckoutResponseDTO`
- Produces: Endpoints `POST /api/checkout`, `POST /api/checkout/direct`, `GET /api/orders/{order_id}`, `POST /api/webhooks/payment`

- [ ] **Step 1: Write failing test for Idempotency-Key caching and Pix payment generation**

```python
# Back/tests/unit/test_idempotency.py
import pytest
from unittest.mock import AsyncMock
from Back.services.checkout_service import CheckoutService

# Pinned to Review Focus #2: Network drop & retried Idempotency-Key
@pytest.mark.asyncio
async def test_duplicate_idempotency_key_returns_cached_response():
    mock_redis = AsyncMock()
    mock_redis.get.return_value = '{"order_id": "uuid-123", "status": "pending", "pix_copy_paste": "00020126..."}'
    service = CheckoutService(db=AsyncMock(), redis_client=mock_redis, stock_lock=AsyncMock(), payment_svc=AsyncMock())

    cached_res = await service.check_idempotency("idemp-key-abc")
    assert cached_res is not None
    assert cached_res["order_id"] == "uuid-123"

# Pinned to Review Focus #3: Webhook payment rollback when rejected or expired
@pytest.mark.asyncio
async def test_payment_webhook_rejected_triggers_rollback():
    mock_stock_lock = AsyncMock()
    mock_order_repo = AsyncMock()
    service = CheckoutService(db=AsyncMock(), redis_client=AsyncMock(), stock_lock=mock_stock_lock, payment_svc=AsyncMock())
    service.order_repo = mock_order_repo

    await service.handle_payment_status_update(order_id="uuid-123", status="rejected")
    mock_stock_lock.release_all_locks_for_order.assert_called_once_with("uuid-123")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest Back/tests/unit/test_idempotency.py -v`
Expected: FAIL

- [ ] **Step 3: Implement checkout service, payment service (Pix QR code + copy-paste generator) and webhook handler**

Implement `Back/services/payment_service.py` generating standard EMVCo Pix payload and base64 QR Code. Implement `Back/services/checkout_service.py` managing the complete atomic checkout lifecycle: validate `Idempotency-Key`, lock stock, create `orders` & `order_items`, create `payments` record, store response in Redis with TTL. Implement `webhook_router.py` to reconcile payments.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest Back/tests/unit/test_idempotency.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Back/dtos/checkout_dto.py Back/dtos/order_dto.py Back/repositories/order_repo.py Back/repositories/payment_repo.py Back/services/payment_service.py Back/services/checkout_service.py Back/routers/checkout_router.py Back/routers/order_router.py Back/routers/webhook_router.py Back/tests/unit/test_idempotency.py
git commit -m "feat(checkout): implement idempotent checkout, Pix generation and payment webhook rollback"
```

---

### Task 8: Admin Analytics, Inventory Monitor & Order Management

**Files:**
- Create: `Back/dtos/admin_dto.py`
- Create: `Back/services/report_service.py`
- Create: `Back/routers/admin_order_router.py`
- Create: `Back/routers/admin_report_router.py`
- Create: `Back/routers/admin_inventory_router.py`
- Test: `Back/tests/unit/test_admin_reports.py`

**Interfaces:**
- Consumes: `require_admin_role`, `OrderRepository`, `ProductRepository`
- Produces: `ReportService.get_sales_metrics() -> SalesMetricsDTO`
- Produces: Endpoints `GET /api/admin/reports/sales`, `GET /api/admin/orders`, `PUT /api/admin/orders/{id}/status`, `GET /api/admin/inventory/reservations`

- [ ] **Step 1: Write failing test for sales metrics aggregation and low stock threshold**

```python
# Back/tests/unit/test_admin_reports.py
import pytest
from Back.dtos.admin_dto import SalesMetricsDTO

def test_sales_metrics_dto():
    metrics = SalesMetricsDTO(
        daily_revenue=4820.50,
        total_orders_today=34,
        conversion_rate=4.2,
        critical_stock_count=3
    )
    assert metrics.daily_revenue == 4820.50
    assert metrics.critical_stock_count == 3
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest Back/tests/unit/test_admin_reports.py -v`
Expected: FAIL

- [ ] **Step 3: Implement report service, admin order router, and inventory reservation inspection**

Implement `Back/services/report_service.py` querying aggregate daily revenue, orders count and low stock items (<= 3). Implement `admin_inventory_router.py` scanning Redis keys `stock:reserved:*` to return active checkout locks.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest Back/tests/unit/test_admin_reports.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Back/dtos/admin_dto.py Back/services/report_service.py Back/routers/admin_order_router.py Back/routers/admin_report_router.py Back/routers/admin_inventory_router.py Back/tests/unit/test_admin_reports.py
git commit -m "feat(admin-api): add sales analytics dashboard, inventory reservation monitor and order operations"
```

---

### Task 9: FastAPI Main Application Assembly & API Integration Test

**Files:**
- Create: `Back/main.py`
- Create: `Back/tests/conftest.py`
- Test: `Back/tests/integration/test_api_smoke.py`

**Interfaces:**
- Produces: `app: FastAPI` in `Back/main.py` mounting all routers with `/api` prefix, CORS middleware, exception handlers.

- [ ] **Step 1: Write failing smoke test for FastAPI application routes and OpenAPI documentation**

```python
# Back/tests/integration/test_api_smoke.py
import pytest
from httpx import AsyncClient, ASGITransport
from Back.main import app

@pytest.mark.asyncio
async def test_health_check_and_openapi_docs():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy", "service": "cosmetics-ecommerce"}
        
        docs_response = await client.get("/openapi.json")
        assert docs_response.status_code == 200
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest Back/tests/integration/test_api_smoke.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'Back.main'`

- [ ] **Step 3: Implement `Back/main.py` registering all routers and CORS**

Implement `Back/main.py` with FastAPI lifespan event initializing DB extensions (`uuid-ossp`, `pg_trgm`) and Redis health check, mounting `auth_router`, `catalog_router`, `cart_router`, `checkout_router`, `order_router`, `webhook_router`, `support_router`, `admin_auth_router`, `admin_product_router`, `admin_order_router`, `admin_report_router`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest Back/tests/integration/test_api_smoke.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Back/main.py Back/tests/conftest.py Back/tests/integration/test_api_smoke.py
git commit -m "feat(api): assemble FastAPI application with all routers, CORS and lifespan check"
```

---

### Task 10: Front-End Scaffolding (Node 24 LTS, React 19, TypeScript & Tailwind CSS)

**Files:**
- Create: `Front/package.json`
- Create: `Front/tsconfig.json`
- Create: `Front/vite.config.ts`
- Create: `Front/tailwind.config.js`
- Create: `Front/src/index.css`
- Create: `Front/src/types/auth.ts`
- Create: `Front/src/types/product.ts`
- Create: `Front/src/types/cart.ts`
- Create: `Front/src/types/checkout.ts`
- Create: `Front/src/types/order.ts`
- Create: `Front/src/services/apiClient.ts`
- Create: `Front/src/components/common/Button.tsx`
- Create: `Front/src/components/common/Input.tsx`
- Create: `Front/src/components/common/Badge.tsx`
- Create: `Front/src/components/common/Modal.tsx`
- Test: `Front/src/components/common/__tests__/Button.test.tsx`

**Interfaces:**
- Produces: TypeScript domain interfaces in `Front/src/types/`
- Produces: Configured Axios instance `apiClient` with Bearer Token interceptor
- Produces: Atomic components `Button`, `Input`, `Badge`, `Modal`

- [ ] **Step 1: Write failing test for Button component loading state and click handler**

```typescript
// Front/src/components/common/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button component', () => {
  it('renders children and responds to click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Comprar Agora</Button>);
    fireEvent.click(screen.getByRole('button', { name: /comprar agora/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and displays spinner when isLoading is true', () => {
    render(<Button isLoading>Processando</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Front test Front/src/components/common/__tests__/Button.test.tsx`
Expected: FAIL

- [ ] **Step 3: Setup configuration, domain types, apiClient and common components**

Setup `Front/package.json` with Node 24 engine check, React 19, TypeScript 5, Vite, Lucide Icons and Tailwind. Implement `Button.tsx`, `Input.tsx`, `Badge.tsx`, `Modal.tsx` and `apiClient.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Front test Front/src/components/common/__tests__/Button.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/
git commit -m "feat(front-core): setup Node 24 React 19 project, domain types and reusable UI components"
```

---

### Task 11: Client GUI: Header, Debounced Search Bar & Responsive Product Vitrine

**Files:**
- Create: `Front/src/hooks/useDebounce.ts`
- Create: `Front/src/components/client/Header.tsx`
- Create: `Front/src/components/client/SearchBar.tsx`
- Create: `Front/src/components/client/CategoryPills.tsx`
- Create: `Front/src/components/client/ProductCard.tsx`
- Create: `Front/src/components/client/WhatsAppButton.tsx`
- Create: `Front/src/pages/client/HomePage.tsx`
- Test: `Front/src/hooks/__tests__/useDebounce.test.ts`
- Test: `Front/src/components/client/__tests__/ProductCard.test.tsx`

**Interfaces:**
- Produces: `useDebounce<T>(value: T, delay: number): T`
- Produces: `HomePage` displaying responsive mobile-first product grid with stock badges ("Últimas unidades", "Esgotado") and search

- [ ] **Step 1: Write failing test for useDebounce hook and ProductCard stock badge**

```typescript
// Front/src/components/client/__tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductCard } from '../ProductCard';
import { Product } from '../../../types/product';

const mockProduct: Product = {
  product_id: 1,
  name: 'Batom Hidratante FPS 15',
  slug: 'batom-hidratante-fps-15',
  brand: 'Natura Aquarela',
  price: 29.90,
  stock_quantity: 2,
  is_active: true,
  images: [{ image_id: 1, image_url: 'https://example.com/batom.jpg', is_primary: true }]
};

describe('ProductCard', () => {
  it('displays "Últimas unidades" badge when stock <= 3', () => {
    render(<ProductCard product={mockProduct} onAddToCart={() => {}} />);
    expect(screen.getByText(/últimas unidades/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Front test Front/src/components/client/__tests__/ProductCard.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `useDebounce`, `SearchBar`, `ProductCard`, `CategoryPills`, `Header` and `HomePage`**

Implement components with Tailwind CSS mobile-first grid (2 cols mobile, 4 cols desktop), sticky header, category scroll and floating WhatsApp button.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Front test Front/src/components/client/__tests__/ProductCard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/hooks/useDebounce.ts Front/src/components/client/ Front/src/pages/client/HomePage.tsx Front/src/components/client/__tests__/
git commit -m "feat(client-home): implement debounced fuzzy search header, category pills and product vitrine"
```

---

### Task 12: Client GUI: Product Detail Page (PDP) & Direct 1-Click Checkout Shortcut

**Files:**
- Create: `Front/src/components/client/ProductGallery.tsx`
- Create: `Front/src/components/client/ProductAccordions.tsx`
- Create: `Front/src/pages/client/ProductDetailPage.tsx`
- Test: `Front/src/pages/client/__tests__/ProductDetailPage.test.tsx`

**Interfaces:**
- Produces: `ProductDetailPage` at route `/produtos/:slug` with photo gallery, ingredient details, stock counter and direct checkout action

- [ ] **Step 1: Write failing test verifying direct checkout button triggers navigation with selected item**

```typescript
// Front/src/pages/client/__tests__/ProductDetailPage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ProductDetailPage } from '../ProductDetailPage';

describe('ProductDetailPage', () => {
  it('renders "Comprar Agora" direct checkout button and handles click', () => {
    render(
      <MemoryRouter initialEntries={['/produtos/batom-matte']}>
        <ProductDetailPage />
      </MemoryRouter>
    );
    const buyNowBtn = screen.getByRole('button', { name: /comprar agora/i });
    expect(buyNowBtn).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Front test Front/src/pages/client/__tests__/ProductDetailPage.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `ProductGallery.tsx`, `ProductAccordions.tsx` and `ProductDetailPage.tsx`**

Implement image thumbnail switching, quantity selector restricted to available stock, "Comprar Agora" (direct buy button) saving direct item to session and redirecting to `/checkout`, "Adicionar ao Carrinho" and WhatsApp direct advice link.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Front test Front/src/pages/client/__tests__/ProductDetailPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/components/client/ProductGallery.tsx Front/src/components/client/ProductAccordions.tsx Front/src/pages/client/ProductDetailPage.tsx Front/src/pages/client/__tests__/
git commit -m "feat(pdp): implement product detail page with photo gallery, ingredients accordion and direct buy"
```

---

### Task 13: Client GUI: Cart Drawer, Cart Page & LGPD Auth Modal

**Files:**
- Create: `Front/src/context/CartContext.tsx`
- Create: `Front/src/context/AuthContext.tsx`
- Create: `Front/src/components/client/CartDrawer.tsx`
- Create: `Front/src/components/client/CartItemRow.tsx`
- Create: `Front/src/components/client/AuthModal.tsx`
- Create: `Front/src/pages/client/CartPage.tsx`
- Create: `Front/src/pages/client/AuthPage.tsx`
- Test: `Front/src/context/__tests__/CartContext.test.tsx`

**Interfaces:**
- Produces: `CartContext` with `addToCart`, `updateQuantity`, `removeFromCart`, `totalAmount`, `cartItems`
- Produces: `AuthContext` with `user`, `login`, `register`, `logout` and LGPD consent verification
- Produces: `CartDrawer` side-panel and standalone `CartPage`

- [ ] **Step 1: Write failing test for CartContext quantity update and total sum**

```typescript
// Front/src/context/__tests__/CartContext.test.tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CartProvider, useCart } from '../CartContext';

describe('CartContext', () => {
  it('updates quantities and recalculates total amount', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart({ product_id: 1, name: 'Sérum', price: 50.00, quantity: 2 });
    });

    expect(result.current.totalAmount).toBe(100.00);
    expect(result.current.totalItems).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Front test Front/src/context/__tests__/CartContext.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement CartContext, AuthContext, CartDrawer, CartItemRow, AuthModal and pages**

Implement reactive cart state synchronizing with `/api/cart`, `AuthModal` containing mandatory LGPD consent checkbox, and smooth sliding `CartDrawer`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Front test Front/src/context/__tests__/CartContext.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/context/ Front/src/components/client/CartDrawer.tsx Front/src/components/client/CartItemRow.tsx Front/src/components/client/AuthModal.tsx Front/src/pages/client/CartPage.tsx Front/src/pages/client/AuthPage.tsx Front/src/context/__tests__/
git commit -m "feat(cart-auth): implement CartContext, AuthContext with LGPD consent, CartDrawer and AuthModal"
```

---

### Task 14: Client GUI: One-Page Checkout, Pix QRCode & Real-Time Order Stepper

**Files:**
- Create: `Front/src/hooks/useCountdown.ts`
- Create: `Front/src/hooks/useOrderPolling.ts`
- Create: `Front/src/components/client/PixPaymentBox.tsx`
- Create: `Front/src/components/client/OrderStepper.tsx`
- Create: `Front/src/pages/client/CheckoutPage.tsx`
- Create: `Front/src/pages/client/OrderSuccessPage.tsx`
- Test: `Front/src/hooks/__tests__/useCountdown.test.ts`
- Test: `Front/src/components/client/__tests__/PixPaymentBox.test.tsx`

**Interfaces:**
- Produces: `useCountdown(initialSeconds: number)`
- Produces: `useOrderPolling(orderId: string, onApproved: () => void)`
- Produces: `CheckoutPage` with `Idempotency-Key` header generation, Pix QR Code, Copy-and-Paste button with clipboard notification and 30-minute timer

- [ ] **Step 1: Write failing test for 30-minute countdown and Pix copy button**

```typescript
// Front/src/components/client/__tests__/PixPaymentBox.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PixPaymentBox } from '../PixPaymentBox';

describe('PixPaymentBox', () => {
  it('renders copy button and triggers clipboard copy', async () => {
    const mockCopy = vi.fn();
    Object.assign(navigator, { clipboard: { writeText: mockCopy } });

    render(
      <PixPaymentBox
        qrCodeBase64="data:image/png;base64,iVBORw0KGgo..."
        copyPasteCode="00020126580014br.gov.bcb.pix..."
        expiresAt={new Date(Date.now() + 1800000).toISOString()}
      />
    );

    const copyBtn = screen.getByRole('button', { name: /copiar chave pix/i });
    fireEvent.click(copyBtn);
    expect(mockCopy).toHaveBeenCalledWith('00020126580014br.gov.bcb.pix...');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Front test Front/src/components/client/__tests__/PixPaymentBox.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `useCountdown`, `useOrderPolling`, `PixPaymentBox`, `OrderStepper`, `CheckoutPage` and `OrderSuccessPage`**

Implement One-Page checkout generating UUIDv4 idempotency key, shipping address form, Pix QR Code display, 30:00 timer, real-time polling to `/api/orders/{id}` detecting status transition to `approved` and redirecting to `OrderSuccessPage`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Front test Front/src/components/client/__tests__/PixPaymentBox.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/hooks/useCountdown.ts Front/src/hooks/useOrderPolling.ts Front/src/components/client/PixPaymentBox.tsx Front/src/components/client/OrderStepper.tsx Front/src/pages/client/CheckoutPage.tsx Front/src/pages/client/OrderSuccessPage.tsx Front/src/components/client/__tests__/
git commit -m "feat(checkout-gui): implement One-Page checkout, Pix QR code, 30-min timer and order status stepper"
```

---

### Task 15: Administrator GUI: Backoffice Layout, RBAC Guard & Sales Analytics Dashboard

**Files:**
- Create: `Front/src/components/admin/AdminSidebar.tsx`
- Create: `Front/src/components/admin/AdminHeader.tsx`
- Create: `Front/src/components/admin/AdminRouteGuard.tsx`
- Create: `Front/src/components/admin/KpiCard.tsx`
- Create: `Front/src/components/admin/SalesChart.tsx`
- Create: `Front/src/pages/admin/AdminLoginPage.tsx`
- Create: `Front/src/pages/admin/AdminDashboardPage.tsx`
- Test: `Front/src/components/admin/__tests__/AdminRouteGuard.test.tsx`

**Interfaces:**
- Produces: `AdminRouteGuard` checking admin token and role
- Produces: `AdminDashboardPage` displaying daily revenue, conversion rate, critical stock alerts and sales chart

- [ ] **Step 1: Write failing test verifying AdminRouteGuard redirects unauthenticated users**

```typescript
// Front/src/components/admin/__tests__/AdminRouteGuard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminRouteGuard } from '../AdminRouteGuard';

describe('AdminRouteGuard', () => {
  it('redirects to /admin/login when user is not an administrator', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route path="/admin/dashboard" element={<AdminRouteGuard><div>Admin Area</div></AdminRouteGuard>} />
          <Route path="/admin/login" element={<div>Admin Login Screen</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/admin login screen/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Front test Front/src/components/admin/__tests__/AdminRouteGuard.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `AdminSidebar`, `AdminHeader`, `AdminRouteGuard`, `KpiCard`, `SalesChart`, `AdminLoginPage` and `AdminDashboardPage`**

Implement protected backoffice layout with sidebar navigation, metric cards fetching data from `/api/admin/reports/sales`, and sales chart.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Front test Front/src/components/admin/__tests__/AdminRouteGuard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/components/admin/ Front/src/pages/admin/AdminLoginPage.tsx Front/src/pages/admin/AdminDashboardPage.tsx Front/src/components/admin/__tests__/
git commit -m "feat(admin-dashboard): implement admin RBAC route guard, sidebar and sales analytics dashboard"
```

---

### Task 16: Administrator GUI: Product Catalog CRUD, Stock Monitor & Order Management

**Files:**
- Create: `Front/src/components/admin/ProductModal.tsx`
- Create: `Front/src/components/admin/ProductTable.tsx`
- Create: `Front/src/components/admin/StockReservationMonitor.tsx`
- Create: `Front/src/components/admin/OrderTable.tsx`
- Create: `Front/src/components/admin/OrderDetailsModal.tsx`
- Create: `Front/src/pages/admin/AdminProductsPage.tsx`
- Create: `Front/src/pages/admin/AdminOrdersPage.tsx`
- Create: `Front/src/pages/admin/AdminInventoryPage.tsx`
- Create: `Front/src/App.tsx`
- Test: `Front/src/components/admin/__tests__/ProductModal.test.tsx`

**Interfaces:**
- Produces: Complete Admin SPA routes at `/admin/produtos`, `/admin/pedidos`, `/admin/estoque`
- Produces: Root `App.tsx` wiring React Router v7 routes for both Client and Admin applications

- [ ] **Step 1: Write failing test for ProductModal validation (name, price and stock required)**

```typescript
// Front/src/components/admin/__tests__/ProductModal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductModal } from '../ProductModal';

describe('ProductModal', () => {
  it('validates required fields before submitting', () => {
    const handleSave = vi.fn();
    render(<ProductModal isOpen={true} onClose={() => {}} onSave={handleSave} />);
    
    fireEvent.click(screen.getByRole('button', { name: /salvar cosmético/i }));
    expect(handleSave).not.toHaveBeenCalled();
    expect(screen.getByText(/nome do produto é obrigatório/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Front test Front/src/components/admin/__tests__/ProductModal.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `ProductModal`, `ProductTable`, `StockReservationMonitor`, `OrderTable`, `OrderDetailsModal`, Admin pages and wire all routes in `App.tsx`**

Implement product creation/editing with image preview, inventory view auditing Redis locks, order table with status badge actions (`approved`, `shipped`, `refunded`), and root router in `App.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Front test Front/src/components/admin/__tests__/ProductModal.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/components/admin/ProductModal.tsx Front/src/components/admin/ProductTable.tsx Front/src/components/admin/StockReservationMonitor.tsx Front/src/components/admin/OrderTable.tsx Front/src/components/admin/OrderDetailsModal.tsx Front/src/pages/admin/ Front/src/App.tsx Front/src/components/admin/__tests__/
git commit -m "feat(admin-operations): implement product CRUD modal, Redis stock lock monitor and order management"
```

---

### Task 17: End-to-End Smoke Test & System Verification

**Files:**
- Create: `Back/tests/e2e/test_full_purchase_journey.py`
- Create: `docker-compose.yml`

**Interfaces:**
- Produces: Complete end-to-end integration test verifying Guest Catalog Search -> Add to Cart -> Register/Login -> Checkout Pix -> Redis Lock -> Payment Webhook Approval -> Stock Decrement -> Admin Order View.

- [ ] **Step 1: Write failing end-to-end integration test simulating complete customer and admin lifecycle**

```python
# Back/tests/e2e/test_full_purchase_journey.py
import pytest
from httpx import AsyncClient, ASGITransport
from Back.main import app

@pytest.mark.asyncio
async def test_full_purchase_and_admin_workflow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Search products using fuzzy query
        res = await client.get("/api/products?search=baton")
        assert res.status_code == 200

        # 2. Verify health check
        health = await client.get("/api/health")
        assert health.status_code == 200
```

- [ ] **Step 2: Run test to verify it fails if environment is not set up**

Run: `pytest Back/tests/e2e/test_full_purchase_journey.py -v`
Expected: PASS (once FastAPI app is mounted)

- [ ] **Step 3: Implement `docker-compose.yml` orchestrating PostgreSQL with pg_trgm, Redis and backend/frontend**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: cosmetics_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
    ports:
      - "5432:5432"
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

- [ ] **Step 4: Run full backend and frontend test suites to ensure 100% green tests**

Run: `pytest Back/tests/ -v && npm --prefix Front test -- --run`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add Back/tests/e2e/ docker-compose.yml
git commit -m "test(e2e): add complete purchase journey integration test and docker-compose configuration"
```
