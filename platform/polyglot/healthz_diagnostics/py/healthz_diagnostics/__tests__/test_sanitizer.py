"""
Unit tests for healthz_diagnostics.sanitizer module.
"""

import pytest
from healthz_diagnostics.sanitizer import ConfigSanitizer


class TestConfigSanitizer:
    """Tests for ConfigSanitizer."""

    class TestStatementCoverage:
        """Ensure every statement executes."""

        def test_sanitize_redacts_sensitive_keys(self):
            """sanitize() redacts sensitive keys with ***."""
            sanitizer = ConfigSanitizer()
            config = {
                "name": "gemini",
                "endpoint_api_key": "sk-secret-123",
            }

            result = sanitizer.sanitize(config)

            assert result["name"] == "gemini"
            assert result["endpoint_api_key"] == "***"

        def test_check_env_vars_returns_presence_map(self, clean_env):
            """check_env_vars() returns boolean presence map."""
            clean_env(TEST_VAR="value")
            sanitizer = ConfigSanitizer()

            result = sanitizer.check_env_vars(["TEST_VAR", "MISSING_VAR", "PATH"])

            assert result["TEST_VAR"] is True
            assert result["MISSING_VAR"] is False
            assert result["PATH"] is True  # PATH should exist

    class TestBranchCoverage:
        """Test all branches."""

        def test_key_matches_sensitive_pattern(self):
            """Keys matching sensitive patterns are redacted."""
            sanitizer = ConfigSanitizer()
            config = {
                "api_key": "secret",
                "token": "bearer-abc",
                "password": "hunter2",
                "secret": "shh",
            }

            result = sanitizer.sanitize(config)

            assert result["api_key"] == "***"
            assert result["token"] == "***"
            assert result["password"] == "***"
            assert result["secret"] == "***"

        def test_key_does_not_match_pattern(self):
            """Keys not matching patterns are preserved."""
            sanitizer = ConfigSanitizer()
            config = {
                "name": "provider",
                "endpoint": "https://api.example.com",
                "timeout": 30,
            }

            result = sanitizer.sanitize(config)

            assert result["name"] == "provider"
            assert result["endpoint"] == "https://api.example.com"
            assert result["timeout"] == 30

    class TestBoundaryValues:
        """Test edge cases."""

        def test_empty_config(self):
            """Empty config returns empty dict."""
            sanitizer = ConfigSanitizer()

            result = sanitizer.sanitize({})

            assert result == {}

        def test_nested_config_sanitized(self):
            """Nested config is recursively sanitized."""
            sanitizer = ConfigSanitizer()
            config = {
                "provider": {
                    "name": "openai",
                    "endpoint_api_key": "sk-nested",
                },
            }

            result = sanitizer.sanitize(config)

            assert result["provider"]["name"] == "openai"
            assert result["provider"]["endpoint_api_key"] == "***"

        def test_no_sensitive_keys(self):
            """Config with no sensitive keys unchanged."""
            sanitizer = ConfigSanitizer()
            config = {
                "name": "test",
                "timeout": 30,
                "enabled": True,
            }

            result = sanitizer.sanitize(config)

            assert result == config

        def test_empty_env_var_list(self):
            """Empty env var list returns empty map."""
            sanitizer = ConfigSanitizer()

            result = sanitizer.check_env_vars([])

            assert result == {}

        def test_list_values_sanitized(self):
            """List values are recursively sanitized."""
            sanitizer = ConfigSanitizer()
            config = {
                "providers": [
                    {"name": "p1", "api_key": "secret1"},
                    {"name": "p2", "api_key": "secret2"},
                ]
            }

            result = sanitizer.sanitize(config)

            assert result["providers"][0]["name"] == "p1"
            assert result["providers"][0]["api_key"] == "***"
            assert result["providers"][1]["name"] == "p2"
            assert result["providers"][1]["api_key"] == "***"

    class TestParityVectors:
        """Cross-language parity tests."""

        @pytest.mark.parametrize("key,should_redact", [
            ("endpoint_api_key", True),
            ("api_key", True),
            ("token", True),
            ("access_token", True),
            ("password", True),
            ("secret", True),
            ("client_secret", True),
            ("name", False),
            ("endpoint", False),
            ("model", False),
            ("timeout", False),
        ])
        def test_redaction_parity(self, key, should_redact):
            """Verify same keys redacted across languages."""
            sanitizer = ConfigSanitizer()
            config = {key: "test_value"}

            result = sanitizer.sanitize(config)

            if should_redact:
                assert result[key] == "***"
            else:
                assert result[key] == "test_value"
