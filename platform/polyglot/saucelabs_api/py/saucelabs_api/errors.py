"""
Typed error hierarchy for Sauce Labs REST API responses.

Every non-2xx HTTP response is mapped to a specific ``SaucelabsError`` subclass
via the :func:`create_error_from_response` factory.
"""

from __future__ import annotations

from typing import Any


class SaucelabsError(Exception):
    """Base exception for all Sauce Labs API errors."""

    def __init__(
        self,
        message: str,
        *,
        status_code: int = 0,
        response_body: Any = None,
        headers: dict[str, str] | None = None,
        endpoint: str = "",
        method: str = "",
    ) -> None:
        super().__init__(message)
        self.status_code: int = status_code
        self.response_body: Any = response_body
        self.headers: dict[str, str] = headers or {}
        self.endpoint: str = endpoint
        self.method: str = method


class SaucelabsAuthError(SaucelabsError):
    """Raised on HTTP 401 — missing or invalid credentials."""


class SaucelabsNotFoundError(SaucelabsError):
    """Raised on HTTP 404 — resource not found."""


class SaucelabsRateLimitError(SaucelabsError):
    """Raised on HTTP 429 — rate limit exceeded."""

    def __init__(
        self,
        message: str,
        *,
        status_code: int = 429,
        response_body: Any = None,
        headers: dict[str, str] | None = None,
        retry_after: float = 1.0,
        endpoint: str = "",
        method: str = "",
    ) -> None:
        super().__init__(
            message,
            status_code=status_code,
            response_body=response_body,
            headers=headers,
            endpoint=endpoint,
            method=method,
        )
        self.retry_after: float = retry_after


class SaucelabsValidationError(SaucelabsError):
    """Raised on HTTP 400 or 422 — invalid request."""


class SaucelabsServerError(SaucelabsError):
    """Raised on HTTP 5xx — server-side failure."""


class SaucelabsConfigError(SaucelabsError):
    """Raised when required configuration is missing."""


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

def _parse_retry_after(headers: dict[str, str]) -> float:
    raw = headers.get("retry-after") or headers.get("Retry-After", "")
    try:
        return max(float(raw), 0.0)
    except (ValueError, TypeError):
        return 1.0


def _safe_body(body: Any) -> str:
    if isinstance(body, dict):
        msg = body.get("message") or body.get("error") or body.get("detail")
        if msg:
            return str(msg)
    if isinstance(body, str) and len(body) <= 200:
        return body
    return str(body)[:200]


def create_error_from_response(
    status_code: int,
    body: Any,
    headers: dict[str, str],
) -> SaucelabsError:
    """Map an HTTP error response to the appropriate error subclass."""
    summary = _safe_body(body)
    common = dict(status_code=status_code, response_body=body, headers=headers)

    if status_code == 401:
        return SaucelabsAuthError(
            f"Authentication failed (401): {summary} — check SAUCE_USERNAME and SAUCE_ACCESS_KEY",
            **common,
        )

    if status_code == 404:
        return SaucelabsNotFoundError(
            f"Resource not found (404): {summary}", **common
        )

    if status_code == 429:
        retry_after = _parse_retry_after(headers)
        return SaucelabsRateLimitError(
            f"Rate limited (429): retry after {retry_after}s — {summary}",
            retry_after=retry_after,
            **common,
        )

    if status_code in (400, 422):
        return SaucelabsValidationError(
            f"Validation error ({status_code}): {summary}", **common
        )

    if 500 <= status_code < 600:
        return SaucelabsServerError(
            f"Server error ({status_code}): {summary} — check https://status.saucelabs.com",
            **common,
        )

    return SaucelabsError(f"HTTP error ({status_code}): {summary}", **common)
