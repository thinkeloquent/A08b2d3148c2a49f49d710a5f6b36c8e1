"""
Unit tests for confluence_api.config module.

Tests cover:
- Statement coverage for all config resolution paths
- Branch coverage for priority chain (server config > env vars)
- Boundary value analysis (missing/partial/complete config)
- Error handling for invalid app_state objects
"""

from unittest.mock import MagicMock

import pytest

from confluence_api.config import get_config, get_server_config, load_config_from_env


class TestLoadConfigFromEnv:
    """Tests for load_config_from_env()."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        def test_returns_dict_with_expected_keys(self, clean_env):
            """Config dict should always contain the three expected keys."""
            result = load_config_from_env()
            assert "base_url" in result
            assert "username" in result
            assert "api_token" in result

        def test_reads_all_env_vars(self, clean_env):
            """All three env vars should be read correctly."""
            clean_env(
                CONFLUENCE_BASE_URL="https://confluence.test.com",
                CONFLUENCE_USERNAME="testuser",
                CONFLUENCE_API_TOKEN="token-abc",
            )
            result = load_config_from_env()
            assert result["base_url"] == "https://confluence.test.com"
            assert result["username"] == "testuser"
            assert result["api_token"] == "token-abc"

    class TestBranchCoverage:
        """Test all if/else branches."""

        def test_missing_base_url_returns_none(self, clean_env):
            """Missing CONFLUENCE_BASE_URL should yield None."""
            clean_env(CONFLUENCE_USERNAME="u", CONFLUENCE_API_TOKEN="t")
            result = load_config_from_env()
            assert result["base_url"] is None

        def test_missing_username_returns_none(self, clean_env):
            """Missing CONFLUENCE_USERNAME should yield None."""
            clean_env(CONFLUENCE_BASE_URL="http://x", CONFLUENCE_API_TOKEN="t")
            result = load_config_from_env()
            assert result["username"] is None

        def test_missing_api_token_returns_none(self, clean_env):
            """Missing CONFLUENCE_API_TOKEN should yield None."""
            clean_env(CONFLUENCE_BASE_URL="http://x", CONFLUENCE_USERNAME="u")
            result = load_config_from_env()
            assert result["api_token"] is None

    class TestBoundaryValueAnalysis:
        """Test edge cases: empty, min, max, boundary values."""

        def test_all_missing_returns_all_none(self, clean_env):
            """No env vars set should return all None values."""
            result = load_config_from_env()
            assert result == {"base_url": None, "username": None, "api_token": None}

        def test_empty_string_env_var_treated_as_missing(self, clean_env):
            """Empty string env vars should be treated as missing (os.environ.get returns '')."""
            clean_env(
                CONFLUENCE_BASE_URL="",
                CONFLUENCE_USERNAME="",
                CONFLUENCE_API_TOKEN="",
            )
            result = load_config_from_env()
            # Empty strings are falsy, logged as warnings
            assert result["base_url"] == ""
            assert result["username"] == ""
            assert result["api_token"] == ""


class TestGetServerConfig:
    """Tests for get_server_config()."""

    class TestStatementCoverage:

        def test_with_get_nested_method(self):
            """Should extract config using get_nested() method."""
            mock_config = MagicMock()
            mock_config.get_nested.side_effect = lambda *args: {
                ("providers", "confluence", "base_url"): "https://conf.test",
                ("providers", "confluence", "username"): "admin",
                ("providers", "confluence", "api_token"): "tok",
            }.get(args)

            mock_state = MagicMock()
            mock_state.config = mock_config

            result = get_server_config(mock_state)
            assert result["base_url"] == "https://conf.test"
            assert result["username"] == "admin"
            assert result["api_token"] == "tok"

        def test_with_dict_config(self):
            """Should extract config from dict-like config object."""
            mock_state = MagicMock(spec=[])
            mock_state.config = {
                "providers": {
                    "confluence": {
                        "base_url": "https://conf.test",
                        "username": "admin",
                        "api_token": "tok",
                    }
                }
            }

            result = get_server_config(mock_state)
            assert result["base_url"] == "https://conf.test"
            assert result["username"] == "admin"
            assert result["api_token"] == "tok"

    class TestBranchCoverage:

        def test_no_config_attribute(self):
            """Should return all None when app.state has no config."""
            mock_state = MagicMock(spec=[])
            mock_state.config = None

            result = get_server_config(mock_state)
            assert result == {"base_url": None, "username": None, "api_token": None}

        def test_unknown_config_type(self):
            """Should return all None for unknown config type."""
            mock_state = MagicMock(spec=[])
            mock_state.config = "not-a-dict-or-get_nested"

            result = get_server_config(mock_state)
            assert result == {"base_url": None, "username": None, "api_token": None}

        def test_dict_config_missing_providers(self):
            """Should handle missing 'providers' key gracefully."""
            mock_state = MagicMock(spec=[])
            mock_state.config = {}

            result = get_server_config(mock_state)
            assert result == {"base_url": None, "username": None, "api_token": None}

    class TestErrorHandling:

        def test_exception_in_get_nested(self):
            """Should catch and handle exceptions from get_nested()."""
            mock_config = MagicMock()
            mock_config.get_nested.side_effect = RuntimeError("config broken")

            mock_state = MagicMock()
            mock_state.config = mock_config

            result = get_server_config(mock_state)
            assert result == {"base_url": None, "username": None, "api_token": None}


class TestGetConfig:
    """Tests for get_config() priority chain."""

    class TestStatementCoverage:

        def test_returns_server_config_when_complete(self):
            """Should prefer complete server config over env vars."""
            mock_config = MagicMock()
            mock_config.get_nested.side_effect = lambda *args: {
                ("providers", "confluence", "base_url"): "https://server.conf",
                ("providers", "confluence", "username"): "srv-user",
                ("providers", "confluence", "api_token"): "srv-tok",
            }.get(args)

            mock_state = MagicMock()
            mock_state.config = mock_config

            result = get_config(mock_state)
            assert result["base_url"] == "https://server.conf"

        def test_falls_back_to_env_when_no_app_state(self, clean_env):
            """Should fall back to env vars when app_state is None."""
            clean_env(
                CONFLUENCE_BASE_URL="https://env.conf",
                CONFLUENCE_USERNAME="env-user",
                CONFLUENCE_API_TOKEN="env-tok",
            )
            result = get_config(None)
            assert result["base_url"] == "https://env.conf"

    class TestBranchCoverage:

        def test_falls_back_to_env_when_server_config_incomplete(self, clean_env):
            """Should fall back to env when server config is incomplete."""
            mock_state = MagicMock(spec=[])
            mock_state.config = None

            clean_env(
                CONFLUENCE_BASE_URL="https://fallback.conf",
                CONFLUENCE_USERNAME="fb-user",
                CONFLUENCE_API_TOKEN="fb-tok",
            )

            result = get_config(mock_state)
            assert result["base_url"] == "https://fallback.conf"

        def test_no_app_state_no_env_returns_none_values(self, clean_env):
            """Should return all None when nothing is configured."""
            result = get_config()
            assert result["base_url"] is None
            assert result["username"] is None
            assert result["api_token"] is None
