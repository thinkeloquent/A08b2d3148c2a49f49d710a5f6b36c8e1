"""Tests for types module."""

import pytest
from pydantic import ValidationError

from static_app_loader.types import (
    MultiAppOptions,
    PathRewriteOptions,
    RegisterResult,
    StaticLoaderOptions,
)


class TestStaticLoaderOptions:
    """Tests for StaticLoaderOptions model."""

    def test_minimal_valid_config(self) -> None:
        """Should validate a minimal valid config."""
        config = StaticLoaderOptions(
            app_name="dashboard",
            root_path="/var/www/dashboard/dist",
        )

        assert config.app_name == "dashboard"
        assert config.root_path == "/var/www/dashboard/dist"
        assert config.template_engine == "none"
        assert config.url_prefix == "/assets"
        assert config.spa_mode is True
        assert config.max_age == 86400

    def test_full_config_with_all_options(self) -> None:
        """Should validate a full config with all options."""
        config = StaticLoaderOptions(
            app_name="admin",
            root_path="/var/www/admin/dist",
            template_engine="liquid",
            url_prefix="/static",
            default_context={"version": "1.0.0"},
            spa_mode=False,
            max_age=3600,
        )

        assert config.template_engine == "liquid"
        assert config.url_prefix == "/static"
        assert config.spa_mode is False
        assert config.max_age == 3600
        assert config.default_context == {"version": "1.0.0"}

    def test_reject_empty_app_name(self) -> None:
        """Should reject empty app_name."""
        with pytest.raises(ValidationError):
            StaticLoaderOptions(
                app_name="",
                root_path="/var/www/dashboard/dist",
            )

    def test_reject_empty_root_path(self) -> None:
        """Should reject empty root_path."""
        with pytest.raises(ValidationError):
            StaticLoaderOptions(
                app_name="dashboard",
                root_path="",
            )

    def test_reject_negative_max_age(self) -> None:
        """Should reject negative max_age."""
        with pytest.raises(ValidationError):
            StaticLoaderOptions(
                app_name="dashboard",
                root_path="/var/www/dashboard/dist",
                max_age=-1,
            )

    def test_reject_invalid_template_engine(self) -> None:
        """Should reject invalid template engine."""
        with pytest.raises(ValidationError):
            StaticLoaderOptions(
                app_name="dashboard",
                root_path="/var/www/dashboard/dist",
                template_engine="invalid",  # type: ignore
            )


class TestMultiAppOptions:
    """Tests for MultiAppOptions model."""

    def test_validate_multi_app_config(self) -> None:
        """Should validate multi-app config."""
        config = MultiAppOptions(
            apps=[
                StaticLoaderOptions(
                    app_name="dashboard", root_path="/var/www/dashboard/dist"
                ),
                StaticLoaderOptions(
                    app_name="admin", root_path="/var/www/admin/dist"
                ),
            ],
            collision_strategy="warn",
        )

        assert len(config.apps) == 2
        assert config.collision_strategy == "warn"

    def test_default_collision_strategy(self) -> None:
        """Should apply default collision strategy."""
        config = MultiAppOptions(
            apps=[
                StaticLoaderOptions(
                    app_name="dashboard", root_path="/var/www/dashboard/dist"
                )
            ]
        )

        assert config.collision_strategy == "error"


class TestRegisterResult:
    """Tests for RegisterResult model."""

    def test_success_result(self) -> None:
        """Should create a success result."""
        result = RegisterResult(
            app_name="dashboard",
            success=True,
            route_prefix="/dashboard",
            root_path="/var/www/dashboard/dist",
        )

        assert result.success is True
        assert result.error is None

    def test_failure_result(self) -> None:
        """Should create a failure result with error."""
        result = RegisterResult(
            app_name="dashboard",
            success=False,
            error="Path not found",
            route_prefix="/dashboard",
            root_path="/var/www/dashboard/dist",
        )

        assert result.success is False
        assert result.error == "Path not found"


class TestPathRewriteOptions:
    """Tests for PathRewriteOptions model."""

    def test_defaults(self) -> None:
        """Should apply defaults."""
        options = PathRewriteOptions(
            app_name="dashboard",
            url_prefix="/assets",
        )

        assert options.enable_cache is True
        assert options.cache_ttl == 60.0
