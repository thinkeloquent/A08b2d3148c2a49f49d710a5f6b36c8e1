"""
CQL (Confluence Query Language) query builder with fluent API.

Usage:
    from confluence_api.utils.cql_builder import cql, CQLBuilder

    query = (
        cql("type").equals("page")
        .and_()
        .field("space").equals("DEV")
        .and_()
        .field("title").contains("architecture")
        .order_by("lastModified", "desc")
        .build()
    )
    # => 'type = "page" AND space = "DEV" AND title ~ "architecture" ORDER BY lastModified desc'
"""

from __future__ import annotations

from typing import Any


class CQLBuilder:
    """
    Fluent CQL query builder for Confluence search.

    CQL (Confluence Query Language) is used with the /content/search and
    /search endpoints. This builder provides a safe, composable way to
    construct CQL queries without manual string concatenation.
    """

    def __init__(self, field_name: str | None = None) -> None:
        """
        Initialize the CQL builder.

        Args:
            field_name: Optional initial field name to query against.
        """
        self._parts: list[str] = []
        self._current_field: str | None = field_name
        self._order_by: str | None = None

    def field(self, name: str) -> CQLBuilder:
        """
        Set the current field for the next comparison operation.

        Args:
            name: CQL field name (e.g. 'type', 'space', 'title', 'label',
                  'creator', 'lastModified', 'ancestor', 'content').

        Returns:
            Self for method chaining.
        """
        self._current_field = name
        return self

    def equals(self, value: str) -> CQLBuilder:
        """
        Add an equality condition: field = "value".

        Args:
            value: The value to compare against.

        Returns:
            Self for method chaining.
        """
        self._assert_field()
        self._parts.append(f'{self._current_field} = {_quote(value)}')
        self._current_field = None
        return self

    def not_equals(self, value: str) -> CQLBuilder:
        """
        Add a not-equal condition: field != "value".

        Args:
            value: The value to compare against.

        Returns:
            Self for method chaining.
        """
        self._assert_field()
        self._parts.append(f'{self._current_field} != {_quote(value)}')
        self._current_field = None
        return self

    def contains(self, value: str) -> CQLBuilder:
        """
        Add a contains/matches condition: field ~ "value".

        Uses CQL's ~ operator for text search matching.

        Args:
            value: The text to search for.

        Returns:
            Self for method chaining.
        """
        self._assert_field()
        self._parts.append(f'{self._current_field} ~ {_quote(value)}')
        self._current_field = None
        return self

    def not_contains(self, value: str) -> CQLBuilder:
        """
        Add a not-contains condition: field !~ "value".

        Args:
            value: The text to exclude.

        Returns:
            Self for method chaining.
        """
        self._assert_field()
        self._parts.append(f'{self._current_field} !~ {_quote(value)}')
        self._current_field = None
        return self

    def in_list(self, values: list[str]) -> CQLBuilder:
        """
        Add an IN condition: field IN ("val1", "val2", ...).

        Args:
            values: List of values for the IN clause.

        Returns:
            Self for method chaining.
        """
        self._assert_field()
        quoted = ", ".join(_quote(v) for v in values)
        self._parts.append(f'{self._current_field} IN ({quoted})')
        self._current_field = None
        return self

    def not_in_list(self, values: list[str]) -> CQLBuilder:
        """
        Add a NOT IN condition: field NOT IN ("val1", "val2", ...).

        Args:
            values: List of values for the NOT IN clause.

        Returns:
            Self for method chaining.
        """
        self._assert_field()
        quoted = ", ".join(_quote(v) for v in values)
        self._parts.append(f'{self._current_field} NOT IN ({quoted})')
        self._current_field = None
        return self

    def is_not_null(self) -> CQLBuilder:
        """
        Add an IS NOT NULL condition: field IS NOT NULL.

        Returns:
            Self for method chaining.
        """
        self._assert_field()
        self._parts.append(f'{self._current_field} IS NOT NULL')
        self._current_field = None
        return self

    def is_null(self) -> CQLBuilder:
        """
        Add an IS NULL condition: field IS NULL.

        Returns:
            Self for method chaining.
        """
        self._assert_field()
        self._parts.append(f'{self._current_field} IS NULL')
        self._current_field = None
        return self

    def and_(self) -> CQLBuilder:
        """
        Add AND logical operator between conditions.

        Returns:
            Self for method chaining.
        """
        self._parts.append("AND")
        return self

    def or_(self) -> CQLBuilder:
        """
        Add OR logical operator between conditions.

        Returns:
            Self for method chaining.
        """
        self._parts.append("OR")
        return self

    def not_(self) -> CQLBuilder:
        """
        Add NOT logical operator before the next condition.

        Returns:
            Self for method chaining.
        """
        self._parts.append("NOT")
        return self

    def order_by(self, field: str, direction: str = "asc") -> CQLBuilder:
        """
        Set the ORDER BY clause.

        Args:
            field: Field name to sort by (e.g. 'lastModified', 'created', 'title').
            direction: Sort direction, either 'asc' or 'desc' (default 'asc').

        Returns:
            Self for method chaining.
        """
        direction = direction.lower()
        if direction not in ("asc", "desc"):
            raise ValueError(f"Invalid sort direction: {direction!r}. Must be 'asc' or 'desc'.")
        self._order_by = f"{field} {direction}"
        return self

    def build(self) -> str:
        """
        Build and return the final CQL query string.

        Returns:
            The complete CQL query string.

        Raises:
            ValueError: If no conditions have been added.
        """
        if not self._parts:
            raise ValueError("Cannot build empty CQL query. Add at least one condition.")

        query = " ".join(self._parts)

        if self._order_by:
            query += f" ORDER BY {self._order_by}"

        return query

    def _assert_field(self) -> None:
        """Assert that a current field is set for the next comparison."""
        if not self._current_field:
            raise ValueError(
                "No field set. Call .field('name') before a comparison method, "
                "or use cql('field_name') to initialize with a field."
            )

    def __repr__(self) -> str:
        try:
            return f"CQLBuilder(query={self.build()!r})"
        except ValueError:
            return "CQLBuilder(query=<empty>)"


def cql(field_name: str) -> CQLBuilder:
    """
    Shortcut constructor for CQLBuilder with an initial field.

    Args:
        field_name: The first field to query against.

    Returns:
        A new CQLBuilder instance with the field pre-set.

    Example:
        >>> cql("type").equals("page").and_().field("space").equals("DEV").build()
        'type = "page" AND space = "DEV"'
    """
    return CQLBuilder(field_name)


def _quote(value: str) -> str:
    """
    Quote a CQL string value with double quotes, escaping inner double quotes.

    Args:
        value: The string value to quote.

    Returns:
        The quoted string suitable for CQL.
    """
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'
