"""
Integration tests for FastAPI module.

Tests cover:
- Static file serving
- SPA catch-all routing
- Multi-app registration
- Error handling
- Log verification
"""

import logging
import tempfile
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from static_app_loader import (
    IndexNotFoundError,
    MultiAppOptions,
    RouteCollisionError,
    StaticLoaderOptions,
    StaticPathNotFoundError,
    get_registered_prefixes,
    register_multiple_apps,
    register_static_app,
)


class TestStaticAppRegistration:
    """Tests for register_static_app function."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        def test_register_static_app_success(
            self, app: FastAPI, temp_static_dir: Path
        ) -> None:
            """Happy path: register a static app successfully."""
            options = StaticLoaderOptions(
                app_name="dashboard",
                root_path=str(temp_static_dir),
            )

            register_static_app(app, options)

            prefixes = get_registered_prefixes()
            assert "/apps/dashboard" in prefixes
            assert prefixes["/apps/dashboard"] == "dashboard"

        def test_static_files_served(
            self, app: FastAPI, temp_static_dir: Path
        ) -> None:
            """Static files should be served correctly."""
            options = StaticLoaderOptions(
                app_name="myapp",
                root_path=str(temp_static_dir),
            )
            register_static_app(app, options)
            client = TestClient(app)

            response = client.get("/apps/myapp/assets/style.css")

            assert response.status_code == 200
            assert "margin: 0" in response.text

    class TestDecisionBranchCoverage:
        """Test all if/else/switch branches."""

        def test_spa_mode_enabled_serves_index(
            self, app: FastAPI, temp_static_dir: Path
        ) -> None:
            """SPA mode enabled should serve index.html for any route."""
            options = StaticLoaderOptions(
                app_name="spa",
                root_path=str(temp_static_dir),
                spa_mode=True,
            )
            register_static_app(app, options)
            client = TestClient(app)

            response = client.get("/apps/spa/any/nested/route")

            assert response.status_code == 200
            assert "Test App" in response.text

        def test_spa_mode_disabled_no_catch_all(
            self, app: FastAPI, temp_static_dir: Path
        ) -> None:
            """SPA mode disabled should not create catch-all route."""
            options = StaticLoaderOptions(
                app_name="nospa",
                root_path=str(temp_static_dir),
                spa_mode=False,
            )
            register_static_app(app, options)
            client = TestClient(app)

            response = client.get("/apps/nospa/nonexistent")

            assert response.status_code == 404

    class TestBoundaryValueAnalysis:
        """Test edge cases: empty, min, max, boundary values."""

        def test_root_route_serves_index(
            self, app: FastAPI, temp_static_dir: Path
        ) -> None:
            """App root route should serve index.html."""
            options = StaticLoaderOptions(
                app_name="boundary",
                root_path=str(temp_static_dir),
            )
            register_static_app(app, options)
            client = TestClient(app)

            response = client.get("/apps/boundary")

            assert response.status_code == 200
            assert "Test App" in response.text

        def test_trailing_slash_route(
            self, app: FastAPI, temp_static_dir: Path
        ) -> None:
            """Route with trailing slash should work."""
            options = StaticLoaderOptions(
                app_name="slash",
                root_path=str(temp_static_dir),
            )
            register_static_app(app, options)
            client = TestClient(app)

            response = client.get("/apps/slash/")

            assert response.status_code == 200

    class TestErrorHandling:
        """Test error conditions and exception paths."""

        def test_nonexistent_path_raises_error(self, app: FastAPI) -> None:
            """Non-existent root path should raise StaticPathNotFoundError."""
            options = StaticLoaderOptions(
                app_name="missing",
                root_path="/nonexistent/path/that/does/not/exist",
            )

            with pytest.raises(StaticPathNotFoundError) as exc_info:
                register_static_app(app, options)

            assert "does not exist" in str(exc_info.value)

        def test_missing_index_html_raises_error(self, app: FastAPI) -> None:
            """Missing index.html in SPA mode should raise IndexNotFoundError."""
            with tempfile.TemporaryDirectory() as tmpdir:
                options = StaticLoaderOptions(
                    app_name="noindex",
                    root_path=tmpdir,
                    spa_mode=True,
                )

                with pytest.raises(IndexNotFoundError) as exc_info:
                    register_static_app(app, options)

                assert "index.html not found" in str(exc_info.value)

        def test_route_collision_raises_error(
            self, app: FastAPI, temp_static_dir: Path
        ) -> None:
            """Registering same app name twice should raise RouteCollisionError."""
            options = StaticLoaderOptions(
                app_name="collision",
                root_path=str(temp_static_dir),
            )
            register_static_app(app, options)

            with pytest.raises(RouteCollisionError) as exc_info:
                register_static_app(app, options)

            assert "collision" in str(exc_info.value).lower()


class TestMultiAppRegistration:
    """Tests for register_multiple_apps function."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        def test_register_multiple_apps_success(
            self, app: FastAPI, temp_static_dir: Path
        ) -> None:
            """Register multiple apps successfully."""
            options = MultiAppOptions(
                apps=[
                    StaticLoaderOptions(
                        app_name="app1", root_path=str(temp_static_dir)
                    ),
                    StaticLoaderOptions(
                        app_name="app2", root_path=str(temp_static_dir)
                    ),
                ]
            )

            results = register_multiple_apps(app, options)

            assert len(results) == 2
            assert all(r.success for r in results)

    class TestDecisionBranchCoverage:
        """Test collision strategies."""

        def test_collision_strategy_error(
            self, app: FastAPI, temp_static_dir: Path
        ) -> None:
            """Error strategy should raise on collision."""
            options = MultiAppOptions(
                apps=[
                    StaticLoaderOptions(
                        app_name="dup", root_path=str(temp_static_dir)
                    ),
                    StaticLoaderOptions(
                        app_name="dup", root_path=str(temp_static_dir)
                    ),
                ],
                collision_strategy="error",
            )

            with pytest.raises(RouteCollisionError):
                register_multiple_apps(app, options)

        def test_collision_strategy_warn(
            self, app: FastAPI, temp_static_dir: Path, caplog: pytest.LogCaptureFixture
        ) -> None:
            """Warn strategy should log warning and continue."""
            options = MultiAppOptions(
                apps=[
                    StaticLoaderOptions(
                        app_name="warndup", root_path=str(temp_static_dir)
                    ),
                    StaticLoaderOptions(
                        app_name="warndup", root_path=str(temp_static_dir)
                    ),
                ],
                collision_strategy="warn",
            )

            with caplog.at_level(logging.WARNING):
                results = register_multiple_apps(app, options)

            # Second should fail due to collision at registration
            assert results[0].success is True

        def test_collision_strategy_skip(
            self, app: FastAPI, temp_static_dir: Path
        ) -> None:
            """Skip strategy should skip duplicates."""
            options = MultiAppOptions(
                apps=[
                    StaticLoaderOptions(
                        app_name="skipdup", root_path=str(temp_static_dir)
                    ),
                    StaticLoaderOptions(
                        app_name="skipdup", root_path=str(temp_static_dir)
                    ),
                ],
                collision_strategy="skip",
            )

            results = register_multiple_apps(app, options)

            assert results[0].success is True
            assert results[1].success is False
            assert "Skipped" in results[1].error


