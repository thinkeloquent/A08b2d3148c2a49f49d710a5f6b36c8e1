#!/usr/bin/env python3
"""
Common Exceptions - Basic Usage Examples (Python)

This script demonstrates the core features of the common_exceptions package:
- Creating and raising exceptions
- Serializing exceptions to API responses
- Using the SDK for CLI and agent integration
- Logging with the built-in logger

Run with: python basic_usage.py
"""

import os
import sys
from typing import Any

# Ensure package is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from common_exceptions import (
    BadRequestException,
    # Base exception
    BaseHttpException,
    ConflictException,
    # Outbound exceptions
    ConnectTimeoutException,
    # Error codes
    ErrorCode,
    # Internal exceptions
    InternalServerException,
    NetworkException,
    NotAuthenticatedException,
    NotAuthorizedException,
    # Inbound exceptions
    NotFoundException,
    TooManyRequestsException,
    UpstreamServiceException,
    ValidationException,
    # SDK
    create_exception,
    # Logger
    create_logger,
    format_for_cli,
    get_status_for_code,
    is_common_exception,
    parse_error_response,
    to_agent_context,
)

# Create logger for this module
logger = create_logger("examples", __file__)


# =============================================================================
# Example 1: Basic Exception Creation
# =============================================================================
def example1_basic_exception_creation() -> None:
    """
    Demonstrates creating basic HTTP exceptions with different error codes.
    Each exception automatically derives its HTTP status from the error code.
    """
    logger.info("Example 1: Basic Exception Creation")

    # NotFoundException (404)
    not_found = NotFoundException(
        message="User not found",
        details={"userId": "user-123"},
        request_id="req-abc-123",
    )
    print(f"  NotFoundException: status={not_found.status}, code={not_found.code}")

    # BadRequestException (400)
    bad_request = BadRequestException(
        message="Invalid input provided",
        details={"field": "email", "reason": "invalid format"},
    )
    print(f"  BadRequestException: status={bad_request.status}, code={bad_request.code}")

    # NotAuthenticatedException (401)
    not_auth = NotAuthenticatedException(message="Token expired")
    print(f"  NotAuthenticatedException: status={not_auth.status}")

    # NotAuthorizedException (403)
    forbidden = NotAuthorizedException(
        message="Insufficient permissions",
        details={"required_role": "admin", "user_role": "viewer"},
    )
    print(f"  NotAuthorizedException: status={forbidden.status}")

    print()


# =============================================================================
# Example 2: Validation Errors
# =============================================================================
def example2_validation_errors() -> None:
    """
    Demonstrates creating validation exceptions with field-level errors.
    Useful for form validation and input validation in API endpoints.
    """
    logger.info("Example 2: Validation Errors")

    # Create validation exception with field errors
    errors = [
        {"field": "body.email", "message": "Invalid email format", "code": "invalid_email"},
        {"field": "body.age", "message": "Must be a positive number", "code": "min_value"},
        {"field": "body.name", "message": "Required field", "code": "required"},
    ]

    validation_exc = ValidationException.from_field_errors(
        errors=errors,
        message="Validation failed for 3 fields",
        request_id="req-validation-001",
    )

    print(f"  ValidationException: status={validation_exc.status}")
    print(f"  Error count: {len(validation_exc.errors)}")
    for error in validation_exc.errors:
        print(f"    - {error['field']}: {error['message']}")

    print()


# =============================================================================
# Example 3: Exception Serialization
# =============================================================================
def example3_exception_serialization() -> None:
    """
    Demonstrates serializing exceptions to standard API response format.
    The toResponse() method produces a consistent JSON structure.
    """
    logger.info("Example 3: Exception Serialization")

    exc = NotFoundException(
        message="Product not found",
        details={"productId": "prod-456", "catalog": "electronics"},
        request_id="req-serialize-001",
    )

    # Serialize to response format
    response = exc.to_response()

    print("  Serialized response:")
    print(f"    code: {response['error']['code']}")
    print(f"    message: {response['error']['message']}")
    print(f"    status: {response['error']['status']}")
    print(f"    details: {response['error']['details']}")
    print(f"    requestId: {response['error']['requestId']}")
    print(f"    timestamp: {response['error']['timestamp']}")

    print()


# =============================================================================
# Example 4: Log Entry Generation
# =============================================================================
def example4_log_entry_generation() -> None:
    """
    Demonstrates generating structured log entries from exceptions.
    Useful for observability and debugging in production systems.
    """
    logger.info("Example 4: Log Entry Generation")

    exc = InternalServerException(
        message="Database connection failed",
        details={"database": "users_db", "host": "db.example.com"},
        request_id="req-log-001",
    )

    # Generate log entry
    log_entry = exc.to_log_entry()

    print("  Log entry:")
    print(f"    level: {log_entry['level']}")
    print(f"    category: {log_entry['category']}")
    print(f"    message: {log_entry['message']}")
    print(f"    error.type: {log_entry['error']['type']}")
    print(f"    error.code: {log_entry['error']['code']}")
    print(f"    error.status: {log_entry['error']['status']}")

    print()


