"""
Tests for key generation utilities.
"""

from __future__ import annotations

import pytest

from cache_json_awss3_storage.key_generator import generate_key


class TestGenerateKey:
    """Tests for generate_key function."""

    def test_generates_deterministic_key(self) -> None:
        """Same input should always produce same output."""
        data = {"user_id": 123, "name": "Alice"}

        key1 = generate_key(data)
        key2 = generate_key(data)

        assert key1 == key2
        assert len(key1) == 16

    def test_different_data_different_keys(self) -> None:
        """Different input should produce different output."""
        data1 = {"user_id": 123, "name": "Alice"}
        data2 = {"user_id": 456, "name": "Bob"}

        key1 = generate_key(data1)
        key2 = generate_key(data2)

        assert key1 != key2

    def test_uses_all_keys_sorted_by_default(self) -> None:
        """Without hash_keys, all keys should be used sorted alphabetically."""
        data1 = {"b": 2, "a": 1}
        data2 = {"a": 1, "b": 2}

        key1 = generate_key(data1)
        key2 = generate_key(data2)

        # Same keys, same values, same result regardless of order
        assert key1 == key2

    def test_uses_only_specified_hash_keys(self) -> None:
        """With hash_keys, only specified keys should be used."""
        data = {"user_id": 123, "name": "Alice", "email": "alice@example.com"}

        key_all = generate_key(data)
        key_partial = generate_key(data, hash_keys=["user_id"])

        assert key_all != key_partial

    def test_hash_keys_order_matters(self) -> None:
        """hash_keys order should affect the result."""
        data = {"a": 1, "b": 2}

        key1 = generate_key(data, hash_keys=["a", "b"])
        key2 = generate_key(data, hash_keys=["b", "a"])

        assert key1 != key2

    def test_handles_empty_dict(self) -> None:
        """Empty dict should produce valid key."""
        data: dict[str, object] = {}

        key = generate_key(data)

        assert len(key) == 16
        assert key.isalnum()

    def test_handles_none_values(self) -> None:
        """None values should be handled."""
        data = {"user_id": 123, "optional": None}

        key = generate_key(data)

        assert len(key) == 16

    def test_handles_nested_objects(self) -> None:
        """Nested objects should be serialized consistently."""
        data = {"user": {"id": 123, "name": "Alice"}, "active": True}

        key1 = generate_key(data)
        key2 = generate_key(data)

        assert key1 == key2
        assert len(key1) == 16

    def test_handles_lists(self) -> None:
        """Lists should be serialized consistently."""
        data = {"items": [1, 2, 3], "name": "test"}

        key1 = generate_key(data)
        key2 = generate_key(data)

        assert key1 == key2

    def test_handles_boolean_values(self) -> None:
        """Boolean values should be serialized consistently."""
        data1 = {"active": True}
        data2 = {"active": False}

        key1 = generate_key(data1)
        key2 = generate_key(data2)

        assert key1 != key2

    def test_handles_numeric_values(self) -> None:
        """Numeric values should be serialized correctly."""
        data_int = {"value": 42}
        data_float = {"value": 42.0}

        key_int = generate_key(data_int)
        key_float = generate_key(data_float)

        # Note: 42 and 42.0 will produce different keys due to string representation
        assert len(key_int) == 16
        assert len(key_float) == 16

    def test_missing_hash_keys_use_empty_string(self) -> None:
        """Missing hash_keys should use empty string."""
        data = {"user_id": 123}

        key = generate_key(data, hash_keys=["user_id", "missing_key"])

        assert len(key) == 16

    def test_key_is_hexadecimal(self) -> None:
        """Generated key should be valid hexadecimal."""
        data = {"test": "value"}

        key = generate_key(data)

        # Should be valid hex
        int(key, 16)  # Will raise ValueError if not valid hex
