"""Tests for base exception class."""

import pytest

from common_exceptions import (
    BaseHttpException,
    ErrorCode,
    NotFoundException,
    ValidationException,
)
from common_exceptions.response import ValidationErrorDetail


class TestBaseHttpException:
    """Tests for BaseHttpException."""

    def test_instantiation_with_defaults(self):
        """Test exception instantiation with default values."""
        exc = BaseHttpException(
            code=ErrorCode.NOT_FOUND,
            message="Resource not found",
        )

        assert exc.code == ErrorCode.NOT_FOUND
        assert exc.message == "Resource not found"
        assert exc.status == 404  # Derived from code
        assert exc.details == {}
        assert exc.request_id is None
        assert exc.timestamp is not None

    def test_instantiation_with_all_params(self):
        """Test exception instantiation with all parameters."""
        exc = BaseHttpException(
            code=ErrorCode.BAD_REQUEST,
            message="Invalid input",
            status=400,
            details={"field": "email"},
            request_id="req-123",
        )

        assert exc.code == ErrorCode.BAD_REQUEST
        assert exc.status == 400
        assert exc.details == {"field": "email"}
        assert exc.request_id == "req-123"

    def test_to_response(self):
        """Test to_response() returns correct format."""
        exc = BaseHttpException(
            code=ErrorCode.NOT_FOUND,
            message="User not found",
            details={"userId": "123"},
            request_id="req-abc",
        )

        response = exc.to_response()

        assert "error" in response
        error = response["error"]
        assert error["code"] == "NOT_FOUND"
        assert error["message"] == "User not found"
        assert error["status"] == 404
        assert error["details"] == {"userId": "123"}
        assert error["requestId"] == "req-abc"
        assert "timestamp" in error

    def test_to_log_entry(self):
        """Test to_log_entry() returns correct format."""
        exc = BaseHttpException(
            code=ErrorCode.INTERNAL_SERVER_ERROR,
            message="Something broke",
        )

        entry = exc.to_log_entry()

        assert entry["level"] == "ERROR"
        assert entry["category"] == "exception"
        assert entry["message"] == "Something broke"
        assert entry["error"]["type"] == "BaseHttpException"
        assert entry["error"]["code"] == "INTERNAL_SERVER_ERROR"

    def test_string_code_conversion(self):
        """Test string code is converted to ErrorCode."""
        exc = BaseHttpException(
            code="NOT_FOUND",
            message="Not found",
        )

        assert exc.code == ErrorCode.NOT_FOUND
        assert exc.status == 404


class TestNotFoundException:
    """Tests for NotFoundException."""

    def test_defaults(self):
        """Test default values."""
        exc = NotFoundException()

        assert exc.code == ErrorCode.NOT_FOUND
        assert exc.message == "Resource not found"
        assert exc.status == 404

    def test_custom_message(self):
        """Test custom message override."""
        exc = NotFoundException(message="User not found")

        assert exc.message == "User not found"


class TestValidationException:
    """Tests for ValidationException."""

    def test_with_errors(self):
        """Test with validation errors."""
        errors = [
            ValidationErrorDetail(field="email", message="Invalid email"),
            ValidationErrorDetail(field="age", message="Must be positive"),
        ]

        exc = ValidationException(errors=errors)

        assert exc.code == ErrorCode.VALIDATION_FAILED
        assert exc.status == 422
        assert len(exc.errors) == 2
        assert exc.details["errors"][0]["field"] == "email"

    def test_from_field_errors(self):
        """Test from_field_errors factory method."""
        field_errors = [
            {"field": "name", "message": "Required"},
            {"field": "email", "message": "Invalid format"},
        ]

        exc = ValidationException.from_field_errors(field_errors)

        assert len(exc.errors) == 2
        assert exc.errors[0].field == "name"
