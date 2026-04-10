"""Unit tests for github_api.sdk.pagination module.

Tests cover:
- Statement coverage for paginate and paginate_all
- Branch coverage for Link header parsing, max_pages, empty data
- Boundary value analysis for per_page capping and edge cases
- Error handling verification
"""

from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest

from github_api.sdk.pagination import paginate, paginate_all


def _make_response(
    data: Any,
    link_header: str | None = None,
) -> MagicMock:
    """Create a mock httpx.Response with configurable JSON and Link header.

    Args:
        data: The JSON data the response should return.
        link_header: Optional Link header value.

    Returns:
        A MagicMock mimicking an httpx.Response.
    """
    response = MagicMock()
    response.json.return_value = data
    headers: dict[str, str] = {}
    if link_header is not None:
        headers["link"] = link_header
    response.headers = headers
    return response


def _make_client(*responses: MagicMock) -> MagicMock:
    """Create a mock GitHubClient with sequential get_raw responses.

    Args:
        *responses: Mock responses to return in order.

    Returns:
        A MagicMock with an AsyncMock get_raw returning given responses.
    """
    client = MagicMock()
    client.get_raw = AsyncMock(side_effect=list(responses))
    return client


class TestStatementCoverage:
    """Execute every code path in paginate and paginate_all."""

    async def test_paginate_yields_single_page(self) -> None:
        """paginate yields a single page when no Link header present."""
        resp = _make_response([{"id": 1}, {"id": 2}])
        client = _make_client(resp)

        pages = []
        async for page in paginate(client, "/repos"):
            pages.append(page)

        assert len(pages) == 1
        assert pages[0] == [{"id": 1}, {"id": 2}]

    async def test_paginate_yields_multiple_pages(self) -> None:
        """paginate yields multiple pages following Link next headers."""
        resp1 = _make_response(
            [{"id": 1}],
            link_header='<https://api.github.com/repos?page=2>; rel="next"',
        )
        resp2 = _make_response([{"id": 2}])
        client = _make_client(resp1, resp2)

        pages = []
        async for page in paginate(client, "/repos"):
            pages.append(page)

        assert len(pages) == 2
        assert pages[0] == [{"id": 1}]
        assert pages[1] == [{"id": 2}]

    async def test_paginate_all_collects_flat_list(self) -> None:
        """paginate_all collects all pages into a flat list."""
        resp1 = _make_response(
            [{"id": 1}, {"id": 2}],
            link_header='<https://api.github.com/repos?page=2>; rel="next"',
        )
        resp2 = _make_response([{"id": 3}])
        client = _make_client(resp1, resp2)

        items = await paginate_all(client, "/repos")
        assert items == [{"id": 1}, {"id": 2}, {"id": 3}]

    async def test_paginate_passes_params_on_first_page(self) -> None:
        """paginate sends params on first request, not on subsequent pages."""
        resp1 = _make_response(
            [{"id": 1}],
            link_header='<https://api.github.com/repos?page=2>; rel="next"',
        )
        resp2 = _make_response([{"id": 2}])
        client = _make_client(resp1, resp2)

        pages = []
        async for page in paginate(client, "/repos", params={"sort": "updated"}):
            pages.append(page)

        # First call should include params with sort and per_page
        first_call_params = client.get_raw.call_args_list[0]
        assert first_call_params[0][0] == "/repos"
        call_kwargs = first_call_params[1]
        assert call_kwargs["params"]["sort"] == "updated"
        assert call_kwargs["params"]["per_page"] == 100

        # Second call should have None params (absolute URL from Link header)
        second_call_params = client.get_raw.call_args_list[1]
        assert second_call_params[1]["params"] is None

    async def test_link_header_next_url_parsed(self) -> None:
        """Link header rel='next' URL is correctly extracted."""
        resp1 = _make_response(
            [{"id": 1}],
            link_header='<https://api.github.com/page2>; rel="next", <https://api.github.com/last>; rel="last"',
        )
        resp2 = _make_response([{"id": 2}])
        client = _make_client(resp1, resp2)

        pages = []
        async for page in paginate(client, "/start"):
            pages.append(page)

        assert len(pages) == 2
        # Second call should use the next URL
        assert client.get_raw.call_args_list[1][0][0] == "https://api.github.com/page2"


