"""
Tests for SDK functions.

These tests cover the SDK functionality:
- Factory functions (create_exception, parse_error_response)
- CLI formatting (format_for_cli)
- Agent context (to_agent_context)
"""

from typing import Any

import pytest

from common_exceptions import (
    BadRequestException,
    BaseHttpException,
    ErrorCode,
    InternalServerException,
    NotFoundException,
    UpstreamServiceException,
    ValidationException,
    create_exception,
    format_for_cli,
    is_common_exception,
    parse_error_response,
    to_agent_context,
)


class TestCreateException:
    """Tests for create_exception factory function."""

    def test_create_from_error_code_enum(self):
        """Should create exception from ErrorCode enum."""
        exc = create_exception(
            code=ErrorCode.NOT_FOUND,
            message="Resource not found",
        )
        assert isinstance(exc, NotFoundException)
        assert exc.status == 404

    def test_create_from_string_code(self):
        """Should create exception from string code."""
        exc = create_exception(
            code="VALIDATION_FAILED",
            message="Invalid input",
        )
        assert isinstance(exc, ValidationException)
        assert exc.status == 422

    def test_create_with_details(self):
        """Should include details in created exception."""
        exc = create_exception(
            code=ErrorCode.BAD_REQUEST,
            message="Invalid format",
            details={"field": "email"},
        )
        assert exc.details == {"field": "email"}

    def test_create_with_request_id(self):
        """Should include request ID in created exception."""
        exc = create_exception(
            code=ErrorCode.NOT_FOUND,
            message="Not found",
            request_id="req-123",
        )
        assert exc.request_id == "req-123"

    @pytest.mark.parametrize(
        "code,expected_type",
        [
            (ErrorCode.AUTH_NOT_AUTHENTICATED, "NotAuthenticatedException"),
            (ErrorCode.AUTHZ_NOT_AUTHORIZED, "NotAuthorizedException"),
            (ErrorCode.NOT_FOUND, "NotFoundException"),
            (ErrorCode.BAD_REQUEST, "BadRequestException"),
            (ErrorCode.VALIDATION_FAILED, "ValidationException"),
            (ErrorCode.INTERNAL_SERVER_ERROR, "InternalServerException"),
            (ErrorCode.UPSTREAM_SERVICE_ERROR, "UpstreamServiceException"),
        ],
    )
    def test_create_correct_exception_type(self, code, expected_type):
        """Should create correct exception type for each code."""
        exc = create_exception(code=code, message="Test")
        assert type(exc).__name__ == expected_type

    def test_create_with_unknown_code(self):
        """Should create BaseHttpException for unknown codes."""
        exc = create_exception(
            code="UNKNOWN_CODE",
            message="Unknown error",
        )
        assert isinstance(exc, BaseHttpException)


class TestParseErrorResponse:
    """Tests for parse_error_response function."""

    def test_parse_valid_response(self):
        """Should parse valid error response."""
        response: dict[str, Any] = {
            "error": {
                "code": "NOT_FOUND",
                "message": "User not found",
                "status": 404,
                "timestamp": "2025-01-19T10:00:00Z",
            }
        }
        exc = parse_error_response(response)
        assert exc is not None
        assert isinstance(exc, NotFoundException)
        assert exc.message == "User not found"

    def test_parse_with_details(self):
        """Should include details from response."""
        response: dict[str, Any] = {
            "error": {
                "code": "BAD_REQUEST",
                "message": "Invalid input",
                "status": 400,
                "timestamp": "2025-01-19T10:00:00Z",
                "details": {"field": "email", "reason": "invalid format"},
            }
        }
        exc = parse_error_response(response)
        assert exc is not None
        assert exc.details["field"] == "email"

    def test_parse_with_request_id(self):
        """Should include request ID from response."""
        response: dict[str, Any] = {
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "Server error",
                "status": 500,
                "timestamp": "2025-01-19T10:00:00Z",
                "requestId": "req-abc-123",
            }
        }
        exc = parse_error_response(response)
        assert exc is not None
        assert exc.request_id == "req-abc-123"

    def test_parse_invalid_response_returns_none(self):
        """Should return None for invalid response."""
        invalid_responses = [
            {},
            {"error": {}},
            {"error": {"message": "test"}},  # missing code
            None,
        ]
        for response in invalid_responses:
            if response is not None:
                exc = parse_error_response(response)
                assert exc is None

    def test_parse_validation_errors(self):
        """Should parse validation error with field errors."""
        response: dict[str, Any] = {
            "error": {
                "code": "VALIDATION_FAILED",
                "message": "Validation failed",
                "status": 422,
                "timestamp": "2025-01-19T10:00:00Z",
                "details": {
                    "errors": [
                        {"field": "email", "message": "Invalid"},
                        {"field": "age", "message": "Required"},
                    ]
                },
            }
        }
        exc = parse_error_response(response)
        assert exc is not None
        assert isinstance(exc, ValidationException)


