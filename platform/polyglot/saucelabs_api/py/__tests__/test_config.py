"""
Unit tests for saucelabs_api.config

Tests cover:
- Statement coverage for resolve_core_base_url, resolve_mobile_base_url, resolve_config
- Branch coverage for env vars, overrides, regions, defaults
- Boundary value analysis
"""

import os

import pytest

from saucelabs_api.config import resolve_config, resolve_core_base_url, resolve_mobile_base_url


class TestResolveCoreBaseUrl:
    """Tests for resolve_core_base_url."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    def test_default_base_url(self):
        url = resolve_core_base_url()
        assert url == "https://api.us-west-1.saucelabs.com"

    def test_eu_region_base_url(self):
        url = resolve_core_base_url("eu-central-1")
        assert url == "https://api.eu-central-1.saucelabs.com"

    def test_us_east_4_region(self):
        url = resolve_core_base_url("us-east-4")
        assert url == "https://api.us-east-4.saucelabs.com"

    def test_explicit_override(self):
        url = resolve_core_base_url("us-west-1", "https://custom.example.com/")
        assert url == "https://custom.example.com"

    # =================================================================
    # Branch Coverage
    # =================================================================

    def test_unknown_region_falls_back_to_default(self):
        url = resolve_core_base_url("ap-southeast-1")
        assert url == "https://api.us-west-1.saucelabs.com"

    def test_strips_trailing_slashes(self):
        url = resolve_core_base_url("us-west-1", "https://example.com///")
        assert url == "https://example.com"


class TestResolveMobileBaseUrl:
    """Tests for resolve_mobile_base_url."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    def test_mobile_default(self):
        url = resolve_mobile_base_url()
        assert url == "https://mobile.saucelabs.com"

    def test_mobile_eu(self):
        url = resolve_mobile_base_url("eu-central-1")
        assert url == "https://mobile.eu-central-1.saucelabs.com"

    def test_mobile_override(self):
        url = resolve_mobile_base_url("us-east", "https://mobile.custom.com/")
        assert url == "https://mobile.custom.com"

    # =================================================================
    # Branch Coverage
    # =================================================================

    def test_unknown_mobile_region_falls_back(self):
        url = resolve_mobile_base_url("ap-southeast-1")
        assert url == "https://mobile.saucelabs.com"


class TestResolveConfig:
    """Tests for resolve_config."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    def test_resolves_defaults(self, monkeypatch):
        monkeypatch.delenv("SAUCE_USERNAME", raising=False)
        monkeypatch.delenv("SAUCE_ACCESS_KEY", raising=False)
        monkeypatch.delenv("SAUCELABS_USERNAME", raising=False)
        monkeypatch.delenv("SAUCELABS_ACCESS_KEY", raising=False)
        monkeypatch.setenv("LOG_LEVEL", "SILENT")

        config = resolve_config()
        assert config["username"] == ""
        assert config["api_key"] == ""
        assert config["base_url"] == "https://api.us-west-1.saucelabs.com"
        assert config["mobile_base_url"] == "https://mobile.saucelabs.com"
        assert config["rate_limit_auto_wait"] is True
        assert config["timeout"] == 30.0

    def test_resolves_from_env(self, monkeypatch):
        monkeypatch.setenv("SAUCE_USERNAME", "env_user")
        monkeypatch.setenv("SAUCE_ACCESS_KEY", "env_key")
        monkeypatch.setenv("LOG_LEVEL", "SILENT")

        config = resolve_config()
        assert config["username"] == "env_user"
        assert config["api_key"] == "env_key"

    def test_resolves_from_saucelabs_env(self, monkeypatch):
        monkeypatch.delenv("SAUCE_USERNAME", raising=False)
        monkeypatch.delenv("SAUCE_ACCESS_KEY", raising=False)
        monkeypatch.setenv("SAUCELABS_USERNAME", "alt_user")
        monkeypatch.setenv("SAUCELABS_ACCESS_KEY", "alt_key")
        monkeypatch.setenv("LOG_LEVEL", "SILENT")

        config = resolve_config()
        assert config["username"] == "alt_user"
        assert config["api_key"] == "alt_key"

    # =================================================================
    # Branch Coverage
    # =================================================================

    def test_kwargs_override_env(self, monkeypatch):
        monkeypatch.setenv("SAUCE_USERNAME", "env_user")
        monkeypatch.setenv("SAUCE_ACCESS_KEY", "env_key")
        monkeypatch.setenv("LOG_LEVEL", "SILENT")

        config = resolve_config(username="override_user", region="eu-central-1")
        assert config["username"] == "override_user"
        assert config["base_url"] == "https://api.eu-central-1.saucelabs.com"

    def test_base_url_override(self, monkeypatch):
        monkeypatch.setenv("LOG_LEVEL", "SILENT")
        config = resolve_config(base_url="https://custom.api.com", region="eu-central-1")
        assert config["base_url"] == "https://custom.api.com"

    def test_mobile_region_override(self, monkeypatch):
        monkeypatch.setenv("LOG_LEVEL", "SILENT")
        config = resolve_config(mobile_region="eu-central-1")
        assert config["mobile_base_url"] == "https://mobile.eu-central-1.saucelabs.com"

    def test_rate_limit_auto_wait_disabled(self, monkeypatch):
        monkeypatch.setenv("LOG_LEVEL", "SILENT")
        config = resolve_config(rate_limit_auto_wait=False)
        assert config["rate_limit_auto_wait"] is False

    def test_custom_timeout(self, monkeypatch):
        monkeypatch.setenv("LOG_LEVEL", "SILENT")
        config = resolve_config(timeout=60.0)
        assert config["timeout"] == 60.0

    def test_verify_ssl_disabled(self, monkeypatch):
        monkeypatch.setenv("LOG_LEVEL", "SILENT")
        config = resolve_config(verify_ssl=False)
        assert config["verify_ssl"] is False

    def test_proxy_from_kwargs(self, monkeypatch):
        monkeypatch.setenv("LOG_LEVEL", "SILENT")
        config = resolve_config(proxy="http://proxy.local:8080")
        assert config["proxy"] == "http://proxy.local:8080"

    def test_proxy_from_env(self, monkeypatch):
        monkeypatch.setenv("HTTPS_PROXY", "http://env-proxy:3128")
        monkeypatch.setenv("LOG_LEVEL", "SILENT")
        config = resolve_config()
        assert config["proxy"] == "http://env-proxy:3128"

    # =================================================================
    # Boundary Values
    # =================================================================

    def test_empty_kwargs(self, monkeypatch):
        monkeypatch.delenv("SAUCE_USERNAME", raising=False)
        monkeypatch.delenv("SAUCE_ACCESS_KEY", raising=False)
        monkeypatch.delenv("SAUCELABS_USERNAME", raising=False)
        monkeypatch.delenv("SAUCELABS_ACCESS_KEY", raising=False)
        monkeypatch.setenv("LOG_LEVEL", "SILENT")
        config = resolve_config()
        assert config["username"] == ""
        assert config["api_key"] == ""
