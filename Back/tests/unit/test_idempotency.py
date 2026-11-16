import pytest
from unittest.mock import AsyncMock
from Back.services.checkout_service import CheckoutService

# Pinned to Review Focus #2: Network drop & retried Idempotency-Key
@pytest.mark.asyncio
async def test_duplicate_idempotency_key_returns_cached_response():
    mock_redis = AsyncMock()
    mock_redis.get.return_value = '{"order_id": "uuid-123", "status": "pending", "pix_copy_paste": "00020126..."}'
    service = CheckoutService(
        db=AsyncMock(),
        redis_client=mock_redis,
        stock_lock=AsyncMock(),
        payment_svc=AsyncMock(),
        order_repo=AsyncMock(),
        product_repo=AsyncMock()
    )

    cached_res = await service.check_idempotency("idemp-key-abc")
    assert cached_res is not None
    assert cached_res["order_id"] == "uuid-123"

# Pinned to Review Focus #3: Webhook payment rollback when rejected or expired
@pytest.mark.asyncio
async def test_payment_webhook_rejected_triggers_rollback():
    mock_stock_lock = AsyncMock()
    mock_order_repo = AsyncMock()
    service = CheckoutService(
        db=AsyncMock(),
        redis_client=AsyncMock(),
        stock_lock=mock_stock_lock,
        payment_svc=AsyncMock(),
        order_repo=mock_order_repo,
        product_repo=AsyncMock()
    )

    await service.handle_payment_status_update(order_id="uuid-123", status="rejected")
    mock_stock_lock.release_all_locks_for_order.assert_called_once_with("uuid-123")
