"""
Unit tests for confluence_api.core.client module.

Tests cover:
- ConfluenceClient constructor and parameter storage
- Base URL normalization (strips trailing slash, appends /rest/api/)
- HTTP convenience methods (get, post, put, delete, patch) via mocked httpx.Client
- get_raw() returns raw httpx.Response
- close() delegates to httpx client close
- Context manager protocol (__enter__, __exit__)
- _extract_error_message() standalone function
- Error handling for non-2xx status codes (400, 401, 403, 404, 409, 429, 5xx)
- Rate limit auto-wait behavior
- Network and timeout exception translation
"""

from unittest.mock import MagicMock, patch

import httpx
import pytest

from confluence_api.core.client import ConfluenceClient, _extract_error_message
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
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_mock_response(status_code=200, json_data=None, content=b'{"ok": true}', headers=None):
    """Create a mock httpx.Response with sensible defaults."""
    resp = MagicMock(spec=httpx.Response)
    resp.status_code = status_code
    resp.json.return_value = json_data if json_data is not None else {"ok": True}
    resp.content = content
    resp.headers = headers or {}
    resp.raise_for_status.return_value = None
    return resp


def _build_client(mock_httpx_cls, base_url="https://confluence.example.com", **kwargs):
    """Construct a ConfluenceClient with the httpx.Client class patched out."""
    mock_http_instance = MagicMock()
    mock_httpx_cls.return_value = mock_http_instance
    client = ConfluenceClient(
        base_url=base_url,
        username="admin",
        api_token="secret-token",
        **kwargs,
    )
    return client, mock_http_instance


# ===========================================================================
# Constructor Tests
# ===========================================================================

class TestConfluenceClientConstructor:
    """Tests for ConfluenceClient.__init__."""

    @patch("confluence_api.core.client.httpx.Client")
    def test_stores_parameters(self, mock_httpx_cls):
        client, _ = _build_client(mock_httpx_cls)
        assert client.username == "admin"
        assert client.api_token == "secret-token"
        assert client.timeout == 30.0
        assert client.rate_limit_auto_wait is True
        assert client.max_retries == 3

    @patch("confluence_api.core.client.httpx.Client")
    def test_custom_timeout(self, mock_httpx_cls):
        client, _ = _build_client(mock_httpx_cls, timeout=60.0)
        assert client.timeout == 60.0

    @patch("confluence_api.core.client.httpx.Client")
    def test_custom_max_retries(self, mock_httpx_cls):
        client, _ = _build_client(mock_httpx_cls, max_retries=5)
        assert client.max_retries == 5

    @patch("confluence_api.core.client.httpx.Client")
    def test_rate_limit_auto_wait_disabled(self, mock_httpx_cls):
        client, _ = _build_client(mock_httpx_cls, rate_limit_auto_wait=False)
        assert client.rate_limit_auto_wait is False

    @patch("confluence_api.core.client.httpx.Client")
    def test_last_rate_limit_initially_none(self, mock_httpx_cls):
        client, _ = _build_client(mock_httpx_cls)
        assert client.last_rate_limit is None


class TestBaseUrlNormalization:
    """Tests for base_url -> self.base_url normalization."""

    @patch("confluence_api.core.client.httpx.Client")
    def test_appends_rest_api_path(self, mock_httpx_cls):
        client, _ = _build_client(mock_httpx_cls, base_url="https://confluence.test")
        assert client.base_url == "https://confluence.test/rest/api/"

    @patch("confluence_api.core.client.httpx.Client")
    def test_strips_trailing_slash(self, mock_httpx_cls):
        client, _ = _build_client(mock_httpx_cls, base_url="https://confluence.test/")
        assert client.base_url == "https://confluence.test/rest/api/"

    @patch("confluence_api.core.client.httpx.Client")
    def test_strips_multiple_trailing_slashes(self, mock_httpx_cls):
        client, _ = _build_client(mock_httpx_cls, base_url="https://confluence.test///")
        assert client.base_url == "https://confluence.test/rest/api/"

    @patch("confluence_api.core.client.httpx.Client")
    def test_with_subpath(self, mock_httpx_cls):
        client, _ = _build_client(mock_httpx_cls, base_url="https://host.com/wiki")
        assert client.base_url == "https://host.com/wiki/rest/api/"


