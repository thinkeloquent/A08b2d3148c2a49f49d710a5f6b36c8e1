"""
Unit tests for saucelabs_api domain modules (jobs, platform, users)

Tests cover:
- Statement coverage for all module methods
- Branch coverage for validation and optional params
- Boundary value analysis
- Error handling verification
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from saucelabs_api.errors import SaucelabsValidationError
from saucelabs_api.modules.jobs import JobsModule
from saucelabs_api.modules.platform import PlatformModule
from saucelabs_api.modules.users import UsersModule


def create_mock_client(**overrides):
    client = MagicMock()
    client.username = "test_user"
    client.get = AsyncMock(return_value=[])
    client.post = AsyncMock(return_value={})
    for k, v in overrides.items():
        setattr(client, k, v)
    return client


class TestJobsModule:
    """Tests for JobsModule."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    @pytest.mark.asyncio
    async def test_lists_jobs_default(self):
        client = create_mock_client()
        jobs = JobsModule(client)
        await jobs.list()
        client.get.assert_called_once_with(
            "/rest/v1/test_user/jobs",
            params={"limit": 25, "format": "json"},
        )

    @pytest.mark.asyncio
    async def test_gets_specific_job(self):
        client = create_mock_client()
        jobs = JobsModule(client)
        await jobs.get("abc123")
        client.get.assert_called_once_with("/rest/v1.1/test_user/jobs/abc123")

    # =================================================================
    # Branch Coverage
    # =================================================================

    @pytest.mark.asyncio
    async def test_lists_jobs_with_custom_params(self):
        client = create_mock_client()
        jobs = JobsModule(client)
        await jobs.list({"limit": 5, "skip": 10})
        client.get.assert_called_once_with(
            "/rest/v1/test_user/jobs",
            params={"limit": 5, "skip": 10, "format": "json"},
        )

    @pytest.mark.asyncio
    async def test_lists_jobs_with_from_to(self):
        client = create_mock_client()
        jobs = JobsModule(client)
        await jobs.list({"from": 1000000, "to": 2000000})
        call_args = client.get.call_args
        assert call_args[1]["params"]["from"] == 1000000
        assert call_args[1]["params"]["to"] == 2000000

    @pytest.mark.asyncio
    async def test_validates_from_negative(self):
        client = create_mock_client()
        jobs = JobsModule(client)
        with pytest.raises(SaucelabsValidationError):
            await jobs.list({"from": -1})

    @pytest.mark.asyncio
    async def test_validates_from_non_int(self):
        client = create_mock_client()
        jobs = JobsModule(client)
        with pytest.raises(SaucelabsValidationError):
            await jobs.list({"from": 1.5})

    @pytest.mark.asyncio
    async def test_validates_to_negative(self):
        client = create_mock_client()
        jobs = JobsModule(client)
        with pytest.raises(SaucelabsValidationError):
            await jobs.list({"to": -1})

    # =================================================================
    # Error Handling
    # =================================================================

    @pytest.mark.asyncio
    async def test_throws_when_username_missing_list(self):
        client = create_mock_client(username="")
        jobs = JobsModule(client)
        with pytest.raises(SaucelabsValidationError, match="username"):
            await jobs.list()

    @pytest.mark.asyncio
    async def test_throws_when_username_missing_get(self):
        client = create_mock_client(username="")
        jobs = JobsModule(client)
        with pytest.raises(SaucelabsValidationError, match="username"):
            await jobs.get("abc")

    @pytest.mark.asyncio
    async def test_throws_when_job_id_empty(self):
        client = create_mock_client()
        jobs = JobsModule(client)
        with pytest.raises(SaucelabsValidationError, match="job_id"):
            await jobs.get("")

    # =================================================================
    # Boundary Values
    # =================================================================

    @pytest.mark.asyncio
    async def test_from_zero_accepted(self):
        client = create_mock_client()
        jobs = JobsModule(client)
        await jobs.list({"from": 0})
        client.get.assert_called_once()

    @pytest.mark.asyncio
    async def test_to_zero_accepted(self):
        client = create_mock_client()
        jobs = JobsModule(client)
        await jobs.list({"to": 0})
        client.get.assert_called_once()


class TestPlatformModule:
    """Tests for PlatformModule."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    @pytest.mark.asyncio
    async def test_gets_status(self):
        client = create_mock_client()
        platform = PlatformModule(client)
        await platform.get_status()
        client.get.assert_called_once_with("/rest/v1/info/status")

    @pytest.mark.asyncio
    async def test_gets_platforms_appium(self):
        client = create_mock_client()
        platform = PlatformModule(client)
        await platform.get_platforms("appium")
        client.get.assert_called_once_with("/rest/v1/info/platforms/appium")

    # =================================================================
    # Branch Coverage
    # =================================================================

    @pytest.mark.asyncio
    async def test_gets_platforms_all(self):
        client = create_mock_client()
        platform = PlatformModule(client)
        await platform.get_platforms("all")
        client.get.assert_called_once_with("/rest/v1/info/platforms/all")

    @pytest.mark.asyncio
    async def test_gets_platforms_webdriver(self):
        client = create_mock_client()
        platform = PlatformModule(client)
        await platform.get_platforms("webdriver")
        client.get.assert_called_once_with("/rest/v1/info/platforms/webdriver")

    # =================================================================
    # Error Handling
    # =================================================================

    @pytest.mark.asyncio
    async def test_throws_on_invalid_automation_api(self):
        client = create_mock_client()
        platform = PlatformModule(client)
        with pytest.raises(SaucelabsValidationError):
            await platform.get_platforms("invalid")

    @pytest.mark.asyncio
    async def test_throws_on_empty_automation_api(self):
        client = create_mock_client()
        platform = PlatformModule(client)
        with pytest.raises(SaucelabsValidationError):
            await platform.get_platforms("")


class TestUsersModule:
    """Tests for UsersModule."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    @pytest.mark.asyncio
    async def test_gets_current_user(self):
        client = create_mock_client()
        users = UsersModule(client)
        await users.get_user()
        client.get.assert_called_once_with("/rest/v1.2/users/test_user")

    @pytest.mark.asyncio
    async def test_gets_specific_user(self):
        client = create_mock_client()
        users = UsersModule(client)
        await users.get_user("other_user")
        client.get.assert_called_once_with("/rest/v1.2/users/other_user")

    @pytest.mark.asyncio
    async def test_gets_concurrency(self):
        client = create_mock_client()
        users = UsersModule(client)
        await users.get_concurrency()
        client.get.assert_called_once_with("/rest/v1.2/users/test_user/concurrency")

    # =================================================================
    # Branch Coverage
    # =================================================================

    @pytest.mark.asyncio
    async def test_gets_concurrency_for_specific_user(self):
        client = create_mock_client()
        users = UsersModule(client)
        await users.get_concurrency("other")
        client.get.assert_called_once_with("/rest/v1.2/users/other/concurrency")
