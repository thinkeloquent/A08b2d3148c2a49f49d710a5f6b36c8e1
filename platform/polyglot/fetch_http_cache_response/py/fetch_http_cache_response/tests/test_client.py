"""Tests for FetchHttpCacheClient (Story 6, Task 6.3)."""

import time
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from fetch_http_cache_response.client import FetchHttpCacheClient, _generate_cache_key
from fetch_http_cache_response.exceptions import (
    FetchCacheNetworkError,
    FetchCacheStorageError,
)
from fetch_http_cache_response.types import (
    CacheResponseConfig,
    HttpFetchConfig,
    SDKConfig,
)


class TestGenerateCacheKey:
    def test_url_strategy(self):
        key = _generate_cache_key("GET", "https://api.example.com/data", "url", "fhcr:")
        assert key.startswith("fhcr:")
        assert len(key) == 5 + 16  # prefix + 16 hex chars

    def test_same_input_same_key(self):
        k1 = _generate_cache_key("GET", "https://api.example.com/data", "url", "fhcr:")
        k2 = _generate_cache_key("GET", "https://api.example.com/data", "url", "fhcr:")
        assert k1 == k2

    def test_different_method_different_key(self):
        k1 = _generate_cache_key("GET", "https://api.example.com/data", "url", "fhcr:")
        k2 = _generate_cache_key("POST", "https://api.example.com/data", "url", "fhcr:")
        assert k1 != k2

    def test_url_body_strategy(self):
        k1 = _generate_cache_key(
            "POST", "https://api.example.com/data", "url+body", "fhcr:", body={"q": "test"}
        )
        k2 = _generate_cache_key(
            "POST", "https://api.example.com/data", "url+body", "fhcr:", body={"q": "other"}
        )
        assert k1 != k2

    def test_custom_strategy(self):
        key = _generate_cache_key(
            "GET", "https://api.example.com/data", "custom", "fhcr:",
            key_fn=lambda m, u, b: f"{m}:{u}:custom"
        )
        assert key.startswith("fhcr:")

    def test_custom_prefix(self):
        key = _generate_cache_key("GET", "https://api.example.com", "url", "myapp:")
        assert key.startswith("myapp:")


class TestFetchHttpCacheClient:
    def _make_client(
        self,
        http_client=None,
        storage=None,
        token_manager=None,
        cache_enabled=True,
    ):
        config = SDKConfig(
            http=HttpFetchConfig(base_url="https://api.example.com"),
            cache=CacheResponseConfig(enabled=cache_enabled),
        )
        return FetchHttpCacheClient(
            config=config,
            http_client=http_client,
            storage=storage,
            token_manager=token_manager,
        )

    async def test_cache_miss_fetches_and_stores(self, mock_http_client, mock_storage):
        client = self._make_client(
            http_client=mock_http_client,
            storage=mock_storage,
        )
        result = await client.get("/data")
        assert result.success is True
        assert result.data == {"result": "ok"}
        assert result.cached is False
        mock_http_client.request.assert_awaited_once()
        mock_storage.save.assert_awaited_once()

    async def test_cache_hit_no_http_call(self, mock_http_client, mock_storage):
        # Simulate a cache hit
        now = time.time()
        mock_storage.load = AsyncMock(return_value={
            "key": "fhcr:abc123",
            "data": {
                "response": {
                    "status_code": 200,
                    "headers": {},
                    "body": {"cached": True},
                },
                "created_at": now,
                "expires_at": now + 600,
            },
            "created_at": now,
            "expires_at": now + 600,
        })
        client = self._make_client(
            http_client=mock_http_client,
            storage=mock_storage,
        )
        result = await client.get("/data")
        assert result.success is True
        assert result.cached is True
        assert result.data == {"cached": True}
        mock_http_client.request.assert_not_awaited()

    async def test_cache_disabled_always_fetches(self, mock_http_client, mock_storage):
        client = self._make_client(
            http_client=mock_http_client,
            storage=mock_storage,
            cache_enabled=False,
        )
        result = await client.get("/data")
        assert result.success is True
        assert result.cached is False
        mock_storage.load.assert_not_awaited()

    async def test_auth_headers_injected(self, mock_http_client, mock_storage, mock_token_manager):
        client = self._make_client(
            http_client=mock_http_client,
            storage=mock_storage,
            token_manager=mock_token_manager,
        )
        await client.get("/data")
        call_args = mock_http_client.request.call_args
        headers = call_args[1]["headers"]
        assert "Authorization" in headers
        assert headers["Authorization"] == "Bearer test-token-123"

    async def test_http_error_raises_network_error(self, mock_storage):
        http_client = AsyncMock()
        http_client.request = AsyncMock(side_effect=ConnectionError("refused"))
        http_client.aclose = AsyncMock()

        client = self._make_client(
            http_client=http_client,
            storage=mock_storage,
        )
        with pytest.raises(FetchCacheNetworkError, match="HTTP request failed"):
            await client.get("/data")

    async def test_storage_error_on_write(self, mock_http_client, mock_storage):
        mock_storage.save = AsyncMock(side_effect=Exception("S3 write failed"))
        client = self._make_client(
            http_client=mock_http_client,
            storage=mock_storage,
        )
        # Should not raise — storage errors on write are non-fatal (logged)
        result = await client.get("/data")
        assert result.success is True

    async def test_post_not_cached_by_default(self, mock_http_client, mock_storage):
        client = self._make_client(
            http_client=mock_http_client,
            storage=mock_storage,
        )
        result = await client.post("/data", body={"key": "value"})
        assert result.success is True
        mock_storage.load.assert_not_awaited()
        mock_storage.save.assert_not_awaited()

    async def test_context_manager(self, mock_http_client, mock_storage):
        client = self._make_client(
            http_client=mock_http_client,
            storage=mock_storage,
        )
        async with client as c:
            result = await c.get("/data")
            assert result.success is True
        mock_http_client.aclose.assert_awaited_once()

    async def test_invalidate_cache(self, mock_http_client, mock_storage):
        client = self._make_client(
            http_client=mock_http_client,
            storage=mock_storage,
        )
        await client.invalidate_cache("fhcr:abc123")
        mock_storage.delete.assert_awaited_once_with("fhcr:abc123")

    async def test_expired_cache_refetches(self, mock_http_client, mock_storage):
        # Simulate expired cache entry
        now = time.time()
        mock_storage.load = AsyncMock(return_value={
            "key": "fhcr:abc123",
            "data": {
                "response": {
                    "status_code": 200,
                    "headers": {},
                    "body": {"stale": True},
                },
                "created_at": now - 700,
                "expires_at": now - 100,
            },
            "created_at": now - 700,
            "expires_at": now - 100,
        })
        client = self._make_client(
            http_client=mock_http_client,
            storage=mock_storage,
        )
        result = await client.get("/data")
        # Should have fetched fresh since expired and no stale_while_revalidate
        assert result.success is True
        assert result.cached is False
        mock_http_client.request.assert_awaited_once()
