"""Tests for path_rewriter module."""

import pytest

from static_app_loader.path_rewriter import (
    clear_cache,
    get_cache_size,
    rewrite_html_paths,
    rewrite_html_paths_cached,
)
from static_app_loader.types import PathRewriteOptions


class TestRewriteHtmlPaths:
    """Tests for rewrite_html_paths function."""

    @pytest.fixture(autouse=True)
    def clear_cache_before_test(self) -> None:
        """Clear cache before each test."""
        clear_cache()

    def test_rewrite_absolute_asset_paths(self) -> None:
        """Should rewrite absolute asset paths."""
        options = PathRewriteOptions(app_name="dashboard", url_prefix="/assets")
        html = '<script src="/assets/main.js"></script>'

        result = rewrite_html_paths(html, options)

        assert result == '<script src="/apps/dashboard/assets/main.js"></script>'

    def test_rewrite_relative_paths_with_dot_slash(self) -> None:
        """Should rewrite relative asset paths with ./"""
        options = PathRewriteOptions(app_name="dashboard", url_prefix="/assets")
        html = '<script src="./assets/main.js"></script>'

        result = rewrite_html_paths(html, options)

        assert result == '<script src="/apps/dashboard/assets/main.js"></script>'

    def test_rewrite_relative_paths_without_prefix(self) -> None:
        """Should rewrite relative asset paths without ./"""
        options = PathRewriteOptions(app_name="dashboard", url_prefix="/assets")
        html = '<script src="assets/main.js"></script>'

        result = rewrite_html_paths(html, options)

        assert result == '<script src="/apps/dashboard/assets/main.js"></script>'

    def test_rewrite_href_attributes(self) -> None:
        """Should rewrite href attributes."""
        options = PathRewriteOptions(app_name="dashboard", url_prefix="/assets")
        html = '<link rel="stylesheet" href="/assets/style.css">'

        result = rewrite_html_paths(html, options)

        assert result == '<link rel="stylesheet" href="/apps/dashboard/assets/style.css">'

    def test_rewrite_img_src_attributes(self) -> None:
        """Should rewrite img src attributes."""
        options = PathRewriteOptions(app_name="dashboard", url_prefix="/assets")
        html = '<img src="/assets/logo.png">'

        result = rewrite_html_paths(html, options)

        assert result == '<img src="/apps/dashboard/assets/logo.png">'

    def test_rewrite_css_url_references(self) -> None:
        """Should rewrite CSS url() references."""
        options = PathRewriteOptions(app_name="dashboard", url_prefix="/assets")
        html = '<style>body { background: url("/assets/bg.png"); }</style>'

        result = rewrite_html_paths(html, options)

        assert '/apps/dashboard/assets/bg.png' in result

    def test_handle_multiple_assets(self) -> None:
        """Should handle multiple assets in one document."""
        options = PathRewriteOptions(app_name="dashboard", url_prefix="/assets")
        html = """
        <link href="/assets/style.css" rel="stylesheet">
        <script src="/assets/main.js"></script>
        <img src="/assets/logo.png">
        """

        result = rewrite_html_paths(html, options)

        assert "/apps/dashboard/assets/style.css" in result
        assert "/apps/dashboard/assets/main.js" in result
        assert "/apps/dashboard/assets/logo.png" in result

    def test_custom_url_prefix(self) -> None:
        """Should handle custom url prefix."""
        options = PathRewriteOptions(app_name="admin", url_prefix="/static")
        html = '<script src="/assets/main.js"></script>'

        result = rewrite_html_paths(html, options)

        assert result == '<script src="/apps/admin/static/main.js"></script>'

    def test_not_modify_non_asset_paths(self) -> None:
        """Should not modify non-asset paths."""
        options = PathRewriteOptions(app_name="dashboard", url_prefix="/assets")
        html = '<a href="/api/users">Users</a>'

        result = rewrite_html_paths(html, options)

        assert result == '<a href="/api/users">Users</a>'


class TestRewriteHtmlPathsCached:
    """Tests for rewrite_html_paths_cached function."""

    @pytest.fixture(autouse=True)
    def clear_cache_before_test(self) -> None:
        """Clear cache before each test."""
        clear_cache()

    def test_cache_rewritten_html(self) -> None:
        """Should cache rewritten HTML."""
        options = PathRewriteOptions(
            app_name="dashboard",
            url_prefix="/assets",
            enable_cache=True,
            cache_ttl=60.0,
        )
        html = '<script src="/assets/main.js"></script>'

        result1 = rewrite_html_paths_cached(html, "/path/to/index.html", options)
        assert get_cache_size() == 1

        result2 = rewrite_html_paths_cached(html, "/path/to/index.html", options)
        assert result1 == result2
        assert get_cache_size() == 1

    def test_bypass_cache_when_disabled(self) -> None:
        """Should bypass cache when disabled."""
        options = PathRewriteOptions(
            app_name="dashboard",
            url_prefix="/assets",
            enable_cache=False,
        )
        html = '<script src="/assets/main.js"></script>'

        rewrite_html_paths_cached(html, "/path/to/index.html", options)
        assert get_cache_size() == 0


class TestClearCache:
    """Tests for clear_cache function."""

    def test_clear_all_cache_entries(self) -> None:
        """Should clear all cache entries."""
        options = PathRewriteOptions(
            app_name="dashboard",
            url_prefix="/assets",
            enable_cache=True,
        )

        rewrite_html_paths_cached('<script src="/assets/main.js"></script>', "/a", options)
        rewrite_html_paths_cached('<script src="/assets/app.js"></script>', "/b", options)
        assert get_cache_size() == 2

        clear_cache()
        assert get_cache_size() == 0

    def test_clear_specific_cache_key(self) -> None:
        """Should clear specific cache key prefix."""
        options = PathRewriteOptions(
            app_name="dashboard",
            url_prefix="/assets",
            enable_cache=True,
        )

        rewrite_html_paths_cached('<script src="/assets/main.js"></script>', "/a", options)
        rewrite_html_paths_cached('<script src="/assets/app.js"></script>', "/b", options)
        assert get_cache_size() == 2

        clear_cache("/a")
        assert get_cache_size() == 1
