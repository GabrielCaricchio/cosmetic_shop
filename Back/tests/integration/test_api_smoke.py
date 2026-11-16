import pytest
from httpx import AsyncClient, ASGITransport
from Back.main import app

@pytest.mark.asyncio
async def test_health_check_and_openapi_docs():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        response = await client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy", "service": "cosmetics-ecommerce"}

        # 2. Swagger UI endpoint
        docs = await client.get("/docs")
        assert docs.status_code == 200
        assert "swagger-ui" in docs.text.lower() or "swagger" in docs.text.lower()

        # 3. ReDoc endpoint
        redoc = await client.get("/redoc")
        assert redoc.status_code == 200
        assert "redoc" in redoc.text.lower()

        # 4. OpenAPI JSON specification
        openapi = await client.get("/openapi.json")
        assert openapi.status_code == 200
        data = openapi.json()

        # Verify Metadata
        assert data["info"]["title"] == "Aura Cosméticos — API de E-Commerce & Marketplace"
        assert data["info"]["version"] == "1.0.0"
        assert "pg_trgm" in data["info"]["description"]

        # Verify Tags
        tag_names = [t["name"] for t in data["tags"]]
        expected_tags = [
            "Health", "Auth", "Catalog", "Cart", "Checkout", "Orders",
            "Webhooks", "Support", "Admin Auth", "Admin Products",
            "Admin Orders", "Admin Reports", "Admin Inventory"
        ]
        for expected in expected_tags:
            assert expected in tag_names, f"Tag {expected} ausente no OpenAPI"

        # Verify Paths
        paths = data["paths"]
        assert "/api/health" in paths
        assert "/api/register" in paths
        assert "/api/login" in paths
        assert "/api/me" in paths
        assert "/api/categories" in paths
        assert "/api/products" in paths
        assert "/api/products/{id_or_slug}" in paths
        assert "/api/cart" in paths
        assert "/api/cart/items" in paths
        assert "/api/checkout" in paths
        assert "/api/checkout/direct" in paths
        assert "/api/orders" in paths
        assert "/api/orders/{order_id}" in paths
        assert "/api/webhooks/payment" in paths
        assert "/api/admin/login" in paths
        assert "/api/admin/products" in paths
        assert "/api/admin/orders" in paths
        assert "/api/admin/reports/sales" in paths
        assert "/api/admin/inventory/reservations" in paths

        # Verify Security Schemes
        assert "HTTPBearer" in data["components"]["securitySchemes"]
