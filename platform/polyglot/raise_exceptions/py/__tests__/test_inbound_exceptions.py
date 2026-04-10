"""
Tests for inbound exception classes.

These tests cover client-facing exceptions raised when processing incoming requests:
- NotAuthenticatedException (401)
- NotAuthorizedException (403)
- NotFoundException (404)
- BadRequestException (400)
- ValidationException (422)
- ConflictException (409)
- TooManyRequestsException (429)
"""

import pytest

from common_exceptions import (
    BadRequestException,
    ConflictException,
    ErrorCode,
    NotAuthenticatedException,
    NotAuthorizedException,
    NotFoundException,
    TooManyRequestsException,
    ValidationException,
)


class TestNotAuthenticatedException:
    """Tests for NotAuthenticatedException (401)."""

    def test_default_message(self):
        """Should have default message."""
        exc = NotAuthenticatedException()
        assert exc.message == "Authentication required"
        assert exc.status == 401
        assert exc.code == ErrorCode.AUTH_NOT_AUTHENTICATED

    def test_custom_message(self):
        """Should accept custom message."""
        exc = NotAuthenticatedException(message="Token expired")
        assert exc.message == "Token expired"

    def test_with_details(self):
        """Should include details in response."""
        exc = NotAuthenticatedException(
            message="Invalid token",
            details={"reason": "expired", "expired_at": "2025-01-01"},
        )
        response = exc.to_response()
        assert response["error"]["details"]["reason"] == "expired"

    def test_with_request_id(self):
        """Should include request ID."""
        exc = NotAuthenticatedException(request_id="req-123")
        assert exc.request_id == "req-123"
        response = exc.to_response()
        assert response["error"]["requestId"] == "req-123"


class TestNotAuthorizedException:
    """Tests for NotAuthorizedException (403)."""

    def test_default_message(self):
        """Should have default message."""
        exc = NotAuthorizedException()
        assert exc.message == "Access denied"
        assert exc.status == 403
        assert exc.code == ErrorCode.AUTHZ_NOT_AUTHORIZED

    def test_permission_denied_scenario(self):
        """Should handle permission denied scenario."""
        exc = NotAuthorizedException(
            message="Insufficient permissions",
            details={"required": "admin", "actual": "viewer"},
        )
        response = exc.to_response()
        assert response["error"]["status"] == 403
        assert "admin" in str(response["error"]["details"])


class TestNotFoundException:
    """Tests for NotFoundException (404)."""

    def test_default_message(self):
        """Should have default message."""
        exc = NotFoundException()
        assert exc.message == "Resource not found"
        assert exc.status == 404
        assert exc.code == ErrorCode.NOT_FOUND

    def test_resource_details(self):
        """Should include resource details."""
        exc = NotFoundException(
            message="User not found",
            details={"userId": "user-123", "searchedIn": "users_table"},
        )
        response = exc.to_response()
        assert response["error"]["details"]["userId"] == "user-123"


class TestBadRequestException:
    """Tests for BadRequestException (400)."""

    def test_default_message(self):
        """Should have default message."""
        exc = BadRequestException()
        assert exc.message == "Bad request"
        assert exc.status == 400
        assert exc.code == ErrorCode.BAD_REQUEST

    def test_invalid_input_scenario(self):
        """Should handle invalid input scenario."""
        exc = BadRequestException(
            message="Invalid JSON payload",
            details={"expected": "object", "received": "array"},
        )
        assert exc.status == 400
        assert "Invalid JSON" in exc.message


