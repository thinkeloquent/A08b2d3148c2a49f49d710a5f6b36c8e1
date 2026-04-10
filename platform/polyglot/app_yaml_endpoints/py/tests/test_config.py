"""
Unit tests for the Config module.

Coverage:
- Configuration loading from file and dict
- Endpoint retrieval
- Intent resolution
- FetchConfig generation
- Error handling
"""

import json
import pytest
from pathlib import Path

from app_yaml_endpoints.config import (
    ConfigError,
    load_config,
    load_config_from_file,
    get_config,
    list_endpoints,
    get_endpoint,
    resolve_intent,
    get_fetch_config,
)
from app_yaml_endpoints.models import EndpointConfig, FetchConfig
import app_yaml_endpoints.config as cfg_module


class TestLoadConfig:
    """Tests for configuration loading functions."""

    def test_load_config_from_dict(self, sample_config, reset_config):
        """load_config should store config from dict."""
        result = load_config(sample_config)

        assert result is sample_config
        assert "llm001" in result["endpoints"]

    def test_load_config_from_file(self, temp_yaml_file, reset_config):
        """load_config_from_file should load YAML file."""
        result = load_config_from_file(temp_yaml_file)

        assert "endpoints" in result
        assert "llm001" in result["endpoints"]

    def test_load_config_missing_file(self, tmp_path, reset_config):
        """load_config_from_file should return empty config for missing file."""
        result = load_config_from_file(tmp_path / "nonexistent.yaml")

        assert result == {"endpoints": {}, "intent_mapping": {}}

    def test_load_config_invalid_yaml(self, tmp_path, reset_config):
        """load_config_from_file should raise ConfigError for invalid YAML."""
        bad_file = tmp_path / "bad.yaml"
        bad_file.write_text("invalid: yaml: content: [")

        with pytest.raises(ConfigError) as exc_info:
            load_config_from_file(bad_file)

        assert "Failed to parse YAML" in str(exc_info.value)


class TestGetConfig:
    """Tests for get_config function."""

    def test_get_config_not_loaded(self, reset_config):
        """get_config should raise if config not loaded."""
        with pytest.raises(ConfigError) as exc_info:
            get_config()

        assert "not loaded" in str(exc_info.value)

    def test_get_config_after_load(self, sample_config, reset_config):
        """get_config should return loaded config."""
        load_config(sample_config)
        result = get_config()

        assert result is sample_config


class TestListEndpoints:
    """Tests for list_endpoints function."""

    def test_list_endpoints(self, sample_config, reset_config):
        """list_endpoints should return all endpoint IDs."""
        load_config(sample_config)
        endpoints = list_endpoints()

        assert "llm001" in endpoints
        assert "llm002" in endpoints
        assert "text001" in endpoints
        assert len(endpoints) == 3

    def test_list_endpoints_empty(self, reset_config):
        """list_endpoints should return empty list for empty config."""
        load_config({"endpoints": {}})
        endpoints = list_endpoints()

        assert endpoints == []


class TestGetEndpoint:
    """Tests for get_endpoint function."""

    def test_get_endpoint_exists(self, sample_config, reset_config):
        """get_endpoint should return EndpointConfig for valid ID."""
        load_config(sample_config)
        endpoint = get_endpoint("llm001")

        assert isinstance(endpoint, EndpointConfig)
        assert endpoint.base_url == "http://localhost:51000/api/llm/gemini-openai-v1"
        assert endpoint.method == "POST"

    def test_get_endpoint_not_found(self, sample_config, reset_config):
        """get_endpoint should return None for unknown ID."""
        load_config(sample_config)
        endpoint = get_endpoint("unknown")

        assert endpoint is None

    def test_get_endpoint_strips_prefix(self, sample_config, reset_config):
        """get_endpoint should strip 'endpoints.' prefix."""
        load_config(sample_config)
        endpoint = get_endpoint("endpoints.llm001")

        assert endpoint is not None
        assert endpoint.base_url == "http://localhost:51000/api/llm/gemini-openai-v1"


class TestResolveIntent:
    """Tests for resolve_intent function."""

    def test_resolve_known_intent(self, sample_config, reset_config):
        """resolve_intent should map known intents."""
        load_config(sample_config)

        assert resolve_intent("persona") == "llm001"
        assert resolve_intent("chat") == "llm001"
        assert resolve_intent("agent") == "llm002"

    def test_resolve_unknown_intent_uses_default(self, sample_config, reset_config):
        """resolve_intent should use default for unknown intents."""
        load_config(sample_config)
        result = resolve_intent("unknown_intent")

        assert result == "llm001"  # default_intent

    def test_resolve_intent_no_mapping(self, reset_config):
        """resolve_intent should use default when no mappings exist."""
        load_config({"endpoints": {}, "intent_mapping": {}})
        result = resolve_intent("any")

        assert result == "llm001"  # hardcoded default


