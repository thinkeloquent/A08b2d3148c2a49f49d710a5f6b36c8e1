"""
Error response schema definitions for common_exceptions.

Provides Pydantic models for standardized error response envelope:
- ErrorResponse: Top-level envelope {"error": ErrorDetail}
- ErrorDetail: Error details {code, message, status, details?, requestId?, timestamp}
- ValidationErrorDetail: Field-level validation errors
- UpstreamErrorDetail: Upstream service error context
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field

from .codes import ErrorCode
from .logger import create

logger = create("common_exceptions", __file__)


class ValidationErrorDetail(BaseModel):
    """
    Detailed validation error structure.

    Attributes:
        field: Field path in dot notation (e.g., "body.user.email")
        message: Human-readable validation failure message
        code: Optional validation rule that failed
    """

    field: str = Field(..., description="Field path (e.g., 'body.user.email')")
    message: str = Field(..., description="Validation failure message")
    code: Optional[str] = Field(None, description="Validation rule that failed")

    model_config = {"extra": "allow"}


class UpstreamErrorDetail(BaseModel):
    """
    Details for upstream service errors.

    Attributes:
        service: Name of the upstream service
        operation: Optional operation being performed
        status_code: Optional upstream HTTP status code
        timeout_ms: Optional timeout duration in milliseconds
    """

    service: str = Field(..., description="Name of upstream service")
    operation: Optional[str] = Field(None, description="Operation being performed")
    status_code: Optional[int] = Field(None, description="Upstream HTTP status code")
    timeout_ms: Optional[int] = Field(None, description="Timeout duration in milliseconds")

    model_config = {"extra": "allow"}


class ErrorDetail(BaseModel):
    """
    Error detail structure.

    Attributes:
        code: Machine-readable error code (e.g., AUTH_NOT_AUTHENTICATED)
        message: Human-readable error message
        status: HTTP status code (400-599)
        details: Additional context (field errors, service info, etc.)
        request_id: Correlation ID for tracing
        timestamp: Error occurrence timestamp in ISO8601 format
    """

    code: str = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable error message")
    status: int = Field(..., ge=400, le=599, description="HTTP status code")
    details: Optional[Dict[str, Any]] = Field(
        None, description="Additional context"
    )
    request_id: Optional[str] = Field(
        None, alias="requestId", description="Correlation ID for tracing"
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat() + "Z",
        description="Error occurrence timestamp",
    )

    model_config = {
        "populate_by_name": True,
        "extra": "allow",
    }


class ErrorResponse(BaseModel):
    """
    Standardized error response envelope.

    This is the top-level structure returned by all exception handlers.

    Attributes:
        error: ErrorDetail object containing error information

    Example:
        {
            "error": {
                "code": "NOT_FOUND",
                "message": "User not found",
                "status": 404,
                "requestId": "req-123",
                "timestamp": "2026-01-19T10:00:00.000Z"
            }
        }
    """

    error: ErrorDetail = Field(..., description="Error detail object")

    model_config = {"extra": "forbid"}


def serialize_error_response(
    code: Union[ErrorCode, str],
    message: str,
    status: int,
    details: Optional[Dict[str, Any]] = None,
    request_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Serialize an error to the standardized response format.

    Args:
        code: Error code (ErrorCode enum or string)
        message: Human-readable message
        status: HTTP status code
        details: Optional additional context
        request_id: Optional correlation ID

    Returns:
        Dict matching ErrorResponse schema

    Example:
        response = serialize_error_response(
            ErrorCode.NOT_FOUND,
            "User not found",
            404,
            details={"userId": "123"},
            request_id="req-abc"
        )
    """
    code_str = code.value if isinstance(code, ErrorCode) else code

    error_detail = ErrorDetail(
        code=code_str,
        message=message,
        status=status,
        details=details,
        request_id=request_id,
    )

    response = ErrorResponse(error=error_detail)

    logger.debug(f"Serialized error response: {code_str} ({status})")

    # Convert to dict with camelCase for JSON serialization
    return response.model_dump(by_alias=True, exclude_none=True)


def create_validation_error_response(
    errors: List[ValidationErrorDetail],
    message: str = "Validation failed",
    request_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Create a validation error response with field-level errors.

    Args:
        errors: List of ValidationErrorDetail objects
        message: Optional custom message
        request_id: Optional correlation ID

    Returns:
        Dict matching ErrorResponse schema with validation details
    """
    details = {
        "errors": [err.model_dump(exclude_none=True) for err in errors]
    }

    return serialize_error_response(
        ErrorCode.VALIDATION_FAILED,
        message,
        422,
        details=details,
        request_id=request_id,
    )


logger.debug("Response schemas initialized")
