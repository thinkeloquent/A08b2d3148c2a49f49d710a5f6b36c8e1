"""
Unit tests for statsig_client.client.

Tests cover:
- Statement coverage for all HTTP verbs and client lifecycle
- Decision/branch coverage for API key resolution, response handling
- Boundary value analysis for empty responses, 204, non-JSON
- Error handling for non-2xx status codes
- Log verification for request/response debug logs
"""

import os
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from statsig_client.client import StatsigClient
from statsig_client.errors import (
    AuthenticationError,
    NotFoundError,
    RateLimitError,
    ServerError,
    StatsigError,
    ValidationError,
)


class TestStatsigClient:
    """Tests for the StatsigClient class."""

    class TestStatementCoverage:
        async def test_get_returns_json(self, httpx_mock):
            httpx_mock.add_response(json={"data": [{"id": "g1"}]})
            async with StatsigClient(api_key="test-key") as client:
                result = await client.get("/gates")
            assert result == {"data": [{"id": "g1"}]}

        async def test_post_sends_json_body(self, httpx_mock):
            httpx_mock.add_response(json={"id": "new"})
            async with StatsigClient(api_key="test-key") as client:
                result = await client.post("/gates", json={"name": "test_gate"})
            assert result == {"id": "new"}
            request = httpx_mock.get_request()
            assert request.method == "POST"

        async def test_put_request(self, httpx_mock):
            httpx_mock.add_response(json={"updated": True})
            async with StatsigClient(api_key="test-key") as client:
                result = await client.put("/gates/g1", json={"enabled": True})
            assert result == {"updated": True}

        async def test_patch_request(self, httpx_mock):
            httpx_mock.add_response(json={"patched": True})
            async with StatsigClient(api_key="test-key") as client:
                result = await client.patch("/gates/g1", json={"name": "new"})
            assert result == {"patched": True}

        async def test_delete_request(self, httpx_mock):
            httpx_mock.add_response(json={"deleted": True})
            async with StatsigClient(api_key="test-key") as client:
                result = await client.delete("/gates/g1")
            assert result == {"deleted": True}

        async def test_get_raw_returns_response(self, httpx_mock):
            httpx_mock.add_response(json={"raw": True})
            async with StatsigClient(api_key="test-key") as client:
                result = await client.get_raw("/test")
            assert isinstance(result, httpx.Response)

        async def test_list_delegates_to_pagination(self, httpx_mock):
            httpx_mock.add_response(
                json={"data": [{"id": "a"}], "pagination": {}}
            )
            async with StatsigClient(api_key="test-key") as client:
                result = await client.list("/gates")
            assert result == [{"id": "a"}]

        async def test_context_manager(self, httpx_mock):
            httpx_mock.add_response(json={"ok": True})
            async with StatsigClient(api_key="test-key") as client:
                result = await client.get("/test")
            assert result == {"ok": True}

        async def test_close(self, httpx_mock):
            client = StatsigClient(api_key="test-key")
            await client.close()

    class TestDecisionBranchCoverage:
        def test_api_key_from_constructor(self):
            client = StatsigClient(api_key="explicit-key")
            assert client._api_key == "explicit-key"

        def test_api_key_from_env(self, monkeypatch):
            monkeypatch.setenv("STATSIG_API_KEY", "env-key")
            client = StatsigClient()
            assert client._api_key == "env-key"

        def test_missing_api_key_raises(self, monkeypatch):
            monkeypatch.delenv("STATSIG_API_KEY", raising=False)
            with pytest.raises(ValueError, match="API key is required"):
                StatsigClient()

        async def test_204_returns_empty_dict(self, httpx_mock):
            httpx_mock.add_response(status_code=204)
            async with StatsigClient(api_key="test-key") as client:
                result = await client.delete("/gates/g1")
            assert result == {}

        async def test_empty_content_returns_empty_dict(self, httpx_mock):
            httpx_mock.add_response(status_code=200, content=b"")
            async with StatsigClient(api_key="test-key") as client:
                result = await client.get("/test")
            assert result == {}

        async def test_non_json_response_returns_text(self, httpx_mock):
            httpx_mock.add_response(
                status_code=200,
                text="plain text response",
                headers={"content-type": "text/plain"},
            )
            async with StatsigClient(api_key="test-key") as client:
                result = await client.get("/text")
            assert result == "plain text response"

        async def test_query_params_forwarded(self, httpx_mock):
            httpx_mock.add_response(json={"data": []})
            async with StatsigClient(api_key="test-key") as client:
                await client.get("/gates", params={"limit": "10"})
            request = httpx_mock.get_request()
            assert "limit=10" in str(request.url)

        def test_base_url_trailing_slash_stripped(self):
            client = StatsigClient(
                api_key="key", base_url="https://api.example.com/v1/"
            )
            assert client._base_url == "https://api.example.com/v1"

        def test_custom_logger_used(self):
            mock_log = MagicMock()
            client = StatsigClient(api_key="key", logger=mock_log)
            assert client._logger is mock_log

        def test_proxy_configured(self):
            client = StatsigClient(api_key="key", proxy="http://proxy:8080")
            assert client._http is not None

    class TestErrorHandling:
        async def test_401_raises_authentication_error(self, httpx_mock):
            httpx_mock.add_response(
                status_code=401, json={"message": "Unauthorized"}
            )
            async with StatsigClient(api_key="bad-key") as client:
                with pytest.raises(AuthenticationError):
                    await client.get("/gates")

        async def test_404_raises_not_found_error(self, httpx_mock):
            httpx_mock.add_response(
                status_code=404, json={"message": "Not found"}
            )
            async with StatsigClient(api_key="test-key") as client:
                with pytest.raises(NotFoundError):
                    await client.get("/gates/nonexistent")

        async def test_400_raises_validation_error(self, httpx_mock):
            httpx_mock.add_response(
                status_code=400, json={"message": "Bad request"}
            )
            async with StatsigClient(api_key="test-key") as client:
                with pytest.raises(ValidationError):
                    await client.post("/gates", json={})

        async def test_500_raises_server_error(self, httpx_mock):
            httpx_mock.add_response(
                status_code=500, json={"message": "Internal error"}
            )
            async with StatsigClient(api_key="test-key") as client:
                with pytest.raises(ServerError):
                    await client.get("/test")

        async def test_error_with_non_json_body(self, httpx_mock):
            httpx_mock.add_response(
                status_code=503,
                text="Service Unavailable",
                headers={"content-type": "text/plain"},
            )
            async with StatsigClient(api_key="test-key") as client:
                with pytest.raises(ServerError):
                    await client.get("/test")

    class TestLogVerification:
        async def test_logs_request_debug(self, httpx_mock):
            httpx_mock.add_response(json={"ok": True})
            mock_log = MagicMock()
            async with StatsigClient(api_key="test-key", logger=mock_log) as client:
                await client.get("/gates")

            debug_calls = [str(c) for c in mock_log.debug.call_args_list]
            assert any("GET" in c for c in debug_calls)

        async def test_logs_response_status(self, httpx_mock):
            httpx_mock.add_response(json={"ok": True})
            mock_log = MagicMock()
            async with StatsigClient(api_key="test-key", logger=mock_log) as client:
                await client.get("/test")

            debug_calls = [str(c) for c in mock_log.debug.call_args_list]
            assert any("200" in c for c in debug_calls)

    class TestBoundaryValueAnalysis:
        async def test_sends_correct_headers(self, httpx_mock):
            httpx_mock.add_response(json={})
            async with StatsigClient(api_key="my-api-key") as client:
                await client.get("/test")
            request = httpx_mock.get_request()
            assert request.headers["statsig-api-key"] == "my-api-key"
            assert request.headers["content-type"] == "application/json"

    class TestIntegration:
        async def test_last_rate_limit_property(self, httpx_mock):
            client = StatsigClient(api_key="test-key")
            assert client.last_rate_limit is None
            await client.close()


class TestCreateStatsigClient:
    """Tests for the create_statsig_client convenience factory."""

    def test_from_options_object(self):
        from statsig_client import StatsigClientOptions, create_statsig_client

        opts = StatsigClientOptions(api_key="factory-key", timeout=60.0)
        client = create_statsig_client(opts)
        assert client._api_key == "factory-key"

    def test_from_kwargs(self):
        from statsig_client import create_statsig_client

        client = create_statsig_client(api_key="kwarg-key")
        assert client._api_key == "kwarg-key"

    def test_kwargs_override_options(self):
        from statsig_client import StatsigClientOptions, create_statsig_client

        opts = StatsigClientOptions(api_key="opt-key")
        client = create_statsig_client(opts, api_key="override-key")
        assert client._api_key == "override-key"

    def test_none_options_uses_kwargs(self):
        from statsig_client import create_statsig_client

        client = create_statsig_client(None, api_key="only-kwarg")
        assert client._api_key == "only-kwarg"
