"""Unit tests for figma_api.sdk.client."""
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from figma_api.sdk.client import FigmaClient
from figma_api.sdk.errors import (
    AuthenticationError,
    NetworkError,
    NotFoundError,
    TimeoutError,
)


class TestFigmaClient:
    class TestStatementCoverage:
        def test_create_with_token(self):
            client = FigmaClient(token="test-token-1234567890")
            assert client is not None
            assert client.stats["requests_made"] == 0

        async def test_get_request(self):
            client = FigmaClient(token="test-token-1234567890")
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.headers = {}
            mock_response.json.return_value = {"projects": []}
            mock_response.text = '{"projects": []}'

            with patch.object(client, "_get_client") as mock_get:
                mock_http = AsyncMock()
                mock_http.request = AsyncMock(return_value=mock_response)
                mock_get.return_value = mock_http
                result = await client.get("/v1/teams/123/projects")
                assert result == {"projects": []}
            await client.close()

        async def test_post_request(self):
            client = FigmaClient(token="test-token-1234567890")
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.headers = {}
            mock_response.json.return_value = {"id": "new"}
            mock_response.text = '{"id": "new"}'

            with patch.object(client, "_get_client") as mock_get:
                mock_http = AsyncMock()
                mock_http.request = AsyncMock(return_value=mock_response)
                mock_get.return_value = mock_http
                result = await client.post("/v1/comments", {"message": "hello"})
                assert result == {"id": "new"}
            await client.close()

        async def test_delete_request(self):
            client = FigmaClient(token="test-token-1234567890")
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.headers = {}
            mock_response.json.return_value = {"deleted": True}
            mock_response.text = '{"deleted": true}'

            with patch.object(client, "_get_client") as mock_get:
                mock_http = AsyncMock()
                mock_http.request = AsyncMock(return_value=mock_response)
                mock_get.return_value = mock_http
                result = await client.delete("/v1/resource")
                assert result == {"deleted": True}
            await client.close()

    class TestBranchCoverage:
        def test_build_url_with_params(self):
            client = FigmaClient(token="test-token-1234567890")
            url = client._build_url("/v1/files", {"depth": 2, "version": None})
            assert "depth=2" in url
            assert "version" not in url

        def test_build_url_without_params(self):
            client = FigmaClient(token="test-token-1234567890")
            url = client._build_url("/v1/files")
            assert url == "https://api.figma.com/v1/files"

        def test_build_url_full_url(self):
            client = FigmaClient(token="test-token-1234567890")
            url = client._build_url("https://custom.api.com/path")
            assert url == "https://custom.api.com/path"

        def test_build_headers(self):
            client = FigmaClient(token="test-token-1234567890")
            headers = client._build_headers()
            assert headers["X-Figma-Token"] == "test-token-1234567890"
            assert headers["Content-Type"] == "application/json"

        async def test_cache_hit(self):
            client = FigmaClient(token="test-token-1234567890")
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.headers = {}
            mock_response.json.return_value = {"data": "cached"}
            mock_response.text = '{"data": "cached"}'

            with patch.object(client, "_get_client") as mock_get:
                mock_http = AsyncMock()
                mock_http.request = AsyncMock(return_value=mock_response)
                mock_get.return_value = mock_http

                await client.get("/v1/test")
                await client.get("/v1/test")  # cached

                assert mock_http.request.call_count == 1
                assert client.stats["cache_hits"] == 1
            await client.close()

        async def test_context_manager(self):
            async with FigmaClient(token="test-token-1234567890") as client:
                assert client is not None

    class TestErrorHandling:
        async def test_404_raises_not_found(self):
            client = FigmaClient(token="test-token-1234567890", max_retries=0)
            mock_response = MagicMock()
            mock_response.status_code = 404
            mock_response.headers = {}
            mock_response.json.return_value = {"message": "File not found"}
            mock_response.text = '{"message": "File not found"}'

            with patch.object(client, "_get_client") as mock_get:
                mock_http = AsyncMock()
                mock_http.request = AsyncMock(return_value=mock_response)
                mock_get.return_value = mock_http
                with pytest.raises(NotFoundError, match="File not found"):
                    await client.get("/v1/files/missing")
            await client.close()

        async def test_timeout_raises_timeout_error(self):
            client = FigmaClient(token="test-token-1234567890", max_retries=0)

            with patch.object(client, "_get_client") as mock_get:
                mock_http = AsyncMock()
                mock_http.request = AsyncMock(side_effect=httpx.TimeoutException("timeout"))
                mock_get.return_value = mock_http
                with pytest.raises(TimeoutError, match="Request timed out"):
                    await client.get("/v1/test")
            await client.close()

        async def test_connect_error_raises_network_error(self):
            client = FigmaClient(token="test-token-1234567890", max_retries=0)

            with patch.object(client, "_get_client") as mock_get:
                mock_http = AsyncMock()
                mock_http.request = AsyncMock(side_effect=httpx.ConnectError("refused"))
                mock_get.return_value = mock_http
                with pytest.raises(NetworkError, match="Network error"):
                    await client.get("/v1/test")
            await client.close()

    class TestIntegration:
        def test_last_rate_limit_initially_none(self):
            client = FigmaClient(token="test-token-1234567890")
            assert client.last_rate_limit is None

        def test_stats_initial(self):
            client = FigmaClient(token="test-token-1234567890")
            stats = client.stats
            assert stats["requests_made"] == 0
            assert stats["requests_failed"] == 0
            assert stats["cache_hits"] == 0
