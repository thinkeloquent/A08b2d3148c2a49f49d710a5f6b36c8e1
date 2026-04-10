"""
Unit tests for saucelabs_api.client

Tests cover:
- Statement coverage for SaucelabsClient config resolution
- Branch coverage for env vars, overrides, regions
- Boundary value analysis
"""

import pytest

from saucelabs_api.config import resolve_config, resolve_core_base_url, resolve_mobile_base_url


class TestConfig:
    """Config-level tests exercised through resolve_config (client uses resolve_config internally)."""

    def test_default_base_url(self):
        url = resolve_core_base_url()
        assert url == "https://api.us-west-1.saucelabs.com"

    def test_eu_region_base_url(self):
        url = resolve_core_base_url("eu-central-1")
        assert url == "https://api.eu-central-1.saucelabs.com"

    def test_explicit_override(self):
        url = resolve_core_base_url("us-west-1", "https://custom.example.com/")
        assert url == "https://custom.example.com"

    def test_mobile_default(self):
        url = resolve_mobile_base_url()
        assert url == "https://mobile.saucelabs.com"

    def test_mobile_eu(self):
        url = resolve_mobile_base_url("eu-central-1")
        assert url == "https://mobile.eu-central-1.saucelabs.com"


class TestResolveConfig:
    """Tests for resolve_config priority chain."""

    def test_resolves_from_env(self, monkeypatch):
        monkeypatch.setenv("SAUCE_USERNAME", "env_user")
        monkeypatch.setenv("SAUCE_ACCESS_KEY", "env_key")
        monkeypatch.setenv("LOG_LEVEL", "SILENT")

        config = resolve_config()
        assert config["username"] == "env_user"
        assert config["api_key"] == "env_key"
        assert config["base_url"] == "https://api.us-west-1.saucelabs.com"

    def test_kwargs_override_env(self, monkeypatch):
        monkeypatch.setenv("SAUCE_USERNAME", "env_user")
        monkeypatch.setenv("SAUCE_ACCESS_KEY", "env_key")
        monkeypatch.setenv("LOG_LEVEL", "SILENT")

        config = resolve_config(username="override_user", region="eu-central-1")
        assert config["username"] == "override_user"
        assert config["base_url"] == "https://api.eu-central-1.saucelabs.com"

    def test_defaults(self, monkeypatch):
        monkeypatch.delenv("SAUCE_USERNAME", raising=False)
        monkeypatch.delenv("SAUCE_ACCESS_KEY", raising=False)
        monkeypatch.delenv("SAUCELABS_USERNAME", raising=False)
        monkeypatch.delenv("SAUCELABS_ACCESS_KEY", raising=False)
        monkeypatch.setenv("LOG_LEVEL", "SILENT")

        config = resolve_config()
        assert config["username"] == ""
        assert config["api_key"] == ""
        assert config["rate_limit_auto_wait"] is True
        assert config["timeout"] == 30.0
