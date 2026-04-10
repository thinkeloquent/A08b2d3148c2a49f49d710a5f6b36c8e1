"""Unit tests for jira_api.exceptions."""

import pytest

from jira_api.exceptions import (
    JiraAPIError,
    JiraAuthenticationError,
    JiraConfigurationError,
    JiraNetworkError,
    JiraNotFoundError,
    JiraPermissionError,
    JiraRateLimitError,
    JiraServerError,
    JiraTimeoutError,
    JiraValidationError,
    SDKError,
    create_error_from_response,
)


class TestJiraAPIError:
    class TestStatementCoverage:
        def test_defaults(self):
            err = JiraAPIError()
            assert str(err) == "Jira API error"
            assert err.status_code is None
            assert err.response_data == {}
            assert err.url is None
            assert err.method is None

        def test_custom_options(self):
            err = JiraAPIError(
                "custom error", status_code=418,
                response_data={"x": 1}, url="/test", method="GET",
            )
            assert err.message == "custom error"
            assert err.status_code == 418
            assert err.response_data == {"x": 1}
            assert err.url == "/test"
            assert err.method == "GET"

        def test_to_dict(self):
            err = JiraAPIError("dict test", status_code=400)
            d = err.to_dict()
            assert d["name"] == "JiraAPIError"
            assert d["message"] == "dict test"
            assert d["status_code"] == 400

        def test_repr(self):
            err = JiraAPIError("repr test", status_code=500)
            assert "JiraAPIError" in repr(err)
            assert "500" in repr(err)


class TestErrorSubclasses:
    class TestStatementCoverage:
        def test_authentication_error(self):
            e = JiraAuthenticationError()
            assert e.status_code == 401
            assert "Authentication failed" in str(e)

        def test_permission_error(self):
            e = JiraPermissionError()
            assert e.status_code == 403

        def test_not_found_error(self):
            e = JiraNotFoundError()
            assert e.status_code == 404

        def test_validation_error(self):
            e = JiraValidationError()
            assert e.status_code == 400

        def test_rate_limit_error(self):
            e = JiraRateLimitError(retry_after=30.0)
            assert e.status_code == 429
            assert e.retry_after == 30.0

        def test_server_error(self):
            e = JiraServerError()
            assert e.status_code == 500

        def test_server_error_custom_status(self):
            e = JiraServerError(status_code=503)
            assert e.status_code == 503

        def test_network_error(self):
            e = JiraNetworkError()
            assert e.status_code is None
            assert "Network error" in str(e)

        def test_timeout_error(self):
            e = JiraTimeoutError()
            assert "timed out" in str(e)

        def test_configuration_error(self):
            e = JiraConfigurationError()
            assert "Configuration error" in str(e)

        def test_sdk_error(self):
            e = SDKError("sdk fail")
            assert str(e) == "sdk fail"

    class TestBranchCoverage:
        def test_all_inherit_from_jira_api_error(self):
            errors = [
                JiraAuthenticationError(), JiraPermissionError(),
                JiraNotFoundError(), JiraValidationError(),
                JiraRateLimitError(), JiraServerError(),
                JiraNetworkError(), JiraTimeoutError(),
                JiraConfigurationError(), SDKError(),
            ]
            for e in errors:
                assert isinstance(e, JiraAPIError)
                assert isinstance(e, Exception)


class TestCreateErrorFromResponse:
    class TestStatementCoverage:
        def test_400(self):
            err = create_error_from_response(400, {"message": "bad"})
            assert isinstance(err, JiraValidationError)
            assert str(err) == "bad"

        def test_401(self):
            err = create_error_from_response(401, {"message": "unauthorized"})
            assert isinstance(err, JiraAuthenticationError)

        def test_403(self):
            err = create_error_from_response(403, {"message": "forbidden"})
            assert isinstance(err, JiraPermissionError)

        def test_404(self):
            err = create_error_from_response(404, {"message": "not found"})
            assert isinstance(err, JiraNotFoundError)

        def test_429(self):
            err = create_error_from_response(429, {"message": "rate limited"}, retry_after=60.0)
            assert isinstance(err, JiraRateLimitError)
            assert err.retry_after == 60.0

        def test_500(self):
            err = create_error_from_response(500, {"message": "server error"})
            assert isinstance(err, JiraServerError)

        def test_502(self):
            err = create_error_from_response(502, {"message": "bad gateway"})
            assert isinstance(err, JiraServerError)

    class TestBranchCoverage:
        def test_error_messages_list(self):
            err = create_error_from_response(400, {"errorMessages": ["a", "b"]})
            assert "a; b" in str(err)

        def test_none_body(self):
            err = create_error_from_response(400, None)
            assert "HTTP 400" in str(err)

        def test_empty_body(self):
            err = create_error_from_response(400, {})
            assert "HTTP 400" in str(err)

        def test_other_4xx(self):
            err = create_error_from_response(418, {"message": "teapot"})
            assert isinstance(err, JiraAPIError)
            assert err.status_code == 418
