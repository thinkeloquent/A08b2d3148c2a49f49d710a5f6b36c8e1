"""
Structured exception hierarchy for the Jira API client.
Maps HTTP status codes to specific exception subclasses.
"""

from __future__ import annotations

from typing import Any


class JiraAPIError(Exception):
    """Base exception for all Jira API errors."""

    def __init__(
        self,
        message: str = "Jira API error",
        status_code: int | None = None,
        response_data: dict[str, Any] | None = None,
        url: str | None = None,
        method: str | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.response_data = response_data or {}
        self.url = url
        self.method = method

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": type(self).__name__,
            "message": self.message,
            "status_code": self.status_code,
            "response_data": self.response_data,
            "url": self.url,
            "method": self.method,
        }

    def __repr__(self) -> str:
        return f"{type(self).__name__}(message={self.message!r}, status_code={self.status_code})"


class JiraAuthenticationError(JiraAPIError):
    """401 - Invalid credentials or expired token."""

    def __init__(self, message: str = "Authentication failed", **kwargs: Any) -> None:
        super().__init__(message, status_code=401, **kwargs)


class JiraPermissionError(JiraAPIError):
    """403 - Insufficient permissions."""

    def __init__(self, message: str = "Permission denied", **kwargs: Any) -> None:
        super().__init__(message, status_code=403, **kwargs)


class JiraNotFoundError(JiraAPIError):
    """404 - Resource not found."""

    def __init__(self, message: str = "Resource not found", **kwargs: Any) -> None:
        super().__init__(message, status_code=404, **kwargs)


class JiraValidationError(JiraAPIError):
    """400 - Bad request / validation failure."""

    def __init__(self, message: str = "Validation failed", **kwargs: Any) -> None:
        super().__init__(message, status_code=400, **kwargs)


class JiraRateLimitError(JiraAPIError):
    """429 - Rate limited."""

    def __init__(
        self,
        message: str = "Rate limited",
        retry_after: float | None = None,
        **kwargs: Any,
    ) -> None:
        super().__init__(message, status_code=429, **kwargs)
        self.retry_after = retry_after


class JiraServerError(JiraAPIError):
    """5xx - Jira server error."""

    def __init__(self, message: str = "Jira server error", status_code: int = 500, **kwargs: Any) -> None:
        super().__init__(message, status_code=status_code, **kwargs)


class JiraNetworkError(JiraAPIError):
    """Network failure (DNS, connection refused, etc)."""

    def __init__(self, message: str = "Network error", **kwargs: Any) -> None:
        super().__init__(message, **kwargs)


class JiraTimeoutError(JiraAPIError):
    """Request timed out."""

    def __init__(self, message: str = "Request timed out", **kwargs: Any) -> None:
        super().__init__(message, **kwargs)


class JiraConfigurationError(JiraAPIError):
    """Configuration error (missing params, invalid config)."""

    def __init__(self, message: str = "Configuration error", **kwargs: Any) -> None:
        super().__init__(message, **kwargs)


class SDKError(JiraAPIError):
    """SDK-specific error for REST proxy client."""

    def __init__(self, message: str = "SDK error", **kwargs: Any) -> None:
        super().__init__(message, **kwargs)


def create_error_from_response(
    status: int,
    body: dict[str, Any] | None,
    url: str | None = None,
    method: str | None = None,
    retry_after: float | None = None,
) -> JiraAPIError:
    """Create a typed exception from an HTTP response status and body."""
    detail = "Unknown error"
    if body:
        if "message" in body:
            detail = body["message"]
        elif "errorMessages" in body and isinstance(body["errorMessages"], list):
            detail = "; ".join(body["errorMessages"])
        else:
            detail = f"HTTP {status}"
    else:
        detail = f"HTTP {status}"

    kwargs: dict[str, Any] = {"response_data": body, "url": url, "method": method}

    if status == 400:
        return JiraValidationError(detail, **kwargs)
    if status == 401:
        return JiraAuthenticationError(detail, **kwargs)
    if status == 403:
        return JiraPermissionError(detail, **kwargs)
    if status == 404:
        return JiraNotFoundError(detail, **kwargs)
    if status == 429:
        return JiraRateLimitError(detail, retry_after=retry_after, **kwargs)
    if status >= 500:
        return JiraServerError(detail, status_code=status, **kwargs)
    return JiraAPIError(detail, status_code=status, **kwargs)
