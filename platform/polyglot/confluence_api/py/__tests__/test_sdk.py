"""
Unit tests for confluence_api.sdk.client module.

Tests cover:
- ConfluenceSDKClient constructor and parameter storage
- close() method delegation
- Context manager protocol (__enter__, __exit__)
- Direct convenience methods: health_check, get_content, get_contents,
  create_content, update_content, delete_content, search_content,
  get_spaces, get_space, get_server_info
- Property accessors: content, space, search, user
- Proxy methods: content.get/list/create/update/delete,
  space.get/list, search.query, user.get_current/search
- Error handling for HTTP error responses
- SDK-specific error translation via SDKError
"""

from unittest.mock import MagicMock, patch

import httpx
import pytest

from confluence_api.exceptions import SDKError
from confluence_api.sdk.client import ConfluenceSDKClient

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_mock_response(status_code=200, json_data=None, content=b'{"ok": true}'):
    """Create a mock httpx.Response."""
    resp = MagicMock(spec=httpx.Response)
    resp.status_code = status_code
    resp.json.return_value = json_data if json_data is not None else {"ok": True}
    resp.content = content
    return resp


def _build_sdk(mock_httpx_cls, base_url="http://localhost:8000/api/", api_key=None):
    """Construct a ConfluenceSDKClient with httpx.Client patched."""
    mock_http_instance = MagicMock()
    mock_httpx_cls.return_value = mock_http_instance
    sdk = ConfluenceSDKClient(base_url=base_url, api_key=api_key)
    return sdk, mock_http_instance


# ===========================================================================
# Constructor Tests
# ===========================================================================

class TestSDKClientConstructor:
    """Tests for ConfluenceSDKClient.__init__."""

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_stores_base_url_with_trailing_slash(self, mock_httpx_cls):
        sdk, _ = _build_sdk(mock_httpx_cls, base_url="http://localhost:8000/api")
        assert sdk.base_url == "http://localhost:8000/api/"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_preserves_trailing_slash(self, mock_httpx_cls):
        sdk, _ = _build_sdk(mock_httpx_cls, base_url="http://localhost:8000/api/")
        assert sdk.base_url == "http://localhost:8000/api/"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_creates_httpx_client_with_api_key(self, mock_httpx_cls):
        sdk, _ = _build_sdk(mock_httpx_cls, api_key="my-secret-key")
        call_kwargs = mock_httpx_cls.call_args[1]
        assert call_kwargs["auth"] == ("my-secret-key", "")

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_creates_httpx_client_without_api_key(self, mock_httpx_cls):
        sdk, _ = _build_sdk(mock_httpx_cls, api_key=None)
        call_kwargs = mock_httpx_cls.call_args[1]
        assert call_kwargs["auth"] is None

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_default_timeout_30(self, mock_httpx_cls):
        sdk, _ = _build_sdk(mock_httpx_cls)
        call_kwargs = mock_httpx_cls.call_args[1]
        assert call_kwargs["timeout"] == 30.0


# ===========================================================================
# Close & Context Manager Tests
# ===========================================================================

