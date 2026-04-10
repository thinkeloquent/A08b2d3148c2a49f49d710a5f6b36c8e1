"""
Unit tests for errors module.

Tests cover:
- All error classes
- Error codes
- Error messages
"""

import pytest

from static_app_loader.errors import (
    ConfigValidationError,
    IndexNotFoundError,
    RouteCollisionError,
    StaticAppLoaderError,
    StaticPathNotFoundError,
    UnsupportedTemplateEngineError,
)


class TestStaticAppLoaderError:
    """Tests for base StaticAppLoaderError."""

    def test_error_has_message(self) -> None:
        """Error should have message."""
        error = StaticAppLoaderError("Test error", "TEST_CODE")

        assert str(error) == "Test error"
        assert error.code == "TEST_CODE"


class TestStaticPathNotFoundError:
    """Tests for StaticPathNotFoundError."""

    def test_error_message_includes_path(self) -> None:
        """Error message should include the missing path."""
        error = StaticPathNotFoundError("/some/missing/path")

        assert "/some/missing/path" in str(error)
        assert error.path == "/some/missing/path"
        assert error.code == "STATIC_PATH_NOT_FOUND"


class TestUnsupportedTemplateEngineError:
    """Tests for UnsupportedTemplateEngineError."""

    def test_error_message_includes_engine(self) -> None:
        """Error message should include the unsupported engine."""
        error = UnsupportedTemplateEngineError("invalid_engine")

        assert "invalid_engine" in str(error)
        assert "mustache, liquid, edge, none" in str(error)
        assert error.engine == "invalid_engine"
        assert error.code == "UNSUPPORTED_TEMPLATE_ENGINE"


class TestRouteCollisionError:
    """Tests for RouteCollisionError."""

    def test_error_message_includes_apps(self) -> None:
        """Error message should include conflicting apps."""
        error = RouteCollisionError("/dashboard", ["app1", "app2"])

        assert "/dashboard" in str(error)
        assert "app1" in str(error)
        assert "app2" in str(error)
        assert error.route_prefix == "/dashboard"
        assert error.conflicting_apps == ["app1", "app2"]
        assert error.code == "ROUTE_COLLISION"


class TestConfigValidationError:
    """Tests for ConfigValidationError."""

    def test_error_message_includes_all_errors(self) -> None:
        """Error message should include all validation errors."""
        errors = ["app_name is required", "root_path must not be empty"]
        error = ConfigValidationError(errors)

        assert "app_name is required" in str(error)
        assert "root_path must not be empty" in str(error)
        assert error.validation_errors == errors
        assert error.code == "CONFIG_VALIDATION_ERROR"


class TestIndexNotFoundError:
    """Tests for IndexNotFoundError."""

    def test_error_message_includes_path(self) -> None:
        """Error message should include the root path."""
        error = IndexNotFoundError("/var/www/app/dist")

        assert "/var/www/app/dist" in str(error)
        assert "index.html" in str(error)
        assert error.root_path == "/var/www/app/dist"
        assert error.code == "INDEX_NOT_FOUND"
