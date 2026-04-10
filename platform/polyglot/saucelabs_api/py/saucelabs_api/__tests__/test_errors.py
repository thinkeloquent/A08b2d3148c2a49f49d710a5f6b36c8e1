"""Tests for the Sauce Labs API error hierarchy."""

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
    def test_base_error(self):
        err = SaucelabsError("test", status_code=418)
        assert isinstance(err, Exception)
        assert err.status_code == 418
        assert str(err) == "test"

    def test_auth_error(self):
        err = SaucelabsAuthError("bad creds", status_code=401)
        assert isinstance(err, SaucelabsError)

    def test_rate_limit_error_has_retry_after(self):
        err = SaucelabsRateLimitError("limited", retry_after=30.0)
        assert err.retry_after == 30.0
        assert err.status_code == 429

    def test_config_error(self):
        err = SaucelabsConfigError("missing key")
        assert isinstance(err, SaucelabsError)
        assert err.status_code == 0


class TestCreateErrorFromResponse:
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

    def test_maps_500(self):
        err = create_error_from_response(500, {"message": "Internal error"}, {})
        assert isinstance(err, SaucelabsServerError)

    def test_maps_unknown(self):
        err = create_error_from_response(418, {"message": "Teapot"}, {})
        assert isinstance(err, SaucelabsError)
        assert err.status_code == 418
