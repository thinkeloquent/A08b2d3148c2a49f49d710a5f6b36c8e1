"""
Unit tests for the EndpointConfigSDK class.

Coverage:
- Factory function
- All SDK methods: get_by_key, get_by_name, get_by_tag, get_all,
  resolve_intent, list_keys, properties, load_config,
  refresh_config, load_from_file, get_fetch_config
"""

import pytest

from app_yaml_endpoints.sdk import EndpointConfigSDK, create_endpoint_config_sdk


SAMPLE_CONFIG = {
    "endpoints": {
        "llm001": {
            "name": "Primary LLM",
            "tags": ["llm", "gemini", "primary"],
            "baseUrl": "http://localhost:51000/api/llm",
            "description": "Primary LLM Service",
            "method": "POST",
            "headers": {"Content-Type": "application/json"},
            "timeout": 30000,
            "bodyType": "json",
        },
        "llm002": {
            "name": "Secondary LLM",
            "tags": ["llm", "gemini", "secondary"],
            "baseUrl": "http://localhost:52000/api/llm",
            "description": "Secondary LLM Service",
            "method": "POST",
            "headers": {"Content-Type": "application/json"},
            "timeout": 30000,
            "bodyType": "json",
        },
        "fastify": {
            "name": "Fastify Server",
            "tags": ["server", "nodejs"],
            "baseUrl": "http://localhost:51000",
            "description": "Fastify (Node.js)",
            "method": "GET",
            "headers": {},
            "timeout": 10000,
            "bodyType": "json",
        },
    },
    "intent_mapping": {
        "mappings": {
            "chat": "llm001",
            "persona": "llm001",
        },
        "default_intent": "llm001",
    },
}


class TestFactory:
    """Tests for create_endpoint_config_sdk factory."""

    def test_returns_instance(self):
        sdk = create_endpoint_config_sdk()
        assert isinstance(sdk, EndpointConfigSDK)

    def test_accepts_file_path(self):
        sdk = create_endpoint_config_sdk(file_path="/tmp/test.yaml")
        assert isinstance(sdk, EndpointConfigSDK)


class TestEndpointConfigSDK:
    """Tests for EndpointConfigSDK methods."""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.sdk = EndpointConfigSDK()
        self.sdk.load_config(SAMPLE_CONFIG)

    def test_load_config(self):
        keys = self.sdk.list_keys()
        assert sorted(keys) == ["fastify", "llm001", "llm002"]

    def test_get_by_key_valid(self):
        ep = self.sdk.get_by_key("llm001")
        assert ep is not None
        assert ep.key == "llm001"
        assert ep.name == "Primary LLM"
        assert ep.base_url == "http://localhost:51000/api/llm"

    def test_get_by_key_unknown(self):
        ep = self.sdk.get_by_key("unknown")
        assert ep is None

    def test_get_by_key_includes_key_name_tags(self):
        ep = self.sdk.get_by_key("llm001")
        assert ep.key == "llm001"
        assert ep.name == "Primary LLM"
        assert ep.tags == ["llm", "gemini", "primary"]

    def test_get_by_name_found(self):
        ep = self.sdk.get_by_name("Primary LLM")
        assert ep is not None
        assert ep.key == "llm001"

    def test_get_by_name_not_found(self):
        ep = self.sdk.get_by_name("Nonexistent")
        assert ep is None

    def test_get_by_name_case_sensitive(self):
        ep = self.sdk.get_by_name("primary llm")
        assert ep is None

    def test_get_by_tag_multiple(self):
        results = self.sdk.get_by_tag("llm")
        assert len(results) == 2
        keys = sorted(ep.key for ep in results)
        assert keys == ["llm001", "llm002"]

    def test_get_by_tag_unknown(self):
        results = self.sdk.get_by_tag("nonexistent")
        assert results == []

    def test_get_by_tag_specific(self):
        results = self.sdk.get_by_tag("primary")
        assert len(results) == 1
        assert results[0].key == "llm001"

    def test_get_all(self):
        all_eps = self.sdk.get_all()
        assert len(all_eps) == 3

    def test_get_all_has_key_field(self):
        for ep in self.sdk.get_all():
            assert ep.key
            assert ep.base_url

    def test_list_keys(self):
        keys = self.sdk.list_keys()
        assert len(keys) == 3
        assert "llm001" in keys
        assert "llm002" in keys
        assert "fastify" in keys

    def test_resolve_intent_known(self):
        result = self.sdk.resolve_intent("chat")
        assert result["key"] == "llm001"
        assert result["endpoint"] is not None
        assert result["endpoint"].base_url == "http://localhost:51000/api/llm"

    def test_resolve_intent_unknown_uses_default(self):
        result = self.sdk.resolve_intent("unknown_intent")
        assert result["key"] == "llm001"
        assert result["endpoint"] is not None

    def test_properties_nested(self):
        timeout = self.sdk.properties("endpoints.llm001.timeout")
        assert timeout == 30000

    def test_properties_missing_returns_default(self):
        val = self.sdk.properties("endpoints.missing.timeout", 5000)
        assert val == 5000

    def test_properties_missing_no_default(self):
        val = self.sdk.properties("endpoints.missing.timeout")
        assert val is None

    def test_properties_top_level(self):
        mapping = self.sdk.properties("intent_mapping")
        assert mapping is not None
        assert "mappings" in mapping

    def test_refresh_config_raises_without_file_path(self):
        with pytest.raises(RuntimeError, match="no file_path configured"):
            self.sdk.refresh_config()

    def test_get_fetch_config_valid(self):
        fc = self.sdk.get_fetch_config("llm001", {"prompt": "Hello"})
        assert fc.url == "http://localhost:51000/api/llm"
        assert fc.method == "POST"
        assert fc.body
        assert fc.timeout

    def test_get_fetch_config_unknown_raises(self):
        from app_yaml_endpoints.config import ConfigError

        with pytest.raises(ConfigError):
            self.sdk.get_fetch_config("unknown", {})
