"""
Tests for URL building functionality.
"""

import pytest

from computed_url_builder import create_null_logger, create_url_builder


class TestStringBasedUrls:
    """Tests for string-based URL building."""

    def test_build_url_with_host_and_base_path(self, basic_builder):
        """Should build URL by concatenating host with basePath."""
        assert basic_builder.build("dev") == "https://dev.api.example.com/v1/users"
        assert basic_builder.build("prod") == "https://api.example.com/v1/users"

    def test_build_url_without_base_path(self, null_logger):
        """Should build URL without basePath."""
        builder = create_url_builder(
            {"dev": "https://dev.api.example.com"},
            logger=null_logger,
        )
        assert builder.build("dev") == "https://dev.api.example.com"

    def test_build_url_with_empty_base_path(self, null_logger):
        """Should build URL with empty basePath."""
        builder = create_url_builder(
            {"dev": "https://dev.api.example.com"},
            "",
            logger=null_logger,
        )
        assert builder.build("dev") == "https://dev.api.example.com"


class TestArrayBasedUrls:
    """Tests for array-based URL building."""

    def test_build_url_from_array_by_joining(self, array_builder):
        """Should build URL from array by joining elements."""
        assert array_builder.build("dev") == "https://dev.api.example.com/v2/special/endpoint"
        assert array_builder.build("prod") == "https://api.example.com/v2/special/endpoint"

    def test_join_array_with_multiple_parts(self, null_logger):
        """Should join array with multiple parts."""
        builder = create_url_builder(
            {"custom": ["https://api.example.com", "/v1", "/users", "/profile"]},
            logger=null_logger,
        )
        assert builder.build("custom") == "https://api.example.com/v1/users/profile"

    def test_handle_single_element_array(self, null_logger):
        """Should handle single element array."""
        builder = create_url_builder(
            {"single": ["https://api.example.com"]},
            logger=null_logger,
        )
        assert builder.build("single") == "https://api.example.com"


class TestMixedConfigurations:
    """Tests for mixed string and array configurations."""

    def test_handle_both_string_and_array_in_same_config(self, mixed_builder):
        """Should handle both string and array values in same config."""
        assert mixed_builder.build("dev") == "https://dev.api.example.com/v1"
        assert mixed_builder.build("special") == "https://special.api.example.com/custom/path"