class TestConfigurationValidation:
    """Tests for constructor validation errors."""

    @patch("confluence_api.core.client.httpx.Client")
    def test_empty_base_url_raises(self, mock_httpx_cls):
        with pytest.raises(ConfluenceConfigurationError, match="Base URL must start with"):
            ConfluenceClient("", "user", "token")

    @patch("confluence_api.core.client.httpx.Client")
    def test_invalid_scheme_raises(self, mock_httpx_cls):
        with pytest.raises(ConfluenceConfigurationError, match="Base URL must start with"):
            ConfluenceClient("ftp://host.com", "user", "token")

    @patch("confluence_api.core.client.httpx.Client")
    def test_empty_username_raises(self, mock_httpx_cls):
        with pytest.raises(ConfluenceConfigurationError, match="Username is required"):
            ConfluenceClient("https://host.com", "", "token")

    @patch("confluence_api.core.client.httpx.Client")
    def test_empty_api_token_raises(self, mock_httpx_cls):
        with pytest.raises(ConfluenceConfigurationError, match="API token is required"):
            ConfluenceClient("https://host.com", "user", "")


# ===========================================================================
# HTTP Method Tests
# ===========================================================================

class TestGetMethod:
    """Tests for ConfluenceClient.get()."""

    @patch("confluence_api.core.client.httpx.Client")
    def test_get_returns_json(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"id": "123", "title": "Page"})

        result = client.get("content/123")
        assert result == {"id": "123", "title": "Page"}

    @patch("confluence_api.core.client.httpx.Client")
    def test_get_passes_params(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"results": []})

        client.get("content", params={"expand": "body.storage", "limit": 10})
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"] == {"expand": "body.storage", "limit": 10}

    @patch("confluence_api.core.client.httpx.Client")
    def test_get_constructs_full_url(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls, base_url="https://conf.test")
        mock_http.request.return_value = _make_mock_response(200, {"id": "1"})

        client.get("content/1")
        call_kwargs = mock_http.request.call_args[1]
        assert "content/1" in call_kwargs["url"]


class TestPostMethod:
    """Tests for ConfluenceClient.post()."""

    @patch("confluence_api.core.client.httpx.Client")
    def test_post_with_json_body(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"id": "456"})

        body = {"type": "page", "title": "New Page"}
        result = client.post("content", json_data=body)
        assert result == {"id": "456"}
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["method"] == "POST"
        assert call_kwargs["json"] == body

    @patch("confluence_api.core.client.httpx.Client")
    def test_post_with_files(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"id": "789"})
        # Mock the headers attribute to behave like a real dict
        mock_http.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Atlassian-Token": "no-check",
        }

        files = {"file": ("test.txt", b"content", "text/plain")}
        result = client.post("content/123/child/attachment", files=files)
        assert result == {"id": "789"}
        call_kwargs = mock_http.request.call_args[1]
        assert "files" in call_kwargs
        # Content-Type should be removed for multipart
        assert "Content-Type" not in call_kwargs.get("headers", {})


class TestPutMethod:
    """Tests for ConfluenceClient.put()."""

    @patch("confluence_api.core.client.httpx.Client")
    def test_put_sends_json(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"id": "123", "version": {"number": 2}})

        body = {"title": "Updated", "version": {"number": 2}}
        result = client.put("content/123", json_data=body)
        assert result["version"]["number"] == 2
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["method"] == "PUT"


