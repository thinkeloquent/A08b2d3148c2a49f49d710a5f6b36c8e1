"""
Pytest configuration and shared fixtures for gemini_openai_sdk tests.

Provides:
- Mock logger fixture for injection
- Log assertion helpers
- Environment variable management
- FastAPI test client fixtures
"""
import logging
import os
from typing import Any, Dict, Optional
from unittest.mock import AsyncMock, MagicMock

import pytest

# Configure logging for tests
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)


# =============================================================================
# Mock Logger Fixtures
# =============================================================================

@pytest.fixture
def mock_logger():
    """Fixture providing a mock logger for injection."""
    mock = MagicMock()
    mock.debug = MagicMock()
    mock.info = MagicMock()
    mock.warn = MagicMock()
    mock.warning = MagicMock()
    mock.error = MagicMock()
    mock.trace = MagicMock()
    return mock


@pytest.fixture
def logger_spy():
    """Fixture providing a logger spy that captures log calls."""
    logs = {"debug": [], "info": [], "warn": [], "error": []}

    class LoggerSpy:
        def debug(self, msg, *args, **kwargs):
            logs["debug"].append({"msg": msg, "args": args, "kwargs": kwargs})

        def info(self, msg, *args, **kwargs):
            logs["info"].append({"msg": msg, "args": args, "kwargs": kwargs})

        def warn(self, msg, *args, **kwargs):
            logs["warn"].append({"msg": msg, "args": args, "kwargs": kwargs})

        def warning(self, msg, *args, **kwargs):
            logs["warn"].append({"msg": msg, "args": args, "kwargs": kwargs})

        def error(self, msg, *args, **kwargs):
            logs["error"].append({"msg": msg, "args": args, "kwargs": kwargs})

        def trace(self, msg, *args, **kwargs):
            logs["debug"].append({"msg": msg, "args": args, "kwargs": kwargs})

    return {"logs": logs, "logger": LoggerSpy()}


# =============================================================================
# Log Assertion Fixtures
# =============================================================================

@pytest.fixture
def assert_log_contains(caplog):
    """Fixture to assert log messages are present."""
    def _assert(expected_text: str, level: Optional[str] = None):
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


def expect_log_contains(logs: Dict, level: str, text: str) -> bool:
    """Helper to check if logs contain expected text."""
    for entry in logs.get(level, []):
        if text in str(entry.get("msg", "")):
            return True
    return False


# =============================================================================
# Environment Fixtures
# =============================================================================

@pytest.fixture
def clean_env(monkeypatch):
    """Fixture to manage environment variables."""
    original_values = {}

    def set_env(**kwargs):
        for key, value in kwargs.items():
            if key in os.environ:
                original_values[key] = os.environ[key]
            if value is None:
                monkeypatch.delenv(key, raising=False)
            else:
                monkeypatch.setenv(key, value)

    return set_env


@pytest.fixture
def mock_api_key(monkeypatch):
    """Fixture to set a mock API key."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-api-key-12345")
    return "test-api-key-12345"


@pytest.fixture
def no_api_key(monkeypatch):
    """Fixture to ensure no API key is set."""
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)


# =============================================================================
# HTTP Mock Fixtures
# =============================================================================

@pytest.fixture
def mock_http_response():
    """Fixture to create mock HTTP responses."""
    def _create_response(
        status_code: int = 200,
        json_data: Optional[Dict] = None,
        text: str = "",
        raise_for_status: bool = False
    ):
        response = MagicMock()
        response.status_code = status_code
        response.json.return_value = json_data or {}
        response.text = text or (json_data and str(json_data)) or ""
        if raise_for_status:
            response.raise_for_status.side_effect = Exception(f"HTTP {status_code}")
        return response
    return _create_response


@pytest.fixture
def mock_chat_response():
    """Fixture for standard chat completion response."""
    return {
        "id": "chatcmpl-test123",
        "object": "chat.completion",
        "created": 1700000000,
        "model": "gemini-2.0-flash",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "Hello! How can I help you today?"
                },
                "finish_reason": "stop"
            }
        ],
        "usage": {
            "prompt_tokens": 10,
            "completion_tokens": 15,
            "total_tokens": 25
        }
    }


@pytest.fixture
def mock_stream_chunks():
    """Fixture for streaming response chunks."""
    return [
        'data: {"id":"chatcmpl-test","object":"chat.completion.chunk","model":"gemini-2.0-flash","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}',
        'data: {"id":"chatcmpl-test","object":"chat.completion.chunk","model":"gemini-2.0-flash","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}',
        'data: {"id":"chatcmpl-test","object":"chat.completion.chunk","model":"gemini-2.0-flash","choices":[{"index":0,"delta":{"content":" world"},"finish_reason":null}]}',
        'data: {"id":"chatcmpl-test","object":"chat.completion.chunk","model":"gemini-2.0-flash","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}',
        'data: [DONE]'
    ]


# =============================================================================
# FastAPI Test Client Fixtures
# =============================================================================

@pytest.fixture
def fastapi_app():
    """Fixture to create a test FastAPI application."""
    try:
        from fastapi import FastAPI, Request
        from fastapi.responses import JSONResponse

        app = FastAPI(title="Test Gemini OpenAI SDK")

        @app.get("/health")
        async def health():
            return {"status": "ok", "service": "gemini-openai-sdk"}

        @app.get("/api/llm/gemini-openai-v1/health")
        async def api_health():
            return {"status": "ok", "api_version": "v1"}

        return app
    except ImportError:
        pytest.skip("FastAPI not installed")


@pytest.fixture
def test_client(fastapi_app):
    """Fixture for synchronous FastAPI test client."""
    try:
        from fastapi.testclient import TestClient
        return TestClient(fastapi_app)
    except ImportError:
        pytest.skip("FastAPI test client not available")


@pytest.fixture
async def async_client(fastapi_app):
    """Fixture for asynchronous FastAPI test client."""
    try:
        from httpx import ASGITransport, AsyncClient
        transport = ASGITransport(app=fastapi_app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac
    except ImportError:
        pytest.skip("httpx not installed")
