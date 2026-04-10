"""Tests for the JSX usage extractor."""

import pytest

from github_sdk_api_component_usage_audit.analysis.jsx_extractor import (
    extract_jsx_usages,
    MAX_SNIPPET_LENGTH,
)


class TestSelfClosing:
    """Self-closing tag extraction: <Component />"""

    def test_simple_self_closing(self):
        source = '<Accordion />'
        result = extract_jsx_usages(source, "Accordion")
        assert result == ["<Accordion />"]

    def test_self_closing_with_props(self):
        source = '<Accordion variant="outlined" disabled />'
        result = extract_jsx_usages(source, "Accordion")
        assert len(result) == 1
        assert 'variant="outlined"' in result[0]

    def test_self_closing_multiline_props(self):
        source = """<Accordion
  variant="outlined"
  disabled
/>"""
        result = extract_jsx_usages(source, "Accordion")
        assert len(result) == 1
        assert "variant" in result[0]

    def test_no_match(self):
        source = '<Button onClick={handler} />'
        result = extract_jsx_usages(source, "Accordion")
        assert result == []


class TestPairedTags:
    """Paired tag extraction: <Component>...</Component>"""

    def test_simple_paired(self):
        source = "<Accordion>content</Accordion>"
        result = extract_jsx_usages(source, "Accordion")
        assert result == ["<Accordion>content</Accordion>"]

    def test_paired_with_props(self):
        source = '<Accordion expanded={true}>content</Accordion>'
        result = extract_jsx_usages(source, "Accordion")
        assert len(result) == 1
        assert "expanded" in result[0]

    def test_multiline_paired(self):
        source = """<Accordion>
  <AccordionSummary>Title</AccordionSummary>
  <AccordionDetails>Body</AccordionDetails>
</Accordion>"""
        result = extract_jsx_usages(source, "Accordion")
        assert len(result) == 1
        assert "<AccordionSummary>" in result[0]

    def test_does_not_match_subcomponent_name(self):
        """Searching for 'Accordion' should NOT match 'AccordionSummary' alone."""
        source = "<AccordionSummary>Title</AccordionSummary>"
        result = extract_jsx_usages(source, "Accordion")
        # The regex for self-closing won't match, but the paired regex
        # for <Accordion...>...</Accordion> won't match either because
        # the closing tag is </AccordionSummary> not </Accordion>
        assert result == []


class TestMixed:
    """Mixed self-closing and paired usages."""

    def test_both_patterns(self):
        source = """
<Accordion />
<Accordion expanded>
  <p>Hello</p>
</Accordion>
"""
        result = extract_jsx_usages(source, "Accordion")
        assert len(result) == 2

    def test_deduplication(self):
        source = """
<Accordion />
<Accordion />
"""
        result = extract_jsx_usages(source, "Accordion")
        # Duplicates are deduplicated via set
        assert len(result) == 1


class TestTruncation:
    """Snippet truncation at MAX_SNIPPET_LENGTH."""

    def test_long_snippet_truncated(self):
        long_content = "x" * 600
        source = f"<Accordion>{long_content}</Accordion>"
        result = extract_jsx_usages(source, "Accordion")
        assert len(result) == 1
        assert len(result[0]) == MAX_SNIPPET_LENGTH + 3  # +3 for "..."
        assert result[0].endswith("...")

    def test_short_snippet_not_truncated(self):
        source = "<Accordion>short</Accordion>"
        result = extract_jsx_usages(source, "Accordion")
        assert len(result) == 1
        assert not result[0].endswith("...")


class TestEdgeCases:
    """Edge cases and special characters."""

    def test_component_with_dot(self):
        """Components like MUI.Accordion."""
        source = "<MUI.Accordion />"
        result = extract_jsx_usages(source, "MUI.Accordion")
        assert len(result) == 1

    def test_empty_source(self):
        result = extract_jsx_usages("", "Accordion")
        assert result == []

    def test_empty_component_name(self):
        # Empty component name with regex escape should still work
        source = "<Accordion />"
        result = extract_jsx_usages(source, "")
        # Might match everything or nothing depending on regex — just shouldn't crash
        assert isinstance(result, list)
