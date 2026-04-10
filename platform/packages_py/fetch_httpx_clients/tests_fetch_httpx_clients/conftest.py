"""Shared fixtures for fetch_httpx_clients tests."""

from __future__ import annotations

import logging

import pytest
from can_use_http2 import Http2CheckResult


@pytest.fixture()
def caplog_info(caplog: pytest.LogCaptureFixture) -> pytest.LogCaptureFixture:
    """Capture log output at INFO level."""
    with caplog.at_level(logging.INFO, logger="fetch_httpx_clients"):
        yield caplog


@pytest.fixture()
def caplog_warning(caplog: pytest.LogCaptureFixture) -> pytest.LogCaptureFixture:
    """Capture log output at WARNING level."""
    with caplog.at_level(logging.WARNING, logger="fetch_httpx_clients"):
        yield caplog


@pytest.fixture()
def h2_ok() -> Http2CheckResult:
    """An Http2CheckResult where everything passed."""
    return Http2CheckResult(
        h2_installed=True,
        httpx_installed=True,
        httpx_version="0.27.0",
        alpn_negotiated="h2",
        errors=[],
    )


@pytest.fixture()
def h2_fail() -> Http2CheckResult:
    """An Http2CheckResult where h2 is missing."""
    return Http2CheckResult(
        h2_installed=False,
        httpx_installed=True,
        httpx_version="0.27.0",
        errors=["h2 package is not installed (pip install h2)"],
    )
