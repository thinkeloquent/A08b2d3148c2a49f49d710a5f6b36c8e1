"""Unit tests for github_api.middleware.github_hooks module.

Tests cover:
- Statement coverage for all hook functions
- Branch coverage for conditional paths (204, JSON parse, headers)
- Boundary value analysis
- Error handling verification
- Log verification
"""

from __future__ import annotations

from typing import Any
from unittest.mock import MagicMock, PropertyMock

import httpx
import pytest

from github_api.middleware.github_hooks import (
    json_fallback_hook,
    rate_limit_hook,
    request_id_hook,
    response_204_hook,
)
from github_api.sdk.rate_limit import RateLimitInfo


def _make_response(
    status_code: int = 200,
    json_data: Any = None,
    text: str = "",
    headers: dict[str, str] | None = None,
    json_raises: bool = False,
) -> MagicMock:
    """Create a mock httpx.Response.

    Args:
        status_code: The HTTP status code.
        json_data: Data to return from .json().
        text: Data to return from .text property.
        headers: Response headers.
        json_raises: If True, .json() raises an exception.

    Returns:
        A MagicMock mimicking httpx.Response.
    """
    response = MagicMock(spec=httpx.Response)
    response.status_code = status_code
    if json_raises:
        response.json.side_effect = ValueError("No JSON")
    else:
        response.json.return_value = json_data
    type(response).text = PropertyMock(return_value=text)
    response.headers = httpx.Headers(headers or {})
    return response


class TestStatementCoverage:
    """Execute every code path in github_hooks module."""

    # -- response_204_hook --

    def test_response_204_hook_returns_empty_dict_for_204(self) -> None:
        """response_204_hook returns {} for 204 status."""
        resp = _make_response(status_code=204)
        result = response_204_hook(resp)
        assert result == {}

    def test_response_204_hook_returns_empty_dict_for_non_204(self) -> None:
        """response_204_hook returns {} for non-204 status too (current impl)."""
        resp = _make_response(status_code=200)
        result = response_204_hook(resp)
        assert result == {}

    # -- json_fallback_hook --

    def test_json_fallback_hook_returns_dict(self) -> None:
        """json_fallback_hook returns parsed JSON dict directly."""
        resp = _make_response(json_data={"id": 1, "name": "repo"})
        result = json_fallback_hook(resp)
        assert result == {"id": 1, "name": "repo"}

    def test_json_fallback_hook_wraps_non_dict(self) -> None:
        """json_fallback_hook wraps non-dict JSON in {'data': ...}."""
        resp = _make_response(json_data=[1, 2, 3])
        result = json_fallback_hook(resp)
        assert result == {"data": [1, 2, 3]}

    def test_json_fallback_hook_falls_back_to_text(self) -> None:
        """json_fallback_hook returns {'data': text} on JSON parse failure."""
        resp = _make_response(json_raises=True, text="raw body content")
        result = json_fallback_hook(resp)
        assert result == {"data": "raw body content"}

    def test_json_fallback_hook_empty_text_returns_empty_dict(self) -> None:
        """json_fallback_hook returns {} when JSON fails and text is empty."""
        resp = _make_response(json_raises=True, text="")
        result = json_fallback_hook(resp)
        assert result == {}

    # -- request_id_hook --

    def test_request_id_hook_extracts_header(self) -> None:
        """request_id_hook extracts x-github-request-id header."""
        resp = _make_response(headers={"x-github-request-id": "ABCD-1234"})
        result = request_id_hook(resp)
        assert result == "ABCD-1234"

    def test_request_id_hook_returns_none_when_missing(self) -> None:
        """request_id_hook returns None when header is absent."""
        resp = _make_response(headers={})
        result = request_id_hook(resp)
        assert result is None

    # -- rate_limit_hook --

    def test_rate_limit_hook_parses_headers(self) -> None:
        """rate_limit_hook returns RateLimitInfo from rate limit headers."""
        resp = _make_response(
            headers={
                "x-ratelimit-limit": "5000",
                "x-ratelimit-remaining": "4999",
                "x-ratelimit-reset": "1700000000",
                "x-ratelimit-used": "1",
                "x-ratelimit-resource": "core",
            }
        )
        info = rate_limit_hook(resp)
        assert info is not None
        assert isinstance(info, RateLimitInfo)
        assert info.limit == 5000
        assert info.remaining == 4999

    def test_rate_limit_hook_returns_none_without_headers(self) -> None:
        """rate_limit_hook returns None when rate limit headers are missing."""
        resp = _make_response(headers={})
        info = rate_limit_hook(resp)
        assert info is None


