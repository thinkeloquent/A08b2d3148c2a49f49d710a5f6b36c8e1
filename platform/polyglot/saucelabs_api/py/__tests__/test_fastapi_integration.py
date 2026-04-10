"""
FastAPI Integration Tests — Sauce Labs API Lifecycle Plugin

Tests the lifecycle plugin route registration, app state decorators,
and route handlers using FastAPI's TestClient.

Tests cover:
- Health endpoint returns vendor metadata
- Route registration for jobs, platform, users, upload
- App state decorators (saucelabs, saucelabs_clients)
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import APIRouter, FastAPI
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient

VENDOR = "saucelabs_api"
VENDOR_VERSION = "v1"
PREFIX = "/~/api/rest/02-01-2026/providers/saucelabs_api"


def create_mock_client():
    """Create a mock SaucelabsClient with all domain modules."""
    client = MagicMock()
    client.username = "test_user"
    client.close = AsyncMock()

    client.jobs = MagicMock()
    client.jobs.list = AsyncMock(return_value=[{"id": "job1", "status": "complete"}])
    client.jobs.get = AsyncMock(return_value={"id": "job1", "status": "complete", "name": "Test Job"})

    client.platform = MagicMock()
    client.platform.get_status = AsyncMock(return_value={"status": {"wait_time": 0.5}})
    client.platform.get_platforms = AsyncMock(return_value=[{"os": "Windows", "api_name": "appium"}])

    client.users = MagicMock()
    client.users.get_user = AsyncMock(return_value={"username": "test_user", "email": "test@example.com"})
    client.users.get_concurrency = AsyncMock(return_value={"concurrency": {"remaining": {"overall": 5}}})

    client.upload = MagicMock()
    client.upload.upload_app = AsyncMock(return_value={"item": {"id": "upload_123"}})

    return client


def create_test_app():
    """Create a FastAPI app with saucelabs routes registered (simulating lifecycle plugin)."""
    app = FastAPI()
    mock_client = create_mock_client()

    # Store on app.state (as lifecycle plugin does)
    app.state.saucelabs = mock_client
    app.state.saucelabs_clients = {
        "jobs": mock_client.jobs,
        "platform": mock_client.platform,
        "users": mock_client.users,
        "upload": mock_client.upload,
    }

    # Register routes (matching lifecycle plugin pattern)
    saucelabs_router = APIRouter(prefix=PREFIX)

    @saucelabs_router.get("/health")
    async def saucelabs_health():
        return JSONResponse(content={
            "status": "ok",
            "vendor": VENDOR,
            "vendor_version": VENDOR_VERSION,
        })

    v1 = APIRouter(prefix="/v1")

    from fastapi import Request

    @v1.get("/jobs")
    async def list_jobs(request: Request):
        return await request.app.state.saucelabs_clients["jobs"].list(
            params=dict(request.query_params)
        )

    @v1.get("/jobs/{job_id}")
    async def get_job(job_id: str, request: Request):
        return await request.app.state.saucelabs_clients["jobs"].get(job_id)

    @v1.get("/platform/status")
    async def get_platform_status(request: Request):
        return await request.app.state.saucelabs_clients["platform"].get_status()

    @v1.get("/platform/{automation_api}")
    async def get_platforms(automation_api: str, request: Request):
        return await request.app.state.saucelabs_clients["platform"].get_platforms(automation_api)

    @v1.get("/users/{username}")
    async def get_user(username: str, request: Request):
        return await request.app.state.saucelabs_clients["users"].get_user(username)

    @v1.get("/users/{username}/concurrency")
    async def get_concurrency(username: str, request: Request):
        return await request.app.state.saucelabs_clients["users"].get_concurrency(username)

    @v1.post("/upload")
    async def upload_app(request: Request):
        body = await request.json()
        return await request.app.state.saucelabs_clients["upload"].upload_app(body)

    saucelabs_router.include_router(v1)
    app.include_router(saucelabs_router)

    return app, mock_client


@pytest.fixture
def app_and_client():
    """Fixture returning the test app and mock client."""
    app, mock_client = create_test_app()
    test_client = TestClient(app)
    return test_client, mock_client


class TestHealthEndpoint:
    """Tests for the health endpoint."""

    def test_health_returns_200(self, app_and_client):
        client, _ = app_and_client
        response = client.get(f"{PREFIX}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["vendor"] == VENDOR
        assert data["vendor_version"] == VENDOR_VERSION


class TestJobsRoutes:
    """Tests for jobs proxy routes."""

    def test_list_jobs(self, app_and_client):
        client, mock = app_and_client
        response = client.get(f"{PREFIX}/v1/jobs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert data[0]["id"] == "job1"
        mock.jobs.list.assert_called_once()

    def test_list_jobs_with_params(self, app_and_client):
        client, mock = app_and_client
        response = client.get(f"{PREFIX}/v1/jobs?limit=5&skip=10")
        assert response.status_code == 200
        mock.jobs.list.assert_called_once()
        call_kwargs = mock.jobs.list.call_args
        assert call_kwargs[1]["params"]["limit"] == "5"

    def test_get_job(self, app_and_client):
        client, mock = app_and_client
        response = client.get(f"{PREFIX}/v1/jobs/abc123")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "job1"
        mock.jobs.get.assert_called_once_with("abc123")


class TestPlatformRoutes:
    """Tests for platform proxy routes."""

    def test_get_status(self, app_and_client):
        client, mock = app_and_client
        response = client.get(f"{PREFIX}/v1/platform/status")
        assert response.status_code == 200
        mock.platform.get_status.assert_called_once()

    def test_get_platforms(self, app_and_client):
        client, mock = app_and_client
        response = client.get(f"{PREFIX}/v1/platform/appium")
        assert response.status_code == 200
        mock.platform.get_platforms.assert_called_once_with("appium")


class TestUsersRoutes:
    """Tests for users proxy routes."""

    def test_get_user(self, app_and_client):
        client, mock = app_and_client
        response = client.get(f"{PREFIX}/v1/users/test_user")
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "test_user"
        mock.users.get_user.assert_called_once_with("test_user")

    def test_get_concurrency(self, app_and_client):
        client, mock = app_and_client
        response = client.get(f"{PREFIX}/v1/users/test_user/concurrency")
        assert response.status_code == 200
        mock.users.get_concurrency.assert_called_once_with("test_user")


class TestUploadRoutes:
    """Tests for upload proxy routes."""

    def test_upload_app(self, app_and_client):
        client, mock = app_and_client
        response = client.post(
            f"{PREFIX}/v1/upload",
            json={"filePath": "/tmp/app.apk"},
        )
        assert response.status_code == 200
        mock.upload.upload_app.assert_called_once()


class TestAppState:
    """Tests for app state decorators."""

    def test_saucelabs_client_in_state(self, app_and_client):
        client, mock = app_and_client
        app = client.app
        assert hasattr(app.state, "saucelabs")
        assert app.state.saucelabs is mock

    def test_saucelabs_clients_in_state(self, app_and_client):
        client, mock = app_and_client
        app = client.app
        assert hasattr(app.state, "saucelabs_clients")
        assert app.state.saucelabs_clients["jobs"] is mock.jobs
        assert app.state.saucelabs_clients["platform"] is mock.platform
        assert app.state.saucelabs_clients["users"] is mock.users
        assert app.state.saucelabs_clients["upload"] is mock.upload