class TestPathRewriting:
    """Tests for HTML path rewriting."""

    def test_asset_paths_rewritten_in_html(
        self, app: FastAPI, temp_static_dir: Path
    ) -> None:
        """Asset paths in HTML should be rewritten with app prefix."""
        options = StaticLoaderOptions(
            app_name="rewrite",
            root_path=str(temp_static_dir),
        )
        register_static_app(app, options)
        client = TestClient(app)

        response = client.get("/apps/rewrite")
        html = response.text

        assert "/apps/rewrite/assets/style.css" in html
        assert "/apps/rewrite/assets/main.js" in html


class TestIntegration:
    """End-to-end scenarios with realistic data."""

    def test_full_spa_workflow(
        self, app: FastAPI, temp_static_dir: Path
    ) -> None:
        """Test complete SPA workflow: register, serve, navigate."""
        options = StaticLoaderOptions(
            app_name="fulltest",
            root_path=str(temp_static_dir),
            spa_mode=True,
            default_context={"version": "1.0.0"},
        )
        register_static_app(app, options)
        client = TestClient(app)

        # Root serves index
        root_response = client.get("/apps/fulltest")
        assert root_response.status_code == 200
        assert "Test App" in root_response.text

        # Deep route serves index (SPA)
        deep_response = client.get("/apps/fulltest/users/123/profile")
        assert deep_response.status_code == 200
        assert "Test App" in deep_response.text

        # Static assets served
        css_response = client.get("/apps/fulltest/assets/style.css")
        assert css_response.status_code == 200

        # Initial state injected
        assert "INITIAL_STATE" in root_response.text
