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
