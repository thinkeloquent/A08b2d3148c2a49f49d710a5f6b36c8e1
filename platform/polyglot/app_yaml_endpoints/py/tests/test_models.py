"""
Unit tests for the Models module.

Coverage:
- EndpointConfig creation and serialization
- FetchConfig creation and serialization
- Default values
- Field mapping (camelCase <-> snake_case)
"""

import pytest
from app_yaml_endpoints.models import EndpointConfig, FetchConfig


class TestEndpointConfig:
    """Tests for EndpointConfig dataclass."""

    def test_from_dict_full(self):
        """EndpointConfig should parse all fields from dict."""
        data = {
            "baseUrl": "http://localhost:8000/api",
            "description": "Test endpoint",
            "method": "POST",
            "headers": {"X-Custom": "value"},
            "timeout": 60000,
            "bodyType": "json",
        }
        config = EndpointConfig.from_dict(data)

        assert config.base_url == "http://localhost:8000/api"
        assert config.description == "Test endpoint"
        assert config.method == "POST"
        assert config.headers == {"X-Custom": "value"}
        assert config.timeout == 60000
        assert config.body_type == "json"

    def test_from_dict_defaults(self):
        """EndpointConfig should use defaults for missing fields."""
        data = {"baseUrl": "http://localhost:8000"}
        config = EndpointConfig.from_dict(data)

        assert config.base_url == "http://localhost:8000"
        assert config.description == ""
        assert config.method == "POST"
        assert config.headers == {}
        assert config.timeout == 30000
        assert config.body_type == "json"

    def test_from_dict_alternate_baseurl_key(self):
        """EndpointConfig should accept 'baseurl' (lowercase)."""
        data = {"baseurl": "http://example.com"}
        config = EndpointConfig.from_dict(data)

        assert config.base_url == "http://example.com"

    def test_to_dict(self):
        """EndpointConfig should serialize to dict with camelCase keys."""
        config = EndpointConfig(
            base_url="http://localhost:8000",
            description="Test",
            method="GET",
            headers={"Accept": "application/json"},
            timeout=5000,
            body_type="text",
        )
        result = config.to_dict()

        assert result["baseUrl"] == "http://localhost:8000"
        assert result["description"] == "Test"
        assert result["method"] == "GET"
        assert result["headers"] == {"Accept": "application/json"}
        assert result["timeout"] == 5000
        assert result["bodyType"] == "text"

    def test_body_type_text(self):
        """EndpointConfig should accept text body type."""
        data = {"baseUrl": "http://localhost", "bodyType": "text"}
        config = EndpointConfig.from_dict(data)
        assert config.body_type == "text"


class TestFetchConfig:
    """Tests for FetchConfig dataclass."""

    def test_creation(self):
        """FetchConfig should be created with all fields."""
        config = FetchConfig(
            service_id="llm001",
            url="http://localhost:8000/api",
            method="POST",
            headers={"Content-Type": "application/json"},
            body='{"prompt": "test"}',
            timeout=30000,
        )

        assert config.service_id == "llm001"
        assert config.url == "http://localhost:8000/api"
        assert config.method == "POST"
        assert config.headers == {"Content-Type": "application/json"}
        assert config.body == '{"prompt": "test"}'
        assert config.timeout == 30000

    def test_to_dict(self):
        """FetchConfig should serialize with camelCase keys."""
        config = FetchConfig(
            service_id="test001",
            url="http://example.com",
            method="GET",
            headers={},
            body="",
            timeout=10000,
        )
        result = config.to_dict()

        assert result["serviceId"] == "test001"
        assert result["url"] == "http://example.com"
        assert result["method"] == "GET"
        assert result["headers"] == {}
        assert result["body"] == ""
        assert result["headersTimeout"] == 10000

    def test_body_can_be_json_string(self):
        """FetchConfig body can hold JSON string."""
        import json

        payload = {"messages": [{"role": "user", "content": "Hello"}]}
        body = json.dumps(payload)

        config = FetchConfig(
            service_id="llm001",
            url="http://localhost",
            method="POST",
            headers={},
            body=body,
            timeout=30000,
        )

        parsed = json.loads(config.body)
        assert parsed == payload


class TestBoundaryValues:
    """Boundary value tests for models."""

    def test_empty_headers(self):
        """Models should handle empty headers dict."""
        config = EndpointConfig.from_dict({"baseUrl": "http://test"})
        assert config.headers == {}

    def test_zero_timeout(self):
        """Models should accept zero timeout."""
        data = {"baseUrl": "http://test", "timeout": 0}
        config = EndpointConfig.from_dict(data)
        assert config.timeout == 0

    def test_large_timeout(self):
        """Models should accept large timeout values."""
        data = {"baseUrl": "http://test", "timeout": 600000}
        config = EndpointConfig.from_dict(data)
        assert config.timeout == 600000

    def test_empty_base_url(self):
        """Models should handle empty base URL."""
        config = EndpointConfig.from_dict({})
        assert config.base_url == ""
