"""
Inbound request exception classes for common_exceptions.

Provides exception classes for handling incoming request errors:
- NotAuthenticatedException (401)
- NotAuthorizedException (403)
- NotFoundException (404)
- BadRequestException (400)
- ValidationException (422)
- ConflictException (409)
- TooManyRequestsException (429)
"""

from typing import Any, Dict, List, Optional

from .base import BaseHttpException
from .codes import ErrorCode
from .logger import LoggerProtocol, create
from .response import ValidationErrorDetail

logger = create("common_exceptions", __file__)


class NotAuthenticatedException(BaseHttpException):
    """
    Exception for missing or invalid authentication credentials.

    HTTP Status: 401 Unauthorized
    Default Code: AUTH_NOT_AUTHENTICATED

    Use when:
    - No authentication token provided
    - Token format is invalid
    - Token signature verification fails
    """

    def __init__(
        self,
        message: str = "Authentication required",
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        super().__init__(
            code=ErrorCode.AUTH_NOT_AUTHENTICATED,
            message=message,
            status=401,
            details=details,
            request_id=request_id,
            custom_logger=custom_logger,
        )


class NotAuthorizedException(BaseHttpException):
    """
    Exception for valid authentication but insufficient permissions.

    HTTP Status: 403 Forbidden
    Default Code: AUTHZ_FORBIDDEN

    Use when:
    - User is authenticated but lacks required role/permission
    - Resource access is denied
    - Scope is insufficient
    """

    def __init__(
        self,
        message: str = "Access denied",
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        super().__init__(
            code=ErrorCode.AUTHZ_FORBIDDEN,
            message=message,
            status=403,
            details=details,
            request_id=request_id,
            custom_logger=custom_logger,
        )


class NotFoundException(BaseHttpException):
    """
    Exception for requested resource not found.

    HTTP Status: 404 Not Found
    Default Code: NOT_FOUND

    Use when:
    - Requested entity does not exist
    - Resource has been deleted
    - Invalid resource identifier
    """

    def __init__(
        self,
        message: str = "Resource not found",
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        super().__init__(
            code=ErrorCode.NOT_FOUND,
            message=message,
            status=404,
            details=details,
            request_id=request_id,
            custom_logger=custom_logger,
        )


class BadRequestException(BaseHttpException):
    """
    Exception for malformed request syntax.

    HTTP Status: 400 Bad Request
    Default Code: BAD_REQUEST

    Use when:
    - Request syntax is malformed
    - Invalid query parameters
    - Missing required parameters
    """

    def __init__(
        self,
        message: str = "Bad request",
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        super().__init__(
            code=ErrorCode.BAD_REQUEST,
            message=message,
            status=400,
            details=details,
            request_id=request_id,
            custom_logger=custom_logger,
        )


class ValidationException(BaseHttpException):
    """
    Exception for request body/params failing validation.

    HTTP Status: 422 Unprocessable Entity
    Default Code: VALIDATION_FAILED

    Use when:
    - Request body fails schema validation
    - Field constraints are violated
    - Data format is incorrect

    Attributes:
        errors: List of field-level validation errors
    """

    def __init__(
        self,
        message: str = "Validation failed",
        errors: Optional[List[ValidationErrorDetail]] = None,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        self.errors = errors or []

        # Build details with errors array
        full_details = details or {}
        if self.errors:
            full_details["errors"] = [
                err.model_dump(exclude_none=True) for err in self.errors
            ]

        super().__init__(
            code=ErrorCode.VALIDATION_FAILED,
            message=message,
            status=422,
            details=full_details if full_details else None,
            request_id=request_id,
            custom_logger=custom_logger,
        )

    @classmethod
    def from_field_errors(
        cls,
        field_errors: List[Dict[str, str]],
        message: str = "Validation failed",
        request_id: Optional[str] = None,
    ) -> "ValidationException":
        """
        Create ValidationException from a list of field error dicts.

        Args:
            field_errors: List of {"field": "...", "message": "..."}
            message: Optional custom message
            request_id: Optional correlation ID

        Returns:
            ValidationException with populated errors list
        """
        errors = [
            ValidationErrorDetail(
                field=err.get("field", "unknown"),
                message=err.get("message", "Invalid value"),
                code=err.get("code"),
            )
            for err in field_errors
        ]
        return cls(message=message, errors=errors, request_id=request_id)


class ConflictException(BaseHttpException):
    """
    Exception for resource state conflict.

    HTTP Status: 409 Conflict
    Default Code: CONFLICT

    Use when:
    - Resource already exists (duplicate)
    - Optimistic locking conflict
    - State prevents operation
    """

    def __init__(
        self,
        message: str = "Resource conflict",
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        super().__init__(
            code=ErrorCode.CONFLICT,
            message=message,
            status=409,
            details=details,
            request_id=request_id,
            custom_logger=custom_logger,
        )


class TooManyRequestsException(BaseHttpException):
    """
    Exception for rate limit exceeded.

    HTTP Status: 429 Too Many Requests
    Default Code: TOO_MANY_REQUESTS

    Use when:
    - Rate limit exceeded
    - Throttling applied
    - Quota exhausted

    Attributes:
        retry_after_ms: Suggested wait time in milliseconds before retry
    """

    def __init__(
        self,
        message: str = "Too many requests",
        retry_after_ms: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        custom_logger: Optional[LoggerProtocol] = None,
    ):
        self.retry_after_ms = retry_after_ms

        # Include retry info in details
        full_details = details or {}
        if retry_after_ms is not None:
            full_details["retryAfterMs"] = retry_after_ms

        super().__init__(
            code=ErrorCode.TOO_MANY_REQUESTS,
            message=message,
            status=429,
            details=full_details if full_details else None,
            request_id=request_id,
            custom_logger=custom_logger,
        )


logger.debug("Inbound exception classes initialized")
