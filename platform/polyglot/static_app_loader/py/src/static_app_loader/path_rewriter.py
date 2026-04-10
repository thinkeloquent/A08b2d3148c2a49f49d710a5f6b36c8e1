"""HTML path rewriting utilities for static app loader."""

import re
import time
from dataclasses import dataclass
from typing import Dict, Optional

from .types import PathRewriteOptions


@dataclass
class CacheEntry:
    """Cache entry for rewritten HTML."""

    html: str
    timestamp: float


_html_cache: dict[str, CacheEntry] = {}

# Patterns for matching asset paths in HTML
# Handles: /assets/, ./assets/, assets/
ASSET_PATTERNS = [
    # src="/assets/..." or href="/assets/..."
    (
        re.compile(
            r'(<(?:script|link|img|source|video|audio)[^>]*(?:src|href)=["\'])/assets/',
            re.IGNORECASE,
        ),
        r"\1{prefix}/",
    ),
    # src="./assets/..." or href="./assets/..."
    (
        re.compile(
            r'(<(?:script|link|img|source|video|audio)[^>]*(?:src|href)=["\'])\./assets/',
            re.IGNORECASE,
        ),
        r"\1{prefix}/",
    ),
    # src="assets/..." or href="assets/..."
    (
        re.compile(
            r'(<(?:script|link|img|source|video|audio)[^>]*(?:src|href)=["\'])assets/',
            re.IGNORECASE,
        ),
        r"\1{prefix}/",
    ),
]

# CSS url() patterns
CSS_URL_PATTERNS = [
    (re.compile(r'url\(["\']?/assets/', re.IGNORECASE), 'url("{prefix}/'),
    (re.compile(r'url\(["\']?\./assets/', re.IGNORECASE), 'url("{prefix}/'),
    (re.compile(r'url\(["\']?assets/', re.IGNORECASE), 'url("{prefix}/'),
]


def rewrite_html_paths(html: str, options: PathRewriteOptions) -> str:
    """Rewrite asset paths in HTML content to include the app-specific route prefix.

    Args:
        html: The HTML content to rewrite
        options: Rewrite configuration options

    Returns:
        Rewritten HTML content

    Example:
        >>> options = PathRewriteOptions(app_name='dashboard', url_prefix='/assets')
        >>> rewritten = rewrite_html_paths(html, options)
        # src="/assets/main.js" → src="/dashboard/assets/main.js"
    """
    url_prefix = options.url_prefix
    if not url_prefix.startswith("/"):
        url_prefix = f"/{url_prefix}"
    base = options.base_path if options.base_path.startswith("/") else f"/{options.base_path}"
    normalized_base = base if base.endswith("/") else f"{base}/"
    prefix = f"{normalized_base}{options.app_name}{url_prefix}"

    result = html

    # Rewrite HTML attributes (src, href)
    for pattern, replacement in ASSET_PATTERNS:
        result = pattern.sub(replacement.format(prefix=prefix), result)

    # Rewrite CSS url() references
    for pattern, replacement in CSS_URL_PATTERNS:
        result = pattern.sub(replacement.format(prefix=prefix), result)

    return result


def rewrite_html_paths_cached(
    html: str, cache_key: str, options: PathRewriteOptions
) -> str:
    """Rewrite HTML paths with caching support.

    Args:
        html: The HTML content to rewrite
        cache_key: Unique key for caching (typically file path)
        options: Rewrite configuration options

    Returns:
        Rewritten HTML content
    """
    if not options.enable_cache:
        return rewrite_html_paths(html, options)

    full_key = f"{cache_key}:{options.base_path}:{options.app_name}:{options.url_prefix}"
    cached = _html_cache.get(full_key)
    now = time.time()

    if cached and now - cached.timestamp < options.cache_ttl:
        return cached.html

    rewritten = rewrite_html_paths(html, options)
    _html_cache[full_key] = CacheEntry(html=rewritten, timestamp=now)

    return rewritten


def clear_cache(cache_key: str | None = None) -> None:
    """Clear the HTML cache for a specific key or all entries.

    Args:
        cache_key: Optional specific key to clear; clears all if not provided
    """
    if cache_key:
        keys_to_delete = [k for k in _html_cache if k.startswith(cache_key)]
        for key in keys_to_delete:
            del _html_cache[key]
    else:
        _html_cache.clear()


def get_cache_size() -> int:
    """Get the current cache size."""
    return len(_html_cache)
