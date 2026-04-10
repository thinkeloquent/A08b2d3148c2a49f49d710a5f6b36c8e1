"""Tests for code/text separator."""

import pytest
from rag_search_algorithms.code_text_separator import (
    separate_code_text_regex,
    CODE_FILE_EXTENSIONS,
)
from rag_search_algorithms.content_hash import content_hash


class TestContentHash:
    def test_deterministic(self):
        assert content_hash("hello") == content_hash("hello")

    def test_different_inputs(self):
        assert content_hash("hello") != content_hash("world")

    def test_returns_hex_string(self):
        result = content_hash("test")
        assert isinstance(result, str)
        assert len(result) == 32  # MD5 hex digest length


class TestCodeFileExtensions:
    def test_common_extensions(self):
        assert ".ts" in CODE_FILE_EXTENSIONS
        assert ".tsx" in CODE_FILE_EXTENSIONS
        assert ".js" in CODE_FILE_EXTENSIONS
        assert ".py" in CODE_FILE_EXTENSIONS
        assert ".css" in CODE_FILE_EXTENSIONS

    def test_not_text_extensions(self):
        assert ".txt" not in CODE_FILE_EXTENSIONS
        assert ".md" not in CODE_FILE_EXTENSIONS


class TestSeparateCodeTextRegex:
    def test_empty_content(self):
        result = separate_code_text_regex("")
        assert result == {"code_parts": [], "text_parts": []}

    def test_code_file_extension(self):
        result = separate_code_text_regex("const x = 1;", "test.ts")
        assert len(result["code_parts"]) == 1
        assert result["text_parts"] == []

    def test_markdown_code_block(self):
        content = "Some text\n\n```js\nconst x = 1;\n```\n\nMore text"
        result = separate_code_text_regex(content)
        assert len(result["code_parts"]) > 0

    def test_plain_text(self):
        content = "This is just regular text about components."
        result = separate_code_text_regex(content)
        assert len(result["text_parts"]) > 0
