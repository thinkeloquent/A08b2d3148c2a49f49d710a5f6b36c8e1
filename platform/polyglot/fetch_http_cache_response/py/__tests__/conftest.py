"""Integration test fixtures."""

import pytest
from unittest.mock import AsyncMock, MagicMock


@pytest.fixture
def mock_http_response():
    response = MagicMock()
    response.status_code = 200
    response.headers = {"content-type": "application/json"}
    response.json.return_value = {"integration": "ok"}
    response.text = '{"integration": "ok"}'
    return response


@pytest.fixture
def mock_http_client(mock_http_response):
    client = AsyncMock()
    client.request = AsyncMock(return_value=mock_http_response)
    client.aclose = AsyncMock()
    return client


@pytest.fixture
def mock_storage():
    storage = AsyncMock()
    storage.load = AsyncMock(return_value=None)
    storage.save = AsyncMock()
    storage.delete = AsyncMock()
    storage.close = AsyncMock()
    return storage
