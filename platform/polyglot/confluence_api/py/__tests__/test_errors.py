"""Tests for the confluence_api exceptions module."""

import pytest

from confluence_api.exceptions import (
    ConfluenceAPIError,
    ConfluenceAuthenticationError,
    ConfluenceConfigurationError,
    ConfluenceConflictError,
    ConfluenceNetworkError,
    ConfluenceNotFoundError,
    ConfluencePermissionError,
    ConfluenceRateLimitError,
    ConfluenceServerError,
    ConfluenceTimeoutError,
    ConfluenceValidationError,
    SDKError,
    create_error_from_response,
)


class TestErrorHierarchy:
    """Tests for the exception class hierarchy."""

    def test_all_errors_inherit_from_base(self):
        """All Confluence error classes should inherit from ConfluenceAPIError."""
        assert issubclass(ConfluenceAuthenticationError, ConfluenceAPIError)
        assert issubclass(ConfluencePermissionError, ConfluenceAPIError)
        assert issubclass(ConfluenceNotFoundError, ConfluenceAPIError)
        assert issubclass(ConfluenceValidationError, ConfluenceAPIError)
        assert issubclass(ConfluenceConflictError, ConfluenceAPIError)
        assert issubclass(ConfluenceRateLimitError, ConfluenceAPIError)
        assert issubclass(ConfluenceServerError, ConfluenceAPIError)
        assert issubclass(ConfluenceNetworkError, ConfluenceAPIError)
        assert issubclass(ConfluenceTimeoutError, ConfluenceAPIError)
        assert issubclass(ConfluenceConfigurationError, ConfluenceAPIError)
        assert issubclass(SDKError, ConfluenceAPIError)

    def test_base_error_is_exception(self):
        """ConfluenceAPIError should inherit from Exception."""
        assert issubclass(ConfluenceAPIError, Exception)

    def test_base_error_default_message(self):
        """ConfluenceAPIError should have a default message."""
        err = ConfluenceAPIError()
        assert str(err) == "Confluence API error"
        assert err.status_code is None

    def test_error_with_custom_message(self):
        """Errors should accept custom messages."""
        err = ConfluenceNotFoundError("Page 12345 not found")
        assert str(err) == "Page 12345 not found"
        assert err.status_code == 404

    def test_error_stores_response_data(self):
        """Errors should store response data."""
        data = {"statusCode": 404, "message": "Not found"}
        err = ConfluenceNotFoundError("Not found", response_data=data)
        assert err.response_data == data

    def test_error_stores_url_and_method(self):
        """Errors should store the request URL and method."""
        err = ConfluenceAPIError(
            "test", status_code=500, url="/rest/api/content", method="GET"
        )
        assert err.url == "/rest/api/content"
        assert err.method == "GET"

    def test_error_to_dict(self):
        """Errors should serialize to a dictionary."""
        err = ConfluenceNotFoundError(
            "Page not found",
            response_data={"statusCode": 404},
            url="/rest/api/content/123",
            method="GET",
        )
        d = err.to_dict()
        assert d["name"] == "ConfluenceNotFoundError"
        assert d["message"] == "Page not found"
        assert d["status_code"] == 404
        assert d["url"] == "/rest/api/content/123"
        assert d["method"] == "GET"

    def test_error_repr(self):
        """Errors should have a useful repr."""
        err = ConfluenceAuthenticationError("Bad credentials")
        r = repr(err)
        assert "ConfluenceAuthenticationError" in r
        assert "Bad credentials" in r
        assert "401" in r