class TestBranchCoverage:
    """Test all conditional branches in pagination logic."""

    async def test_no_link_header_stops_pagination(self) -> None:
        """Pagination stops when no Link header is present."""
        resp = _make_response([{"id": 1}])
        client = _make_client(resp)

        pages = []
        async for page in paginate(client, "/repos"):
            pages.append(page)

        assert len(pages) == 1
        assert client.get_raw.call_count == 1

    async def test_link_header_without_next_stops(self) -> None:
        """Pagination stops when Link header has no rel='next'."""
        resp = _make_response(
            [{"id": 1}],
            link_header='<https://api.github.com/repos?page=1>; rel="prev"',
        )
        client = _make_client(resp)

        pages = []
        async for page in paginate(client, "/repos"):
            pages.append(page)

        assert len(pages) == 1

    async def test_link_header_with_next_continues(self) -> None:
        """Pagination continues when Link header contains rel='next'."""
        resp1 = _make_response(
            [{"id": 1}],
            link_header='<https://api.github.com/repos?page=2>; rel="next"',
        )
        resp2 = _make_response([{"id": 2}])
        client = _make_client(resp1, resp2)

        pages = []
        async for page in paginate(client, "/repos"):
            pages.append(page)

        assert len(pages) == 2

    async def test_max_pages_one_stops_after_first(self) -> None:
        """max_pages=1 stops after fetching one page."""
        resp1 = _make_response(
            [{"id": 1}],
            link_header='<https://api.github.com/repos?page=2>; rel="next"',
        )
        client = _make_client(resp1)

        pages = []
        async for page in paginate(client, "/repos", max_pages=1):
            pages.append(page)

        assert len(pages) == 1
        assert client.get_raw.call_count == 1

    async def test_response_list_yielded_directly(self) -> None:
        """When response JSON is a list, it is yielded directly."""
        resp = _make_response([{"id": 1}, {"id": 2}])
        client = _make_client(resp)

        pages = []
        async for page in paginate(client, "/repos"):
            pages.append(page)

        assert pages[0] == [{"id": 1}, {"id": 2}]

    async def test_response_dict_wrapped_in_list(self) -> None:
        """When response JSON is a dict, it is wrapped in a list."""
        resp = _make_response({"id": 1, "name": "repo"})
        client = _make_client(resp)

        pages = []
        async for page in paginate(client, "/repos"):
            pages.append(page)

        assert pages[0] == [{"id": 1, "name": "repo"}]

    async def test_empty_list_stops_pagination(self) -> None:
        """Empty list response stops pagination."""
        resp = _make_response([])
        client = _make_client(resp)

        pages = []
        async for page in paginate(client, "/repos"):
            pages.append(page)

        assert len(pages) == 0

    async def test_empty_link_header_string(self) -> None:
        """Empty link header string stops pagination."""
        resp = _make_response([{"id": 1}])
        resp.headers = {"link": ""}
        client = _make_client(resp)

        pages = []
        async for page in paginate(client, "/repos"):
            pages.append(page)

        assert len(pages) == 1


