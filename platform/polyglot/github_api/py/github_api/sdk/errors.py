"""
GitHub API error hierarchy.

Provides structured error types for all GitHub API error conditions,
including rate limiting, authentication, authorization, and server errors.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

__all__ = [
    "GitHubError",
    "AuthError",
    "NotFoundError",
    "ValidationError",
    "RateLimitError",
    "ConflictError",
    "ForbiddenError",
    "ServerError",
    "map_response_to_error",
]


class GitHubError(Exception):
    """Base exception for all GitHub API errors."""

    def __init__(
        self,
        message: str,
        *,
        status: int | None = None,
        request_id: str | None = None,
        documentation_url: str | None = None,
        response_body: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status = status
        self.request_id = request_id
        self.documentation_url = documentation_url
        self.response_body = response_body or {}

    def to_dict(self) -> dict[str, Any]:
        """Serialize error to dictionary for JSON responses."""
        result: dict[str, Any] = {
            "error": self.__class__.__name__,
            "message": self.message,
        }
        if self.status is not None:
            result["status"] = self.status
        if self.request_id is not None:
            result["request_id"] = self.request_id
        if self.documentation_url is not None:
            result["documentation_url"] = self.documentation_url
        return result

    def __repr__(self) -> str:
        return (
            f"{self.__class__.__name__}("
            f"message={self.message!r}, "
            f"status={self.status!r}, "
            f"request_id={self.request_id!r}"
            f")"
        )


class AuthError(GitHubError):
    """Authentication failed — invalid or missing token."""

    def __init__(
        self,
        message: str = "Authentication failed",
        **kwargs: Any,
    ) -> None:
        super().__init__(message, status=kwargs.pop("status", 401), **kwargs)


class NotFoundError(GitHubError):
    """Requested resource was not found."""

    def __init__(
        self,
        message: str = "Resource not found",
        **kwargs: Any,
    ) -> None:
        super().__init__(message, status=kwargs.pop("status", 404), **kwargs)


class ValidationError(GitHubError):
    """Request validation failed — invalid parameters or body."""

    def __init__(
        self,
        message: str = "Validation failed",
        *,
        errors: list[dict[str, Any]] | None = None,
        **kwargs: Any,
    ) -> None:
        super().__init__(message, status=kwargs.pop("status", 422), **kwargs)
        self.errors = errors or []

    def to_dict(self) -> dict[str, Any]:
        """Serialize with validation errors."""
        result = super().to_dict()
        if self.errors:
            result["errors"] = self.errors
        return result


class RateLimitError(GitHubError):
    """Rate limit exceeded — primary or secondary."""

    def __init__(
        self,
        message: str = "Rate limit exceeded",
        *,
        reset_at: datetime | None = None,
        retry_after: int | None = None,
        **kwargs: Any,
    ) -> None:
        super().__init__(message, status=kwargs.pop("status", 429), **kwargs)
        self.reset_at = reset_at
        self.retry_after = retry_after

    def to_dict(self) -> dict[str, Any]:
        """Serialize with rate limit details."""
        result = super().to_dict()
        if self.reset_at is not None:
            result["reset_at"] = self.reset_at.isoformat()
        if self.retry_after is not None:
            result["retry_after"] = self.retry_after
        return result


class ConflictError(GitHubError):
    """Conflict — resource already exists or state conflict."""

    def __init__(
        self,
        message: str = "Conflict",
        **kwargs: Any,
    ) -> None:
        super().__init__(message, status=kwargs.pop("status", 409), **kwargs)


class ForbiddenError(GitHubError):
    """Forbidden — insufficient permissions."""

    def __init__(
        self,
        message: str = "Forbidden",
        **kwargs: Any,
    ) -> None:
        super().__init__(message, status=kwargs.pop("status", 403), **kwargs)


class ServerError(GitHubError):
    """GitHub server error — 5xx responses."""

    def __init__(
        self,
        message: str = "Server error",
        **kwargs: Any,
    ) -> None:
        super().__init__(message, status=kwargs.pop("status", 502), **kwargs)


def map_response_to_error(
    status: int,
    body: dict[str, Any] | None,
    headers: dict[str, str] | None = None,
) -> GitHubError:
    """Map an HTTP response status to the appropriate GitHubError subclass.

    Args:
        status: HTTP status code.
        body: Parsed response body (JSON).
        headers: Response headers.

    Returns:
        An appropriate GitHubError subclass instance.
    """
    body = body or {}
    headers = headers or {}
    message = body.get("message", f"GitHub API error (HTTP {status})")
    request_id = headers.get("x-github-request-id")
    documentation_url = body.get("documentation_url")

    common_kwargs: dict[str, Any] = {
        "request_id": request_id,
        "documentation_url": documentation_url,
        "response_body": body,
    }

    if status == 401:
        return AuthError(message, **common_kwargs)

    if status == 403:
        # Check for rate limit (secondary rate limit returns 403)
        remaining = headers.get("x-ratelimit-remaining")
        retry_after_str = headers.get("retry-after")

        if remaining == "0" or retry_after_str is not None:
            reset_at = None
            retry_after = None
            reset_str = headers.get("x-ratelimit-reset")
            if reset_str:
                try:
                    reset_at = datetime.fromtimestamp(int(reset_str))
                except (ValueError, OSError):
                    pass
            if retry_after_str:
                try:
                    retry_after = int(retry_after_str)
                except ValueError:
                    pass
            return RateLimitError(
                message,
                reset_at=reset_at,
                retry_after=retry_after,
                status=403,
                **common_kwargs,
            )
        return ForbiddenError(message, **common_kwargs)

    if status == 404:
        return NotFoundError(message, **common_kwargs)

    if status == 409:
        return ConflictError(message, **common_kwargs)

    if status == 422:
        return ValidationError(
            message,
            errors=body.get("errors", []),
            **common_kwargs,
        )

    if status == 429:
        retry_after = None
        reset_at = None
        retry_after_str = headers.get("retry-after")
        if retry_after_str:
            try:
                retry_after = int(retry_after_str)
            except ValueError:
                pass
        reset_str = headers.get("x-ratelimit-reset")
        if reset_str:
            try:
                reset_at = datetime.fromtimestamp(int(reset_str))
            except (ValueError, OSError):
                pass
        return RateLimitError(
            message,
            reset_at=reset_at,
            retry_after=retry_after,
            **common_kwargs,
        )

    if status >= 500:
        return ServerError(message, status=status, **common_kwargs)

    return GitHubError(message, status=status, **common_kwargs)
