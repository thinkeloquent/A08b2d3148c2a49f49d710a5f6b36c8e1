"""
Unit tests for confluence_api.pagination module.

Tests cover:
- build_expand() joins field names with commas
- _extract_cursor() extracts cursor parameter from URL query strings
- paginate_offset() async generator for offset-based pagination
- paginate_cursor() async generator for cursor-based pagination
"""

from unittest.mock import MagicMock

import pytest

from confluence_api.pagination import (
    _extract_cursor,
    build_expand,
    paginate_cursor,
    paginate_offset,
)

# ===========================================================================
# build_expand Tests
# ===========================================================================

class TestBuildExpand:
    """Tests for the build_expand utility function."""

    def test_single_field(self):
        assert build_expand(["body.storage"]) == "body.storage"

    def test_multiple_fields(self):
        result = build_expand(["body.storage", "version", "ancestors"])
        assert result == "body.storage,version,ancestors"

    def test_empty_list(self):
        assert build_expand([]) == ""

    def test_preserves_dotted_fields(self):
        result = build_expand(["body.view", "space.homepage", "metadata.labels"])
        assert result == "body.view,space.homepage,metadata.labels"

    def test_single_element_no_comma(self):
        result = build_expand(["version"])
        assert "," not in result


# ===========================================================================
# _extract_cursor Tests
# ===========================================================================

class TestExtractCursor:
    """Tests for _extract_cursor URL parsing."""

    def test_extracts_cursor_from_full_url(self):
        url = "/rest/api/content/scan?cursor=abc123&limit=25"
        assert _extract_cursor(url) == "abc123"

    def test_extracts_cursor_from_absolute_url(self):
        url = "https://conf.test/rest/api/content/scan?cursor=xyz789&limit=25"
        assert _extract_cursor(url) == "xyz789"

    def test_returns_none_when_no_cursor(self):
        url = "/rest/api/content/scan?limit=25"
        assert _extract_cursor(url) is None

    def test_returns_none_for_empty_string(self):
        assert _extract_cursor("") is None

    def test_handles_encoded_cursor(self):
        url = "/rest/api/content/scan?cursor=abc%3D%3D&limit=25"
        result = _extract_cursor(url)
        assert result == "abc=="

    def test_extracts_first_cursor_when_multiple(self):
        url = "/rest/api/content/scan?cursor=first&cursor=second&limit=25"
        assert _extract_cursor(url) == "first"

    def test_handles_cursor_only_param(self):
        url = "/rest/api/content/scan?cursor=onlythis"
        assert _extract_cursor(url) == "onlythis"


# ===========================================================================
# paginate_offset Tests
# ===========================================================================