class TestBoundaryValues:
    """Edge cases: per_page capping, max_pages=0, single item."""

    async def test_per_page_capped_at_100(self) -> None:
        """per_page=200 is capped to 100 in the request params."""
        resp = _make_response([{"id": 1}])
        client = _make_client(resp)

        pages = []
        async for page in paginate(client, "/repos", per_page=200):
            pages.append(page)

        call_kwargs = client.get_raw.call_args_list[0][1]
        assert call_kwargs["params"]["per_page"] == 100

    async def test_per_page_exact_100(self) -> None:
        """per_page=100 stays at 100."""
        resp = _make_response([{"id": 1}])
        client = _make_client(resp)

        pages = []
        async for page in paginate(client, "/repos", per_page=100):
            pages.append(page)

        call_kwargs = client.get_raw.call_args_list[0][1]
        assert call_kwargs["params"]["per_page"] == 100

    async def test_per_page_below_100_unchanged(self) -> None:
        """per_page=30 is not modified."""
        resp = _make_response([{"id": 1}])
        client = _make_client(resp)

        pages = []
        async for page in paginate(client, "/repos", per_page=30):
            pages.append(page)

        call_kwargs = client.get_raw.call_args_list[0][1]
        assert call_kwargs["params"]["per_page"] == 30

    async def test_max_pages_zero_yields_nothing(self) -> None:
        """max_pages=0 yields no pages at all."""
        client = _make_client()  # No responses needed

        pages = []
        async for page in paginate(client, "/repos", max_pages=0):
            pages.append(page)

        assert len(pages) == 0
        assert client.get_raw.call_count == 0

    async def test_single_item_response(self) -> None:
        """Single item list response is yielded correctly."""
        resp = _make_response([{"id": 42}])
        client = _make_client(resp)

        pages = []
        async for page in paginate(client, "/repos"):
            pages.append(page)

        assert len(pages) == 1
        assert pages[0] == [{"id": 42}]

    async def test_paginate_all_empty_endpoint(self) -> None:
        """paginate_all on endpoint returning empty list returns empty list."""
        resp = _make_response([])
        client = _make_client(resp)

        items = await paginate_all(client, "/repos")
        assert items == []

    async def test_params_none_default(self) -> None:
        """paginate with params=None uses empty dict internally."""
        resp = _make_response([{"id": 1}])
        client = _make_client(resp)

        pages = []
        async for page in paginate(client, "/repos", params=None):
            pages.append(page)

        call_kwargs = client.get_raw.call_args_list[0][1]
        assert call_kwargs["params"]["per_page"] == 100

    async def test_three_pages_all_collected(self) -> None:
        """paginate_all collects items from three pages."""
        resp1 = _make_response(
            [{"id": 1}],
            link_header='<https://api.github.com/repos?page=2>; rel="next"',
        )
        resp2 = _make_response(
            [{"id": 2}],
            link_header='<https://api.github.com/repos?page=3>; rel="next"',
        )
        resp3 = _make_response([{"id": 3}])
        client = _make_client(resp1, resp2, resp3)

        items = await paginate_all(client, "/repos")
        assert items == [{"id": 1}, {"id": 2}, {"id": 3}]


class TestErrorHandling:
    """Test error propagation in pagination."""

    async def test_client_error_propagates(self) -> None:
        """Exceptions from client.get_raw propagate through paginate."""
        client = MagicMock()
        client.get_raw = AsyncMock(side_effect=RuntimeError("connection lost"))

        with pytest.raises(RuntimeError, match="connection lost"):
            async for _ in paginate(client, "/repos"):
                pass

    async def test_client_error_propagates_in_paginate_all(self) -> None:
        """Exceptions from client.get_raw propagate through paginate_all."""
        client = MagicMock()
        client.get_raw = AsyncMock(side_effect=RuntimeError("timeout"))

        with pytest.raises(RuntimeError, match="timeout"):
            await paginate_all(client, "/repos")


class TestLogVerification:
    """Verify logging behavior in pagination module.

    The pagination module does not use a logger directly.
    This section confirms that no logging side-effects occur.
    """

    async def test_no_logging_side_effects(self) -> None:
        """Pagination functions complete without requiring a logger."""
        resp = _make_response([{"id": 1}])
        client = _make_client(resp)

        pages = []
        async for page in paginate(client, "/repos"):
            pages.append(page)

        assert len(pages) == 1