class TestDefaultStatusCodes:
    """Tests for default status codes on error subclasses."""

    def test_authentication_error_status(self):
        err = ConfluenceAuthenticationError()
        assert err.status_code == 401

    def test_permission_error_status(self):
        err = ConfluencePermissionError()
        assert err.status_code == 403

    def test_not_found_error_status(self):
        err = ConfluenceNotFoundError()
        assert err.status_code == 404

    def test_validation_error_status(self):
        err = ConfluenceValidationError()
        assert err.status_code == 400

    def test_conflict_error_status(self):
        err = ConfluenceConflictError()
        assert err.status_code == 409

    def test_rate_limit_error_status(self):
        err = ConfluenceRateLimitError()
        assert err.status_code == 429

    def test_server_error_status(self):
        err = ConfluenceServerError()
        assert err.status_code == 500

    def test_server_error_custom_status(self):
        err = ConfluenceServerError(status_code=502)
        assert err.status_code == 502

    def test_rate_limit_error_retry_after(self):
        err = ConfluenceRateLimitError(retry_after=30.0)
        assert err.retry_after == 30.0


class TestCreateErrorFromResponse:
    """Tests for the create_error_from_response factory function."""

    def test_400_returns_validation_error(self):
        err = create_error_from_response(400, {"message": "Invalid request"}, "/api/test", "POST")
        assert isinstance(err, ConfluenceValidationError)
        assert err.status_code == 400
        assert "Invalid request" in str(err)

    def test_401_returns_authentication_error(self):
        err = create_error_from_response(401, {"message": "Unauthorized"}, "/api/test", "GET")
        assert isinstance(err, ConfluenceAuthenticationError)
        assert err.status_code == 401

    def test_403_returns_permission_error(self):
        err = create_error_from_response(403, {"message": "Forbidden"}, "/api/test", "GET")
        assert isinstance(err, ConfluencePermissionError)
        assert err.status_code == 403

    def test_404_returns_not_found_error(self):
        err = create_error_from_response(404, {"message": "Not found"}, "/api/test", "GET")
        assert isinstance(err, ConfluenceNotFoundError)
        assert err.status_code == 404

    def test_409_returns_conflict_error(self):
        err = create_error_from_response(409, {"message": "Version conflict"}, "/api/test", "PUT")
        assert isinstance(err, ConfluenceConflictError)
        assert err.status_code == 409

    def test_429_returns_rate_limit_error(self):
        err = create_error_from_response(429, {"message": "Too many requests"}, "/api/test", "GET", retry_after=60.0)
        assert isinstance(err, ConfluenceRateLimitError)
        assert err.status_code == 429
        assert err.retry_after == 60.0

    def test_500_returns_server_error(self):
        err = create_error_from_response(500, {"message": "Internal error"}, "/api/test", "GET")
        assert isinstance(err, ConfluenceServerError)
        assert err.status_code == 500

    def test_502_returns_server_error(self):
        err = create_error_from_response(502, {"message": "Bad gateway"}, "/api/test", "GET")
        assert isinstance(err, ConfluenceServerError)
        assert err.status_code == 502

    def test_unknown_status_returns_base_error(self):
        err = create_error_from_response(418, {"message": "I'm a teapot"}, "/api/test", "GET")
        assert isinstance(err, ConfluenceAPIError)
        assert err.status_code == 418

    def test_none_body_uses_http_status_message(self):
        err = create_error_from_response(404, None, "/api/test", "GET")
        assert isinstance(err, ConfluenceNotFoundError)
        assert "HTTP 404" in str(err)

    def test_empty_body_uses_http_status_message(self):
        err = create_error_from_response(500, {}, "/api/test", "GET")
        assert isinstance(err, ConfluenceServerError)
        assert "HTTP 500" in str(err)

    def test_error_messages_array(self):
        body = {"errorMessages": ["Field A is required", "Field B is invalid"]}
        err = create_error_from_response(400, body, "/api/test", "POST")
        assert isinstance(err, ConfluenceValidationError)
        assert "Field A is required" in str(err)
        assert "Field B is invalid" in str(err)

    def test_stores_url_and_method(self):
        err = create_error_from_response(404, {"message": "Not found"}, "/rest/api/content/123", "DELETE")
        assert err.url == "/rest/api/content/123"
        assert err.method == "DELETE"
