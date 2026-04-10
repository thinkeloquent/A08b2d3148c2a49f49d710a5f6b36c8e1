"""
Unit tests for template_resolver module.

Tests cover:
- Template engine resolution
- Template rendering
- Initial state injection
- XSS prevention
"""

import pytest

from static_app_loader.errors import UnsupportedTemplateEngineError
from static_app_loader.template_resolver import (
    inject_initial_state,
    render_template,
    resolve_template_engine,
)


class TestResolveTemplateEngine:
    """Tests for resolve_template_engine function."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_none_engine_returns_none(self) -> None:
            """'none' engine should return None."""
            result = await resolve_template_engine("none", "/tmp")

            assert result is None

        @pytest.mark.asyncio
        async def test_liquid_engine_returns_environment(self) -> None:
            """'liquid' engine should return Liquid environment."""
            result = await resolve_template_engine("liquid", "/tmp")

            assert result is not None

    class TestErrorHandling:
        """Test error conditions."""

        @pytest.mark.asyncio
        async def test_unsupported_engine_raises_error(self) -> None:
            """Unsupported engine should raise error."""
            with pytest.raises(UnsupportedTemplateEngineError):
                await resolve_template_engine("invalid", "/tmp")  # type: ignore


class TestRenderTemplate:
    """Tests for render_template function."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        @pytest.mark.asyncio
        async def test_none_engine_returns_html_unchanged(self) -> None:
            """'none' engine should return HTML unchanged."""
            html = "<h1>Hello World</h1>"

            result = await render_template(html, {}, "none")

            assert result == html

        @pytest.mark.asyncio
        async def test_liquid_engine_renders_variables(self) -> None:
            """'liquid' engine should render variables."""
            html = "<h1>Hello {{ name }}</h1>"
            context = {"name": "World"}

            result = await render_template(html, context, "liquid")

            assert "Hello World" in result

    class TestBoundaryValueAnalysis:
        """Test edge cases."""

        @pytest.mark.asyncio
        async def test_empty_context(self) -> None:
            """Empty context should work."""
            html = "<h1>Static Content</h1>"

            result = await render_template(html, {}, "liquid")

            assert "Static Content" in result


class TestInjectInitialState:
    """Tests for inject_initial_state function."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        def test_injects_script_before_head_close(self) -> None:
            """Should inject script before </head>."""
            html = "<html><head><title>Test</title></head><body></body></html>"
            data = {"user": "test"}

            result = inject_initial_state(html, data)

            assert "window.INITIAL_STATE" in result
            assert result.index("INITIAL_STATE") < result.index("</head>")

        def test_injects_script_after_body_open(self) -> None:
            """Should inject script after <body> if no </head>."""
            html = "<html><body><h1>Test</h1></body></html>"
            data = {"user": "test"}

            result = inject_initial_state(html, data)

            assert "window.INITIAL_STATE" in result

        def test_prepends_script_if_no_head_or_body(self) -> None:
            """Should prepend script if no head or body tags."""
            html = "<h1>Simple HTML</h1>"
            data = {"user": "test"}

            result = inject_initial_state(html, data)

            assert result.startswith("<script>")

    class TestErrorHandling:
        """Test XSS prevention."""

        def test_escapes_html_in_data(self) -> None:
            """Should escape HTML characters to prevent XSS."""
            html = "<html><head></head><body></body></html>"
            data = {"malicious": "<script>alert('xss')</script>"}

            result = inject_initial_state(html, data)

            # Should be escaped
            assert "<script>alert" not in result
            assert "\\u003c" in result  # Escaped <

        def test_escapes_ampersand(self) -> None:
            """Should escape ampersands."""
            html = "<html><head></head><body></body></html>"
            data = {"value": "a & b"}

            result = inject_initial_state(html, data)

            assert "\\u0026" in result

        def test_escapes_single_quotes(self) -> None:
            """Should escape single quotes."""
            html = "<html><head></head><body></body></html>"
            data = {"value": "it's a test"}

            result = inject_initial_state(html, data)

            assert "\\u0027" in result

    class TestBoundaryValueAnalysis:
        """Test edge cases."""

        def test_empty_data(self) -> None:
            """Empty data should work."""
            html = "<html><head></head><body></body></html>"

            result = inject_initial_state(html, {})

            assert "window.INITIAL_STATE={}" in result

        def test_nested_data(self) -> None:
            """Nested data should be serialized correctly."""
            html = "<html><head></head><body></body></html>"
            data = {"user": {"name": "test", "roles": ["admin", "user"]}}

            result = inject_initial_state(html, data)

            assert "window.INITIAL_STATE" in result
            assert "user" in result
