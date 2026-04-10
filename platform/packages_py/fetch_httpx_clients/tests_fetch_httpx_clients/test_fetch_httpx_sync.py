"""Tests for the fetch_httpx_sync factory."""

from __future__ import annotations

from can_use_http2 import Http2CheckResult
from fetch_httpx import Client, Limits, RetryConfig, Timeout

from fetch_httpx_clients import fetch_httpx_sync


class TestDefaults:
    """Verify sane defaults tuned for LLM API calls."""

    def test_returns_sync_client(self) -> None:
        client = fetch_httpx_sync()
        assert isinstance(client, Client)

    def test_default_timeout_is_llm_tuned(self) -> None:
        client = fetch_httpx_sync()
        ac = client._async_client
        assert ac._timeout.connect == 5.0
        assert ac._timeout.read == 120.0
        assert ac._timeout.write == 30.0
        assert ac._timeout.pool == 5.0

    def test_default_follow_redirects(self) -> None:
        client = fetch_httpx_sync()
        assert client._async_client._follow_redirects is True

    def test_default_http2_off(self) -> None:
        client = fetch_httpx_sync()
        assert client._async_client._http2 is False


class TestPassthrough:
    """Verify args are forwarded to the underlying Client."""

    def test_base_url(self) -> None:
        client = fetch_httpx_sync(base_url="https://api.example.com/v1")
        assert str(client._async_client._base_url) == "https://api.example.com/v1"

    def test_headers(self) -> None:
        client = fetch_httpx_sync(
            headers={"x-api-key": "sk-ant-test"},
        )
        assert client._async_client._headers.get("x-api-key") == "sk-ant-test"

    def test_custom_timeout(self) -> None:
        t = Timeout(connect=1.0, read=60.0, write=10.0, pool=2.0)
        client = fetch_httpx_sync(timeout=t)
        assert client._async_client._timeout.read == 60.0

    def test_retry(self) -> None:
        rc = RetryConfig(max_retries=2, retry_delay=1.0)
        client = fetch_httpx_sync(retry=rc)
        assert client._async_client._retry is not None
        assert client._async_client._retry.max_retries == 2


class TestHttp2Integration:
    """Verify Http2CheckResult drives the http2 flag."""

    def test_ok_result_enables_http2(self, h2_ok: Http2CheckResult) -> None:
        client = fetch_httpx_sync(http2=h2_ok)
        assert client._async_client._http2 is True

    def test_failed_result_disables_http2(self, h2_fail: Http2CheckResult) -> None:
        client = fetch_httpx_sync(http2=h2_fail)
        assert client._async_client._http2 is False