# =============================================================================
# Example 5: SDK Factory Functions
# =============================================================================
def example5_sdk_factory() -> None:
    """
    Demonstrates using SDK factory functions to create exceptions dynamically.
    Useful for parsing error responses from upstream services.
    """
    logger.info("Example 5: SDK Factory Functions")

    # Create exception from error code
    exc1 = create_exception(
        code=ErrorCode.NOT_FOUND,
        message="Resource not found",
        details={"resource": "user"},
    )
    print(f"  Created from code: {type(exc1).__name__} (status={exc1.status})")

    # Create exception from string code
    exc2 = create_exception(
        code="VALIDATION_FAILED",
        message="Invalid input",
    )
    print(f"  Created from string: {type(exc2).__name__} (status={exc2.status})")

    # Parse error response from JSON
    error_json: dict[str, Any] = {
        "error": {
            "code": "AUTH_NOT_AUTHENTICATED",
            "message": "Token expired",
            "status": 401,
            "timestamp": "2025-01-19T10:00:00Z",
        }
    }

    exc3 = parse_error_response(error_json)
    if exc3:
        print(f"  Parsed from JSON: {type(exc3).__name__}")

    # Check if exception is a common exception
    print(f"  is_common_exception(exc1): {is_common_exception(exc1)}")
    print(f"  is_common_exception(ValueError()): {is_common_exception(ValueError())}")

    print()


# =============================================================================
# Example 6: CLI Formatting
# =============================================================================
def example6_cli_formatting() -> None:
    """
    Demonstrates formatting exceptions for CLI output.
    Provides color-coded, human-readable error messages.
    """
    logger.info("Example 6: CLI Formatting")

    exc = ValidationException.from_field_errors(
        errors=[
            {"field": "config.port", "message": "Must be between 1 and 65535"},
            {"field": "config.host", "message": "Invalid hostname"},
        ],
        message="Configuration validation failed",
    )

    # Format for CLI
    cli_output = format_for_cli(exc, use_colors=False)

    print("  CLI Output:")
    print(cli_output)

    print()


# =============================================================================
# Example 7: Agent Context
# =============================================================================
def example7_agent_context() -> None:
    """
    Demonstrates converting exceptions to agent-friendly context.
    Useful for LLM agents that need to understand and handle errors.
    """
    logger.info("Example 7: Agent Context")

    exc = UpstreamServiceException(
        message="Payment service returned error",
        service="payment-api",
        operation="charge",
        upstream_status=500,
        details={"transaction_id": "txn-789"},
    )

    # Convert to agent context
    context = to_agent_context(exc)

    print("  Agent Context:")
    print(f"    error_type: {context['error_type']}")
    print(f"    is_retryable: {context['is_retryable']}")
    print(f"    is_client_error: {context['is_client_error']}")
    print(f"    is_server_error: {context['is_server_error']}")
    print(f"    suggested_action: {context['suggested_action']}")
    print(f"    user_message: {context['user_message']}")

    print()


# =============================================================================
# Example 8: Outbound Exceptions
# =============================================================================
def example8_outbound_exceptions() -> None:
    """
    Demonstrates outbound exceptions for HTTP client errors.
    These are used when calling upstream services via HTTPX.
    """
    logger.info("Example 8: Outbound Exceptions")

    # Connection timeout
    timeout_exc = ConnectTimeoutException(
        message="Connection to payment service timed out",
        service="payment-api",
        timeout_ms=5000,
    )
    print(f"  ConnectTimeoutException: status={timeout_exc.status}")

    # Network error
    network_exc = NetworkException(
        message="DNS resolution failed",
        service="inventory-api",
        details={"hostname": "inventory.internal"},
    )
    print(f"  NetworkException: status={network_exc.status}")

    # Upstream service error
    upstream_exc = UpstreamServiceException(
        message="Inventory service returned 503",
        service="inventory-api",
        operation="get_stock",
        upstream_status=503,
    )
    print(f"  UpstreamServiceException: status={upstream_exc.status}")

    print()


# =============================================================================
# Example 9: Error Code Utilities
# =============================================================================
def example9_error_code_utilities() -> None:
    """
    Demonstrates error code utility functions.
    """
    logger.info("Example 9: Error Code Utilities")

    # Get status for code
    codes = [
        ErrorCode.NOT_FOUND,
        ErrorCode.BAD_REQUEST,
        ErrorCode.AUTH_NOT_AUTHENTICATED,
        ErrorCode.INTERNAL_SERVER_ERROR,
        ErrorCode.UPSTREAM_SERVICE_ERROR,
    ]

    print("  Error code to HTTP status mapping:")
    for code in codes:
        status = get_status_for_code(code)
        print(f"    {code.value} -> {status}")

    print()


# =============================================================================
# Example 10: Rate Limiting
# =============================================================================
def example10_rate_limiting() -> None:
    """
    Demonstrates rate limiting exception with retry-after support.
    """
    logger.info("Example 10: Rate Limiting")

    exc = TooManyRequestsException(
        message="Rate limit exceeded",
        retry_after=60,
        details={"limit": 100, "window": "1m", "current": 105},
    )

    print(f"  TooManyRequestsException: status={exc.status}")
    print(f"  retry_after: {exc.retry_after} seconds")

    response = exc.to_response()
    print(f"  Response details: {response['error']['details']}")

    print()


# =============================================================================
# Main Runner
# =============================================================================
def main() -> None:
    """Run all examples sequentially."""
    print("=" * 70)
    print("Common Exceptions - Python Basic Usage Examples")
    print("=" * 70)
    print()

    # Set debug logging for examples
    os.environ.setdefault("LOG_LEVEL", "info")

    examples = [
        example1_basic_exception_creation,
        example2_validation_errors,
        example3_exception_serialization,
        example4_log_entry_generation,
        example5_sdk_factory,
        example6_cli_formatting,
        example7_agent_context,
        example8_outbound_exceptions,
        example9_error_code_utilities,
        example10_rate_limiting,
    ]

    for example_fn in examples:
        try:
            example_fn()
        except Exception as e:
            logger.error(f"Example failed: {e}")
            print(f"  ERROR: {e}")
            print()

    print("=" * 70)
    print("All examples completed!")
    print("=" * 70)


if __name__ == "__main__":
    main()
