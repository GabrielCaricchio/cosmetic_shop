import redis.asyncio as aioredis
from typing import Optional
from Back.services.lua_scripts import RESERVE_STOCK_LUA, RELEASE_STOCK_LUA, COMMIT_STOCK_LUA

class StockLockService:
    def __init__(self, redis_client: aioredis.Redis):
        self.redis = redis_client

    def _available_key(self, product_id: int) -> str:
        return f"stock:available:{product_id}"

    def _reserved_key(self, order_id: str, product_id: int) -> str:
        return f"stock:reserved:{order_id}:{product_id}"

    async def init_stock(self, product_id: int, quantity: int) -> None:
        """Initialize or sync cache available stock from database."""
        await self.redis.set(self._available_key(product_id), quantity)

    async def acquire_stock_lock(
        self,
        order_id: str,
        product_id: int,
        quantity: int,
        ttl_seconds: int = 1800
    ) -> bool:
        """
        Executes atomic Lua script to reserve stock.
        Returns True if reservation was granted, False otherwise.
        """
        keys = [self._available_key(product_id), self._reserved_key(order_id, product_id)]
        args = [quantity, ttl_seconds]

        res = await self.redis.eval(RESERVE_STOCK_LUA, len(keys), *keys, *args)
        return res == 1

    async def release_stock_lock(self, order_id: str, product_id: int) -> bool:
        """
        Releases reserved stock back to available pool on order cancellation or failure.
        """
        keys = [self._available_key(product_id), self._reserved_key(order_id, product_id)]
        res = await self.redis.eval(RELEASE_STOCK_LUA, len(keys), *keys)
        return res == 1

    async def commit_stock_lock(self, order_id: str, product_id: int) -> bool:
        """
        Deletes reservation key upon permanent DB settlement.
        """
        keys = [self._reserved_key(order_id, product_id)]
        res = await self.redis.eval(COMMIT_STOCK_LUA, len(keys), *keys)
        return res == 1

    async def release_all_locks_for_order(self, order_id: str) -> None:
        """Finds all active reservation keys for an order and releases them."""
        pattern = f"stock:reserved:{order_id}:*"
        cursor = 0
        while True:
            cursor, keys = await self.redis.scan(cursor, match=pattern, count=100)
            for key in keys:
                # Key format: stock:reserved:{order_id}:{product_id}
                parts = key.split(":")
                if len(parts) >= 4 and parts[3].isdigit():
                    product_id = int(parts[3])
                    await self.release_stock_lock(order_id, product_id)
            if cursor == 0:
                break
