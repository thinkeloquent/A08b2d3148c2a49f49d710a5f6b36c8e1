"""
Unit tests for statsig_client.pagination.

Tests cover:
- Statement coverage for paginate() and list_all()
- Decision/branch coverage for pagination links and URL extraction
- Boundary value analysis for empty data, non-dict responses
"""

from unittest.mock import AsyncMock

import pytest

from statsig_client.pagination import _extract_relative_path, list_all, paginate


class TestExtractRelativePath:
    """Tests for the _extract_relative_path helper."""

    class TestDecisionBranchCoverage:
        def test_absolute_url_with_base(self):
            result = _extract_relative_path(
                "https://statsigapi.net/console/v1/gates?page=2",
                "https://statsigapi.net/console/v1",
            )
            assert result == "/gates?page=2"

        def test_absolute_url_without_query(self):
            result = _extract_relative_path(
                "https://statsigapi.net/console/v1/gates",
                "https://statsigapi.net/console/v1",
            )
            assert result == "/gates"

        def test_relative_url_passthrough(self):
            result = _extract_relative_path("/gates?page=2", "https://example.com")
            assert result == "/gates?page=2"

        def test_http_url(self):
            result = _extract_relative_path(
                "http://statsigapi.net/console/v1/experiments",
                "http://statsigapi.net/console/v1",
            )
            assert result == "/experiments"

    class TestBoundaryValueAnalysis:
        def test_url_without_matching_base_path(self):
            result = _extract_relative_path(
                "https://other.com/api/v2/gates",
                "https://statsigapi.net/console/v1",
            )
            assert "/gates" in result


class TestPaginate:
    """Tests for the paginate() async generator."""

    class TestStatementCoverage:
        async def test_single_page(self, mock_client):
            mock_client.get.return_value = {
                "data": [{"id": "gate1"}, {"id": "gate2"}],
                "pagination": {},
            }

            pages = []
            async for page in paginate(mock_client, "/gates"):
                pages.append(page)

            assert len(pages) == 1
            assert len(pages[0]) == 2
            mock_client.get.assert_called_once()

        async def test_multi_page(self, mock_client):
            mock_client.get.side_effect = [
                {
                    "data": [{"id": "g1"}],
                    "pagination": {"nextPage": "https://statsigapi.net/console/v1/gates?page=2"},
                },
                {
                    "data": [{"id": "g2"}],
                    "pagination": {},
                },
            ]

            pages = []
            async for page in paginate(mock_client, "/gates"):
                pages.append(page)

            assert len(pages) == 2
            assert pages[0] == [{"id": "g1"}]
            assert pages[1] == [{"id": "g2"}]

    class TestDecisionBranchCoverage:
        async def test_no_next_page_stops(self, mock_client):
            mock_client.get.return_value = {
                "data": [{"id": "x"}],
                "pagination": {"nextPage": None},
            }

            pages = []
            async for page in paginate(mock_client, "/test"):
                pages.append(page)

            assert len(pages) == 1

        async def test_non_dict_response_yields_empty(self, mock_client):
            mock_client.get.return_value = "not a dict"

            pages = []
            async for page in paginate(mock_client, "/test"):
                pages.append(page)

            assert pages == [[]]

    class TestBoundaryValueAnalysis:
        async def test_empty_data_array(self, mock_client):
            mock_client.get.return_value = {"data": [], "pagination": {}}

            pages = []
            async for page in paginate(mock_client, "/test"):
                pages.append(page)

            assert pages == [[]]

        async def test_missing_data_key(self, mock_client):
            mock_client.get.return_value = {"pagination": {}}

            pages = []
            async for page in paginate(mock_client, "/test"):
                pages.append(page)

            assert pages == [[]]


class TestListAll:
    """Tests for the list_all() convenience function."""

    class TestStatementCoverage:
        async def test_collects_all_pages(self, mock_client):
            mock_client.get.side_effect = [
                {
                    "data": [{"id": "a"}, {"id": "b"}],
                    "pagination": {"nextPage": "https://statsigapi.net/console/v1/x?page=2"},
                },
                {
                    "data": [{"id": "c"}],
                    "pagination": {},
                },
            ]

            result = await list_all(mock_client, "/x")
            assert result == [{"id": "a"}, {"id": "b"}, {"id": "c"}]

    class TestBoundaryValueAnalysis:
        async def test_empty_result(self, mock_client):
            mock_client.get.return_value = {"data": [], "pagination": {}}

            result = await list_all(mock_client, "/empty")
            assert result == []
