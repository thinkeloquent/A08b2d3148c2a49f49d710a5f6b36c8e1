"""Tests for the repository metadata endpoint."""

from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock

from github_sdk_api_component_usage_audit.sdk.repo_meta import fetch_repo_meta


@pytest.fixture
def mock_client():
    """Create a mock GitHubClient."""
    client = AsyncMock()
    return client


@pytest.fixture
def cache():
    """Create a fresh cache dict."""
    return {}


class TestFetchRepoMeta:
    """Test fetch_repo_meta validation logic."""

    @pytest.mark.asyncio
    async def test_valid_repo(self, mock_client, cache):
        mock_client.get.return_value = {
            "stargazers_count": 1000,
            "archived": False,
            "full_name": "owner/repo",
        }

        result = await fetch_repo_meta(
            mock_client,
            owner="owner",
            repo="repo",
            min_stars=500,
            cache=cache,
        )

        assert result["valid"] is True
        assert result["repo"]["stargazers_count"] == 1000
        mock_client.get.assert_called_once_with("/repos/owner/repo")

    @pytest.mark.asyncio
    async def test_low_stars_repo(self, mock_client, cache):
        mock_client.get.return_value = {
            "stargazers_count": 100,
            "archived": False,
        }

        result = await fetch_repo_meta(
            mock_client,
            owner="owner",
            repo="repo",
            min_stars=500,
            cache=cache,
        )

        assert result["valid"] is False

    @pytest.mark.asyncio
    async def test_archived_repo(self, mock_client, cache):
        mock_client.get.return_value = {
            "stargazers_count": 2000,
            "archived": True,
        }

        result = await fetch_repo_meta(
            mock_client,
            owner="owner",
            repo="repo",
            min_stars=500,
            cache=cache,
        )

        assert result["valid"] is False

    @pytest.mark.asyncio
    async def test_cache_hit(self, mock_client, cache):
        """Second call for the same owner/repo should use cache."""
        mock_client.get.return_value = {
            "stargazers_count": 1000,
            "archived": False,
        }

        # First call
        result1 = await fetch_repo_meta(
            mock_client,
            owner="owner",
            repo="repo",
            min_stars=500,
            cache=cache,
        )

        # Second call — should not hit the API
        result2 = await fetch_repo_meta(
            mock_client,
            owner="owner",
            repo="repo",
            min_stars=500,
            cache=cache,
        )

        assert result1 is result2
        assert mock_client.get.call_count == 1

    @pytest.mark.asyncio
    async def test_different_repos_not_cached(self, mock_client, cache):
        mock_client.get.return_value = {
            "stargazers_count": 1000,
            "archived": False,
        }

        await fetch_repo_meta(
            mock_client, owner="a", repo="b", min_stars=500, cache=cache
        )
        await fetch_repo_meta(
            mock_client, owner="c", repo="d", min_stars=500, cache=cache
        )

        assert mock_client.get.call_count == 2
