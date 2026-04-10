"""
Typed error hierarchy for Statsig Console API responses.

Every non-2xx HTTP response is mapped to a specific ``StatsigError`` subclass
via the :func:`create_error_from_response` factory.
"""

from __future__ import annotations

from typing import Any


class StatsigError(Exception):
    """Base exception for all Statsig Console API errors.

    Attributes
    ----------
    status_code : int
        The HTTP status code that triggered the error.
    response_body : Any
        The parsed (or raw) response body, if available.
    headers : dict[str, str]
        The response headers associated with the error.
    """

    def __init__(
        self,
        message: str,
        *,
        status_code: int = 0,
        response_body: Any = None,
        headers: dict[str, str] | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code: int = status_code
        self.response_body: Any = response_body
        self.headers: dict[str, str] = headers or {}


class AuthenticationError(StatsigError):
    """Raised when the API returns HTTP 401 (Unauthorized).

    Typically indicates a missing or invalid ``STATSIG-API-KEY`` header.
    """


class NotFoundError(StatsigError):
    """Raised when the API returns HTTP 404 (Not Found).

    The requested resource does not exist or the caller lacks access.
    """


class RateLimitError(StatsigError):
    """Raised when the API returns HTTP 429 (Too Many Requests).

    Attributes
    ----------
    retry_after : float
        Suggested wait time in seconds before retrying, parsed from the
        ``Retry-After`` response header.  Defaults to ``1.0`` if the header
        is absent or unparseable.
    """

    def __init__(
        self,
        message: str,
        *,
        status_code: int = 429,
        response_body: Any = None,
        headers: dict[str, str] | None = None,
        retry_after: float = 1.0,
    ) -> None:
        super().__init__(
            message,
            status_code=status_code,
            response_body=response_body,
            headers=headers,
        )
        self.retry_after: float = retry_after


class ValidationError(StatsigError):
    """Raised when the API returns HTTP 400 or 422.

    Indicates malformed request data or a constraint violation.
    """


class ServerError(StatsigError):
    """Raised when the API returns a 5xx status code.

    Indicates an unexpected server-side failure.
    """


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

def _parse_retry_after(headers: dict[str, str]) -> float:
    """Best-effort parse of the ``Retry-After`` header value (seconds)."""
    raw = headers.get("retry-after") or headers.get("Retry-After", "")
    try:
        return max(float(raw), 0.0)
    except (ValueError, TypeError):
        return 1.0


def _safe_body(body: Any) -> str:
    """Produce a short human-readable summary of *body* for error messages."""
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
) -> StatsigError:
    """Map an HTTP error response to the appropriate :class:`StatsigError` subclass.

    Parameters
    ----------
    status_code:
        The HTTP status code (non-2xx).
    body:
        The decoded response body (usually ``dict`` from JSON, or ``str``).
    headers:
        The response headers as a plain ``dict``.

    Returns
    -------
    StatsigError
        A specific subclass corresponding to the status code.
    """
    summary = _safe_body(body)
    common = dict(status_code=status_code, response_body=body, headers=headers)

    if status_code == 401:
        return AuthenticationError(
            f"Authentication failed (401): {summary}", **common
        )

    if status_code == 404:
        return NotFoundError(
            f"Resource not found (404): {summary}", **common
        )

    if status_code == 429:
        retry_after = _parse_retry_after(headers)
        return RateLimitError(
            f"Rate limited (429): retry after {retry_after}s — {summary}",
            retry_after=retry_after,
            **common,
        )

    if status_code in (400, 422):
        return ValidationError(
            f"Validation error ({status_code}): {summary}", **common
        )

    if 500 <= status_code < 600:
        return ServerError(
            f"Server error ({status_code}): {summary}", **common
        )

    # Catch-all for any other non-2xx code.
    return StatsigError(
        f"HTTP error ({status_code}): {summary}", **common
    )
