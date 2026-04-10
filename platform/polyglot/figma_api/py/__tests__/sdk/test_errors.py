"""Unit tests for figma_api.sdk.errors."""
import pytest

from figma_api.sdk.errors import (
    ApiError,
    AuthenticationError,
    AuthorizationError,
    ConfigurationError,
    FigmaError,
    NetworkError,
    NotFoundError,
    RateLimitError,
    ServerError,
    TimeoutError,
    ValidationError,
    map_response_to_error,
)


class TestFigmaError:
    class TestStatementCoverage:
        def test_defaults(self):
            err = FigmaError("test error")
            assert str(err) == "test error"
            assert err.status == 500
            assert err.code == "FIGMA_ERROR"
            assert err.name == "FigmaError"
            assert err.meta == {}
            assert err.request_id is None
            assert err.timestamp is not None

        def test_custom_options(self):
            err = FigmaError("custom", status=418, code="TEAPOT", meta={"x": 1}, request_id="r1")
            assert err.status == 418
            assert err.code == "TEAPOT"
            assert err.meta == {"x": 1}
            assert err.request_id == "r1"

        def test_to_dict(self):
            err = FigmaError("dict test")
            d = err.to_dict()
            assert d["error"] is True
            assert d["name"] == "FigmaError"
            assert d["message"] == "dict test"
            assert d["status"] == 500
            assert d["timestamp"] is not None


class TestErrorSubclasses:
    class TestStatementCoverage:
        def test_authentication_error(self):
            e = AuthenticationError()
            assert e.status == 401
            assert e.code == "AUTHENTICATION_ERROR"
            assert e.name == "AuthenticationError"

        def test_authorization_error(self):
            e = AuthorizationError()
            assert e.status == 403
            assert e.code == "AUTHORIZATION_ERROR"

        def test_not_found_error(self):
            e = NotFoundError()
            assert e.status == 404
            assert e.code == "NOT_FOUND"

        def test_validation_error(self):
            e = ValidationError()
            assert e.status == 422
            assert e.code == "VALIDATION_ERROR"

        def test_rate_limit_error(self):
            info = {"retry_after": 30}
            e = RateLimitError("limited", rate_limit_info=info)
            assert e.status == 429
            assert e.rate_limit_info == info

        def test_api_error_with_meta_status(self):
            e = ApiError("bad", meta={"status": 418})
            assert e.status == 418

        def test_api_error_default_status(self):
            e = ApiError()
            assert e.status == 400

        def test_server_error_with_meta_status(self):
            e = ServerError("down", meta={"status": 503})
            assert e.status == 503

        def test_server_error_default(self):
            e = ServerError()
            assert e.status == 500

        def test_network_error(self):
            e = NetworkError()
            assert e.status == 0
            assert e.code == "NETWORK_ERROR"

        def test_timeout_error(self):
            e = TimeoutError()
            assert e.status == 408
            assert e.code == "TIMEOUT_ERROR"

        def test_configuration_error(self):
            e = ConfigurationError()
            assert e.status == 0
            assert e.code == "CONFIGURATION_ERROR"

    class TestBranchCoverage:
        def test_all_inherit_from_figma_error(self):
            errors = [
                AuthenticationError(), AuthorizationError(), NotFoundError(),
                ValidationError(), RateLimitError(), ApiError(), ServerError(),
                NetworkError(), TimeoutError(), ConfigurationError(),
            ]
            for e in errors:
                assert isinstance(e, FigmaError)
                assert isinstance(e, Exception)


class TestMapResponseToError:
    class TestStatementCoverage:
        def test_401(self):
            err = map_response_to_error(401, {"message": "bad token"})
            assert isinstance(err, AuthenticationError)
            assert str(err) == "bad token"

        def test_403(self):
            err = map_response_to_error(403, {"message": "forbidden"})
            assert isinstance(err, AuthorizationError)

        def test_404(self):
            err = map_response_to_error(404, {"message": "not found"})
            assert isinstance(err, NotFoundError)

        def test_422(self):
            err = map_response_to_error(422, {"message": "invalid"})
            assert isinstance(err, ValidationError)

        def test_429_with_headers(self):
            headers = {
                "retry-after": "30",
                "x-figma-plan-tier": "pro",
                "x-figma-rate-limit-type": "files",
                "x-figma-upgrade-link": "https://figma.com/upgrade",
            }
            err = map_response_to_error(429, {"message": "rate limited"}, headers)
            assert isinstance(err, RateLimitError)
            assert err.rate_limit_info["retry_after"] == 30.0

        def test_500(self):
            err = map_response_to_error(500, {"message": "internal"})
            assert isinstance(err, ServerError)

        def test_502(self):
            err = map_response_to_error(502, {"message": "bad gateway"})
            assert isinstance(err, ServerError)

        def test_other_4xx(self):
            err = map_response_to_error(418, {"message": "teapot"})
            assert isinstance(err, ApiError)

    class TestBranchCoverage:
        def test_body_with_err_key(self):
            err = map_response_to_error(400, {"err": "oops"})
            assert str(err) == "oops"

        def test_string_body(self):
            err = map_response_to_error(400, "raw error")
            assert str(err) == "raw error"

        def test_none_body(self):
            err = map_response_to_error(400, None)
            assert str(err) == "HTTP 400"

        def test_empty_string_body(self):
            err = map_response_to_error(400, "")
            assert str(err) == "HTTP 400"

        def test_integer_body(self):
            err = map_response_to_error(400, 12345)
            assert str(err) == "HTTP 400"
