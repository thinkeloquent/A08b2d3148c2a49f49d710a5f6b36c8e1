"""
Pytest configuration and shared fixtures for static_app_loader tests.
"""

import logging
import os
import tempfile
from collections.abc import Generator
from pathlib import Path
from typing import Any, Dict, Optional
from unittest.mock import MagicMock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from static_app_loader import (
    StaticLoaderOptions,
    register_static_app,
    reset_registered_prefixes,
)

# Configure logging for tests
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)


@pytest.fixture
def mock_logger() -> MagicMock:
    """Fixture providing a mock logger for injection."""
    mock = MagicMock()
    mock.debug = MagicMock()
    mock.info = MagicMock()
    mock.warn = MagicMock()
    mock.error = MagicMock()
    mock.trace = MagicMock()
    return mock


@pytest.fixture
def assert_log_contains(caplog: pytest.LogCaptureFixture):
    """Fixture to assert log messages are present."""

    def _assert(expected_text: str, level: str | None = None) -> bool:
        for record in caplog.records:
            if level and record.levelname != level.upper():
                continue
            if expected_text in record.message:
                return True

        all_messages = [f"[{r.levelname}] {r.message}" for r in caplog.records]
        raise AssertionError(
            f"Expected log containing '{expected_text}' not found.\n"
            f"Captured logs:\n" + "\n".join(all_messages)
        )

    return _assert


@pytest.fixture
def clean_env(monkeypatch: pytest.MonkeyPatch):
    """Fixture to manage environment variables."""

    def set_env(**kwargs: str | None) -> None:
        for key, value in kwargs.items():
            if value is None:
                monkeypatch.delenv(key, raising=False)
            else:
                monkeypatch.setenv(key, value)

    return set_env


@pytest.fixture
def temp_static_dir() -> Generator[Path, None, None]:
    """Create a temporary directory with static files for testing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        root = Path(tmpdir)

        # Create index.html
        index_html = root / "index.html"
        index_html.write_text(
            """<!DOCTYPE html>
<html>
<head>
    <title>Test App</title>
    <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
    <h1>Test App</h1>
    <script src="/assets/main.js"></script>
</body>
</html>"""
        )

        # Create assets
        assets_dir = root / "assets"
        assets_dir.mkdir()
        (assets_dir / "style.css").write_text("body { margin: 0; }")
        (assets_dir / "main.js").write_text("console.log('Hello');")

        yield root


@pytest.fixture
def app() -> FastAPI:
    """Create a test FastAPI application instance."""
    return FastAPI(title="Test API")


@pytest.fixture
def client(app: FastAPI) -> TestClient:
    """Synchronous test client."""
    return TestClient(app)


@pytest.fixture(autouse=True)
def reset_prefixes() -> Generator[None, None, None]:
    """Reset registered prefixes before each test."""
    reset_registered_prefixes()
    yield
    reset_registered_prefixes()


@pytest.fixture
def sample_options(temp_static_dir: Path) -> StaticLoaderOptions:
    """Create sample StaticLoaderOptions for testing."""
    return StaticLoaderOptions(
        app_name="testapp",
        root_path=str(temp_static_dir),
        spa_mode=True,
        url_prefix="/assets",
    )
