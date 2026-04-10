"""Unit tests for github_api.sdk.repos.client module.

Tests cover:
- Statement coverage for all ReposClient methods
- Branch coverage for conditional paths (is_starred, create validation)
- Boundary value analysis with invalid inputs
- Error handling for validation and client errors
- Log verification for info-level logging
"""

from __future__ import annotations

import logging
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from github_api.sdk.errors import ValidationError
from github_api.sdk.repos.client import ReposClient


@pytest.fixture
def mock_client() -> MagicMock:
    """Create a mock GitHubClient with async method stubs."""
    client = MagicMock()
    client.get = AsyncMock(return_value={"id": 1, "name": "test-repo"})
    client.post = AsyncMock(return_value={"id": 1, "name": "test-repo"})
    client.put = AsyncMock(return_value={})
    client.patch = AsyncMock(return_value={"id": 1, "name": "updated-repo"})
    client.delete = AsyncMock(return_value={})
    return client


@pytest.fixture
def repos(mock_client: MagicMock) -> ReposClient:
    """Create a ReposClient with the mock GitHubClient."""
    return ReposClient(mock_client)


class TestStatementCoverage:
    """Execute every code path in ReposClient."""

    async def test_get_calls_correct_path(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """get(owner, repo) calls client.get with /repos/{owner}/{repo}."""
        result = await repos.get("octocat", "Hello-World")
        mock_client.get.assert_called_once_with("/repos/octocat/Hello-World")
        assert result == {"id": 1, "name": "test-repo"}

    async def test_list_for_user(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """list_for_user calls /users/{username}/repos."""
        await repos.list_for_user("octocat")
        mock_client.get.assert_called_once_with(
            "/users/octocat/repos", params=None
        )

    async def test_list_for_user_with_params(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """list_for_user passes query params correctly."""
        await repos.list_for_user("octocat", params={"sort": "updated"})
        mock_client.get.assert_called_once_with(
            "/users/octocat/repos", params={"sort": "updated"}
        )

    async def test_list_for_authenticated_user(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """list_for_authenticated_user calls /user/repos."""
        await repos.list_for_authenticated_user()
        mock_client.get.assert_called_once_with("/user/repos", params=None)

    async def test_list_for_org(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """list_for_org calls /orgs/{org}/repos."""
        await repos.list_for_org("github")
        mock_client.get.assert_called_once_with(
            "/orgs/github/repos", params=None
        )

    async def test_create_calls_post(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """create calls client.post /user/repos."""
        data = {"name": "new-repo", "private": True}
        result = await repos.create(data)
        mock_client.post.assert_called_once_with("/user/repos", json=data)
        assert result["name"] == "test-repo"

    async def test_create_in_org(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """create_in_org calls /orgs/{org}/repos."""
        data = {"name": "org-repo"}
        await repos.create_in_org("myorg", data)
        mock_client.post.assert_called_once_with(
            "/orgs/myorg/repos", json=data
        )

    async def test_update_calls_patch(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """update calls client.patch with correct path and data."""
        data = {"description": "updated"}
        result = await repos.update("octocat", "Hello-World", data)
        mock_client.patch.assert_called_once_with(
            "/repos/octocat/Hello-World", json=data
        )
        assert result["name"] == "updated-repo"

    async def test_delete_calls_correct_path(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """delete calls client.delete with /repos/{owner}/{repo}."""
        result = await repos.delete("octocat", "Hello-World")
        mock_client.delete.assert_called_once_with(
            "/repos/octocat/Hello-World"
        )
        assert result == {}

    async def test_get_topics(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """get_topics calls /repos/{owner}/{repo}/topics."""
        await repos.get_topics("octocat", "Hello-World")
        mock_client.get.assert_called_once_with(
            "/repos/octocat/Hello-World/topics"
        )

    async def test_replace_topics(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """replace_topics calls client.put with topics payload."""
        await repos.replace_topics("octocat", "Hello-World", ["python", "api"])
        mock_client.put.assert_called_once_with(
            "/repos/octocat/Hello-World/topics",
            json={"names": ["python", "api"]},
        )

    async def test_get_languages(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """get_languages calls /repos/{owner}/{repo}/languages."""
        await repos.get_languages("octocat", "Hello-World")
        mock_client.get.assert_called_once_with(
            "/repos/octocat/Hello-World/languages"
        )

    async def test_list_contributors(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """list_contributors calls /repos/{owner}/{repo}/contributors."""
        await repos.list_contributors("octocat", "Hello-World")
        mock_client.get.assert_called_once_with(
            "/repos/octocat/Hello-World/contributors", params=None
        )

    async def test_list_contributors_with_params(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """list_contributors passes params through."""
        await repos.list_contributors(
            "octocat", "Hello-World", params={"anon": "true"}
        )
        mock_client.get.assert_called_once_with(
            "/repos/octocat/Hello-World/contributors",
            params={"anon": "true"},
        )

    async def test_fork(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """fork calls client.post with /repos/{owner}/{repo}/forks."""
        await repos.fork("octocat", "Hello-World")
        mock_client.post.assert_called_once_with(
            "/repos/octocat/Hello-World/forks", json=None
        )

    async def test_fork_with_options(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """fork passes options correctly."""
        opts = {"organization": "myorg", "name": "my-fork"}
        await repos.fork("octocat", "Hello-World", options=opts)
        mock_client.post.assert_called_once_with(
            "/repos/octocat/Hello-World/forks", json=opts
        )

    async def test_list_forks(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """list_forks calls /repos/{owner}/{repo}/forks."""
        await repos.list_forks("octocat", "Hello-World")
        mock_client.get.assert_called_once_with(
            "/repos/octocat/Hello-World/forks", params=None
        )

    async def test_transfer(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """transfer calls client.post with new_owner body."""
        await repos.transfer("octocat", "Hello-World", "newowner")
        mock_client.post.assert_called_once_with(
            "/repos/octocat/Hello-World/transfer",
            json={"new_owner": "newowner"},
        )

    async def test_transfer_with_options(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """transfer merges options into body."""
        await repos.transfer(
            "octocat", "Hello-World", "newowner",
            options={"team_ids": [1, 2]},
        )
        mock_client.post.assert_called_once_with(
            "/repos/octocat/Hello-World/transfer",
            json={"new_owner": "newowner", "team_ids": [1, 2]},
        )

    async def test_star(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """star calls client.put with /user/starred/{owner}/{repo}."""
        await repos.star("octocat", "Hello-World")
        mock_client.put.assert_called_once_with(
            "/user/starred/octocat/Hello-World"
        )

    async def test_unstar(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """unstar calls client.delete with /user/starred/{owner}/{repo}."""
        await repos.unstar("octocat", "Hello-World")
        mock_client.delete.assert_called_once_with(
            "/user/starred/octocat/Hello-World"
        )

    async def test_is_starred_true(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """is_starred returns True when get succeeds."""
        mock_client.get.return_value = {}
        result = await repos.is_starred("octocat", "Hello-World")
        assert result is True

    async def test_is_starred_false(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """is_starred returns False when get raises an exception."""
        mock_client.get.side_effect = Exception("Not Found")
        result = await repos.is_starred("octocat", "Hello-World")
        assert result is False

    async def test_watch(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """watch calls client.put with subscription body."""
        await repos.watch("octocat", "Hello-World")
        mock_client.put.assert_called_once_with(
            "/repos/octocat/Hello-World/subscription",
            json={"subscribed": True},
        )

    async def test_unwatch(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """unwatch calls client.delete on /repos/{owner}/{repo}/subscription."""
        await repos.unwatch("octocat", "Hello-World")
        mock_client.delete.assert_called_once_with(
            "/repos/octocat/Hello-World/subscription"
        )

    async def test_get_subscription(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """get_subscription calls client.get on subscription endpoint."""
        await repos.get_subscription("octocat", "Hello-World")
        mock_client.get.assert_called_once_with(
            "/repos/octocat/Hello-World/subscription"
        )


class TestBranchCoverage:
    """Test all conditional branches in ReposClient."""

    async def test_is_starred_returns_true_on_success(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """is_starred True branch: get succeeds."""
        mock_client.get.return_value = {}
        assert await repos.is_starred("octocat", "Hello-World") is True

    async def test_is_starred_returns_false_on_any_exception(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """is_starred False branch: get raises any exception."""
        mock_client.get.side_effect = RuntimeError("network error")
        assert await repos.is_starred("octocat", "Hello-World") is False

    async def test_is_starred_returns_false_on_not_found(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """is_starred returns False specifically for NotFoundError."""
        from github_api.sdk.errors import NotFoundError
        mock_client.get.side_effect = NotFoundError("Not Found")
        assert await repos.is_starred("octocat", "Hello-World") is False

    async def test_create_validates_name_when_present(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """create validates repository name when 'name' key is in data."""
        with pytest.raises(ValidationError):
            await repos.create({"name": ".invalid"})

    async def test_create_skips_validation_when_no_name(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """create does not validate when 'name' key is absent."""
        # Should not raise even though there is no name
        await repos.create({"private": True})
        mock_client.post.assert_called_once()

    async def test_create_in_org_validates_org_and_name(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """create_in_org validates both org name and repo name."""
        # Invalid org
        with pytest.raises(ValidationError, match="cannot be empty"):
            await repos.create_in_org("", {"name": "repo"})

    async def test_create_in_org_validates_repo_name(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """create_in_org validates repo name when present."""
        with pytest.raises(ValidationError):
            await repos.create_in_org("myorg", {"name": ".bad-name"})

    async def test_create_in_org_skips_name_validation_when_absent(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """create_in_org skips repo name validation when 'name' not in data."""
        await repos.create_in_org("myorg", {"private": True})
        mock_client.post.assert_called_once()

    async def test_transfer_without_options(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """transfer without options sends only new_owner in body."""
        await repos.transfer("octocat", "Hello-World", "newowner")
        call_json = mock_client.post.call_args[1]["json"]
        assert call_json == {"new_owner": "newowner"}

    async def test_transfer_with_options_merges(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """transfer with options merges them into body."""
        await repos.transfer(
            "octocat", "Hello-World", "newowner",
            options={"team_ids": [1]},
        )
        call_json = mock_client.post.call_args[1]["json"]
        assert call_json == {"new_owner": "newowner", "team_ids": [1]}


class TestBoundaryValues:
    """Edge cases: invalid owner, reserved names, empty strings."""

    async def test_get_empty_owner_raises(
        self, repos: ReposClient
    ) -> None:
        """get with empty owner raises ValidationError."""
        with pytest.raises(ValidationError, match="cannot be empty"):
            await repos.get("", "Hello-World")

    async def test_get_empty_repo_raises(
        self, repos: ReposClient
    ) -> None:
        """get with empty repo name raises ValidationError."""
        with pytest.raises(ValidationError, match="cannot be empty"):
            await repos.get("octocat", "")

    async def test_get_reserved_repo_name_raises(
        self, repos: ReposClient
    ) -> None:
        """get with reserved repo name raises ValidationError."""
        with pytest.raises(ValidationError, match="reserved"):
            await repos.get("octocat", "settings")

    async def test_get_dot_starting_repo_name_raises(
        self, repos: ReposClient
    ) -> None:
        """get with dot-starting repo name raises ValidationError."""
        with pytest.raises(ValidationError, match="cannot start or end with a dot"):
            await repos.get("octocat", ".hidden")

    async def test_list_for_user_empty_username_raises(
        self, repos: ReposClient
    ) -> None:
        """list_for_user with empty username raises ValidationError."""
        with pytest.raises(ValidationError, match="cannot be empty"):
            await repos.list_for_user("")

    async def test_list_for_org_empty_org_raises(
        self, repos: ReposClient
    ) -> None:
        """list_for_org with empty org raises ValidationError."""
        with pytest.raises(ValidationError, match="cannot be empty"):
            await repos.list_for_org("")

    async def test_delete_invalid_owner_raises(
        self, repos: ReposClient
    ) -> None:
        """delete with invalid owner raises ValidationError."""
        with pytest.raises(ValidationError):
            await repos.delete("-invalid", "Hello-World")

    async def test_star_invalid_owner_raises(
        self, repos: ReposClient
    ) -> None:
        """star with invalid owner raises ValidationError."""
        with pytest.raises(ValidationError):
            await repos.star("", "Hello-World")

    async def test_transfer_invalid_new_owner_raises(
        self, repos: ReposClient
    ) -> None:
        """transfer with invalid new_owner raises ValidationError."""
        with pytest.raises(ValidationError):
            await repos.transfer("octocat", "Hello-World", "")

    async def test_update_empty_owner_raises(
        self, repos: ReposClient
    ) -> None:
        """update with empty owner raises ValidationError."""
        with pytest.raises(ValidationError, match="cannot be empty"):
            await repos.update("", "Hello-World", {"description": "new"})


class TestErrorHandling:
    """Test error propagation through ReposClient methods."""

    async def test_client_get_error_propagates(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """Client error from get propagates through domain methods."""
        from github_api.sdk.errors import NotFoundError
        mock_client.get.side_effect = NotFoundError("Not Found")
        with pytest.raises(NotFoundError):
            await repos.get("octocat", "Hello-World")

    async def test_client_post_error_propagates(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """Client error from post propagates through create."""
        from github_api.sdk.errors import ServerError
        mock_client.post.side_effect = ServerError("fail")
        with pytest.raises(ServerError):
            await repos.create({"name": "new-repo"})

    async def test_client_delete_error_propagates(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """Client error from delete propagates through delete."""
        from github_api.sdk.errors import AuthError
        mock_client.delete.side_effect = AuthError("bad token")
        with pytest.raises(AuthError):
            await repos.delete("octocat", "Hello-World")

    async def test_validation_error_for_empty_owner(
        self, repos: ReposClient
    ) -> None:
        """ValidationError raised for empty owner string."""
        with pytest.raises(ValidationError, match="cannot be empty"):
            await repos.get("", "Hello-World")

    async def test_validation_error_for_dot_repo(
        self, repos: ReposClient
    ) -> None:
        """ValidationError raised for dot-starting repo name."""
        with pytest.raises(ValidationError, match="cannot start or end with a dot"):
            await repos.get("octocat", ".hidden")

    async def test_validation_error_for_special_chars(
        self, repos: ReposClient
    ) -> None:
        """ValidationError raised for repo name with special characters."""
        with pytest.raises(ValidationError, match="invalid characters"):
            await repos.get("octocat", "repo name!")

    async def test_create_validation_error_reserved_name(
        self, repos: ReposClient
    ) -> None:
        """create raises ValidationError for reserved repo names."""
        with pytest.raises(ValidationError, match="reserved"):
            await repos.create({"name": "settings"})


class TestLogVerification:
    """Verify logging calls in ReposClient."""

    async def test_get_logs_info(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """get() logs 'Getting repository' at info level."""
        with patch.object(repos._logger, "info") as mock_info:
            await repos.get("octocat", "Hello-World")
            mock_info.assert_called_once()
            log_msg = mock_info.call_args[0][0]
            assert "Getting repository" in log_msg

    async def test_delete_logs_info(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """delete() logs at info level."""
        with patch.object(repos._logger, "info") as mock_info:
            await repos.delete("octocat", "Hello-World")
            mock_info.assert_called_once()
            log_msg = mock_info.call_args[0][0]
            assert "Deleting repository" in log_msg

    async def test_create_logs_info(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """create() logs 'Creating repository' at info level."""
        with patch.object(repos._logger, "info") as mock_info:
            await repos.create({"name": "new-repo"})
            mock_info.assert_called_once()
            log_msg = mock_info.call_args[0][0]
            assert "Creating repository" in log_msg

    async def test_list_for_user_logs_info(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """list_for_user logs at info level."""
        with patch.object(repos._logger, "info") as mock_info:
            await repos.list_for_user("octocat")
            mock_info.assert_called_once()
            log_msg = mock_info.call_args[0][0]
            assert "Listing repositories" in log_msg

    async def test_star_logs_info(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """star() logs 'Starring' at info level."""
        with patch.object(repos._logger, "info") as mock_info:
            await repos.star("octocat", "Hello-World")
            mock_info.assert_called_once()
            log_msg = mock_info.call_args[0][0]
            assert "Starring" in log_msg

    async def test_fork_logs_info(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """fork() logs 'Forking repository' at info level."""
        with patch.object(repos._logger, "info") as mock_info:
            await repos.fork("octocat", "Hello-World")
            mock_info.assert_called_once()
            log_msg = mock_info.call_args[0][0]
            assert "Forking repository" in log_msg

    async def test_watch_logs_info(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """watch() logs 'Watching' at info level."""
        with patch.object(repos._logger, "info") as mock_info:
            await repos.watch("octocat", "Hello-World")
            mock_info.assert_called_once()
            log_msg = mock_info.call_args[0][0]
            assert "Watching" in log_msg

    async def test_transfer_logs_info(
        self, repos: ReposClient, mock_client: MagicMock
    ) -> None:
        """transfer() logs 'Transferring' at info level."""
        with patch.object(repos._logger, "info") as mock_info:
            await repos.transfer("octocat", "Hello-World", "newowner")
            mock_info.assert_called_once()
            log_msg = mock_info.call_args[0][0]
            assert "Transferring" in log_msg
