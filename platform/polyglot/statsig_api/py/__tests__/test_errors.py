"""
Unit tests for statsig_client.errors.

Tests cover:
- Statement coverage for all error classes and factory function
- Decision/branch coverage for create_error_from_response mapping
- Boundary value analysis for _parse_retry_after and _safe_body
- Error handling for inheritance chain verification
"""

import pytest

from statsig_client.errors import (
    AuthenticationError,
    NotFoundError,
    RateLimitError,
    ServerError,
    StatsigError,
    ValidationError,
    _parse_retry_after,
    _safe_body,
    create_error_from_response,
)


class TestStatsigError:
    """Tests for the base StatsigError class."""

    class TestStatementCoverage:
        def test_create_with_message(self):
            err = StatsigError("test error")
            assert str(err) == "test error"
            assert err.status_code == 0
            assert err.response_body is None
            assert err.headers == {}

        def test_create_with_all_fields(self):
            err = StatsigError(
                "test",
                status_code=418,
                response_body={"detail": "teapot"},
                headers={"x-custom": "val"},
            )
            assert err.status_code == 418
            assert err.response_body == {"detail": "teapot"}
            assert err.headers == {"x-custom": "val"}

    class TestErrorHandling:
        def test_is_exception(self):
            assert issubclass(StatsigError, Exception)

        def test_can_be_raised_and_caught(self):
            with pytest.raises(StatsigError, match="boom"):
                raise StatsigError("boom", status_code=500)


class TestErrorSubclasses:
    """Tests for typed error subclasses."""

    class TestStatementCoverage:
        def test_authentication_error(self):
            err = AuthenticationError("bad key", status_code=401)
            assert err.status_code == 401
            assert isinstance(err, StatsigError)

        def test_not_found_error(self):
            err = NotFoundError("gone", status_code=404)
            assert err.status_code == 404
            assert isinstance(err, StatsigError)

        def test_rate_limit_error_default_retry_after(self):
            err = RateLimitError("slow down")
            assert err.status_code == 429
            assert err.retry_after == 1.0

        def test_rate_limit_error_custom_retry_after(self):
            err = RateLimitError("slow down", retry_after=30.0)
            assert err.retry_after == 30.0

        def test_validation_error(self):
            err = ValidationError("bad input", status_code=422)
            assert err.status_code == 422
            assert isinstance(err, StatsigError)

        def test_server_error(self):
            err = ServerError("oops", status_code=503)
            assert err.status_code == 503
            assert isinstance(err, StatsigError)


class TestCreateErrorFromResponse:
    """Tests for the create_error_from_response factory."""

    class TestDecisionBranchCoverage:
        def test_401_returns_authentication_error(self):
            err = create_error_from_response(401, {"message": "Unauthorized"}, {})
            assert isinstance(err, AuthenticationError)
            assert err.status_code == 401
            assert "401" in str(err)

        def test_404_returns_not_found_error(self):
            err = create_error_from_response(404, {"message": "Not found"}, {})
            assert isinstance(err, NotFoundError)
            assert err.status_code == 404

        def test_429_returns_rate_limit_error(self):
            err = create_error_from_response(
                429,
                {"message": "Too many requests"},
                {"retry-after": "5"},
            )
            assert isinstance(err, RateLimitError)
            assert err.retry_after == 5.0

        def test_429_with_retry_after_header_case(self):
            err = create_error_from_response(
                429, {}, {"Retry-After": "10"}
            )
            assert isinstance(err, RateLimitError)
            assert err.retry_after == 10.0

        def test_400_returns_validation_error(self):
            err = create_error_from_response(400, {"message": "Bad request"}, {})
            assert isinstance(err, ValidationError)
            assert err.status_code == 400

        def test_422_returns_validation_error(self):
            err = create_error_from_response(422, {"detail": "Invalid"}, {})
            assert isinstance(err, ValidationError)
            assert err.status_code == 422

        def test_500_returns_server_error(self):
            err = create_error_from_response(500, "Internal error", {})
            assert isinstance(err, ServerError)

        def test_502_returns_server_error(self):
            err = create_error_from_response(502, "Bad gateway", {})
            assert isinstance(err, ServerError)

        def test_unknown_status_returns_base_error(self):
            err = create_error_from_response(418, "I'm a teapot", {})
            assert type(err) is StatsigError
            assert err.status_code == 418


class TestParseRetryAfter:
    """Tests for _parse_retry_after helper."""

    class TestBoundaryValueAnalysis:
        def test_valid_numeric_string(self):
            assert _parse_retry_after({"retry-after": "5"}) == 5.0

        def test_float_string(self):
            assert _parse_retry_after({"Retry-After": "2.5"}) == 2.5

        def test_zero_returns_zero(self):
            assert _parse_retry_after({"retry-after": "0"}) == 0.0

        def test_negative_returns_zero(self):
            assert _parse_retry_after({"retry-after": "-1"}) == 0.0

        def test_empty_string_returns_default(self):
            assert _parse_retry_after({"retry-after": ""}) == 1.0

        def test_non_numeric_returns_default(self):
            assert _parse_retry_after({"retry-after": "abc"}) == 1.0

        def test_missing_header_returns_default(self):
            assert _parse_retry_after({}) == 1.0

        def test_case_insensitive_lookup(self):
            assert _parse_retry_after({"Retry-After": "7"}) == 7.0


class TestSafeBody:
    """Tests for _safe_body helper."""

    class TestBoundaryValueAnalysis:
        def test_dict_with_message(self):
            assert _safe_body({"message": "err"}) == "err"

        def test_dict_with_error(self):
            assert _safe_body({"error": "fail"}) == "fail"

        def test_dict_with_detail(self):
            assert _safe_body({"detail": "info"}) == "info"

        def test_dict_without_known_keys(self):
            result = _safe_body({"foo": "bar"})
            assert len(result) <= 200

        def test_short_string(self):
            assert _safe_body("short") == "short"

        def test_long_string_truncated(self):
            result = _safe_body("x" * 300)
            assert len(result) <= 200

        def test_none_body(self):
            result = _safe_body(None)
            assert len(result) <= 200