class TestSDKCloseAndContextManager:
    """Tests for close() and context manager protocol."""

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_close_delegates_to_httpx(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        sdk.close()
        mock_http.close.assert_called_once()

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_context_manager_enter_returns_self(self, mock_httpx_cls):
        sdk, _ = _build_sdk(mock_httpx_cls)
        result = sdk.__enter__()
        assert result is sdk

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_context_manager_exit_calls_close(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        sdk.__enter__()
        sdk.__exit__(None, None, None)
        mock_http.close.assert_called_once()

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_with_statement(self, mock_httpx_cls):
        mock_http = MagicMock()
        mock_httpx_cls.return_value = mock_http
        with ConfluenceSDKClient("http://localhost:8000/api/") as s:
            assert isinstance(s, ConfluenceSDKClient)
        mock_http.close.assert_called_once()


# ===========================================================================
# Direct Convenience Method Tests
# ===========================================================================

class TestHealthCheck:
    """Tests for health_check()."""

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_health_check_returns_status(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"status": "ok"})
        result = sdk.health_check()
        assert result == {"status": "ok"}


class TestContentMethods:
    """Tests for content-related convenience methods."""

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_get_content(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"id": "123", "title": "Test"})
        result = sdk.get_content("123")
        assert result["id"] == "123"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_get_content_with_expand(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"id": "123", "body": {}})
        result = sdk.get_content("123", expand="body.storage")
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"]["expand"] == "body.storage"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_get_contents_default_params(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"results": [], "size": 0})
        result = sdk.get_contents()
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"]["start"] == 0
        assert call_kwargs["params"]["limit"] == 25

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_get_contents_with_filters(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"results": [{"id": "1"}], "size": 1})
        result = sdk.get_contents(type="page", space_key="DEV", title="My Page", start=10, limit=50)
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"]["type"] == "page"
        assert call_kwargs["params"]["spaceKey"] == "DEV"
        assert call_kwargs["params"]["title"] == "My Page"
        assert call_kwargs["params"]["start"] == 10
        assert call_kwargs["params"]["limit"] == 50

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_get_contents_with_expand(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"results": []})
        sdk.get_contents(expand="body.storage,version")
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"]["expand"] == "body.storage,version"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_create_content(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"id": "456", "title": "New"})
        data = {"type": "page", "title": "New", "space": {"key": "DEV"}}
        result = sdk.create_content(data)
        assert result["id"] == "456"
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["method"] == "POST"
        assert call_kwargs["json"] == data

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_update_content(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"id": "123", "version": {"number": 3}})
        data = {"version": {"number": 3}, "title": "Updated"}
        result = sdk.update_content("123", data)
        assert result["version"]["number"] == 3
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["method"] == "PUT"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_delete_content(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(204, content=b"")
        result = sdk.delete_content("123")
        assert result == {}
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["method"] == "DELETE"


class TestSearchMethod:
    """Tests for search_content()."""

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_search_basic(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"results": [{"title": "Found"}], "totalSize": 1})
        result = sdk.search_content('type = "page"')
        assert len(result["results"]) == 1
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"]["cql"] == 'type = "page"'

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_search_with_params(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"results": []})
        sdk.search_content('space = "DEV"', limit=50, start=10, expand="content.body")
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"]["limit"] == 50
        assert call_kwargs["params"]["start"] == 10
        assert call_kwargs["params"]["expand"] == "content.body"


class TestSpaceMethods:
    """Tests for space-related convenience methods."""

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_get_spaces(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"results": [{"key": "DEV"}], "size": 1})
        result = sdk.get_spaces()
        assert len(result["results"]) == 1

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_get_spaces_with_expand(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"results": []})
        sdk.get_spaces(expand="description.plain")
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"]["expand"] == "description.plain"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_get_space(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"key": "DEV", "name": "Development"})
        result = sdk.get_space("DEV")
        assert result["key"] == "DEV"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_get_space_with_expand(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"key": "DEV"})
        sdk.get_space("DEV", expand="homepage")
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"]["expand"] == "homepage"


class TestServerInfoMethod:
    """Tests for get_server_info()."""

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_get_server_info(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(
            200, {"baseUrl": "https://conf.test", "version": "9.2.3"}
        )
        result = sdk.get_server_info()
        assert result["version"] == "9.2.3"


# ===========================================================================
# Property Proxy Tests
# ===========================================================================

class TestContentProxy:
    """Tests for sdk.content property proxy methods."""

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_content_get(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"id": "100"})
        result = sdk.content.get("100")
        assert result["id"] == "100"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_content_get_with_expand(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"id": "100", "body": {}})
        result = sdk.content.get("100", expand="body.storage")
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"]["expand"] == "body.storage"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_content_list(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"results": [{"id": "1"}, {"id": "2"}]})
        result = sdk.content.list(type="page", space_key="DEV")
        assert len(result["results"]) == 2

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_content_create(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"id": "new-1"})
        data = {"type": "page", "title": "Test"}
        result = sdk.content.create(data)
        assert result["id"] == "new-1"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_content_update(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"id": "100", "title": "Updated"})
        result = sdk.content.update("100", {"title": "Updated"})
        assert result["title"] == "Updated"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_content_delete(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(204, content=b"")
        result = sdk.content.delete("100")
        assert result == {}


class TestSpaceProxy:
    """Tests for sdk.space property proxy methods."""

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_space_get(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"key": "DEV", "name": "Development"})
        result = sdk.space.get("DEV")
        assert result["key"] == "DEV"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_space_get_with_expand(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"key": "DEV"})
        sdk.space.get("DEV", expand="homepage")
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"]["expand"] == "homepage"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_space_list(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"results": [{"key": "A"}, {"key": "B"}]})
        result = sdk.space.list()
        assert len(result["results"]) == 2

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_space_list_with_params(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"results": []})
        sdk.space.list(limit=10, start=5)
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"]["limit"] == 10
        assert call_kwargs["params"]["start"] == 5


