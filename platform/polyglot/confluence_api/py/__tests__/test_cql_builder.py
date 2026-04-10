"""
Unit tests for confluence_api.utils.cql_builder module.

Tests cover:
- Statement coverage for all builder methods
- Branch coverage for order_by validation, empty build
- Boundary value analysis (empty queries, special characters)
- Error handling (missing field, invalid direction)
"""

import pytest

from confluence_api.utils.cql_builder import CQLBuilder, cql


class TestCQLBuilder:
    """Tests for the CQLBuilder class."""

    class TestStatementCoverage:
        """Ensure every statement executes at least once."""

        def test_equals_produces_equality_condition(self):
            result = cql("type").equals("page").build()
            assert result == 'type = "page"'

        def test_not_equals_produces_inequality(self):
            result = cql("type").not_equals("comment").build()
            assert result == 'type != "comment"'

        def test_contains_produces_tilde_operator(self):
            result = cql("title").contains("architecture").build()
            assert result == 'title ~ "architecture"'

        def test_not_contains_produces_not_tilde(self):
            result = cql("title").not_contains("draft").build()
            assert result == 'title !~ "draft"'

        def test_in_list_produces_in_clause(self):
            result = cql("space").in_list(["DEV", "OPS"]).build()
            assert result == 'space IN ("DEV", "OPS")'

        def test_not_in_list_produces_not_in_clause(self):
            result = cql("space").not_in_list(["TEST"]).build()
            assert result == 'space NOT IN ("TEST")'

        def test_is_not_null(self):
            result = cql("label").is_not_null().build()
            assert result == "label IS NOT NULL"

        def test_is_null(self):
            result = cql("label").is_null().build()
            assert result == "label IS NULL"

        def test_and_joins_conditions(self):
            result = (
                cql("type").equals("page")
                .and_()
                .field("space").equals("DEV")
                .build()
            )
            assert result == 'type = "page" AND space = "DEV"'

        def test_or_joins_conditions(self):
            result = (
                cql("space").equals("DEV")
                .or_()
                .field("space").equals("OPS")
                .build()
            )
            assert result == 'space = "DEV" OR space = "OPS"'

        def test_not_prefix_operator(self):
            result = (
                CQLBuilder()
                .not_()
                .field("type").equals("comment")
                .build()
            )
            assert result == 'NOT type = "comment"'

        def test_order_by_asc(self):
            result = cql("type").equals("page").order_by("created", "asc").build()
            assert result == 'type = "page" ORDER BY created asc'

        def test_order_by_desc(self):
            result = cql("type").equals("page").order_by("lastModified", "desc").build()
            assert result == 'type = "page" ORDER BY lastModified desc'

        def test_complex_query(self):
            result = (
                cql("type").equals("page")
                .and_()
                .field("space").equals("DEV")
                .and_()
                .field("title").contains("architecture")
                .order_by("lastModified", "desc")
                .build()
            )
            expected = 'type = "page" AND space = "DEV" AND title ~ "architecture" ORDER BY lastModified desc'
            assert result == expected

    class TestBranchCoverage:
        """Test all if/else branches."""

        def test_order_by_default_is_asc(self):
            result = cql("type").equals("page").order_by("created").build()
            assert "ORDER BY created asc" in result

        def test_build_without_order_by(self):
            result = cql("type").equals("page").build()
            assert "ORDER BY" not in result

        def test_build_with_order_by(self):
            result = cql("type").equals("page").order_by("title").build()
            assert "ORDER BY title asc" in result

    class TestBoundaryValueAnalysis:
        """Test edge cases."""

        def test_value_with_double_quotes_is_escaped(self):
            result = cql("title").equals('say "hello"').build()
            assert result == r'title = "say \"hello\""'

        def test_value_with_backslash_is_escaped(self):
            result = cql("title").equals("path\\to\\file").build()
            assert result == r'title = "path\\to\\file"'

        def test_single_item_in_list(self):
            result = cql("space").in_list(["DEV"]).build()
            assert result == 'space IN ("DEV")'

        def test_field_method_returns_self(self):
            builder = CQLBuilder()
            returned = builder.field("space")
            assert returned is builder

        def test_repr_with_query(self):
            builder = cql("type").equals("page")
            r = repr(builder)
            assert "CQLBuilder" in r
            assert "page" in r

        def test_repr_empty_builder(self):
            builder = CQLBuilder()
            r = repr(builder)
            assert "empty" in r

    class TestErrorHandling:
        """Test error conditions and exception paths."""

        def test_build_empty_raises_value_error(self):
            builder = CQLBuilder()
            with pytest.raises(ValueError, match="empty"):
                builder.build()

        def test_equals_without_field_raises_value_error(self):
            builder = CQLBuilder()
            with pytest.raises(ValueError, match="No field set"):
                builder.equals("value")

        def test_contains_without_field_raises_value_error(self):
            builder = CQLBuilder()
            with pytest.raises(ValueError, match="No field set"):
                builder.contains("value")

        def test_invalid_order_direction_raises_value_error(self):
            with pytest.raises(ValueError, match="Invalid sort direction"):
                cql("type").equals("page").order_by("created", "sideways")


class TestCqlShortcut:
    """Tests for the cql() shortcut factory."""

    def test_cql_returns_builder_with_field(self):
        builder = cql("space")
        result = builder.equals("DEV").build()
        assert result == 'space = "DEV"'

    def test_cql_returns_cql_builder_instance(self):
        builder = cql("space")
        assert isinstance(builder, CQLBuilder)