class TestBranchCoverage:
    """Test all conditional branches in github_hooks."""

    # -- response_204_hook branches --

    def test_response_204_hook_204_branch(self) -> None:
        """response_204_hook enters the status_code == 204 branch."""
        resp = _make_response(status_code=204)
        assert response_204_hook(resp) == {}

    def test_response_204_hook_non_204_branch(self) -> None:
        """response_204_hook enters the else branch for non-204."""
        resp = _make_response(status_code=200)
        assert response_204_hook(resp) == {}

    # -- json_fallback_hook branches --

    def test_json_fallback_dict_branch(self) -> None:
        """json_fallback_hook takes dict branch when data is dict."""
        resp = _make_response(json_data={"key": "val"})
        result = json_fallback_hook(resp)
        assert result == {"key": "val"}

    def test_json_fallback_non_dict_branch(self) -> None:
        """json_fallback_hook wraps when data is not dict."""
        resp = _make_response(json_data="string_value")
        result = json_fallback_hook(resp)
        assert result == {"data": "string_value"}

    def test_json_fallback_exception_with_text_branch(self) -> None:
        """json_fallback_hook falls back to text when JSON parsing fails."""
        resp = _make_response(json_raises=True, text="error text")
        result = json_fallback_hook(resp)
        assert result == {"data": "error text"}

    def test_json_fallback_exception_empty_text_branch(self) -> None:
        """json_fallback_hook returns empty dict when text is also empty."""
        resp = _make_response(json_raises=True, text="")
        result = json_fallback_hook(resp)
        assert result == {}

    # -- request_id_hook branches --

    def test_request_id_present(self) -> None:
        """request_id_hook returns value when header is present."""
        resp = _make_response(headers={"x-github-request-id": "REQ-1"})
        assert request_id_hook(resp) == "REQ-1"

    def test_request_id_absent(self) -> None:
        """request_id_hook returns None when header is absent."""
        resp = _make_response(headers={"other-header": "value"})
        assert request_id_hook(resp) is None

    # -- rate_limit_hook branches --

    def test_rate_limit_hook_all_headers_present(self) -> None:
        """rate_limit_hook returns info when all required headers present."""
        resp = _make_response(
            headers={
                "x-ratelimit-limit": "100",
                "x-ratelimit-remaining": "50",
                "x-ratelimit-reset": "1700000000",
            }
        )
        info = rate_limit_hook(resp)
        assert info is not None

    def test_rate_limit_hook_partial_headers(self) -> None:
        """rate_limit_hook returns None when only some headers present."""
        resp = _make_response(
            headers={"x-ratelimit-limit": "100"}
        )
        info = rate_limit_hook(resp)
        assert info is None


class TestBoundaryValues:
    """Edge cases for hook functions."""

    def test_json_fallback_with_none_json(self) -> None:
        """json_fallback_hook handles None as JSON data."""
        resp = _make_response(json_data=None)
        result = json_fallback_hook(resp)
        # None is not a dict, so wraps in {"data": None}
        assert result == {"data": None}

    def test_json_fallback_with_integer_json(self) -> None:
        """json_fallback_hook wraps integer JSON data."""
        resp = _make_response(json_data=42)
        result = json_fallback_hook(resp)
        assert result == {"data": 42}

    def test_json_fallback_with_boolean_json(self) -> None:
        """json_fallback_hook wraps boolean JSON data."""
        resp = _make_response(json_data=True)
        result = json_fallback_hook(resp)
        assert result == {"data": True}

    def test_json_fallback_with_empty_dict(self) -> None:
        """json_fallback_hook returns empty dict for empty JSON object."""
        resp = _make_response(json_data={})
        result = json_fallback_hook(resp)
        assert result == {}

    def test_json_fallback_with_nested_dict(self) -> None:
        """json_fallback_hook returns nested dict directly."""
        nested = {"a": {"b": {"c": 1}}}
        resp = _make_response(json_data=nested)
        result = json_fallback_hook(resp)
        assert result == nested

    def test_response_204_hook_with_status_201(self) -> None:
        """response_204_hook handles 201 (non-204)."""
        resp = _make_response(status_code=201)
        assert response_204_hook(resp) == {}

    def test_rate_limit_hook_with_zero_remaining(self) -> None:
        """rate_limit_hook parses zero remaining correctly."""
        resp = _make_response(
            headers={
                "x-ratelimit-limit": "5000",
                "x-ratelimit-remaining": "0",
                "x-ratelimit-reset": "1700000000",
            }
        )
        info = rate_limit_hook(resp)
        assert info is not None
        assert info.remaining == 0
        assert info.is_exhausted is True


class TestErrorHandling:
    """Test error scenarios in hook functions."""

    def test_json_fallback_handles_json_decode_error(self) -> None:
        """json_fallback_hook catches all exceptions from .json()."""
        resp = _make_response(json_raises=True, text="fallback text")
        result = json_fallback_hook(resp)
        assert result == {"data": "fallback text"}

    def test_rate_limit_hook_with_non_numeric_headers(self) -> None:
        """rate_limit_hook returns None when headers have non-numeric values."""
        resp = _make_response(
            headers={
                "x-ratelimit-limit": "abc",
                "x-ratelimit-remaining": "def",
                "x-ratelimit-reset": "ghi",
            }
        )
        info = rate_limit_hook(resp)
        assert info is None

    def test_request_id_hook_with_empty_string_header(self) -> None:
        """request_id_hook returns empty string when header value is empty."""
        resp = _make_response(headers={"x-github-request-id": ""})
        result = request_id_hook(resp)
        assert result == ""


class TestLogVerification:
    """Verify logging behavior in github_hooks module.

    The github_hooks module does not use a logger directly.
    These tests verify the functions return data suitable for
    downstream logging.
    """

    def test_rate_limit_info_loggable(self) -> None:
        """rate_limit_hook returns data that can be logged."""
        resp = _make_response(
            headers={
                "x-ratelimit-limit": "5000",
                "x-ratelimit-remaining": "4999",
                "x-ratelimit-reset": "1700000000",
                "x-ratelimit-used": "1",
                "x-ratelimit-resource": "core",
            }
        )
        info = rate_limit_hook(resp)
        assert info is not None
        # Info is loggable via model_dump
        d = info.model_dump()
        assert isinstance(d, dict)
        assert "limit" in d

    def test_request_id_loggable(self) -> None:
        """request_id_hook returns a loggable string."""
        resp = _make_response(headers={"x-github-request-id": "ABC-DEF"})
        result = request_id_hook(resp)
        assert isinstance(result, str)
        assert len(result) > 0