class TestSearchProxy:
    """Tests for sdk.search property proxy methods."""

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_search_query(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"results": [{"title": "Hit"}]})
        result = sdk.search.query('type = "page"')
        assert len(result["results"]) == 1

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_search_query_with_params(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"results": []})
        sdk.search.query('space = "DEV"', limit=100, start=50)
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"]["limit"] == 100
        assert call_kwargs["params"]["start"] == 50


class TestUserProxy:
    """Tests for sdk.user property proxy methods."""

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_user_get_current(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"displayName": "Admin", "type": "known"})
        result = sdk.user.get_current()
        assert result["displayName"] == "Admin"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_user_get_current_with_expand(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"displayName": "Admin"})
        sdk.user.get_current(expand="personalSpace")
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"]["expand"] == "personalSpace"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_user_search_by_username(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"displayName": "JDoe"})
        result = sdk.user.search(username="jdoe")
        assert result["displayName"] == "JDoe"
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"]["username"] == "jdoe"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_user_search_by_key(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {"displayName": "JDoe"})
        result = sdk.user.search(key="user-key-abc")
        call_kwargs = mock_http.request.call_args[1]
        assert call_kwargs["params"]["key"] == "user-key-abc"

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_user_search_no_params(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(200, {})
        sdk.user.search()
        call_kwargs = mock_http.request.call_args[1]
        # When no username or key provided, params should be None
        assert call_kwargs["params"] is None


# ===========================================================================
# Error Handling Tests
# ===========================================================================

class TestSDKErrorHandling:
    """Tests for SDK error translation."""

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_http_error_with_detail(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(
            404, json_data={"detail": "Content not found"}, content=b'{"detail": "Content not found"}'
        )
        with pytest.raises(SDKError) as exc_info:
            sdk.get_content("999")
        assert "Content not found" in str(exc_info.value)
        assert exc_info.value.status_code == 404

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_http_error_with_message(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.return_value = _make_mock_response(
            500, json_data={"message": "Server failure"}, content=b'{"message": "Server failure"}'
        )
        with pytest.raises(SDKError) as exc_info:
            sdk.get_server_info()
        assert "Server failure" in str(exc_info.value)

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_http_error_with_unparseable_json(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        resp = _make_mock_response(500, content=b"not json")
        resp.json.side_effect = ValueError("bad json")
        mock_http.request.return_value = resp
        with pytest.raises(SDKError) as exc_info:
            sdk.get_content("1")
        assert "HTTP 500" in str(exc_info.value)

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_network_error_raises_sdk_error(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        mock_http.request.side_effect = httpx.ConnectError("refused")
        with pytest.raises(SDKError, match="Request failed"):
            sdk.health_check()

    @patch("confluence_api.sdk.client.httpx.Client")
    def test_error_stores_response_data(self, mock_httpx_cls):
        sdk, mock_http = _build_sdk(mock_httpx_cls)
        error_data = {"detail": "Forbidden", "code": "PERM_DENIED"}
        mock_http.request.return_value = _make_mock_response(
            403, json_data=error_data, content=b'{"detail": "Forbidden"}'
        )
        with pytest.raises(SDKError) as exc_info:
            sdk.get_space("PRIVATE")
        assert exc_info.value.response_data == error_data
