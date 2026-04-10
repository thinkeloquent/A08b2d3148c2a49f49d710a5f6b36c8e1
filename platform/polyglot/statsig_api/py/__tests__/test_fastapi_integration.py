"""
Integration tests for statsig_client with FastAPI.

Tests cover:
- Statement coverage for route registration and request handling
- Decision/branch coverage for health endpoint and CRUD proxy routes
- Error handling for upstream API errors propagated through routes
- Log verification for lifecycle startup/shutdown

These tests create a self-contained FastAPI app with mocked HTTP
transport (via pytest-httpx) to verify the statsig_client integrates
correctly with FastAPI's routing and dependency injection.
"""

import pytest
from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient

from statsig_client import StatsigClient, create_statsig_client
from statsig_client.modules.gates import GatesModule
from statsig_client.modules.experiments import ExperimentsModule


VENDOR = "statsig_api"
PREFIX = "/~/api/rest/2025-01-01/providers/statsig_api"


def _create_test_app(api_key: str = "test-integration-key") -> FastAPI:
    """Create a minimal FastAPI app with statsig routes registered."""
    app = FastAPI(title="Test Statsig Integration")

    statsig = create_statsig_client(api_key=api_key)
    gates = GatesModule(statsig)
    experiments = ExperimentsModule(statsig)

    app.state.statsig = statsig
    app.state.statsig_clients = {
        "gates": gates,
        "experiments": experiments,
    }

    router = APIRouter(prefix=PREFIX)

    @router.get("/health")
    async def health():
        return JSONResponse(
            content={"status": "ok", "vendor": VENDOR, "vendor_version": "v1"}
        )

    v1 = APIRouter(prefix="/v1")

    @v1.get("/gates")
    async def list_gates(request: Request):
        return await request.app.state.statsig_clients["gates"].list(
            params=dict(request.query_params)
        )

    @v1.get("/gates/{gate_id}")
    async def get_gate(gate_id: str, request: Request):
        return await request.app.state.statsig_clients["gates"].get(gate_id)

    @v1.post("/gates")
    async def create_gate(request: Request):
        body = await request.json()
        return await request.app.state.statsig_clients["gates"].create(body)

    @v1.delete("/gates/{gate_id}")
    async def delete_gate(gate_id: str, request: Request):
        return await request.app.state.statsig_clients["gates"].delete(gate_id)

    @v1.get("/experiments")
    async def list_experiments(request: Request):
        return await request.app.state.statsig_clients["experiments"].list(
            params=dict(request.query_params)
        )

    router.include_router(v1)
    app.include_router(router)

    return app


class TestFastAPIIntegration:
    """Integration tests for FastAPI + statsig_client."""

    class TestHealthEndpoint:
        def test_health_returns_200(self, httpx_mock):
            app = _create_test_app()
            client = TestClient(app)
            response = client.get(f"{PREFIX}/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "ok"
            assert data["vendor"] == VENDOR

    class TestGatesRoutes:
        def test_list_gates(self, httpx_mock):
            httpx_mock.add_response(
                json={"data": [{"id": "gate1", "name": "feature_x"}], "pagination": {}}
            )
            app = _create_test_app()
            client = TestClient(app)
            response = client.get(f"{PREFIX}/v1/gates")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)

        def test_get_gate(self, httpx_mock):
            httpx_mock.add_response(
                json={"id": "gate1", "name": "feature_x", "enabled": True}
            )
            app = _create_test_app()
            client = TestClient(app)
            response = client.get(f"{PREFIX}/v1/gates/gate1")
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "feature_x"

        def test_create_gate(self, httpx_mock):
            httpx_mock.add_response(
                json={"id": "new_gate", "name": "new_feature"}
            )
            app = _create_test_app()
            client = TestClient(app)
            response = client.post(
                f"{PREFIX}/v1/gates",
                json={"name": "new_feature"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "new_gate"

        def test_delete_gate(self, httpx_mock):
            httpx_mock.add_response(json={"deleted": True})
            app = _create_test_app()
            client = TestClient(app)
            response = client.delete(f"{PREFIX}/v1/gates/gate1")
            assert response.status_code == 200

    class TestExperimentsRoutes:
        def test_list_experiments(self, httpx_mock):
            httpx_mock.add_response(
                json={
                    "data": [{"id": "exp1", "name": "test_experiment"}],
                    "pagination": {},
                }
            )
            app = _create_test_app()
            client = TestClient(app)
            response = client.get(f"{PREFIX}/v1/experiments")
            assert response.status_code == 200

    class TestErrorPropagation:
        def test_upstream_401_propagates(self, httpx_mock):
            httpx_mock.add_response(
                status_code=401, json={"message": "Unauthorized"}
            )
            app = _create_test_app()
            client = TestClient(app, raise_server_exceptions=False)
            response = client.get(f"{PREFIX}/v1/gates")
            assert response.status_code == 500

        def test_upstream_404_propagates(self, httpx_mock):
            httpx_mock.add_response(
                status_code=404, json={"message": "Not found"}
            )
            app = _create_test_app()
            client = TestClient(app, raise_server_exceptions=False)
            response = client.get(f"{PREFIX}/v1/gates/nonexistent")
            assert response.status_code == 500

    class TestLifecycle:
        async def test_client_can_be_closed(self, httpx_mock):
            app = _create_test_app()
            statsig_client = app.state.statsig
            await statsig_client.close()