class TestIsCommonException:
    """Tests for is_common_exception function."""

    def test_returns_true_for_common_exceptions(self):
        """Should return True for common exceptions."""
        exceptions = [
            NotFoundException(),
            ValidationException(),
            InternalServerException(),
            UpstreamServiceException(),
        ]
        for exc in exceptions:
            assert is_common_exception(exc) is True

    def test_returns_false_for_other_exceptions(self):
        """Should return False for other exceptions."""
        other_exceptions = [
            ValueError("test"),
            TypeError("test"),
            Exception("test"),
        ]
        for exc in other_exceptions:
            assert is_common_exception(exc) is False

    def test_returns_false_for_non_exceptions(self):
        """Should return False for non-exception objects."""
        non_exceptions = [
            "string",
            123,
            {"error": "dict"},
            None,
        ]
        for obj in non_exceptions:
            assert is_common_exception(obj) is False


class TestFormatForCli:
    """Tests for format_for_cli function."""

    def test_basic_formatting(self):
        """Should format exception for CLI output."""
        exc = NotFoundException(message="User not found")
        output = format_for_cli(exc, use_colors=False)

        assert "NOT_FOUND" in output
        assert "User not found" in output
        assert "404" in output

    def test_formatting_with_details(self):
        """Should include details in CLI output."""
        exc = BadRequestException(
            message="Invalid input",
            details={"field": "email"},
        )
        output = format_for_cli(exc, use_colors=False)

        assert "email" in output

    def test_formatting_validation_errors(self):
        """Should format validation errors as list."""
        exc = ValidationException.from_field_errors([
            {"field": "email", "message": "Invalid format"},
            {"field": "name", "message": "Required"},
        ])
        output = format_for_cli(exc, use_colors=False)

        assert "email" in output
        assert "Invalid format" in output

    def test_formatting_with_request_id(self):
        """Should include request ID in output."""
        exc = InternalServerException(
            message="Server error",
            request_id="req-123-abc",
        )
        output = format_for_cli(exc, use_colors=False)

        assert "req-123-abc" in output


class TestToAgentContext:
    """Tests for to_agent_context function."""

    def test_basic_context(self):
        """Should return basic agent context."""
        exc = NotFoundException(message="User not found")
        context = to_agent_context(exc)

        assert context["error_type"] == "NotFoundException"
        assert context["error_code"] == "NOT_FOUND"
        assert context["http_status"] == 404
        assert context["message"] == "User not found"

    def test_client_error_flags(self):
        """Should set client error flags correctly."""
        exc = BadRequestException(message="Invalid input")
        context = to_agent_context(exc)

        assert context["is_client_error"] is True
        assert context["is_server_error"] is False

    def test_server_error_flags(self):
        """Should set server error flags correctly."""
        exc = InternalServerException(message="Server error")
        context = to_agent_context(exc)

        assert context["is_client_error"] is False
        assert context["is_server_error"] is True

    def test_retryable_flag_for_server_errors(self):
        """Server errors should be marked as retryable."""
        exc = UpstreamServiceException(message="Upstream error")
        context = to_agent_context(exc)

        assert context["is_retryable"] is True

    def test_retryable_flag_for_client_errors(self):
        """Client errors should not be retryable."""
        exc = BadRequestException(message="Bad request")
        context = to_agent_context(exc)

        assert context["is_retryable"] is False

    def test_suggested_action(self):
        """Should include suggested action."""
        exc = NotFoundException(message="User not found")
        context = to_agent_context(exc)

        assert "suggested_action" in context
        assert len(context["suggested_action"]) > 0

    def test_user_message(self):
        """Should include user-friendly message."""
        exc = InternalServerException(message="Database connection failed")
        context = to_agent_context(exc)

        assert "user_message" in context
        assert len(context["user_message"]) > 0

    def test_includes_details(self):
        """Should include exception details."""
        exc = NotFoundException(
            message="User not found",
            details={"userId": "user-123"},
        )
        context = to_agent_context(exc)

        assert context["details"]["userId"] == "user-123"

    def test_includes_request_id(self):
        """Should include request ID when present."""
        exc = BadRequestException(
            message="Invalid",
            request_id="req-xyz",
        )
        context = to_agent_context(exc)

        assert context["request_id"] == "req-xyz"
