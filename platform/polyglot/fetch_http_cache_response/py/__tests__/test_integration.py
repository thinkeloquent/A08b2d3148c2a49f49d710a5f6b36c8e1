"""Integration tests — end-to-end SDK flow (Story 6, Task 6.4)."""

import time

import pytest
from unittest.mock import AsyncMock, MagicMock

from fetch_http_cache_response import (
    FetchHttpCacheClient,
    SDKConfig,
    HttpFetchConfig,
    CacheResponseConfig,
    AuthRefreshConfig,
    create_fetch_cache_sdk,
    create_token_manager,
)


class TestEndToEndCacheFlow:
    """SDK → HTTP call → cache store → second call returns cached."""

    async def test_fetch_then_cache_hit(self, mock_http_client, mock_storage):
        config = SDKConfig(
            http=HttpFetchConfig(base_url="https://api.example.com"),
            cache=CacheResponseConfig(enabled=True, ttl_seconds=600),
        )
        client = FetchHttpCacheClient(
            config=config,
            http_client=mock_http_client,
            storage=mock_storage,
        )

        # First call — cache miss, HTTP fetch
        result1 = await client.get("/users")
        assert result1.success is True
        assert result1.cached is False
        assert result1.data == {"integration": "ok"}

        # Simulate cache now has the entry
        now = time.time()
        mock_storage.load = AsyncMock(return_value={
            "key": result1.cache_key,
            "data": {
                "response": {
                    "status_code": 200,
                    "headers": {"content-type": "application/json"},
                    "body": {"integration": "ok"},
                },
                "created_at": now,
                "expires_at": now + 600,
            },
            "created_at": now,
            "expires_at": now + 600,
        })

        # Second call — cache hit
        result2 = await client.get("/users")
        assert result2.success is True
        assert result2.cached is True
        assert result2.data == {"integration": "ok"}

        # HTTP client should only have been called once
        assert mock_http_client.request.await_count == 1

        await client.close()

    async def test_sdk_factory_creates_working_client(self, mock_http_client, mock_storage):
        config = SDKConfig(
            http=HttpFetchConfig(base_url="https://api.example.com"),
            auth=AuthRefreshConfig(auth_type="bearer", auth_token="tok_abc"),
            cache=CacheResponseConfig(enabled=False),
        )
        client = create_fetch_cache_sdk(config)
        # Replace internals with mocks
        client._http_client = mock_http_client
        client._storage = mock_storage

        result = await client.get("/health")
        assert result.success is True

        await client.close()

    async def test_context_manager_lifecycle(self, mock_http_client, mock_storage):
        config = SDKConfig(
            http=HttpFetchConfig(base_url="https://api.example.com"),
            cache=CacheResponseConfig(enabled=False),
        )
        async with FetchHttpCacheClient(
            config=config,
            http_client=mock_http_client,
            storage=mock_storage,
        ) as client:
            result = await client.get("/data")
            assert result.success is True

        mock_http_client.aclose.assert_awaited_once()
