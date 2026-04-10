"""Unit tests for github_api.sdk.errors module.

Tests cover:
- Statement coverage for all error classes and map_response_to_error
- Branch coverage for all conditional paths
- Boundary value analysis
- Error handling verification
- Log verification
"""

from __future__ import annotations

from datetime import datetime, timezone

import pytest

from github_api.sdk.errors import (
    AuthError,
    ConflictError,
    ForbiddenError,
    GitHubError,
    NotFoundError,
    RateLimitError,
    ServerError,
    ValidationError,
    map_response_to_error,
)


class TestStatementCoverage:
    """Execute every code path for error classes and map_response_to_error."""

    # -- GitHubError base class --

    def test_github_error_stores_message(self) -> None:
        """GitHubError stores message attribute."""
        err = GitHubError("something went wrong")
        assert err.message == "something went wrong"

    def test_github_error_stores_status(self) -> None:
        """GitHubError stores status attribute."""
        err = GitHubError("fail", status=502)
        assert err.status == 502

    def test_github_error_stores_request_id(self) -> None:
        """GitHubError stores request_id attribute."""
        err = GitHubError("fail", request_id="REQ-1")
        assert err.request_id == "REQ-1"

    def test_github_error_stores_documentation_url(self) -> None:
        """GitHubError stores documentation_url attribute."""
        err = GitHubError("fail", documentation_url="https://docs.github.com")
        assert err.documentation_url == "https://docs.github.com"

    def test_github_error_response_body_default(self) -> None:
        """GitHubError defaults response_body to empty dict."""
        err = GitHubError("fail")
        assert err.response_body == {}

    def test_github_error_response_body_provided(self) -> None:
        """GitHubError stores provided response_body."""
        body = {"detail": "info"}
        err = GitHubError("fail", response_body=body)
        assert err.response_body == body

    # -- Subclass defaults --

    def test_auth_error_default_status(self) -> None:
        """AuthError defaults to status 401."""
        err = AuthError()
        assert err.status == 401
        assert err.message == "Authentication failed"

    def test_not_found_error_default_status(self) -> None:
        """NotFoundError defaults to status 404."""
        err = NotFoundError()
        assert err.status == 404
        assert err.message == "Resource not found"

    def test_validation_error_default_status(self) -> None:
        """ValidationError defaults to status 422."""
        err = ValidationError()
        assert err.status == 422
        assert err.message == "Validation failed"

    def test_rate_limit_error_default_status(self) -> None:
        """RateLimitError defaults to status 429."""
        err = RateLimitError()
        assert err.status == 429
        assert err.message == "Rate limit exceeded"

    def test_conflict_error_default_status(self) -> None:
        """ConflictError defaults to status 409."""
        err = ConflictError()
        assert err.status == 409
        assert err.message == "Conflict"

    def test_forbidden_error_default_status(self) -> None:
        """ForbiddenError defaults to status 403."""
        err = ForbiddenError()
        assert err.status == 403
        assert err.message == "Forbidden"

    def test_server_error_default_status(self) -> None:
        """ServerError defaults to status 502."""
        err = ServerError()
        assert err.status == 502
        assert err.message == "Server error"

    # -- to_dict --

    def test_github_error_to_dict_basic(self) -> None:
        """to_dict returns correct structure for GitHubError."""
        err = GitHubError("fail", status=500, request_id="R1", documentation_url="http://d")
        d = err.to_dict()
        assert d["error"] == "GitHubError"
        assert d["message"] == "fail"
        assert d["status"] == 500
        assert d["request_id"] == "R1"
        assert d["documentation_url"] == "http://d"

    def test_validation_error_to_dict_includes_errors(self) -> None:
        """ValidationError.to_dict includes errors list when present."""
        errs = [{"field": "name", "code": "missing"}]
        err = ValidationError("bad input", errors=errs)
        d = err.to_dict()
        assert d["errors"] == errs

    def test_rate_limit_error_to_dict_includes_reset_at(self) -> None:
        """RateLimitError.to_dict includes reset_at when present."""
        reset = datetime(2024, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
        err = RateLimitError(reset_at=reset)
        d = err.to_dict()
        assert d["reset_at"] == reset.isoformat()

    def test_rate_limit_error_to_dict_includes_retry_after(self) -> None:
        """RateLimitError.to_dict includes retry_after when present."""
        err = RateLimitError(retry_after=60)
        d = err.to_dict()
        assert d["retry_after"] == 60

    # -- __repr__ --

    def test_github_error_repr(self) -> None:
        """__repr__ returns expected format string."""
        err = GitHubError("oops", status=500, request_id="R1")
        r = repr(err)
        assert "GitHubError(" in r
        assert "message='oops'" in r
        assert "status=500" in r
        assert "request_id='R1'" in r

    def test_auth_error_repr(self) -> None:
        """AuthError __repr__ uses correct class name."""
        err = AuthError("bad token", request_id="R2")
        r = repr(err)
        assert "AuthError(" in r
        assert "message='bad token'" in r

    # -- map_response_to_error for each status --

    def test_map_401(self) -> None:
        """map_response_to_error 401 returns AuthError."""
        err = map_response_to_error(401, {"message": "Bad credentials"})
        assert isinstance(err, AuthError)
        assert err.status == 401

    def test_map_403_forbidden(self) -> None:
        """map_response_to_error 403 without rate limit headers returns ForbiddenError."""
        err = map_response_to_error(403, {"message": "Forbidden"}, {})
        assert isinstance(err, ForbiddenError)

    def test_map_404(self) -> None:
        """map_response_to_error 404 returns NotFoundError."""
        err = map_response_to_error(404, {"message": "Not Found"})
        assert isinstance(err, NotFoundError)

    def test_map_409(self) -> None:
        """map_response_to_error 409 returns ConflictError."""
        err = map_response_to_error(409, {"message": "Conflict"})
        assert isinstance(err, ConflictError)

    def test_map_422(self) -> None:
        """map_response_to_error 422 returns ValidationError with errors list."""
        body = {
            "message": "Validation Failed",
            "errors": [{"field": "title", "code": "missing_field"}],
        }
        err = map_response_to_error(422, body)
        assert isinstance(err, ValidationError)
        assert err.errors == body["errors"]

    def test_map_429(self) -> None:
        """map_response_to_error 429 returns RateLimitError."""
        err = map_response_to_error(429, {"message": "Rate limited"})
        assert isinstance(err, RateLimitError)

    def test_map_500(self) -> None:
        """map_response_to_error 500 returns ServerError."""
        err = map_response_to_error(500, {"message": "Internal Server Error"})
        assert isinstance(err, ServerError)
        assert err.status == 500

    def test_map_502(self) -> None:
        """map_response_to_error 502 returns ServerError with correct status."""
        err = map_response_to_error(502, {"message": "Bad Gateway"})
        assert isinstance(err, ServerError)
        assert err.status == 502

    def test_map_503(self) -> None:
        """map_response_to_error 503 returns ServerError with 503 status."""
        err = map_response_to_error(503, {"message": "Service Unavailable"})
        assert isinstance(err, ServerError)
        assert err.status == 503


class TestBranchCoverage:
    """Test all if/else branches in the errors module."""

    # -- map_response_to_error: 403 with x-ratelimit-remaining=0 --

    def test_map_403_rate_limit_remaining_zero(self) -> None:
        """403 with x-ratelimit-remaining=0 returns RateLimitError."""
        err = map_response_to_error(
            403,
            {"message": "rate limit"},
            {"x-ratelimit-remaining": "0"},
        )
        assert isinstance(err, RateLimitError)
        assert err.status == 403

    def test_map_403_retry_after_header(self) -> None:
        """403 with retry-after header returns RateLimitError."""
        err = map_response_to_error(
            403,
            {"message": "secondary rate limit"},
            {"retry-after": "120"},
        )
        assert isinstance(err, RateLimitError)
        assert err.retry_after == 120
        assert err.status == 403

    def test_map_403_without_rate_limit(self) -> None:
        """403 without rate limit indicators returns ForbiddenError."""
        err = map_response_to_error(
            403,
            {"message": "Forbidden"},
            {"x-ratelimit-remaining": "100"},
        )
        assert isinstance(err, ForbiddenError)

    def test_map_403_rate_limit_with_reset_header(self) -> None:
        """403 rate-limited with x-ratelimit-reset sets reset_at."""
        err = map_response_to_error(
            403,
            {"message": "rate limit"},
            {
                "x-ratelimit-remaining": "0",
                "x-ratelimit-reset": "1700000000",
            },
        )
        assert isinstance(err, RateLimitError)
        assert err.reset_at is not None
        assert err.reset_at == datetime.fromtimestamp(1700000000)

    def test_map_403_rate_limit_invalid_reset_timestamp(self) -> None:
        """403 with invalid reset timestamp handles ValueError gracefully."""
        err = map_response_to_error(
            403,
            {"message": "rate limit"},
            {
                "x-ratelimit-remaining": "0",
                "x-ratelimit-reset": "not_a_number",
            },
        )
        assert isinstance(err, RateLimitError)
        assert err.reset_at is None

    def test_map_403_rate_limit_invalid_retry_after(self) -> None:
        """403 with non-numeric retry-after handles ValueError gracefully."""
        err = map_response_to_error(
            403,
            {"message": "secondary"},
            {"retry-after": "invalid"},
        )
        assert isinstance(err, RateLimitError)
        assert err.retry_after is None

    # -- map_response_to_error: 429 with/without reset --

    def test_map_429_with_reset_header(self) -> None:
        """429 with x-ratelimit-reset parses reset_at."""
        err = map_response_to_error(
            429,
            {"message": "rate limited"},
            {
                "retry-after": "60",
                "x-ratelimit-reset": "1700000000",
            },
        )
        assert isinstance(err, RateLimitError)
        assert err.retry_after == 60
        assert err.reset_at == datetime.fromtimestamp(1700000000)

    def test_map_429_without_reset_header(self) -> None:
        """429 without x-ratelimit-reset leaves reset_at as None."""
        err = map_response_to_error(
            429,
            {"message": "rate limited"},
            {},
        )
        assert isinstance(err, RateLimitError)
        assert err.reset_at is None
        assert err.retry_after is None

    def test_map_429_invalid_reset(self) -> None:
        """429 with invalid x-ratelimit-reset leaves reset_at None."""
        err = map_response_to_error(
            429,
            {"message": "rate limited"},
            {"x-ratelimit-reset": "bad"},
        )
        assert isinstance(err, RateLimitError)
        assert err.reset_at is None

    def test_map_429_invalid_retry_after(self) -> None:
        """429 with non-numeric retry-after leaves retry_after as None."""
        err = map_response_to_error(
            429,
            {"message": "rate limited"},
            {"retry-after": "abc"},
        )
        assert isinstance(err, RateLimitError)
        assert err.retry_after is None

    # -- map_response_to_error: unknown status --

    def test_map_unknown_status_returns_github_error(self) -> None:
        """Unknown status codes return base GitHubError."""
        err = map_response_to_error(418, {"message": "I'm a teapot"})
        assert type(err) is GitHubError
        assert err.status == 418

    # -- to_dict with None fields omits them --

    def test_to_dict_omits_none_status(self) -> None:
        """to_dict omits status when None."""
        err = GitHubError("fail")
        d = err.to_dict()
        assert "status" not in d

    def test_to_dict_omits_none_request_id(self) -> None:
        """to_dict omits request_id when None."""
        err = GitHubError("fail", status=500)
        d = err.to_dict()
        assert "request_id" not in d

    def test_to_dict_omits_none_documentation_url(self) -> None:
        """to_dict omits documentation_url when None."""
        err = GitHubError("fail", status=500)
        d = err.to_dict()
        assert "documentation_url" not in d

    def test_to_dict_includes_all_when_present(self) -> None:
        """to_dict includes all fields when they are set."""
        err = GitHubError(
            "fail",
            status=500,
            request_id="R1",
            documentation_url="http://docs",
        )
        d = err.to_dict()
        assert d["status"] == 500
        assert d["request_id"] == "R1"
        assert d["documentation_url"] == "http://docs"

    def test_validation_error_to_dict_omits_empty_errors(self) -> None:
        """ValidationError.to_dict omits errors key when list is empty."""
        err = ValidationError("bad")
        d = err.to_dict()
        assert "errors" not in d

    def test_rate_limit_error_to_dict_omits_none_reset(self) -> None:
        """RateLimitError.to_dict omits reset_at when None."""
        err = RateLimitError()
        d = err.to_dict()
        assert "reset_at" not in d

    def test_rate_limit_error_to_dict_omits_none_retry_after(self) -> None:
        """RateLimitError.to_dict omits retry_after when None."""
        err = RateLimitError()
        d = err.to_dict()
        assert "retry_after" not in d

    # -- 403 remaining is not "0" and no retry-after → ForbiddenError --

    def test_map_403_remaining_nonzero_no_retry(self) -> None:
        """403 with remaining > 0 and no retry-after returns ForbiddenError."""
        err = map_response_to_error(
            403,
            {"message": "Forbidden"},
            {"x-ratelimit-remaining": "50"},
        )
        assert isinstance(err, ForbiddenError)


class TestBoundaryValues:
    """Edge cases: empty, None, max values."""

    def test_map_response_none_body(self) -> None:
        """map_response_to_error with None body uses empty dict."""
        err = map_response_to_error(404, None)
        assert isinstance(err, NotFoundError)
        assert "HTTP 404" in err.message

    def test_map_response_none_headers(self) -> None:
        """map_response_to_error with None headers uses empty dict."""
        err = map_response_to_error(401, {"message": "Bad"}, None)
        assert isinstance(err, AuthError)
        assert err.request_id is None

    def test_map_response_empty_body(self) -> None:
        """map_response_to_error with empty body dict uses fallback message."""
        err = map_response_to_error(404, {})
        assert isinstance(err, NotFoundError)
        assert "HTTP 404" in err.message

    def test_map_response_status_zero(self) -> None:
        """map_response_to_error with status 0 returns base GitHubError."""
        err = map_response_to_error(0, {"message": "weird"})
        assert type(err) is GitHubError
        assert err.status == 0

    def test_map_response_status_599(self) -> None:
        """map_response_to_error with status 599 returns ServerError."""
        err = map_response_to_error(599, {"message": "server fail"})
        assert isinstance(err, ServerError)
        assert err.status == 599

    def test_validation_error_empty_errors_list(self) -> None:
        """ValidationError with empty errors list stores empty list."""
        err = ValidationError("fail", errors=[])
        assert err.errors == []

    def test_validation_error_none_errors(self) -> None:
        """ValidationError with None errors defaults to empty list."""
        err = ValidationError("fail", errors=None)
        assert err.errors == []

    def test_rate_limit_error_both_fields_none(self) -> None:
        """RateLimitError with None reset_at and retry_after stores None."""
        err = RateLimitError(reset_at=None, retry_after=None)
        assert err.reset_at is None
        assert err.retry_after is None

    def test_map_422_no_errors_in_body(self) -> None:
        """422 with no errors key in body defaults to empty list."""
        err = map_response_to_error(422, {"message": "Validation Failed"})
        assert isinstance(err, ValidationError)
        assert err.errors == []

    def test_map_response_extracts_request_id(self) -> None:
        """map_response_to_error extracts x-github-request-id."""
        err = map_response_to_error(
            500,
            {"message": "fail"},
            {"x-github-request-id": "ABC-123"},
        )
        assert err.request_id == "ABC-123"

    def test_map_response_extracts_documentation_url(self) -> None:
        """map_response_to_error extracts documentation_url from body."""
        err = map_response_to_error(
            404,
            {"message": "Not Found", "documentation_url": "http://d"},
        )
        assert err.documentation_url == "http://d"


class TestErrorHandling:
    """Exception hierarchy and propagation tests."""

    def test_all_errors_are_subclass_of_exception(self) -> None:
        """All error classes are subclasses of Exception."""
        classes = [
            GitHubError, AuthError, NotFoundError, ValidationError,
            RateLimitError, ConflictError, ForbiddenError, ServerError,
        ]
        for cls in classes:
            assert issubclass(cls, Exception)

    def test_all_errors_are_subclass_of_github_error(self) -> None:
        """All concrete error classes inherit from GitHubError."""
        classes = [
            AuthError, NotFoundError, ValidationError,
            RateLimitError, ConflictError, ForbiddenError, ServerError,
        ]
        for cls in classes:
            assert issubclass(cls, GitHubError)

    def test_error_message_propagates_through_inheritance(self) -> None:
        """Error message is accessible via both .message and str()."""
        err = AuthError("token expired")
        assert err.message == "token expired"
        assert str(err) == "token expired"

    def test_github_error_can_be_caught_as_exception(self) -> None:
        """GitHubError instances can be caught as Exception."""
        with pytest.raises(Exception):
            raise GitHubError("boom")

    def test_auth_error_can_be_caught_as_github_error(self) -> None:
        """AuthError instances can be caught as GitHubError."""
        with pytest.raises(GitHubError):
            raise AuthError("bad creds")

    def test_rate_limit_error_preserves_custom_status(self) -> None:
        """RateLimitError can carry a custom status (e.g., 403)."""
        err = RateLimitError("limited", status=403)
        assert err.status == 403

    def test_server_error_preserves_custom_status(self) -> None:
        """ServerError can carry a custom status."""
        err = ServerError("fail", status=503)
        assert err.status == 503

    def test_auth_error_custom_message(self) -> None:
        """AuthError accepts a custom message."""
        err = AuthError("custom message")
        assert err.message == "custom message"

    def test_not_found_error_custom_message(self) -> None:
        """NotFoundError accepts a custom message."""
        err = NotFoundError("repo missing")
        assert err.message == "repo missing"

    def test_map_response_stores_response_body(self) -> None:
        """map_response_to_error stores the response body on the error."""
        body = {"message": "Not Found", "extra": "data"}
        err = map_response_to_error(404, body)
        assert err.response_body == body


class TestLogVerification:
    """Verify logging calls in the errors module.

    The errors module does not contain direct logging calls.
    These tests verify that error instances carry enough context
    for downstream loggers to produce meaningful output.
    """

    def test_error_repr_is_loggable(self) -> None:
        """Error repr string is suitable for logging output."""
        err = GitHubError("test msg", status=500, request_id="R1")
        r = repr(err)
        assert isinstance(r, str)
        assert len(r) > 0

    def test_error_to_dict_is_serializable(self) -> None:
        """Error to_dict produces a JSON-serializable dict for log payloads."""
        import json
        err = RateLimitError(
            "limited",
            reset_at=datetime(2024, 1, 1, tzinfo=timezone.utc),
            retry_after=60,
        )
        d = err.to_dict()
        serialized = json.dumps(d)
        assert isinstance(serialized, str)

    def test_validation_error_to_dict_serializable(self) -> None:
        """ValidationError to_dict is JSON-serializable for structured logging."""
        import json
        err = ValidationError(
            "bad input",
            errors=[{"field": "name", "code": "missing"}],
        )
        d = err.to_dict()
        serialized = json.dumps(d)
        assert isinstance(serialized, str)
