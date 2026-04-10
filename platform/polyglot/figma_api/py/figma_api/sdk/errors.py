"""
Errors Module — Figma API SDK

Typed error hierarchy for Figma API responses.
All errors include code, meta, and timestamp fields.
"""

from datetime import datetime, timezone
from typing import Any, Dict, Optional


class FigmaError(Exception):
    """Base error for all Figma API errors."""

    def __init__(
        self,
        message: str = "Figma API error",
        *,
        status: int = 500,
        code: str = "FIGMA_ERROR",
        meta: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
    ):
        super().__init__(message)
        self.name = "FigmaError"
        self.status = status
        self.code = code
        self.meta = meta or {}
        self.request_id = request_id
        self.timestamp = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "error": True,
            "name": self.name,
            "message": str(self),
            "status": self.status,
            "code": self.code,
            "meta": self.meta,
            "request_id": self.request_id,
            "timestamp": self.timestamp,
        }


class AuthenticationError(FigmaError):
    def __init__(self, message: str = "Authentication failed", meta: Optional[Dict] = None):
        super().__init__(message, status=401, code="AUTHENTICATION_ERROR", meta=meta)
        self.name = "AuthenticationError"


class AuthorizationError(FigmaError):
    def __init__(self, message: str = "Access forbidden", meta: Optional[Dict] = None):
        super().__init__(message, status=403, code="AUTHORIZATION_ERROR", meta=meta)
        self.name = "AuthorizationError"


class NotFoundError(FigmaError):
    def __init__(self, message: str = "Resource not found", meta: Optional[Dict] = None):
        super().__init__(message, status=404, code="NOT_FOUND", meta=meta)
        self.name = "NotFoundError"


class ValidationError(FigmaError):
    def __init__(self, message: str = "Validation failed", meta: Optional[Dict] = None):
        super().__init__(message, status=422, code="VALIDATION_ERROR", meta=meta)
        self.name = "ValidationError"


class RateLimitError(FigmaError):
    def __init__(
        self,
        message: str = "Rate limit exceeded",
        *,
        rate_limit_info: Optional[Dict[str, Any]] = None,
        meta: Optional[Dict] = None,
    ):
        super().__init__(message, status=429, code="RATE_LIMIT_ERROR", meta=meta)
        self.name = "RateLimitError"
        self.rate_limit_info = rate_limit_info


class ApiError(FigmaError):
    def __init__(self, message: str = "API error", meta: Optional[Dict] = None):
        status = (meta or {}).get("status", 400)
        super().__init__(message, status=status, code="API_ERROR", meta=meta)
        self.name = "ApiError"


class ServerError(FigmaError):
    def __init__(self, message: str = "Server error", meta: Optional[Dict] = None):
        status = (meta or {}).get("status", 500)
        super().__init__(message, status=status, code="SERVER_ERROR", meta=meta)
        self.name = "ServerError"


class NetworkError(FigmaError):
    def __init__(self, message: str = "Network error", meta: Optional[Dict] = None):
        super().__init__(message, status=0, code="NETWORK_ERROR", meta=meta)
        self.name = "NetworkError"


class TimeoutError(FigmaError):
    def __init__(self, message: str = "Request timed out", meta: Optional[Dict] = None):
        super().__init__(message, status=408, code="TIMEOUT_ERROR", meta=meta)
        self.name = "TimeoutError"


class ConfigurationError(FigmaError):
    def __init__(self, message: str = "Configuration error", meta: Optional[Dict] = None):
        super().__init__(message, status=0, code="CONFIGURATION_ERROR", meta=meta)
        self.name = "ConfigurationError"


def map_response_to_error(
    status: int,
    body: Any,
    headers: Optional[Dict[str, str]] = None,
) -> FigmaError:
    """Map an HTTP response to the appropriate error type."""
    headers = headers or {}
    message = "Unknown error"
    if isinstance(body, dict):
        message = body.get("message") or body.get("err") or f"HTTP {status}"
    elif isinstance(body, str):
        message = body or f"HTTP {status}"
    else:
        message = f"HTTP {status}"

    meta = {"status": status, "body": body}

    if status == 401:
        return AuthenticationError(message, meta=meta)
    if status == 403:
        return AuthorizationError(message, meta=meta)
    if status == 404:
        return NotFoundError(message, meta=meta)
    if status == 422:
        return ValidationError(message, meta=meta)
    if status == 429:
        retry_after = float(headers.get("retry-after", "60"))
        rate_limit_info = {
            "retry_after": retry_after,
            "plan_tier": headers.get("x-figma-plan-tier"),
            "rate_limit_type": headers.get("x-figma-rate-limit-type"),
            "upgrade_link": headers.get("x-figma-upgrade-link"),
            "timestamp": datetime.now(timezone.utc),
        }
        return RateLimitError(message, rate_limit_info=rate_limit_info, meta=meta)
    if status >= 500:
        return ServerError(message, meta=meta)
    return ApiError(message, meta=meta)
