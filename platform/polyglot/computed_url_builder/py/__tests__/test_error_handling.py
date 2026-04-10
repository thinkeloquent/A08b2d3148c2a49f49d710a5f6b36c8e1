"""
Tests for error handling.
"""

import pytest

from computed_url_builder import create_null_logger, create_url_builder


class TestErrorHandling:
    """Tests for error handling scenarios."""

    def test_throw_error_for_non_existent_key(self, basic_builder):
        """Should raise KeyError for non-existent environment key."""
        with pytest.raises(KeyError) as exc_info:
            basic_builder.build("staging")

        assert 'Environment key "staging" not found' in str(exc_info.value)

    def test_throw_error_for_undefined_key(self, null_logger):
        """Should raise KeyError for undefined key."""
        builder = create_url_builder(
            {"dev": "https://dev.api.example.com"},
            logger=null_logger,
        )

        with pytest.raises(KeyError) as exc_info:
            builder.build("prod")

        assert 'Environment key "prod" not found' in str(exc_info.value)

    def test_handle_empty_url_keys(self, empty_builder):
        """Should raise KeyError when url_keys is empty."""
        with pytest.raises(KeyError) as exc_info:
            empty_builder.build("any")

        assert 'Environment key "any" not found' in str(exc_info.value)
