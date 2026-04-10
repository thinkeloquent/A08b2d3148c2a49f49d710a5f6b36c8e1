"""
Unit tests for saucelabs_api.errors

Tests cover:
- Statement coverage for all error classes and factory
- Branch coverage for create_error_from_response status mapping
- Boundary value analysis
"""

import pytest

from saucelabs_api.errors import (
    SaucelabsAuthError,
    SaucelabsConfigError,
    SaucelabsError,
    SaucelabsNotFoundError,
    SaucelabsRateLimitError,
    SaucelabsServerError,
    SaucelabsValidationError,
    create_error_from_response,
)


class TestErrorHierarchy:
    """Tests for the error class hierarchy."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    def test_base_error(self):
        err = SaucelabsError("test", status_code=418)
        assert isinstance(err, Exception)
        assert err.status_code == 418
        assert str(err) == "test"

    def test_auth_error(self):
        err = SaucelabsAuthError("bad creds", status_code=401)
        assert isinstance(err, SaucelabsError)
        assert err.status_code == 401

    def test_not_found_error(self):
        err = SaucelabsNotFoundError("missing", status_code=404)
        assert isinstance(err, SaucelabsError)
        assert err.status_code == 404

    def test_rate_limit_error_has_retry_after(self):
        err = SaucelabsRateLimitError("limited", retry_after=30.0)
        assert err.retry_after == 30.0
        assert err.status_code == 429

    def test_validation_error(self):
        err = SaucelabsValidationError("invalid input", status_code=400)
        assert isinstance(err, SaucelabsError)
        assert err.status_code == 400

    def test_server_error(self):
        err = SaucelabsServerError("internal", status_code=500)
        assert isinstance(err, SaucelabsError)
        assert err.status_code == 500

    def test_config_error(self):
        err = SaucelabsConfigError("missing key")
        assert isinstance(err, SaucelabsError)
        assert err.status_code == 0

    # =================================================================
    # Branch Coverage
    # =================================================================

    def test_base_error_defaults(self):
        err = SaucelabsError("msg")
        assert err.status_code == 0

    def test_rate_limit_error_default_retry_after(self):
        err = SaucelabsRateLimitError("limited")
        assert err.retry_after == 1.0
        assert err.status_code == 429

    # =================================================================
    # Boundary Values
    # =================================================================

    def test_empty_message(self):
        err = SaucelabsError("")
        assert str(err) == ""

    def test_rate_limit_zero_retry(self):
        err = SaucelabsRateLimitError("limited", retry_after=0.0)
        assert err.retry_after == 0.0


class TestCreateErrorFromResponse:
    """Tests for create_error_from_response factory."""

    # =================================================================
    # Statement Coverage
    # =================================================================

    def test_maps_401(self):
        err = create_error_from_response(401, {"message": "Unauthorized"}, {})
        assert isinstance(err, SaucelabsAuthError)
        assert err.status_code == 401

    def test_maps_404(self):
        err = create_error_from_response(404, {"message": "Not found"}, {})
        assert isinstance(err, SaucelabsNotFoundError)

    def test_maps_429_with_retry_after(self):
        err = create_error_from_response(429, {"message": "Too many"}, {"retry-after": "30"})
        assert isinstance(err, SaucelabsRateLimitError)
        assert err.retry_after == 30.0

    def test_maps_400(self):
        err = create_error_from_response(400, {"message": "Bad request"}, {})
        assert isinstance(err, SaucelabsValidationError)

    def test_maps_422(self):
        err = create_error_from_response(422, {"message": "Unprocessable"}, {})
        assert isinstance(err, SaucelabsValidationError)

    def test_maps_500(self):
        err = create_error_from_response(500, {"message": "Internal error"}, {})
        assert isinstance(err, SaucelabsServerError)

    def test_maps_502(self):
        err = create_error_from_response(502, {"message": "Bad gateway"}, {})
        assert isinstance(err, SaucelabsServerError)

    def test_maps_unknown(self):
        err = create_error_from_response(418, {"message": "Teapot"}, {})
        assert isinstance(err, SaucelabsError)
        assert err.status_code == 418

    # =================================================================
    # Branch Coverage
    # =================================================================

    def test_extracts_message_from_body(self):
        err = create_error_from_response(400, {"message": "Bad input"}, {})
        assert "Bad input" in str(err)

    def test_extracts_error_from_body(self):
        err = create_error_from_response(400, {"error": "Validation failed"}, {})
        assert "Validation failed" in str(err)

    def test_handles_string_body(self):
        err = create_error_from_response(400, "raw text error", {})
        assert "raw text error" in str(err)

    def test_handles_empty_body(self):
        err = create_error_from_response(400, {}, {})
        assert "400" in str(err)

    def test_retry_after_case_insensitive(self):
        err = create_error_from_response(429, {"message": "limited"}, {"Retry-After": "45"})
        assert isinstance(err, SaucelabsRateLimitError)
        assert err.retry_after == 45.0

    def test_retry_after_missing_defaults_to_parse_default(self):
        err = create_error_from_response(429, {"message": "limited"}, {})
        assert err.retry_after == 1.0

    # =================================================================
    # Boundary Values
    # =================================================================

    def test_null_body(self):
        err = create_error_from_response(500, None, {})
        assert "500" in str(err)

    def test_status_499_not_server_error(self):
        err = create_error_from_response(499, {"message": "fail"}, {})
        assert isinstance(err, SaucelabsError)
        assert not isinstance(err, SaucelabsServerError)
