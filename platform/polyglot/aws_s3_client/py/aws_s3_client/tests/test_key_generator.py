"""Tests for key generation."""

import pytest

from aws_s3_client.key_generator import generate_key


class TestGenerateKey:
    """Test cases for generate_key function."""

    def test_generates_16_char_hex(self) -> None:
        """Key should be 16 characters of hexadecimal."""
        key = generate_key({"name": "Alice"})
        assert len(key) == 16
        assert all(c in "0123456789abcdef" for c in key)

    def test_deterministic(self) -> None:
        """Same input should produce same key."""
        data = {"user_id": 123, "name": "Alice"}
        key1 = generate_key(data)
        key2 = generate_key(data)
        assert key1 == key2

    def test_different_data_different_keys(self) -> None:
        """Different data should produce different keys."""
        key1 = generate_key({"name": "Alice"})
        key2 = generate_key({"name": "Bob"})
        assert key1 != key2

    def test_key_order_independent(self) -> None:
        """Key order should not affect output."""
        key1 = generate_key({"a": 1, "b": 2})
        key2 = generate_key({"b": 2, "a": 1})
        assert key1 == key2

    def test_hash_keys_filter(self) -> None:
        """hash_keys should filter which fields are used."""
        data = {"user_id": 123, "name": "Alice", "timestamp": 12345}

        key_all = generate_key(data)
        key_filtered = generate_key(data, hash_keys=["user_id", "name"])

        # Different because timestamp is excluded
        assert key_all != key_filtered

    def test_hash_keys_order_matters(self) -> None:
        """hash_keys order should affect output."""
        data = {"a": 1, "b": 2}

        key1 = generate_key(data, hash_keys=["a", "b"])
        key2 = generate_key(data, hash_keys=["b", "a"])

        assert key1 != key2

    def test_handles_nested_objects(self) -> None:
        """Should handle nested objects."""
        data = {"user": {"name": "Alice", "age": 30}}
        key = generate_key(data)
        assert len(key) == 16

    def test_handles_arrays(self) -> None:
        """Should handle arrays."""
        data = {"tags": ["python", "aws", "s3"]}
        key = generate_key(data)
        assert len(key) == 16

    def test_handles_null_values(self) -> None:
        """Should handle null values."""
        data = {"name": "Alice", "email": None}
        key = generate_key(data)
        assert len(key) == 16

    def test_handles_boolean_values(self) -> None:
        """Should handle boolean values."""
        data = {"active": True, "verified": False}
        key = generate_key(data)
        assert len(key) == 16

    def test_handles_numeric_values(self) -> None:
        """Should handle numeric values."""
        data = {"count": 42, "rate": 3.14}
        key = generate_key(data)
        assert len(key) == 16
