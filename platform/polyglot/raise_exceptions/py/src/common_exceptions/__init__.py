"""
Common Exceptions - Standardized exception handling for FastAPI and Fastify.

Provides a unified interface for raising, catching, and serializing exceptions
across Python (FastAPI/HTTPX) and Node.js (Fastify/Undici) applications.

Usage:
    from common_exceptions import (
        NotFoundException,
        ValidationException,
        register_exception_handlers,
    )

    # In FastAPI app
    from fastapi import FastAPI
    app = FastAPI()
    register_exception_handlers(app)

    # Raise exceptions
    raise NotFoundException("User not found", details={"userId": "123"})
"""

# Core
from .base import BaseHttpException
from .codes import ErrorCode, get_code_category, get_status_for_code

# FastAPI adapter
from .fastapi import (
    RequestIdMiddleware,
    register_exception_handlers,
)

# Inbound exceptions
from .inbound import (
    BadRequestException,
    ConflictException,
    NotAuthenticatedException,
    NotAuthorizedException,
    NotFoundException,
    TooManyRequestsException,
    ValidationException,
)

# Internal exceptions
from .internal import (
    BadGatewayException,
    InternalServerException,
    ServiceUnavailableException,
)
from .logger import create as create_logger

# Outbound exceptions
from .outbound import (
    ConnectTimeoutException,
    NetworkException,
    ReadTimeoutException,
    UpstreamServiceException,
    UpstreamTimeoutException,
    WriteTimeoutException,
)
from .response import (
    ErrorDetail,
    ErrorResponse,
    UpstreamErrorDetail,
    ValidationErrorDetail,
    create_validation_error_response,
    serialize_error_response,
)

# SDK
from .sdk import (
    AgentErrorContext,
    create_exception,
    format_for_cli,
    is_common_exception,
    parse_error_response,
    to_agent_context,
)

__version__ = "1.0.0"

__all__ = [
    # Version
    "__version__",
    # Logger
    "create_logger",
    # Codes
    "ErrorCode",
    "get_status_for_code",
    "get_code_category",
    # Response
    "ErrorResponse",
    "ErrorDetail",
    "ValidationErrorDetail",
    "UpstreamErrorDetail",
    "serialize_error_response",
    "create_validation_error_response",
    # Base
    "BaseHttpException",
    # Inbound
    "NotAuthenticatedException",
    "NotAuthorizedException",
    "NotFoundException",
    "BadRequestException",
    "ValidationException",
    "ConflictException",
    "TooManyRequestsException",
    # Outbound
    "ConnectTimeoutException",
    "ReadTimeoutException",
    "WriteTimeoutException",
    "NetworkException",
    "UpstreamServiceException",
    "UpstreamTimeoutException",
    # Internal
    "InternalServerException",
    "ServiceUnavailableException",
    "BadGatewayException",
    # FastAPI
    "register_exception_handlers",
    "RequestIdMiddleware",
    # SDK
    "create_exception",
    "parse_error_response",
    "is_common_exception",
    "format_for_cli",
    "to_agent_context",
    "AgentErrorContext",
]
