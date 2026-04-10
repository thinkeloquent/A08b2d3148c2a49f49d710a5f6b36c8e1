"""
Computed URL Builder - A lightweight utility for building integration endpoint URLs.

This package provides a simple, environment-aware URL builder for constructing
URLs from configuration. It supports both Python and Node.js with identical interfaces.

Features:
    - Build URLs from environment configurations
    - Support for simple host + basePath or full URL arrays
    - Defensive programming with extensive logging
    - Zero runtime dependencies

Usage:
    >>> from computed_url_builder import create_url_builder
    >>>
    >>> builder = create_url_builder(
    ...     {'dev': 'https://dev.api.com', 'prod': 'https://api.com'},
    ...     '/api/v1'
    ... )
    >>> builder.build('dev')
    'https://dev.api.com/api/v1'

Environment-based configuration:
    >>> from computed_url_builder import UrlBuilder
    >>> import os
    >>> os.environ['URL_BUILDER_DEV'] = 'https://dev.api.com'
    >>> builder = UrlBuilder.from_env()
    >>> builder.build('dev')
    'https://dev.api.com'
"""

from __future__ import annotations

__version__ = "1.0.0"
__author__ = "thinkeloquent"

# Core exports
from .builder import UrlBuilder, create_url_builder

# Logger exports
from .logger import (
    Logger as LoggerProtocol,
)
from .logger import (
    NullLogger,
    PackageLogger,
)
from .logger import (
    create as create_logger,
)
from .logger import (
    create_null as create_null_logger,
)
from .types import BuilderInstance, Logger, UrlKeys

__all__ = [
    # Version
    "__version__",
    # Core
    "create_url_builder",
    "UrlBuilder",
    # Types
    "UrlKeys",
    "BuilderInstance",
    "Logger",
    # Logger
    "create_logger",
    "create_null_logger",
    "PackageLogger",
    "NullLogger",
    "LoggerProtocol",
]
