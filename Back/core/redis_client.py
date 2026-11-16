from collections.abc import AsyncGenerator
import redis.asyncio as aioredis
from Back.core.config import settings

redis_pool = aioredis.ConnectionPool.from_url(
    settings.REDIS_URL,
    max_connections=50,
    decode_responses=True
)

def get_redis_client() -> aioredis.Redis:
    """Returns an async Redis client from the pool."""
    return aioredis.Redis(connection_pool=redis_pool)

async def get_redis() -> AsyncGenerator[aioredis.Redis, None]:
    """Dependency yielding an async Redis connection."""
    client = get_redis_client()
    try:
        yield client
    finally:
        await client.aclose()
