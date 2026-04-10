"""
Tests for the GitHubClient core HTTP client.

Covers construction, request methods, rate limit parsing,
error mapping, and response handling.
"""

from __future__ import annotations

import os
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from github_api.sdk.client import GitHubClient
from github_api.sdk.errors import (
    AuthError,
    GitHubError,
    NotFoundError,
    RateLimitError,
    map_response_to_error,
)
from github_api.sdk.rate_limit import RateLimitInfo, parse_rate_limit_headers


class TestGitHubClientConstruction:
    """Test GitHubClient initialization and configuration."""

    def test_client_with_explicit_token(self) -> None:
        """Client should accept an explicit token."""
        client = GitHubClient(token="ghp_test123456789012345678901234567890")
        assert client.token_info.token == "ghp_test123456789012345678901234567890"
        assert client.token_info.source == "explicit"
        assert client.token_info.type == "classic-pat"

    def test_client_with_env_token(self) -> None:
        """Client should resolve token from GITHUB_TOKEN env var."""
        with patch.dict(os.environ, {"GITHUB_TOKEN": "ghp_envtoken1234567890123456789012"}):
            client = GitHubClient()
            assert client.token_info.source == "GITHUB_TOKEN"

    def test_client_raises_without_token(self) -> None:
        """Client should raise AuthError when no token is available."""
        with patch.dict(os.environ, {}, clear=True):
            # Remove all known token env vars
            for var in ("GITHUB_TOKEN", "GH_TOKEN", "GITHUB_ACCESS_TOKEN", "GITHUB_PAT"):
                os.environ.pop(var, None)
            with pytest.raises(AuthError):
                GitHubClient()

    def test_client_default_base_url(self) -> None:
        """Client should default to the GitHub API base URL."""
        client = GitHubClient(token="ghp_test123456789012345678901234567890")
        assert client._base_url == "https://api.github.com"

    def test_client_custom_base_url(self) -> None:
        """Client should accept a custom base URL."""
        client = GitHubClient(
            token="ghp_test123456789012345678901234567890",
            base_url="https://github.example.com/api/v3",
        )
        assert client._base_url == "https://github.example.com/api/v3"

    def test_client_strips_trailing_slash(self) -> None:
        """Client should strip trailing slash from base URL."""
        client = GitHubClient(
            token="ghp_test123456789012345678901234567890",
            base_url="https://api.github.com/",
        )
        assert client._base_url == "https://api.github.com"


class TestRateLimitParsing:
    """Test rate limit header parsing."""

    def test_parse_rate_limit_headers(self, mock_rate_limit_headers: dict) -> None:
        """Should correctly parse all rate limit headers."""
        info = parse_rate_limit_headers(mock_rate_limit_headers)
        assert info is not None
        assert info.limit == 5000
        assert info.remaining == 4999
        assert info.reset == 1700000000
        assert info.used == 1
        assert info.resource == "core"

    def test_parse_rate_limit_missing_headers(self) -> None:
        """Should return None when rate limit headers are missing."""
        info = parse_rate_limit_headers({})
        assert info is None

    def test_parse_rate_limit_partial_headers(self) -> None:
        """Should return None when only some headers are present."""
        info = parse_rate_limit_headers({"x-ratelimit-limit": "5000"})
        assert info is None

    def test_rate_limit_is_exhausted(self) -> None:
        """Should detect exhausted rate limit."""
        info = RateLimitInfo(limit=5000, remaining=0, reset=1700000000, used=5000)
        assert info.is_exhausted is True

    def test_rate_limit_not_exhausted(self) -> None:
        """Should detect available rate limit."""
        info = RateLimitInfo(limit=5000, remaining=100, reset=1700000000, used=4900)
        assert info.is_exhausted is False


class TestErrorMapping:
    """Test HTTP response to error mapping."""

    def test_map_401_to_auth_error(self) -> None:
        """401 should map to AuthError."""
        error = map_response_to_error(401, {"message": "Bad credentials"}, {})
        assert isinstance(error, AuthError)
        assert error.status == 401
        assert "Bad credentials" in error.message

    def test_map_404_to_not_found(self) -> None:
        """404 should map to NotFoundError."""
        error = map_response_to_error(404, {"message": "Not Found"}, {})
        assert isinstance(error, NotFoundError)
        assert error.status == 404

    def test_map_429_to_rate_limit_error(self) -> None:
        """429 should map to RateLimitError with retry-after."""
        error = map_response_to_error(
            429,
            {"message": "Rate limit exceeded"},
            {"retry-after": "60"},
        )
        assert isinstance(error, RateLimitError)
        assert error.retry_after == 60

    def test_map_500_to_server_error(self) -> None:
        """500+ should map to ServerError."""
        from github_api.sdk.errors import ServerError
        error = map_response_to_error(500, {"message": "Internal Server Error"}, {})
        assert isinstance(error, ServerError)

    def test_map_extracts_request_id(self) -> None:
        """Should extract x-github-request-id from headers."""
        error = map_response_to_error(
            404,
            {"message": "Not Found"},
            {"x-github-request-id": "REQ-123"},
        )
        assert error.request_id == "REQ-123"

    def test_map_extracts_documentation_url(self) -> None:
        """Should extract documentation_url from body."""
        error = map_response_to_error(
            422,
            {
                "message": "Validation Failed",
                "documentation_url": "https://docs.github.com/rest",
            },
            {},
        )
        assert error.documentation_url == "https://docs.github.com/rest"

    def test_error_to_dict(self) -> None:
        """Error to_dict should produce serializable output."""
        error = map_response_to_error(
            404,
            {"message": "Not Found"},
            {"x-github-request-id": "REQ-456"},
        )
        d = error.to_dict()
        assert d["error"] == "NotFoundError"
        assert d["message"] == "Not Found"
        assert d["status"] == 404
        assert d["request_id"] == "REQ-456"


class TestGitHubClientContextManager:
    """Test async context manager protocol."""

    @pytest.mark.asyncio
    async def test_context_manager(self) -> None:
        """Client should support async with statement."""
        async with GitHubClient(token="ghp_test123456789012345678901234567890") as client:
            assert client is not None
            assert client.token_info.token == "ghp_test123456789012345678901234567890"
