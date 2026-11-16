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
