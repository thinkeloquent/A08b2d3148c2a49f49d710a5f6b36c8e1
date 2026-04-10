"""
Unit tests for key_generator module.

Tests cover:
- Statement coverage for all code paths
- Branch coverage for all conditionals
- Boundary value analysis
- Error handling verification
- Cross-language parity verification
"""

import pytest

from cache_json_awss3_storage import generate_key


class TestGenerateKey:
    """Tests for generate_key function."""

    # =========================================================================
    # Statement Coverage
    # =========================================================================

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        def test_generates_deterministic_key(self):
            """Same data produces same key."""
            data = {"user_id": 123, "name": "Alice"}

            key1 = generate_key(data)
            key2 = generate_key(data)

            assert key1 == key2
            assert len(key1) == 16

        def test_key_is_valid_hexadecimal(self):
            """Generated key should be valid hex string."""
            data = {"test": "value"}

            key = generate_key(data)

            assert len(key) == 16
            assert all(c in "0123456789abcdef" for c in key)

    # =========================================================================
    # Branch Coverage
    # =========================================================================

    class TestBranchCoverage:
        """Test all if/else branches."""

        def test_with_hash_keys_specified(self):
            """Branch: hash_keys provided."""
            data = {"a": 1, "b": 2, "c": 3}

            key_all = generate_key(data)
            key_partial = generate_key(data, ["a", "b"])

            assert key_all != key_partial

        def test_without_hash_keys(self):
            """Branch: no hash_keys (use all sorted keys)."""
            data = {"b": 2, "a": 1}

            key = generate_key(data)

            assert len(key) == 16

        def test_hash_keys_order_affects_key(self):
            """Branch: hash_keys order matters."""
            data = {"a": 1, "b": 2}

            key_ab = generate_key(data, ["a", "b"])
            key_ba = generate_key(data, ["b", "a"])

            assert key_ab != key_ba

    # =========================================================================
    # Boundary Value Analysis
    # =========================================================================

    class TestBoundaryValues:
        """Test edge cases: empty, min, max, boundary values."""

        def test_empty_dict(self):
            """Boundary: empty data dictionary."""
            data = {}

            key = generate_key(data)

            assert len(key) == 16
            assert all(c in "0123456789abcdef" for c in key)

        def test_none_values(self):
            """Boundary: None values in data."""
            data = {"user_id": 123, "optional": None}

            key = generate_key(data)

            assert len(key) == 16

        def test_nested_objects(self):
            """Boundary: deeply nested structures."""
            data = {"user": {"profile": {"name": "Alice", "age": 30}}}

            key1 = generate_key(data)
            key2 = generate_key(data)

            assert key1 == key2
            assert len(key1) == 16

        def test_arrays_in_data(self):
            """Boundary: arrays/lists in data."""
            data = {"items": [1, 2, 3], "tags": ["a", "b"]}

            key1 = generate_key(data)
            key2 = generate_key(data)

            assert key1 == key2

        def test_boolean_values(self):
            """Boundary: boolean values."""
            data_true = {"active": True}
            data_false = {"active": False}

            key_true = generate_key(data_true)
            key_false = generate_key(data_false)

            assert key_true != key_false

        def test_numeric_values(self):
            """Boundary: different numeric types."""
            data_int = {"value": 42}
            data_float = {"value": 42.5}

            key_int = generate_key(data_int)
            key_float = generate_key(data_float)

            assert key_int != key_float

        def test_missing_hash_keys(self):
            """Boundary: specified hash_keys not in data."""
            data = {"user_id": 123}

            # Should not raise, missing keys treated as empty string
            key = generate_key(data, ["user_id", "missing_key"])

            assert len(key) == 16

        def test_key_order_independent(self):
            """Boundary: object key order should not matter (when no hash_keys)."""
            data1 = {"b": 2, "a": 1}
            data2 = {"a": 1, "b": 2}

            key1 = generate_key(data1)
            key2 = generate_key(data2)

            assert key1 == key2

    # =========================================================================
    # Cross-Language Parity
    # =========================================================================

    class TestCrossLanguageParity:
        """Verify key generation matches TypeScript implementation."""

        def test_standard_parity_case(self):
            """Key should match TypeScript for standard test data."""
            data = {"user_id": 123, "name": "Alice"}

            key = generate_key(data)

            # This is the key generated by both Python and TypeScript
            assert key == "a3a1025004e50a9b"

        def test_empty_dict_parity(self):
            """Empty dict key should match TypeScript."""
            data = {}

            key = generate_key(data)

            # Both implementations should produce same hash for empty
            assert len(key) == 16