class TestValidationException:
    """Tests for ValidationException (422)."""

    def test_default_message(self):
        """Should have default message."""
        exc = ValidationException()
        assert exc.message == "Validation failed"
        assert exc.status == 422
        assert exc.code == ErrorCode.VALIDATION_FAILED

    def test_from_field_errors(self):
        """Should create from field errors."""
        errors = [
            {"field": "email", "message": "Invalid email"},
            {"field": "age", "message": "Must be positive"},
        ]
        exc = ValidationException.from_field_errors(errors)

        assert len(exc.errors) == 2
        assert exc.errors[0]["field"] == "email"
        assert exc.errors[1]["field"] == "age"

    def test_errors_in_response(self):
        """Should include errors in response details."""
        errors = [{"field": "name", "message": "Required"}]
        exc = ValidationException.from_field_errors(errors)

        response = exc.to_response()
        assert "errors" in response["error"]["details"]
        assert len(response["error"]["details"]["errors"]) == 1

    def test_empty_errors_list(self):
        """Should handle empty errors list."""
        exc = ValidationException.from_field_errors([])
        assert exc.errors == []

    def test_with_error_codes(self):
        """Should include error codes in field errors."""
        errors = [
            {"field": "email", "message": "Invalid format", "code": "invalid_email"},
        ]
        exc = ValidationException.from_field_errors(errors)
        assert exc.errors[0]["code"] == "invalid_email"


class TestConflictException:
    """Tests for ConflictException (409)."""

    def test_default_message(self):
        """Should have default message."""
        exc = ConflictException()
        assert exc.message == "Resource conflict"
        assert exc.status == 409
        assert exc.code == ErrorCode.CONFLICT

    def test_duplicate_resource_scenario(self):
        """Should handle duplicate resource scenario."""
        exc = ConflictException(
            message="User with this email already exists",
            details={"email": "test@example.com", "existing_id": "user-456"},
        )
        response = exc.to_response()
        assert response["error"]["status"] == 409
        assert response["error"]["details"]["email"] == "test@example.com"


class TestTooManyRequestsException:
    """Tests for TooManyRequestsException (429)."""

    def test_default_message(self):
        """Should have default message."""
        exc = TooManyRequestsException()
        assert exc.message == "Too many requests"
        assert exc.status == 429
        assert exc.code == ErrorCode.TOO_MANY_REQUESTS

    def test_with_retry_after(self):
        """Should include retry-after in response."""
        exc = TooManyRequestsException(retry_after=60)
        assert exc.retry_after == 60

        response = exc.to_response()
        assert response["error"]["details"]["retryAfter"] == 60

    def test_rate_limit_details(self):
        """Should include rate limit details."""
        exc = TooManyRequestsException(
            message="Rate limit exceeded",
            retry_after=120,
            details={"limit": 100, "window": "1m", "current": 150},
        )
        response = exc.to_response()
        assert response["error"]["details"]["limit"] == 100
        assert response["error"]["details"]["retryAfter"] == 120


class TestExceptionSerialization:
    """Tests for exception serialization consistency."""

    @pytest.mark.parametrize(
        "exc_class,expected_status",
        [
            (NotAuthenticatedException, 401),
            (NotAuthorizedException, 403),
            (NotFoundException, 404),
            (BadRequestException, 400),
            (ValidationException, 422),
            (ConflictException, 409),
            (TooManyRequestsException, 429),
        ],
    )
    def test_status_codes(self, exc_class, expected_status):
        """Should have correct status codes."""
        exc = exc_class()
        assert exc.status == expected_status
        response = exc.to_response()
        assert response["error"]["status"] == expected_status

    def test_response_structure(self):
        """Should have consistent response structure."""
        exc = NotFoundException(message="Test", request_id="req-123")
        response = exc.to_response()

        assert "error" in response
        assert "code" in response["error"]
        assert "message" in response["error"]
        assert "status" in response["error"]
        assert "timestamp" in response["error"]
        assert "requestId" in response["error"]

    def test_log_entry_structure(self):
        """Should have consistent log entry structure."""
        exc = BadRequestException(message="Test error")
        log_entry = exc.to_log_entry()

        assert log_entry["level"] == "ERROR"
        assert log_entry["category"] == "exception"
        assert "error" in log_entry
        assert log_entry["error"]["type"] == "BadRequestException"
