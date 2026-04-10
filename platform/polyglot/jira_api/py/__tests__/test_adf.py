"""Unit tests for jira_api.utils.adf."""

import pytest

from jira_api.utils.adf import comment_to_adf, text_to_adf


class TestTextToAdf:
    class TestStatementCoverage:
        def test_converts_plain_text(self):
            result = text_to_adf("Hello world")
            assert result["type"] == "doc"
            assert result["version"] == 1
            assert result["content"][0]["type"] == "paragraph"
            assert result["content"][0]["content"][0]["text"] == "Hello world"

    class TestBranchCoverage:
        def test_returns_none_for_empty_string(self):
            assert text_to_adf("") is None

        def test_returns_none_for_none(self):
            assert text_to_adf(None) is None

    class TestBoundaryValues:
        def test_single_character(self):
            result = text_to_adf("a")
            assert result["content"][0]["content"][0]["text"] == "a"

        def test_converts_number_to_string(self):
            result = text_to_adf(42)
            assert result["content"][0]["content"][0]["text"] == "42"

        def test_multiline_text(self):
            result = text_to_adf("line1\nline2")
            assert "line1\nline2" in result["content"][0]["content"][0]["text"]


class TestCommentToAdf:
    class TestStatementCoverage:
        def test_wraps_in_body(self):
            result = comment_to_adf("comment text")
            assert "body" in result
            assert result["body"]["type"] == "doc"

    class TestBranchCoverage:
        def test_returns_none_for_empty(self):
            assert comment_to_adf("") is None

        def test_returns_none_for_none(self):
            assert comment_to_adf(None) is None
