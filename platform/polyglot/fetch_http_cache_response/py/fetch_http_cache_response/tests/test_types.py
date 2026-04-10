"""Tests for types and config (Story 6, Task 6.1)."""

import os
import pytest

from fetch_http_cache_response.types import (
    AuthRefreshConfig,
    CacheResponseConfig,
    CachedHttpResponse,
    FetchResult,
    HttpFetchConfig,
    RetryConfig,
    SDKConfig,
)


class TestHttpFetchConfig:
    def test_defaults(self):
        config = HttpFetchConfig()
        assert config.base_url == ""
        assert config.method == "GET"
        assert config.headers == {}
        assert config.timeout == 30.0
        assert config.verify is True
        assert config.proxy_url is None
        assert config.follow_redirects is True
        assert config.retry is None

    def test_custom_values(self):
        config = HttpFetchConfig(
            base_url="https://api.example.com",
            method="POST",
            timeout=60.0,
            verify=False,
        )
        assert config.base_url == "https://api.example.com"
        assert config.method == "POST"
        assert config.timeout == 60.0
        assert config.verify is False


class TestAuthRefreshConfig:
    def test_defaults(self):
        config = AuthRefreshConfig()
        assert config.auth_type == "bearer"
        assert config.auth_token is None
        assert config.refresh_interval_seconds == 1200.0

    def test_custom_header(self):
        config = AuthRefreshConfig(
            auth_type="custom",
            auth_token="tok_123",
            api_auth_header_name="X-Figma-Token",
        )
        assert config.api_auth_header_name == "X-Figma-Token"


class TestCacheResponseConfig:
    def test_defaults(self):
        config = CacheResponseConfig()
        assert config.enabled is True
        assert config.ttl_seconds == 600.0
        assert config.storage_type == "s3"
        assert config.key_strategy == "url"
        assert config.key_prefix == "fhcr:"
        assert config.cache_methods == ["GET"]

    def test_disable_cache(self):
        config = CacheResponseConfig(enabled=False)
        assert config.enabled is False


class TestRetryConfig:
    def test_defaults(self):
        config = RetryConfig()
        assert config.max_retries == 3
        assert config.jitter is True


class TestSDKConfig:
    def test_defaults(self):
        config = SDKConfig()
        assert isinstance(config.http, HttpFetchConfig)
        assert config.auth is None
        assert isinstance(config.cache, CacheResponseConfig)
        assert config.debug is False

    def test_from_env_defaults(self):
        config = SDKConfig.from_env()
        assert config.http.base_url == ""
        assert config.http.timeout == 30.0
        assert config.cache.enabled is True

    def test_from_env_with_overrides(self):
        config = SDKConfig.from_env(
            base_url="https://api.example.com",
            timeout=60,
            cache_ttl_seconds=300,
            debug=True,
        )
        assert config.http.base_url == "https://api.example.com"
        assert config.http.timeout == 60.0
        assert config.cache.ttl_seconds == 300.0
        assert config.debug is True

    def test_from_env_with_yaml(self):
        yaml = {
            "http": {
                "base_url": "https://yaml.example.com",
                "timeout": 45,
            },
            "cache": {
                "ttl_seconds": 120,
                "key_prefix": "test:",
            },
        }
        config = SDKConfig.from_env(yaml_config=yaml)
        assert config.http.base_url == "https://yaml.example.com"
        assert config.http.timeout == 45.0
        assert config.cache.ttl_seconds == 120.0
        assert config.cache.key_prefix == "test:"

    def test_from_env_override_beats_yaml(self):
        yaml = {"http": {"base_url": "https://yaml.example.com"}}
        config = SDKConfig.from_env(
            yaml_config=yaml,
            base_url="https://override.example.com",
        )
        assert config.http.base_url == "https://override.example.com"

    def test_from_env_with_auth(self):
        config = SDKConfig.from_env(
            auth_type="bearer",
            auth_token="tok_123",
        )
        assert config.auth is not None
        assert config.auth.auth_type == "bearer"
        assert config.auth.auth_token == "tok_123"

    def test_from_env_env_vars(self, monkeypatch):
        monkeypatch.setenv("FETCH_CACHE_BASE_URL", "https://env.example.com")
        monkeypatch.setenv("FETCH_CACHE_TIMEOUT", "90")
        monkeypatch.setenv("FETCH_CACHE_DEBUG", "true")
        config = SDKConfig.from_env()
        assert config.http.base_url == "https://env.example.com"
        assert config.http.timeout == 90.0
        assert config.debug is True


class TestCachedHttpResponse:
    def test_cache_hit(self):
        resp = CachedHttpResponse(
            status_code=200,
            headers={"content-type": "application/json"},
            body={"data": "test"},
            cache_hit=True,
            cache_key="fhcr:abc123",
            cache_age=5.0,
        )
        assert resp.cache_hit is True
        assert resp.cache_key == "fhcr:abc123"

    def test_cache_miss(self):
        resp = CachedHttpResponse(
            status_code=200,
            headers={},
            body="ok",
            cache_hit=False,
        )
        assert resp.cache_hit is False
        assert resp.cache_key is None


class TestFetchResult:
    def test_ok(self):
        result = FetchResult.ok(data={"key": "value"}, cached=True, cache_key="k1")
        assert result.success is True
        assert result.data == {"key": "value"}
        assert result.cached is True
        assert result.error is None

    def test_fail(self):
        result = FetchResult.fail(error="connection refused", elapsed_ms=150.0)
        assert result.success is False
        assert result.data is None
        assert result.error == "connection refused"
        assert result.elapsed_ms == 150.0
