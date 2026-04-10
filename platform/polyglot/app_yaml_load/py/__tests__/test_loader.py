"""
Unit tests for app_yaml_load loader module.

Tests cover:
- _resolve_config_dir: override, env var, fallback, empty string
- _resolve_app_env: override, env var, default
- build_config_files: canonical 5-file list
- load_app_yaml_config: end-to-end with LoadOptions
"""
import os
import pytest
from pathlib import Path
from unittest.mock import patch

from app_yaml_load.loader import (
    _resolve_config_dir,
    _resolve_app_env,
    build_config_files,
    load_app_yaml_config,
    LoadOptions,
)
from app_yaml_static_config.core import AppYamlConfig


FIXTURES_DIR = Path(__file__).parent.parent.parent.parent / "app_yaml_static_config" / "__fixtures__"


@pytest.fixture(autouse=True)
def reset_singleton():
    """Reset AppYamlConfig singleton before each test."""
    AppYamlConfig._reset_for_testing()
    yield
    AppYamlConfig._reset_for_testing()


@pytest.fixture
def clean_env(monkeypatch):
    """Remove CONFIG_DIR and APP_ENV from environment."""
    monkeypatch.delenv("CONFIG_DIR", raising=False)
    monkeypatch.delenv("APP_ENV", raising=False)
    return monkeypatch


class TestResolveConfigDir:
    """Tests for _resolve_config_dir resolution order."""

    def test_override_takes_precedence(self, clean_env):
        """Explicit override should be used directly."""
        clean_env.setenv("CONFIG_DIR", "/env/path")
        result = _resolve_config_dir(override="/explicit/path")
        assert result == "/explicit/path"

    def test_env_var_used_when_no_override(self, clean_env):
        """CONFIG_DIR env var should be used when no override."""
        clean_env.setenv("CONFIG_DIR", "/env/config")
        result = _resolve_config_dir()
        assert result == "/env/config"

    def test_caller_dir_fallback(self, clean_env):
        """Should fall back to caller_dir-relative path."""
        result = _resolve_config_dir(caller_dir=Path("/a/b/c/loader"))
        assert result.endswith(os.path.join("common", "config"))

    def test_raises_when_nothing_available(self, clean_env):
        """Should raise ValueError when no resolution is possible."""
        with pytest.raises(ValueError, match="config_dir is required"):
            _resolve_config_dir()

    def test_empty_string_override_raises(self, clean_env):
        """Empty string override should raise ValueError."""
        with pytest.raises(ValueError, match="must not be an empty string"):
            _resolve_config_dir(override="")

    def test_empty_string_env_var_raises(self, clean_env):
        """Empty CONFIG_DIR env var should raise ValueError."""
        clean_env.setenv("CONFIG_DIR", "")
        with pytest.raises(ValueError, match="must not be an empty string"):
            _resolve_config_dir()

    def test_none_override_is_not_empty_string(self, clean_env):
        """None override should not be treated as empty string."""
        clean_env.setenv("CONFIG_DIR", "/valid/path")
        result = _resolve_config_dir(override=None)
        assert result == "/valid/path"


class TestResolveAppEnv:
    """Tests for _resolve_app_env resolution."""

    def test_override_takes_precedence(self, clean_env):
        """Explicit override should be used."""
        clean_env.setenv("APP_ENV", "staging")
        result = _resolve_app_env("production")
        assert result == "production"

    def test_env_var_used_when_no_override(self, clean_env):
        """APP_ENV should be used when no override."""
        clean_env.setenv("APP_ENV", "staging")
        result = _resolve_app_env()
        assert result == "staging"

    def test_defaults_to_dev(self, clean_env):
        """Should default to 'dev' when nothing set."""
        result = _resolve_app_env()
        assert result == "dev"

    def test_normalizes_to_lowercase(self, clean_env):
        """Should normalize to lowercase."""
        result = _resolve_app_env("PRODUCTION")
        assert result == "production"


class TestBuildConfigFiles:
    """Tests for build_config_files."""

    def test_returns_five_files(self):
        """Should return 5 canonical config files."""
        files = build_config_files("/config", "dev")
        assert len(files) == 5

    def test_includes_base_files(self):
        """Should include base.yml, security.yml, api-release-date.yml."""
        files = build_config_files("/config", "dev")
        assert "/config/base.yml" in files
        assert "/config/security.yml" in files
        assert "/config/api-release-date.yml" in files

    def test_includes_env_specific_files(self):
        """Should include env-specific server and endpoint files."""
        files = build_config_files("/config", "staging")
        assert "/config/server.staging.yaml" in files
        assert "/config/endpoint.staging.yaml" in files


class TestLoadAppYamlConfig:
    """End-to-end tests for load_app_yaml_config.

    Note: load_app_yaml_config uses the canonical 5-file list (base.yml,
    security.yml, etc.) so we create minimal .yml fixture files for testing.
    """

    @pytest.fixture
    def loader_fixtures(self, tmp_path):
        """Create fixture files matching the canonical 5-file list."""
        (tmp_path / "base.yml").write_text("app:\n  name: test-app\n")
        (tmp_path / "security.yml").write_text("cors:\n  origins: ['*']\n")
        (tmp_path / "api-release-date.yml").write_text("api:\n  version: 1\n")
        (tmp_path / "server.test.yaml").write_text("server:\n  port: 3000\n")
        (tmp_path / "endpoint.test.yaml").write_text("endpoint:\n  base: /api\n")
        return tmp_path

    def test_loads_with_explicit_config_dir(self, loader_fixtures):
        """Should load config when config_dir is provided."""
        result = load_app_yaml_config(config_dir=str(loader_fixtures), app_env="test")
        assert result.config is not None
        assert result.sdk is not None
        assert result.config.get_nested("app", "name") == "test-app"

    def test_accepts_load_options_dataclass(self, loader_fixtures):
        """Should accept LoadOptions as alternative to kwargs."""
        opts = LoadOptions(config_dir=str(loader_fixtures), app_env="test")
        result = load_app_yaml_config(options=opts)
        assert result.config is not None

    def test_kwargs_override_load_options(self, loader_fixtures):
        """Flat kwargs should take precedence over LoadOptions fields."""
        opts = LoadOptions(app_env="staging")
        result = load_app_yaml_config(
            config_dir=str(loader_fixtures),
            app_env="test",
            options=opts,
        )
        assert result.config is not None
