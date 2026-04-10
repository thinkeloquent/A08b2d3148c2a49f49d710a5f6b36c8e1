"""Tests for the code search endpoint."""

from __future__ import annotations

import pytest
from unittest.mock import AsyncMock

from github_sdk_api_component_usage_audit.sdk.code_search import (
    build_search_query,
    search_code,
)


class TestBuildSearchQuery:
    """Test the search query builder."""

    def test_basic_query(self):
        query = build_search_query("Accordion", 1000)
        assert '"import { Accordion }"' in query
        assert "extension:tsx" in query
        assert "extension:jsx" in query
        assert "size:>1000" in query

    def test_custom_min_size(self):
        query = build_search_query("Button", 500)
        assert "size:>500" in query

    def test_component_name_in_query(self):
        query = build_search_query("DataGrid", 0)
        assert "DataGrid" in query


class TestSearchCode:
    """Test the paginated search code generator."""

    @pytest.mark.asyncio
    async def test_single_page(self):
        client = AsyncMock()
        client.get.return_value = {
            "total_count": 2,
            "items": [
                {"path": "a.tsx", "repository": {"name": "repo1"}},
                {"path": "b.tsx", "repository": {"name": "repo2"}},
            ],
        }

        results = []
        async for item in search_code(
            client, component_name="Accordion", max_pages=1, min_file_size=1000
        ):
            results.append(item)

        assert len(results) == 2
        client.get.assert_called_once()

    @pytest.mark.asyncio
    async def test_empty_results(self):
        client = AsyncMock()
        client.get.return_value = {
            "total_count": 0,
            "items": [],
        }

        results = []
        async for item in search_code(
            client, component_name="Accordion", max_pages=5
        ):
            results.append(item)

        assert len(results) == 0

    @pytest.mark.asyncio
    async def test_pagination_stops_on_partial_page(self):
        """Should stop when a page returns fewer than PER_PAGE items."""
        client = AsyncMock()
        # First call returns 50 items (less than 100)
        client.get.return_value = {
            "total_count": 50,
            "items": [{"path": f"file{i}.tsx"} for i in range(50)],
        }

        results = []
        async for item in search_code(
            client, component_name="Accordion", max_pages=5
        ):
            results.append(item)

        assert len(results) == 50
        assert client.get.call_count == 1
