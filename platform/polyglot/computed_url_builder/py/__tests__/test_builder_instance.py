"""
Tests for builder instance behavior.
"""

import pytest

from computed_url_builder import UrlBuilder, create_null_logger, create_url_builder


class TestBuilderInstance:
    """Tests for builder instance properties and behavior."""

    def test_maintain_separate_state_for_multiple_instances(self, null_logger):
        """Should maintain separate state for multiple instances."""
        builder1 = create_url_builder(
            {"dev": "https://api1.example.com"},
            "/v1",
            logger=null_logger,
        )

        builder2 = create_url_builder(
            {"dev": "https://api2.example.com"},
            "/v2",
            logger=null_logger,
        )

        assert builder1.build("dev") == "https://api1.example.com/v1"
        assert builder2.build("dev") == "https://api2.example.com/v2"

    def test_access_to_env_property(self, null_logger):
        """Should have access to env property."""
        url_keys = {"dev": "https://dev.api.example.com"}
        builder = create_url_builder(url_keys, "/v1", logger=null_logger)

        assert builder.env == url_keys

    def test_access_to_base_path_property(self, null_logger):
        """Should have access to base_path property."""
        builder = create_url_builder({}, "/v1/users", logger=null_logger)

        assert builder.base_path == "/v1/users"

    def test_handle_empty_url_keys_object(self, empty_builder):
        """Should handle empty url_keys object."""
        with pytest.raises(KeyError):
            empty_builder.build("any")

    def test_work_without_any_parameters(self, null_logger):
        """Should work without any parameters."""
        builder = create_url_builder(logger=null_logger)

        assert builder.env == {}
        assert builder.base_path == ""


class TestToDict:
    """Tests for to_dict() serialization."""

    def test_to_dict_returns_state(self, basic_builder):
        """Should return builder state as dictionary."""
        result = basic_builder.to_dict()

        assert "env" in result
        assert "base_path" in result
        assert result["env"]["dev"] == "https://dev.api.example.com"
        assert result["base_path"] == "/v1/users"

    def test_to_dict_returns_copy(self, basic_builder):
        """Should return a copy, not the original."""
        result = basic_builder.to_dict()
        result["env"]["new_key"] = "test"

        # Original should not be modified
        assert "new_key" not in basic_builder.env


class TestFromContext:
    """Tests for from_context() class method."""

    def test_from_context_creates_builder(self, null_logger):
        """Should create builder from context object."""
        builder = UrlBuilder.from_context(
            {"dev": "https://dev.api.com", "prod": "https://api.com"},
            logger=null_logger,
        )

        assert builder.build("dev") == "https://dev.api.com"
        assert builder.build("prod") == "https://api.com"

    def test_from_context_with_base_path(self, null_logger):
        """Should support base path."""
        builder = UrlBuilder.from_context(
            {"dev": "https://dev.api.com"},
            base_path="/v1",
            logger=null_logger,
        )

        assert builder.build("dev") == "https://dev.api.com/v1"

    def test_from_context_with_functions(self, null_logger):
        """Should support function-based URL values."""
        builder = UrlBuilder.from_context(
            {"dev": lambda ctx: f"https://{ctx['tenant']}.api.com"},
            logger=null_logger,
        )

        assert builder.build("dev", {"tenant": "acme"}) == "https://acme.api.com"


class TestFunctionBasedUrls:
    """Tests for function-based URL values."""

    def test_function_receives_context(self, null_logger):
        """Function should receive context dict."""
        received_context = {}

        def capture_context(ctx):
            received_context.update(ctx)
            return "https://api.com"

        builder = create_url_builder({"dev": capture_context}, logger=null_logger)
        builder.build("dev", {"key": "value", "num": 123})

        assert received_context == {"key": "value", "num": 123}

    def test_function_with_base_path(self, null_logger):
        """Function result should have base path appended."""
        builder = create_url_builder(
            {"dev": lambda ctx: f"https://{ctx['region']}.api.com"},
            "/v1",
            logger=null_logger,
        )

        assert builder.build("dev", {"region": "us-west"}) == "https://us-west.api.com/v1"

    def test_function_with_empty_context(self, null_logger):
        """Function should work with empty context."""
        builder = create_url_builder(
            {"dev": lambda ctx: "https://api.com"},
            logger=null_logger,
        )

        assert builder.build("dev") == "https://api.com"
        assert builder.build("dev", {}) == "https://api.com"

    def test_mixed_string_and_function(self, null_logger):
        """Should handle mix of string and function values."""
        builder = create_url_builder(
            {
                "static": "https://static.api.com",
                "dynamic": lambda ctx: f"https://{ctx['env']}.api.com",
            },
            "/v1",
            logger=null_logger,
        )

        assert builder.build("static") == "https://static.api.com/v1"
        assert builder.build("dynamic", {"env": "dev"}) == "https://dev.api.com/v1"