class TestGetFetchConfig:
    """Tests for get_fetch_config function."""

    def test_get_fetch_config_basic(self, sample_config, reset_config):
        """get_fetch_config should return FetchConfig for valid service."""
        load_config(sample_config)
        config = get_fetch_config("llm001", {"prompt": "Hello"})

        assert isinstance(config, FetchConfig)
        assert config.service_id == "llm001"
        assert config.url == "http://localhost:51000/api/llm/gemini-openai-v1"
        assert config.method == "POST"
        assert "Content-Type" in config.headers
        assert "X-Service-ID" in config.headers

    def test_get_fetch_config_body_serialization(self, sample_config, reset_config):
        """get_fetch_config should JSON serialize body."""
        load_config(sample_config)
        payload = {"messages": [{"role": "user", "content": "Test"}]}
        config = get_fetch_config("llm001", payload)

        parsed = json.loads(config.body)
        assert parsed == payload

    def test_get_fetch_config_text_body_type(self, sample_config, reset_config):
        """get_fetch_config should use string for text body type."""
        load_config(sample_config)
        config = get_fetch_config("text001", "plain text content")

        assert config.body == "plain text content"

    def test_get_fetch_config_custom_headers(self, sample_config, reset_config):
        """get_fetch_config should merge custom headers."""
        load_config(sample_config)
        config = get_fetch_config(
            "llm001",
            {"prompt": "Hello"},
            custom_headers={"X-Custom": "value", "X-Request-ID": "123"},
        )

        assert config.headers["X-Custom"] == "value"
        assert config.headers["X-Request-ID"] == "123"
        assert config.headers["X-Service-ID"] == "llm-primary"  # from endpoint

    def test_get_fetch_config_custom_headers_override(self, sample_config, reset_config):
        """Custom headers should override endpoint headers."""
        load_config(sample_config)
        config = get_fetch_config(
            "llm001",
            {"prompt": "Hello"},
            custom_headers={"X-Service-ID": "overridden"},
        )

        assert config.headers["X-Service-ID"] == "overridden"

    def test_get_fetch_config_not_found(self, sample_config, reset_config):
        """get_fetch_config should raise ConfigError for unknown service."""
        load_config(sample_config)

        with pytest.raises(ConfigError) as exc_info:
            get_fetch_config("unknown", {})

        assert exc_info.value.service_id == "unknown"
        assert "llm001" in exc_info.value.available

    def test_get_fetch_config_strips_prefix(self, sample_config, reset_config):
        """get_fetch_config should strip 'endpoints.' prefix."""
        load_config(sample_config)
        config = get_fetch_config("endpoints.llm001", {"test": True})

        assert config.service_id == "llm001"

    def test_get_fetch_config_timeout(self, sample_config, reset_config):
        """get_fetch_config should include timeout from endpoint."""
        load_config(sample_config)
        config = get_fetch_config("llm001", {})

        assert config.timeout == 30000


class TestConfigError:
    """Tests for ConfigError exception."""

    def test_config_error_basic(self):
        """ConfigError should store message."""
        err = ConfigError("Test error")
        assert str(err) == "Test error"
        assert err.service_id is None
        assert err.available == []

    def test_config_error_with_details(self):
        """ConfigError should store service_id and available list."""
        err = ConfigError("Not found", service_id="test001", available=["a", "b"])
        assert err.service_id == "test001"
        assert err.available == ["a", "b"]


class TestLogVerification:
    """Tests verifying logging behavior."""

    def test_load_config_logs_info(self, temp_yaml_file, reset_config, log_capture):
        """load_config_from_file should log info on success."""
        messages, handler = log_capture

        # Replace logger handler
        cfg_module.logger._handler = handler
        cfg_module.logger._level = 0  # trace

        load_config_from_file(temp_yaml_file)

        info_logs = [m for m in messages if m["level"] == "info"]
        assert len(info_logs) >= 1
        assert any("loaded" in m["msg"].lower() for m in info_logs)

    def test_missing_file_logs_warn(self, tmp_path, reset_config, log_capture):
        """load_config_from_file should log warning for missing file."""
        messages, handler = log_capture

        cfg_module.logger._handler = handler
        cfg_module.logger._level = 0

        load_config_from_file(tmp_path / "missing.yaml")

        warn_logs = [m for m in messages if m["level"] == "warn"]
        assert len(warn_logs) >= 1

    def test_service_not_found_logs_warn(self, sample_config, reset_config, log_capture):
        """get_fetch_config should log warning for unknown service."""
        messages, handler = log_capture

        cfg_module.logger._handler = handler
        cfg_module.logger._level = 0

        load_config(sample_config)

        try:
            get_fetch_config("unknown", {})
        except ConfigError:
            pass

        warn_logs = [m for m in messages if m["level"] == "warn"]
        assert len(warn_logs) >= 1