class TestPaginateOffset:
    """Tests for the paginate_offset async generator."""

    @pytest.mark.asyncio
    async def test_single_page(self):
        """Single page with fewer results than limit stops iteration."""
        mock_client = MagicMock()
        mock_client.get.return_value = {
            "results": [{"id": "1"}, {"id": "2"}],
            "size": 2,
            "start": 0,
            "limit": 25,
        }

        items = []
        async for item in paginate_offset(mock_client, "content"):
            items.append(item)

        assert len(items) == 2
        assert items[0]["id"] == "1"
        assert items[1]["id"] == "2"

    @pytest.mark.asyncio
    async def test_empty_results_stops(self):
        """Empty results array stops iteration immediately."""
        mock_client = MagicMock()
        mock_client.get.return_value = {
            "results": [],
            "size": 0,
            "start": 0,
            "limit": 25,
        }

        items = []
        async for item in paginate_offset(mock_client, "content"):
            items.append(item)

        assert len(items) == 0

    @pytest.mark.asyncio
    async def test_multiple_pages(self):
        """Pagination fetches multiple pages until results are exhausted."""
        mock_client = MagicMock()
        mock_client.get.side_effect = [
            {
                "results": [{"id": "1"}, {"id": "2"}],
                "size": 2,
                "start": 0,
                "limit": 2,
                "_links": {"next": "/rest/api/content?start=2&limit=2"},
            },
            {
                "results": [{"id": "3"}],
                "size": 1,
                "start": 2,
                "limit": 2,
            },
        ]

        items = []
        async for item in paginate_offset(mock_client, "content", limit=2):
            items.append(item)

        assert len(items) == 3
        assert [i["id"] for i in items] == ["1", "2", "3"]

    @pytest.mark.asyncio
    async def test_stops_when_no_next_link(self):
        """Stops when page returns full results but no _links.next."""
        mock_client = MagicMock()
        mock_client.get.return_value = {
            "results": [{"id": "1"}, {"id": "2"}],
            "size": 2,
            "start": 0,
            "limit": 2,
            "_links": {},
        }

        items = []
        async for item in paginate_offset(mock_client, "content", limit=2):
            items.append(item)

        assert len(items) == 2

    @pytest.mark.asyncio
    async def test_stops_when_total_size_reached(self):
        """Stops when totalSize is known and all items have been fetched."""
        mock_client = MagicMock()
        mock_client.get.return_value = {
            "results": [{"id": "1"}, {"id": "2"}],
            "size": 2,
            "start": 0,
            "limit": 25,
            "totalSize": 2,
            "_links": {"next": "/rest/api/content?start=2"},
        }

        items = []
        async for item in paginate_offset(mock_client, "content"):
            items.append(item)

        assert len(items) == 2

    @pytest.mark.asyncio
    async def test_passes_extra_params(self):
        """Additional params are included in each page request."""
        mock_client = MagicMock()
        mock_client.get.return_value = {
            "results": [{"id": "1"}],
            "size": 1,
            "start": 0,
            "limit": 25,
        }

        items = []
        async for item in paginate_offset(mock_client, "content", params={"expand": "body.storage", "type": "page"}):
            items.append(item)

        call_kwargs = mock_client.get.call_args
        params = call_kwargs[1]["params"] if "params" in call_kwargs[1] else call_kwargs[0][1]
        assert params["expand"] == "body.storage"
        assert params["type"] == "page"

    @pytest.mark.asyncio
    async def test_custom_start_offset(self):
        """Respects custom start offset."""
        mock_client = MagicMock()
        mock_client.get.return_value = {
            "results": [{"id": "50"}],
            "size": 1,
            "start": 50,
            "limit": 25,
        }

        items = []
        async for item in paginate_offset(mock_client, "content", start=50):
            items.append(item)

        call_kwargs = mock_client.get.call_args
        params = call_kwargs[1]["params"] if "params" in call_kwargs[1] else call_kwargs[0][1]
        assert params["start"] == 50

    @pytest.mark.asyncio
    async def test_three_pages_then_done(self):
        """Properly iterates across three pages."""
        mock_client = MagicMock()
        mock_client.get.side_effect = [
            {
                "results": [{"id": "1"}],
                "size": 1,
                "start": 0,
                "limit": 1,
                "_links": {"next": "/rest/api/content?start=1&limit=1"},
            },
            {
                "results": [{"id": "2"}],
                "size": 1,
                "start": 1,
                "limit": 1,
                "_links": {"next": "/rest/api/content?start=2&limit=1"},
            },
            {
                "results": [{"id": "3"}],
                "size": 1,
                "start": 2,
                "limit": 1,
            },
        ]

        items = []
        async for item in paginate_offset(mock_client, "content", limit=1):
            items.append(item)

        assert len(items) == 3
        assert mock_client.get.call_count == 3


# ===========================================================================
# paginate_cursor Tests
# ===========================================================================

