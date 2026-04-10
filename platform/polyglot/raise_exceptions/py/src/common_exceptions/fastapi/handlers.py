"""
FastAPI exception handlers for common_exceptions.

Provides handlers for:
- BaseHttpException and subclasses
- RequestValidationError (Pydantic)
- HTTPException (Starlette)
- Generic Exception (catch-all)
"""

from typing import Optional

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from ..base import BaseHttpException
from ..codes import ErrorCode
from ..inbound import ValidationException
from ..internal import InternalServerException
from ..logger import LoggerProtocol, create
from ..response import serialize_error_response
from .normalizers import normalize_pydantic_errors

logger = create("common_exceptions", __file__)


def _get_request_id(request: Request) -> Optional[str]:
    """Extract request ID from request state or headers."""
    # Try request state first (set by middleware)
    if hasattr(request.state, "request_id"):
        return request.state.request_id

    # Fall back to header
    return request.headers.get("x-request-id")


async def base_http_exception_handler(
    request: Request,
    exc: BaseHttpException,
    custom_logger: Optional[LoggerProtocol] = None,
) -> JSONResponse:
    """
    Handler for BaseHttpException and all subclasses.

    Args:
        request: FastAPI request
        exc: BaseHttpException instance
        custom_logger: Optional custom logger

    Returns:
        JSONResponse with standardized error format
    """
    _logger = custom_logger or logger

    # Inject request ID if not set
    request_id = exc.request_id or _get_request_id(request)
    if request_id:
        exc.request_id = request_id

    _logger.debug(f"Handling {exc.code.value} for {request.url}")

    return JSONResponse(
        status_code=exc.status,
        content=exc.to_response(),
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
    custom_logger: Optional[LoggerProtocol] = None,
) -> JSONResponse:
    """
    Handler for FastAPI RequestValidationError (Pydantic).

    Normalizes Pydantic validation errors to common format.

    Args:
        request: FastAPI request
        exc: RequestValidationError instance
        custom_logger: Optional custom logger

    Returns:
        JSONResponse with standardized validation error format
    """
    _logger = custom_logger or logger

    request_id = _get_request_id(request)
    _logger.debug(f"Validation error for {request.url}: {len(exc.errors())} errors")

    # Normalize Pydantic errors
    normalized_errors = normalize_pydantic_errors(exc.errors())

    # Create ValidationException
    validation_exc = ValidationException.from_field_errors(
        normalized_errors,
        message="Validation failed",
        request_id=request_id,
    )

    return JSONResponse(
        status_code=422,
        content=validation_exc.to_response(),
    )


async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
    custom_logger: Optional[LoggerProtocol] = None,
) -> JSONResponse:
    """
    Handler for Starlette HTTPException.

    Maps Starlette exceptions to standardized error format.

    Args:
        request: FastAPI request
        exc: StarletteHTTPException instance
        custom_logger: Optional custom logger

    Returns:
        JSONResponse with standardized error format
    """
    _logger = custom_logger or logger

    request_id = _get_request_id(request)
    _logger.debug(f"HTTP exception for {request.url}: {exc.status_code}")

    # Map status code to error code
    status_to_code = {
        400: ErrorCode.BAD_REQUEST,
        401: ErrorCode.AUTH_NOT_AUTHENTICATED,
        403: ErrorCode.AUTHZ_FORBIDDEN,
        404: ErrorCode.NOT_FOUND,
        409: ErrorCode.CONFLICT,
        422: ErrorCode.VALIDATION_FAILED,
        429: ErrorCode.TOO_MANY_REQUESTS,
        500: ErrorCode.INTERNAL_SERVER_ERROR,
        502: ErrorCode.BAD_GATEWAY,
        503: ErrorCode.SERVICE_UNAVAILABLE,
        504: ErrorCode.UPSTREAM_TIMEOUT,
    }

    code = status_to_code.get(exc.status_code, ErrorCode.INTERNAL_SERVER_ERROR)
    message = exc.detail if isinstance(exc.detail, str) else str(exc.detail)

    response = serialize_error_response(
        code=code,
        message=message,
        status=exc.status_code,
        request_id=request_id,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=response,
    )


async def generic_exception_handler(
    request: Request,
    exc: Exception,
    custom_logger: Optional[LoggerProtocol] = None,
) -> JSONResponse:
    """
    Catch-all handler for unhandled exceptions.

    Wraps in InternalServerException to sanitize for client response.

    Args:
        request: FastAPI request
        exc: Any unhandled exception
        custom_logger: Optional custom logger

    Returns:
        JSONResponse with sanitized 500 error
    """
    _logger = custom_logger or logger

    request_id = _get_request_id(request)
    _logger.error(f"Unhandled exception for {request.url}: {type(exc).__name__}: {exc}")

    internal_exc = InternalServerException(
        message=str(exc),
        details={"exception_type": type(exc).__name__},
        request_id=request_id,
        custom_logger=_logger,
        expose_message=False,  # Never expose internal details
    )

    return JSONResponse(
        status_code=500,
        content=internal_exc.to_response(),
    )


def register_exception_handlers(
    app: FastAPI,
    custom_logger: Optional[LoggerProtocol] = None,
) -> None:
    """
    Register all exception handlers on a FastAPI app.

    Registers handlers for:
    - BaseHttpException (and all subclasses)
    - RequestValidationError
    - StarletteHTTPException
    - Exception (catch-all)

    Args:
        app: FastAPI application instance
        custom_logger: Optional custom logger for all handlers

    Example:
        app = FastAPI()
        register_exception_handlers(app)
    """
    _logger = custom_logger or logger
    _logger.info("Registering exception handlers")

    @app.exception_handler(BaseHttpException)
    async def _base_handler(request: Request, exc: BaseHttpException):
        return await base_http_exception_handler(request, exc, _logger)

    @app.exception_handler(RequestValidationError)
    async def _validation_handler(request: Request, exc: RequestValidationError):
        return await validation_exception_handler(request, exc, _logger)

    @app.exception_handler(StarletteHTTPException)
    async def _http_handler(request: Request, exc: StarletteHTTPException):
        return await http_exception_handler(request, exc, _logger)

    @app.exception_handler(Exception)
    async def _generic_handler(request: Request, exc: Exception):
        return await generic_exception_handler(request, exc, _logger)

    _logger.info("Exception handlers registered successfully")
