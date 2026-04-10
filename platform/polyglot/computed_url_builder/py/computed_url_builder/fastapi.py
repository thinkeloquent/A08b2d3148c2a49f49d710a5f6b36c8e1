"""
FastAPI integration for computed-url-builder.

Provides dependency injection utilities and example patterns for using
the URL builder with FastAPI applications.

Usage:
    from fastapi import FastAPI, Depends
    from computed_url_builder.fastapi import get_url_builder, UrlBuilderDep

    app = FastAPI()

    @app.get("/api/proxy")
    async def proxy_request(builder: UrlBuilderDep):
        url = builder.build("dev")
        # ... use url
"""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Annotated, Optional

from .builder import UrlBuilder, create_url_builder
from .logger import Logger
from .logger import create as create_logger
from .types import UrlKeys


@lru_cache
def get_url_builder(
    prefix: str = "URL_BUILDER_",
    base_path: str = "",
) -> UrlBuilder:
    """
    Get or create a cached URL builder instance from environment variables.

    This function is designed to be used as a FastAPI dependency.
    The builder is cached to avoid recreating it on every request.

    Args:
        prefix: Environment variable prefix (default: "URL_BUILDER_")
        base_path: Base path to append to string URLs

    Returns:
        Cached UrlBuilder instance

    Example:
        >>> from fastapi import FastAPI, Depends
        >>> from computed_url_builder.fastapi import get_url_builder
        >>>
        >>> app = FastAPI()
        >>>
        >>> @app.get("/")
        >>> async def root(builder = Depends(get_url_builder)):
        ...     return {"url": builder.build("dev")}
    """
    logger = create_logger("computed_url_builder.fastapi", __file__)
    logger.info("Creating URL builder from environment with prefix='%s'", prefix)

    return UrlBuilder.from_env(prefix=prefix, base_path=base_path, logger=logger)


def create_url_builder_dependency(
    url_keys: UrlKeys | None = None,
    base_path: str = "",
    prefix: str | None = None,
    logger: Logger | None = None,
) -> UrlBuilder:
    """
    Create a URL builder dependency with custom configuration.

    Use this when you need more control over the builder configuration
    than get_url_builder provides.

    Args:
        url_keys: Static URL configuration. If None, loads from environment.
        base_path: Base path to append to string URLs
        prefix: Environment variable prefix (only used if url_keys is None)
        logger: Custom logger instance

    Returns:
        UrlBuilder instance

    Example:
        >>> from fastapi import FastAPI, Depends
        >>> from computed_url_builder.fastapi import create_url_builder_dependency
        >>>
        >>> # Create builder with static config
        >>> builder = create_url_builder_dependency(
        ...     url_keys={"dev": "https://dev.api.com"},
        ...     base_path="/v1"
        ... )
        >>>
        >>> app = FastAPI()
        >>>
        >>> @app.get("/")
        >>> async def root():
        ...     return {"url": builder.build("dev")}
    """
    _logger = logger or create_logger("computed_url_builder.fastapi", __file__)

    if url_keys is not None:
        _logger.debug("Creating builder with static url_keys")
        return create_url_builder(url_keys, base_path, logger=_logger)

    _logger.debug("Creating builder from environment")
    return UrlBuilder.from_env(
        prefix=prefix or "URL_BUILDER_",
        base_path=base_path,
        logger=_logger,
    )


# Type alias for FastAPI dependency injection
try:
    from fastapi import Depends

    # Annotated type for dependency injection
    UrlBuilderDep = Annotated[UrlBuilder, Depends(get_url_builder)]
except ImportError:
    # FastAPI not installed, provide a placeholder
    UrlBuilderDep = UrlBuilder  # type: ignore


__all__ = [
    "get_url_builder",
    "create_url_builder_dependency",
    "UrlBuilderDep",
]
