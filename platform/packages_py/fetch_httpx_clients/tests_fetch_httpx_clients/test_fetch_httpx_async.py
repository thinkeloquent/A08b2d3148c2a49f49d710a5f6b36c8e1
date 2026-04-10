"""Tests for the fetch_httpx_async factory."""

from __future__ import annotations

import pytest
from can_use_http2 import Http2CheckResult
from fetch_httpx import AsyncClient, Limits, RetryConfig, Timeout

from fetch_httpx_clients import fetch_httpx_async
from fetch_httpx_clients.clients import DEFAULT_LLM_TIMEOUT


class TestDefaults:
    """Verify sane defaults tuned for LLM API calls."""

    def test_returns_async_client(self) -> None:
        client = fetch_httpx_async()
        assert isinstance(client, AsyncClient)

    def test_default_timeout_is_llm_tuned(self) -> None:
        client = fetch_httpx_async()
        assert client._timeout.connect == 5.0
        assert client._timeout.read == 120.0
        assert client._timeout.write == 30.0
        assert client._timeout.pool == 5.0

    def test_default_follow_redirects(self) -> None:
        client = fetch_httpx_async()
        assert client._follow_redirects is True

    def test_default_http2_off(self) -> None:
        client = fetch_httpx_async()
        assert client._http2 is False

    def test_default_http1_on(self) -> None:
        client = fetch_httpx_async()
        assert client._http1 is True


class TestPassthrough:
    """Verify args are forwarded to the underlying AsyncClient."""

    def test_base_url(self) -> None:
        client = fetch_httpx_async(base_url="https://api.example.com/v1")
        assert str(client._base_url) == "https://api.example.com/v1"

    def test_headers(self) -> None:
        client = fetch_httpx_async(
            headers={"Authorization": "Bearer test-key"},
        )
        assert client._headers.get("Authorization") == "Bearer test-key"

    def test_custom_timeout(self) -> None:
        t = Timeout(connect=1.0, read=60.0, write=10.0, pool=2.0)
        client = fetch_httpx_async(timeout=t)
        assert client._timeout.read == 60.0

    def test_limits(self) -> None:
        lim = Limits(max_connections=50)
        client = fetch_httpx_async(limits=lim)
        assert client._limits.max_connections == 50

    def test_retry(self) -> None:
        rc = RetryConfig(max_retries=5)
        client = fetch_httpx_async(retry=rc)
        assert client._retry is not None
        assert client._retry.max_retries == 5

    def test_verify_false(self) -> None:
        client = fetch_httpx_async(verify=False)
        assert client._verify is False

    def test_trust_env_false(self) -> None:
        client = fetch_httpx_async(trust_env=False)
        assert client._trust_env is False

    def test_max_redirects(self) -> None:
        client = fetch_httpx_async(max_redirects=5)
        assert client._max_redirects == 5

    def test_follow_redirects_false(self) -> None:
        client = fetch_httpx_async(follow_redirects=False)
        assert client._follow_redirects is False

    def test_event_hooks(self) -> None:
        called = []
        hooks = {"request": [lambda r: called.append("req")], "response": []}
        client = fetch_httpx_async(event_hooks=hooks)
        assert len(client._event_hooks["request"]) == 1


class TestHttp2Integration:
    """Verify Http2CheckResult drives the http2 flag."""

    def test_ok_result_enables_http2(self, h2_ok: Http2CheckResult) -> None:
        client = fetch_httpx_async(http2=h2_ok)
        assert client._http2 is True

    def test_failed_result_disables_http2(self, h2_fail: Http2CheckResult) -> None:
        client = fetch_httpx_async(http2=h2_fail)
        assert client._http2 is False

    def test_bool_true_enables_http2(self) -> None:
        client = fetch_httpx_async(http2=True)
        assert client._http2 is True

    def test_bool_false_disables_http2(self) -> None:
        client = fetch_httpx_async(http2=False)
        assert client._http2 is False
