import pytest
from unittest.mock import AsyncMock

@pytest.fixture
def mock_redis():
    client = AsyncMock()
    client.get.return_value = None
    client.set.return_value = True
    client.delete.return_value = True
    return client