class TestDeleteMethod:
    """Tests for ConfluenceClient.delete()."""

    @patch("confluence_api.core.client.httpx.Client")
    def test_delete_returns_empty_on_204(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(204, content=b"")

        result = client.delete("content/123")
        assert result == {}

    @patch("confluence_api.core.client.httpx.Client")
    def test_delete_sends_method(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(204, content=b"")

        client.delete("content/999")
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["method"] == "DELETE"


class TestPatchMethod:
    """Tests for ConfluenceClient.patch()."""

    @patch("confluence_api.core.client.httpx.Client")
    def test_patch_sends_json(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"id": "123", "status": "current"})

        result = client.patch("content/123", json_data={"status": "current"})
        assert result["status"] == "current"
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["method"] == "PATCH"


# ===========================================================================
# get_raw() Tests
# ===========================================================================

class TestGetRawMethod:
    """Tests for ConfluenceClient.get_raw()."""

    @patch("confluence_api.core.client.httpx.Client")
    def test_returns_raw_response(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        raw_resp = _make_mock_response(200, content=b"\x89PNG binary data")
        mock_http.request.return_value = raw_resp

        result = client.get_raw("content/123/download")
        assert result is raw_resp

    @patch("confluence_api.core.client.httpx.Client")
    def test_get_raw_passes_params(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, content=b"data")

        client.get_raw("download", params={"version": "2"})
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"] == {"version": "2"}

    @patch("confluence_api.core.client.httpx.Client")
    def test_get_raw_raises_on_error_status(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        error_resp = _make_mock_response(404, json_data={"message": "Not found"})
        mock_http.request.return_value = error_resp

        with pytest.raises(ConfluenceNotFoundError):
            client.get_raw("content/nonexistent/download")

    @patch("confluence_api.core.client.httpx.Client")
    def test_get_raw_raises_on_timeout(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.side_effect = httpx.TimeoutException("timed out")

        with pytest.raises(ConfluenceTimeoutError):
            client.get_raw("content/123/download")

    @patch("confluence_api.core.client.httpx.Client")
    def test_get_raw_raises_on_network_error(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.side_effect = httpx.ConnectError("connection refused")

        with pytest.raises(ConfluenceNetworkError):
            client.get_raw("content/123/download")


# ===========================================================================
# Close & Context Manager Tests
# ===========================================================================

class TestCloseAndContextManager:
    """Tests for close() and context manager protocol."""

    @patch("confluence_api.core.client.httpx.Client")
    def test_close_calls_httpx_close(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        client.close()
        mock_http.close.assert_called_once()

    @patch("confluence_api.core.client.httpx.Client")
    def test_context_manager_enter_returns_self(self, mock_httpx_cls):
        client, _ = _build_client(mock_httpx_cls)
        result = client.__enter__()
        assert result is client

    @patch("confluence_api.core.client.httpx.Client")
    def test_context_manager_exit_calls_close(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        client.__enter__()
        client.__exit__(None, None, None)
        mock_http.close.assert_called_once()

    @patch("confluence_api.core.client.httpx.Client")
    def test_with_statement(self, mock_httpx_cls):
        mock_http = MagicMock()
        mock_httpx_cls.return_value = mock_http
        with ConfluenceClient("https://conf.test", "user", "tok") as c:
            assert isinstance(c, ConfluenceClient)
        mock_http.close.assert_called_once()


# ===========================================================================
# _extract_error_message Tests
# ===========================================================================

class TestExtractErrorMessage:
    """Tests for the _extract_error_message standalone function."""

    def test_none_body_returns_http_status(self):
        assert _extract_error_message(None, 500) == "HTTP 500"

    def test_empty_body_returns_http_status(self):
        assert _extract_error_message({}, 404) == "HTTP 404"

    def test_body_with_message_key(self):
        body = {"message": "Page not found"}
        assert _extract_error_message(body, 404) == "Page not found"

    def test_body_with_error_messages_array(self):
        body = {"errorMessages": ["Field required", "Invalid type"]}
        result = _extract_error_message(body, 400)
        assert "Field required" in result
        assert "Invalid type" in result

    def test_body_without_known_keys_returns_http_status(self):
        body = {"unexpected": "data"}
        assert _extract_error_message(body, 418) == "HTTP 418"

    def test_single_error_message(self):
        body = {"errorMessages": ["Only one error"]}
        assert _extract_error_message(body, 400) == "Only one error"


# ===========================================================================
# Error Handling Tests
# ===========================================================================

class TestErrorHandling:
    """Tests for HTTP error status code mapping to exceptions."""

    @patch("confluence_api.core.client.httpx.Client")
    def test_400_raises_validation_error(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(
            400, json_data={"message": "Bad request"}, content=b'{"message": "Bad request"}'
        )
        with pytest.raises(ConfluenceValidationError):
            client.get("content")

    @patch("confluence_api.core.client.httpx.Client")
    def test_401_raises_authentication_error(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(
            401, json_data={"message": "Unauthorized"}, content=b'{"message": "Unauthorized"}'
        )
        with pytest.raises(ConfluenceAuthenticationError):
            client.get("content")

    @patch("confluence_api.core.client.httpx.Client")
    def test_403_raises_permission_error(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(
            403, json_data={"message": "Forbidden"}, content=b'{"message": "Forbidden"}'
        )
        with pytest.raises(ConfluencePermissionError):
            client.get("content")

    @patch("confluence_api.core.client.httpx.Client")
    def test_404_raises_not_found_error(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(
            404, json_data={"message": "Not found"}, content=b'{"message": "Not found"}'
        )
        with pytest.raises(ConfluenceNotFoundError):
            client.get("content/999")

    @patch("confluence_api.core.client.httpx.Client")
    def test_409_raises_conflict_error(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(
            409, json_data={"message": "Version conflict"}, content=b'{"message": "Version conflict"}'
        )
        with pytest.raises(ConfluenceConflictError):
            client.put("content/123", json_data={"version": {"number": 1}})

    @patch("confluence_api.core.client.httpx.Client")
    @patch("confluence_api.core.client.time.sleep")
    def test_429_raises_rate_limit_when_auto_wait_disabled(self, mock_sleep, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls, rate_limit_auto_wait=False)
        mock_http.request.return_value = _make_mock_response(
            429,
            json_data={"message": "Rate limited"},
            content=b'{"message": "Rate limited"}',
            headers={"Retry-After": "10"},
        )
        with pytest.raises(ConfluenceRateLimitError) as exc_info:
            client.get("content")
        assert exc_info.value.retry_after == 10.0

    @patch("confluence_api.core.client.httpx.Client")
    @patch("confluence_api.core.client.time.sleep")
    def test_429_auto_waits_then_succeeds(self, mock_sleep, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls, rate_limit_auto_wait=True)
        rate_limited = _make_mock_response(
            429,
            json_data={"message": "Rate limited"},
            content=b'{"message": "Rate limited"}',
            headers={"Retry-After": "5"},
        )
        success = _make_mock_response(200, {"id": "123"})
        mock_http.request.side_effect = [rate_limited, success]

        result = client.get("content/123")
        assert result == {"id": "123"}
        mock_sleep.assert_called_once_with(5.0)

    @patch("confluence_api.core.client.httpx.Client")
    @patch("confluence_api.core.client.time.sleep")
    def test_429_stores_last_rate_limit_info(self, mock_sleep, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls, rate_limit_auto_wait=True)
        rate_limited = _make_mock_response(
            429,
            json_data={},
            content=b"{}",
            headers={"Retry-After": "3"},
        )
        success = _make_mock_response(200, {"ok": True})
        mock_http.request.side_effect = [rate_limited, success]

        client.get("content")
        assert client.last_rate_limit is not None
        assert client.last_rate_limit.retry_after == 3.0

    @patch("confluence_api.core.client.httpx.Client")
    @patch("confluence_api.core.client.time.sleep")
    def test_5xx_retries_then_raises_server_error(self, mock_sleep, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls, max_retries=2)
        error_resp = _make_mock_response(
            500, json_data={"message": "Internal error"}, content=b'{"message": "Internal error"}'
        )
        mock_http.request.return_value = error_resp

        with pytest.raises(ConfluenceServerError):
            client.get("content")
        # 1 initial + 2 retries = 3 total calls
        assert mock_http.request.call_count == 3

    @patch("confluence_api.core.client.httpx.Client")
    @patch("confluence_api.core.client.time.sleep")
    def test_5xx_retry_succeeds_on_second_attempt(self, mock_sleep, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls, max_retries=3)
        error_resp = _make_mock_response(
            502, json_data={"message": "Bad gateway"}, content=b'{"message": "Bad gateway"}'
        )
        success_resp = _make_mock_response(200, {"id": "1"})
        mock_http.request.side_effect = [error_resp, success_resp]

        result = client.get("content/1")
        assert result == {"id": "1"}

    @patch("confluence_api.core.client.httpx.Client")
    def test_unknown_4xx_raises_base_error(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(
            418, json_data={"message": "I'm a teapot"}, content=b'{"message": "I\'m a teapot"}'
        )
        with pytest.raises(ConfluenceAPIError) as exc_info:
            client.get("content")
        assert exc_info.value.status_code == 418


class TestNetworkExceptions:
    """Tests for network-level exception translation."""

    @patch("confluence_api.core.client.httpx.Client")
    def test_timeout_raises_confluence_timeout(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.side_effect = httpx.TimeoutException("connect timed out")

        with pytest.raises(ConfluenceTimeoutError):
            client.get("content")

    @patch("confluence_api.core.client.httpx.Client")
    def test_request_error_raises_network_error(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.side_effect = httpx.ConnectError("connection refused")

        with pytest.raises(ConfluenceNetworkError):
            client.get("content")

    @patch("confluence_api.core.client.httpx.Client")
    def test_200_with_empty_content_returns_empty_dict(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, content=b"")

        result = client.get("content")
        assert result == {}

    @patch("confluence_api.core.client.httpx.Client")
    def test_200_with_invalid_json_raises_api_error(self, mock_httpx_cls):
        client, mock_http = _build_client(mock_httpx_cls)
        resp = _make_mock_response(200, content=b"not json")
        resp.json.side_effect = ValueError("Invalid JSON")
        mock_http.request.return_value = resp

        with pytest.raises(ConfluenceAPIError, match="Failed to parse response JSON"):
            client.get("content")
