"""
Key Generation Utilities

Provides deterministic SHA256-based key generation for storage entries.
Ensures cross-language parity with the TypeScript implementation.
"""

from __future__ import annotations

import hashlib
import json
from typing import Any


def _serialize_value(value: Any) -> str:
    """
    Serialize a value to string for key generation.

    Handles nested objects by JSON serialization with sorted keys.

    Args:
        value: Any JSON-serializable value

    Returns:
        String representation of the value
    """
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        return value
    if isinstance(value, (list, dict)):
        # Use JSON with sorted keys for deterministic output
        return json.dumps(value, sort_keys=True, separators=(",", ":"))
    return str(value)


def generate_key(
    data: dict[str, Any],
    hash_keys: list[str] | None = None,
) -> str:
    """
    Generate a deterministic storage key from data.

    Uses SHA256 hash with 16-character hex output for uniqueness.
    Key generation is deterministic: same input always produces same output.

    Args:
        data: Dictionary of data to generate key from
        hash_keys: Optional list of specific keys to use for hashing.
                   If None, all keys are used (sorted alphabetically).

    Returns:
        16-character hexadecimal key

    Example:
        >>> generate_key({"user_id": 123, "name": "Alice"})
        'a1b2c3d4e5f67890'

        >>> generate_key({"user_id": 123, "name": "Alice"}, hash_keys=["user_id"])
        'f0e1d2c3b4a59876'
    """
    if hash_keys:
        # Use only specified keys in order
        parts = [f"{k}:{_serialize_value(data.get(k))}" for k in hash_keys]
    else:
        # Use all keys sorted alphabetically
        parts = [f"{k}:{_serialize_value(v)}" for k, v in sorted(data.items())]

    # Join with pipe separator
    key_string = "|".join(parts)

    # Generate SHA256 hash and take first 16 characters
    hash_bytes = hashlib.sha256(key_string.encode("utf-8")).hexdigest()
    return hash_bytes[:16]


def generate_key_string(key_string: str) -> str:
    """
    Generate a storage key from a pre-built key string.

    Useful when the caller has already constructed the key string.

    Args:
        key_string: Pre-built key string

    Returns:
        16-character hexadecimal key
    """
    hash_bytes = hashlib.sha256(key_string.encode("utf-8")).hexdigest()
    return hash_bytes[:16]


def generate_key_from_value(data: dict[str, Any]) -> str:
    """
    Generate a storage key from object value hash.

    Hashes the entire object (all keys and values) to create a deterministic key.
    Useful for content-addressable storage where the same data always produces
    the same key.

    Args:
        data: Dictionary to hash

    Returns:
        16-character hexadecimal key

    Example:
        >>> key = generate_key_from_value({"name": "Alice", "score": 100})
        >>> await storage.save(key, {"name": "Alice", "score": 100})
    """
    # Sort keys and serialize to JSON for deterministic output
    sorted_json = json.dumps(data, sort_keys=True, separators=(",", ":"))
    hash_bytes = hashlib.sha256(sorted_json.encode("utf-8")).hexdigest()
    return hash_bytes[:16]


def generate_key_from_fields(
    data: dict[str, Any],
    fields: list[str],
) -> str:
    """
    Generate a storage key from specific object fields.

    Extracts specified fields from the object and hashes them. Useful when
    you want to key by certain fields (like user_id, session_id) regardless
    of other data in the object.

    Args:
        data: Dictionary containing the fields
        fields: List of field names to use for key generation

    Returns:
        16-character hexadecimal key

    Example:
        >>> key = generate_key_from_fields(
        ...     {"user_id": 123, "action": "login", "timestamp": 1234567890},
        ...     ["user_id", "action"]
        ... )
        # Key is based only on user_id and action, not timestamp
    """
    return generate_key(data, hash_keys=fields)
