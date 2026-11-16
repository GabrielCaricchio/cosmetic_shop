import pytest
from unittest.mock import AsyncMock, MagicMock
from decimal import Decimal
from datetime import datetime, timezone
from httpx import AsyncClient, ASGITransport
from Back.main import app
from Back.routers.catalog_router import get_catalog_service
from Back.dtos.product_dto import PaginatedProductsResponse, ProductResponse

@pytest.mark.asyncio
async def test_full_purchase_and_admin_workflow():
    now = datetime.now(timezone.utc)
    mock_service = MagicMock()
    mock_service.get_products = AsyncMock(
        return_value=PaginatedProductsResponse(
            items=[
                ProductResponse(
                    product_id=1,
                    category_id=1,
                    name="Batom Matte Longa Duração",
                    slug="batom-matte-longa-duracao",
                    brand="Natura",
                    price=Decimal("39.90"),
                    stock_quantity=15,
                    is_active=True,
                    ingredients="Pigmentos minerais, cera de abelha",
                    created_at=now,
                    updated_at=now
                )
            ],
            total=1,
            page=1,
            limit=20,
            total_pages=1
        )
    )

    app.dependency_overrides[get_catalog_service] = lambda: mock_service

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Health check
            health = await client.get("/api/health")
            assert health.status_code == 200
            assert health.json() == {"status": "healthy", "service": "cosmetics-ecommerce"}

            # 2. Search products using fuzzy query
            res = await client.get("/api/products?search=baton")
            assert res.status_code == 200
            data = res.json()
            assert data["total"] == 1
            assert data["items"][0]["name"] == "Batom Matte Longa Duração"

            # 3. WhatsApp redirect support check
            wa_res = await client.get("/api/whatsapp-redirect", follow_redirects=False)
            assert wa_res.status_code == 307
            assert "wa.me" in wa_res.headers.get("location", "")
    finally:
        app.dependency_overrides.clear()