class TestPaginateCursor:
    """Tests for the paginate_cursor async generator."""

    @pytest.mark.asyncio
    async def test_single_page_no_next(self):
        """Single page without _links.next stops iteration."""
        mock_client = MagicMock()
        mock_client.get.return_value = {
            "results": [{"id": "1"}, {"id": "2"}],
            "_links": {},
        }

        items = []
        async for item in paginate_cursor(mock_client, "content/scan"):
            items.append(item)

        assert len(items) == 2

    @pytest.mark.asyncio
    async def test_empty_results_stops(self):
        """Empty results stops iteration immediately."""
        mock_client = MagicMock()
        mock_client.get.return_value = {
            "results": [],
            "_links": {},
        }

        items = []
        async for item in paginate_cursor(mock_client, "content/scan"):
            items.append(item)

        assert len(items) == 0

    @pytest.mark.asyncio
    async def test_multiple_pages_with_cursor(self):
        """Follows cursor through multiple pages."""
        mock_client = MagicMock()
        mock_client.get.side_effect = [
            {
                "results": [{"id": "1"}],
                "_links": {"next": "/rest/api/content/scan?cursor=page2tok&limit=1"},
            },
            {
                "results": [{"id": "2"}],
                "_links": {"next": "/rest/api/content/scan?cursor=page3tok&limit=1"},
            },
            {
                "results": [{"id": "3"}],
                "_links": {},
            },
        ]

        items = []
        async for item in paginate_cursor(mock_client, "content/scan", limit=1):
            items.append(item)

        assert len(items) == 3
        assert mock_client.get.call_count == 3

        # Verify cursor was passed in second call
        second_call_kwargs = mock_client.get.call_args_list[1]
        params = second_call_kwargs[1]["params"] if "params" in second_call_kwargs[1] else second_call_kwargs[0][1]
        assert params["cursor"] == "page2tok"

    @pytest.mark.asyncio
    async def test_first_request_has_no_cursor(self):
        """First request should not include a cursor parameter."""
        mock_client = MagicMock()
        mock_client.get.return_value = {
            "results": [{"id": "1"}],
            "_links": {},
        }

        items = []
        async for item in paginate_cursor(mock_client, "content/scan"):
            items.append(item)

        first_call_kwargs = mock_client.get.call_args_list[0]
        params = first_call_kwargs[1]["params"] if "params" in first_call_kwargs[1] else first_call_kwargs[0][1]
        assert "cursor" not in params

    @pytest.mark.asyncio
    async def test_passes_extra_params(self):
        """Additional params are included in each page request."""
        mock_client = MagicMock()
        mock_client.get.return_value = {
            "results": [{"id": "1"}],
            "_links": {},
        }

        items = []
        async for item in paginate_cursor(mock_client, "content/scan", params={"type": "page"}):
            items.append(item)

        call_kwargs = mock_client.get.call_args
        params = call_kwargs[1]["params"] if "params" in call_kwargs[1] else call_kwargs[0][1]
        assert params["type"] == "page"

    @pytest.mark.asyncio
    async def test_stops_when_cursor_not_in_next_link(self):
        """Stops when _links.next exists but has no cursor parameter."""
        mock_client = MagicMock()
        mock_client.get.return_value = {
            "results": [{"id": "1"}],
            "_links": {"next": "/rest/api/content/scan?limit=25"},
        }

        items = []
        async for item in paginate_cursor(mock_client, "content/scan"):
            items.append(item)

        # Should stop after first page because no cursor in next link
        assert len(items) == 1
        assert mock_client.get.call_count == 1

    @pytest.mark.asyncio
    async def test_custom_limit(self):
        """Custom limit is passed through to requests."""
        mock_client = MagicMock()
        mock_client.get.return_value = {
            "results": [{"id": "1"}],
            "_links": {},
        }

        items = []
        async for item in paginate_cursor(mock_client, "content/scan", limit=100):
            items.append(item)

        call_kwargs = mock_client.get.call_args
        params = call_kwargs[1]["params"] if "params" in call_kwargs[1] else call_kwargs[0][1]
        assert params["limit"] == 100
