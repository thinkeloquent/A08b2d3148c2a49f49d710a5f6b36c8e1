"""
Cache Key Strategies

Functions for generating cache keys from request data.
"""

from __future__ import annotations

import hashlib
import json
from collections.abc import Callable
from typing import Any

from ..types import CacheKeyStrategy


def default_key_strategy(
    method: str,
    url: str,
    headers: dict[str, str] | None = None,
    body: Any = None,
    params: dict[str, Any] | None = None,
) -> str:
    """
    Default cache key strategy: METHOD:URL

    Example:
        default_key_strategy('GET', 'https://api.example.com/users')
        # Returns: 'GET:https://api.example.com/users'

        default_key_strategy('GET', 'https://api.example.com/users?page=1')
        # Returns: 'GET:https://api.example.com/users?page=1'
    """
    return f"{method.upper()}:{url}"


def _get_by_path(obj: dict[str, Any], path: str) -> Any:
    """
    Get a value from a dict using dot notation path.

    Example:
        obj = {'headers': {'Authorization': 'Bearer ****'}}
        _get_by_path(obj, 'headers.Authorization')  # 'Bearer ****'
    """
    keys = path.split(".")
    value: Any = obj
    for key in keys:
        if isinstance(value, dict):
            value = value.get(key)
        else:
            return None
    return value


def create_dot_notation_key_strategy(
    paths: list[str],
) -> CacheKeyStrategy:
    """
    Create a cache key strategy using dot notation to access request properties.

    Example:
        key_strategy = create_dot_notation_key_strategy([
            'headers.Authorization',
            'headers.Accept-Language',
            'body.user_id',
            'params.page'
        ])

        # With request:
        # { method: 'GET', url: '...', headers: { Authorization: 'Bearer ****' }, params: { page: 1 } }
        #
        # Returns: 'GET:https://api.example.com/users:headers.Authorization=Bearer ****:params.page=1'
    """

    def strategy(
        method: str,
        url: str,
        headers: dict[str, str] | None = None,
        body: Any = None,
        params: dict[str, Any] | None = None,
    ) -> str:
        request: dict[str, Any] = {
            "method": method,
            "url": url,
            "headers": headers or {},
            "body": body if isinstance(body, dict) else {},
            "params": params or {},
        }

        parts = [method.upper(), url]

        for path in paths:
            value = _get_by_path(request, path)
            if value is not None:
                parts.append(f"{path}={value}")

        return ":".join(parts)

    return strategy


def create_hashed_key_strategy(
    hash_fn: Callable[[str], str] | None = None,
) -> CacheKeyStrategy:
    """
    Create a cache key strategy that hashes all request data.

    Useful when cache keys would be very long.

    Example:
        key_strategy = create_hashed_key_strategy()  # Uses SHA256[:16] by default

        # Custom hash function
        key_strategy = create_hashed_key_strategy(
            lambda data: hashlib.md5(data.encode()).hexdigest()
        )
    """

    def default_hash(data: str) -> str:
        return hashlib.sha256(data.encode()).hexdigest()[:16]

    hasher = hash_fn or default_hash

    def strategy(
        method: str,
        url: str,
        headers: dict[str, str] | None = None,
        body: Any = None,
        params: dict[str, Any] | None = None,
    ) -> str:
        data = json.dumps(
            {
                "method": method,
                "url": url,
                "headers": headers,
                "body": body,
                "params": params,
            },
            sort_keys=True,
            default=str,
        )
        return hasher(data)

    return strategy


def combine_key_strategies(*strategies: CacheKeyStrategy) -> CacheKeyStrategy:
    """
    Combine multiple key strategies.

    Example:
        key_strategy = combine_key_strategies(
            default_key_strategy,
            create_dot_notation_key_strategy(['headers.Authorization'])
        )
    """

    def strategy(
        method: str,
        url: str,
        headers: dict[str, str] | None = None,
        body: Any = None,
        params: dict[str, Any] | None = None,
    ) -> str:
        parts: list[str] = []

        for strat in strategies:
            key = strat(method, url, headers, body, params)
            if key and key not in parts:
                parts.append(key)

        return ":".join(parts)

    return strategy
