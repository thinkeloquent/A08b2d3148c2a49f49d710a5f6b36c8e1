"""
Core URL builder implementation for computed-url-builder package.

Provides the UrlBuilder class and create_url_builder factory function
for building environment-specific URLs with optional computed values.
"""

from __future__ import annotations

import os
from collections.abc import Callable
from typing import Any, Dict, List, Optional, Union

from .logger import Logger
from .logger import create as create_logger
from .types import UrlFunction, UrlKeys, UrlValue


class UrlBuilder:
    """
    URL builder instance for constructing environment-specific URLs.

    Provides methods for building URLs from environment configurations.
    Values can be strings, arrays, or functions that compute URLs from context.
    All operations are logged at DEBUG level for defensive programming.

    Attributes:
        env: The environment URL configuration
        base_path: The base path appended to string URLs
    """

    def __init__(
        self,
        url_keys: UrlKeys | None = None,
        base_path: str = "",
        logger: Logger | None = None,
    ) -> None:
        """
        Initialize the URL builder.

        Args:
            url_keys: Environment to URL mapping. Values can be:
                     - strings (host URL)
                     - lists of strings (URL parts to join)
                     - functions that take context and return a string
            base_path: Base path to append when using string URL values.
            logger: Optional logger instance. If None, creates a default logger.
        """
        self._env: UrlKeys = url_keys if url_keys is not None else {}
        self._base_path: str = base_path
        self._logger: Logger = logger if logger is not None else create_logger(
            "computed_url_builder", __file__
        )

        self._logger.debug(
            "UrlBuilder initialized with %d environments, base_path='%s'",
            len(self._env),
            self._base_path,
        )

    @property
    def env(self) -> UrlKeys:
        """Get the environment URL configuration."""
        return self._env

    @property
    def base_path(self) -> str:
        """Get the base path."""
        return self._base_path

    def build(self, key: str, context: dict[str, Any] | None = None) -> str:
        """
        Build a URL for the specified environment key.

        Args:
            key: Environment key (e.g., 'dev', 'prod', 'staging')
            context: Optional context dict passed to function-based URL values

        Returns:
            Complete URL string

        Raises:
            KeyError: If the environment key is not found

        Example:
            >>> builder = UrlBuilder({'dev': 'https://dev.api.com'}, '/v1')
            >>> builder.build('dev')
            'https://dev.api.com/v1'

            >>> builder = UrlBuilder({'dev': lambda ctx: f"https://{ctx['tenant']}.api.com"})
            >>> builder.build('dev', {'tenant': 'acme'})
            'https://acme.api.com'
        """
        self._logger.debug("build() called with key='%s', context=%s", key, context)

        value = self._env.get(key)

        if value is None:
            error_msg = f'Environment key "{key}" not found'
            self._logger.error(error_msg)
            raise KeyError(error_msg)

        # If value is callable (function), invoke with context
        if callable(value):
            ctx = context if context is not None else {}
            result = value(ctx)
            self._logger.debug("build() invoked function, result='%s'", result)
            # Apply base_path to function result
            result = result + self._base_path
        # If value is a list, join without separator
        elif isinstance(value, list):
            result = "".join(value)
            self._logger.debug("build() joining array, result='%s'", result)
        else:
            # Otherwise, concatenate with base_path
            result = value + self._base_path
            self._logger.debug("build() concatenating with base_path, result='%s'", result)

        return result

    def to_dict(self) -> dict[str, Any]:
        """
        Serialize the builder state to a dictionary.

        Useful for debugging, logging, and SDK integrations.

        Returns:
            Dictionary containing env and base_path

        Example:
            >>> builder.to_dict()
            {'env': {'dev': 'https://dev.api.com'}, 'base_path': '/v1'}
        """
        self._logger.debug("to_dict() called")
        return {
            "env": dict(self._env),
            "base_path": self._base_path,
        }

    @classmethod
    def from_context(
        cls,
        url_keys: UrlKeys,
        base_path: str = "",
        logger: Logger | None = None,
    ) -> UrlBuilder:
        """
        Create a URL builder from a context object.

        This is an alternative factory method that accepts URL keys directly.
        Values can be strings, arrays, or functions that compute URLs.

        Args:
            url_keys: Environment to URL mapping. Values can be:
                     - strings (host URL)
                     - lists of strings (URL parts to join)
                     - functions that take context dict and return a string
            base_path: Base path to append to string URLs
            logger: Optional logger instance

        Returns:
            UrlBuilder instance

        Example:
            >>> builder = UrlBuilder.from_context({
            ...     'dev': lambda ctx: f"https://{ctx['region']}.dev.api.com",
            ...     'prod': 'https://api.com'
            ... })
            >>> builder.build('dev', {'region': 'us-west'})
            'https://us-west.dev.api.com'
        """
        _logger = logger if logger is not None else create_logger(
            "computed_url_builder", __file__
        )
        _logger.debug("from_context() called with %d environments", len(url_keys))

        return cls(url_keys, base_path, logger)

    def __repr__(self) -> str:
        """Return a string representation of the builder."""
        return (
            f"UrlBuilder(env={list(self._env.keys())}, "
            f"base_path='{self._base_path}')"
        )


def create_url_builder(
    url_keys: UrlKeys | None = None,
    base_path: str = "",
    logger: Logger | None = None,
) -> UrlBuilder:
    """
    Create a URL builder instance.

    Factory function for creating UrlBuilder instances.

    Args:
        url_keys: Environment to URL mapping. Values can be strings (host)
                 or lists of strings (URL parts to join).
        base_path: Base path to append when using string URL values.
        logger: Optional logger instance. If None, creates a default logger.

    Returns:
        UrlBuilder instance

    Example:
        >>> builder = create_url_builder(
        ...     {'dev': 'https://dev.api.com', 'prod': 'https://api.com'},
        ...     '/api/v1'
        ... )
        >>> builder.build('dev')
        'https://dev.api.com/api/v1'
    """
    return UrlBuilder(url_keys, base_path, logger)
