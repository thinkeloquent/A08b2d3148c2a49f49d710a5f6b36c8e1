"""Tests for DocumentMetadata and utility functions.

All assertions are derived from the actual source implementations in
document_metadata.py. Language names come from _EXT_LANGUAGE_MAP, which maps
extensions to full language names (e.g. '.tsx' → 'typescript', not 'tsx').
"""

from __future__ import annotations

import re

import pytest

from rag_ui_component_ingest_config import (
    DocumentMetadata,
    SourceType,
    build_import_patterns,
    classify_source_type,
    detect_language,
    extract_component,
)


# ---------------------------------------------------------------------------
# classify_source_type()
# Evaluation order: test → story → style → type → doc → config → component
# ---------------------------------------------------------------------------


class TestClassifySourceType:
    # ---- Story ---------------------------------------------------------------

    def test_stories_tsx_is_story(self):
        assert classify_source_type("Button.stories.tsx") == "story"

    def test_story_tsx_is_story(self):
        assert classify_source_type("Button.story.tsx") == "story"

    def test_stories_jsx_is_story(self):
        assert classify_source_type("Card.stories.jsx") == "story"

    def test_stories_directory_path_is_story(self):
        assert classify_source_type("/src/stories/Button.tsx") == "story"

    # ---- Component -----------------------------------------------------------

    def test_plain_tsx_is_component(self):
        assert classify_source_type("Button.tsx") == "component"

    def test_plain_jsx_is_component(self):
        assert classify_source_type("Input.jsx") == "component"

    def test_index_tsx_is_component(self):
        assert classify_source_type("/src/components/Button/index.tsx") == "component"

    # ---- Doc -----------------------------------------------------------------

    def test_readme_md_is_doc(self):
        assert classify_source_type("README.md") == "doc"

    def test_mdx_is_doc(self):
        assert classify_source_type("Guide.mdx") == "doc"

    def test_docs_directory_is_doc(self):
        assert classify_source_type("/project/docs/intro.tsx") == "doc"

    # ---- Style ---------------------------------------------------------------

    def test_css_is_style(self):
        assert classify_source_type("Button.css") == "style"

    def test_less_is_style(self):
        assert classify_source_type("Button.less") == "style"

    def test_scss_is_style(self):
        assert classify_source_type("theme.scss") == "style"

    def test_sass_is_style(self):
        assert classify_source_type("vars.sass") == "style"

    def test_styl_is_style(self):
        assert classify_source_type("main.styl") == "style"

    # ---- Test ----------------------------------------------------------------

    def test_test_tsx_is_test(self):
        assert classify_source_type("Button.test.tsx") == "test"

    def test_spec_tsx_is_test(self):
        assert classify_source_type("Button.spec.tsx") == "test"

    def test_test_js_is_test(self):
        assert classify_source_type("util.test.js") == "test"

    def test_tests_directory_path_is_test(self):
        assert classify_source_type("/__tests__/Button.tsx") == "test"

    def test_snapshots_directory_is_test(self):
        assert classify_source_type("/__snapshots__/Button.snap") == "test"

    # ---- Type ----------------------------------------------------------------

    def test_dts_is_type(self):
        assert classify_source_type("index.d.ts") == "type"

    def test_types_directory_is_type(self):
        assert classify_source_type("/src/types/Button.ts") == "type"

    def test_type_directory_is_type(self):
        assert classify_source_type("/src/type/index.ts") == "type"

    # ---- Config --------------------------------------------------------------

    def test_package_json_is_config(self):
        assert classify_source_type("package.json") == "config"

    def test_tsconfig_json_is_config(self):
        assert classify_source_type("tsconfig.json") == "config"

    def test_yaml_is_config(self):
        assert classify_source_type("docker-compose.yaml") == "config"

    def test_yml_is_config(self):
        assert classify_source_type(".eslintrc.yml") == "config"

    def test_toml_is_config(self):
        assert classify_source_type("Cargo.toml") == "config"

    # ---- Priority: test wins over story --------------------------------------

    def test_stories_test_tsx_classified_as_test_not_story(self):
        """test pattern has higher priority than story pattern."""
        # A file that matches both test and story patterns resolves to 'test'
        assert classify_source_type("Button.stories.test.tsx") == "test"

    # ---- Returns SourceType string values ------------------------------------

    def test_returns_string_not_enum(self):
        """classify_source_type returns a plain string value, not a SourceType enum."""
        result = classify_source_type("Button.tsx")
        assert isinstance(result, str)
        assert result == SourceType.component.value


# ---------------------------------------------------------------------------
# extract_component()
# ---------------------------------------------------------------------------


class TestExtractComponent:
    def test_extracts_component_name_from_standard_path(self):
        """Extracts the directory immediately following the path segment."""
        result = extract_component("/path/components/Button/index.tsx", "components")
        assert result == "Button"

    def test_extracts_component_name_from_src_segment(self):
        result = extract_component("/path/src/Button/Button.tsx", "src")
        assert result == "Button"

    def test_returns_none_when_segment_not_found(self):
        """Returns None when component_path_segment is not present in the path."""
        result = extract_component("/path/to/Button/index.tsx", "components")
        assert result is None

    def test_extracts_from_nested_path(self):
        result = extract_component(
            "/home/user/project/dataset/ant-design/components/DatePicker/index.tsx",
            "components",
        )
        assert result == "DatePicker"

    def test_default_segment_is_components(self):
        """Default component_path_segment is 'components'."""
        result = extract_component("/src/components/Modal/Modal.tsx")
        assert result == "Modal"

    def test_returns_none_for_empty_path(self):
        result = extract_component("", "components")
        assert result is None

    def test_returns_none_when_segment_is_last_part(self):
        """Returns None when segment is the final part (no following directory)."""
        result = extract_component("/path/components", "components")
        assert result is None

    def test_extracts_first_occurrence_when_segment_repeats(self):
        """Extracts the directory after the first matching segment."""
        result = extract_component("/components/outer/components/inner/file.tsx", "components")
        assert result == "outer"


# ---------------------------------------------------------------------------
# detect_language()
# ---------------------------------------------------------------------------


class TestDetectLanguage:
    # ---- TypeScript / JavaScript -------------------------------------------

    def test_tsx_returns_typescript(self):
        """'.tsx' maps to 'typescript' in _EXT_LANGUAGE_MAP."""
        assert detect_language("Button.tsx") == "typescript"

    def test_ts_returns_typescript(self):
        assert detect_language("types.ts") == "typescript"

    def test_dts_returns_typescript(self):
        """'.d.ts' is handled specially and also returns 'typescript'."""
        assert detect_language("index.d.ts") == "typescript"

    def test_jsx_returns_javascript(self):
        assert detect_language("Component.jsx") == "javascript"

    def test_js_returns_javascript(self):
        assert detect_language("utils.js") == "javascript"

    def test_mjs_returns_javascript(self):
        assert detect_language("server.mjs") == "javascript"

    # ---- Style --------------------------------------------------------------

    def test_css_returns_css(self):
        assert detect_language("styles.css") == "css"

    def test_less_returns_less(self):
        assert detect_language("theme.less") == "less"

    def test_scss_returns_scss(self):
        assert detect_language("variables.scss") == "scss"

    # ---- Markup / Data ------------------------------------------------------

    def test_md_returns_markdown(self):
        assert detect_language("README.md") == "markdown"

    def test_mdx_returns_mdx(self):
        assert detect_language("Guide.mdx") == "mdx"

    def test_json_returns_json(self):
        assert detect_language("package.json") == "json"

    def test_yaml_returns_yaml(self):
        assert detect_language("config.yaml") == "yaml"

    def test_yml_returns_yaml(self):
        assert detect_language("config.yml") == "yaml"

    def test_toml_returns_toml(self):
        assert detect_language("Cargo.toml") == "toml"

    # ---- Other languages ---------------------------------------------------

    def test_py_returns_python(self):
        assert detect_language("script.py") == "python"

    def test_rs_returns_rust(self):
        assert detect_language("main.rs") == "rust"

    def test_go_returns_go(self):
        assert detect_language("server.go") == "go"

    def test_html_returns_html(self):
        assert detect_language("index.html") == "html"

    # ---- Unknown extension -------------------------------------------------

    def test_unknown_extension_returns_unknown(self):
        assert detect_language("file.xyz") == "unknown"

    def test_no_extension_returns_unknown(self):
        assert detect_language("Makefile") == "unknown"


# ---------------------------------------------------------------------------
# build_import_patterns()
# ---------------------------------------------------------------------------


class TestBuildImportPatterns:
    def test_returns_list_of_patterns(self):
        """Returns a list with one pattern per package."""
        patterns = build_import_patterns(["antd", "@ant-design/icons"])
        assert len(patterns) == 2
        assert all(isinstance(p, re.Pattern) for p in patterns)

    def test_pattern_matches_es_import_from(self):
        """Pattern matches 'import ... from 'antd'' style imports."""
        patterns = build_import_patterns(["antd"])
        pat = patterns[0]

        assert pat.search("import { Button } from 'antd'")
        assert pat.search('import { Button } from "antd"')

    def test_pattern_matches_require_call(self):
        """Pattern matches require('antd') style imports."""
        patterns = build_import_patterns(["antd"])
        pat = patterns[0]

        assert pat.search("const { Button } = require('antd')")
        assert pat.search('const antd = require("antd")')

    def test_pattern_matches_sub_path_import(self):
        """Pattern matches sub-path imports like 'antd/button'."""
        patterns = build_import_patterns(["antd"])
        pat = patterns[0]

        assert pat.search("import Button from 'antd/button'")
        assert pat.search('import Button from "antd/es/button"')

    def test_scoped_package_matches_correctly(self):
        """Scoped package patterns (e.g. @ant-design/icons) match correctly."""
        patterns = build_import_patterns(["@ant-design/icons"])
        pat = patterns[0]

        assert pat.search("import { StarOutlined } from '@ant-design/icons'")
        assert pat.search('import icons from "@ant-design/icons/lib/StarOutlined"')

    def test_pattern_does_not_match_different_package(self):
        """Pattern for 'antd' does not match '@mui/material'."""
        patterns = build_import_patterns(["antd"])
        pat = patterns[0]

        assert not pat.search("import { Button } from '@mui/material'")

    def test_empty_packages_returns_empty_list(self):
        """build_import_patterns([]) returns an empty list."""
        patterns = build_import_patterns([])
        assert patterns == []

    def test_multiple_packages_each_has_own_pattern(self):
        """Each package in the input list produces exactly one pattern."""
        packages = ["antd", "@ant-design/icons", "@ant-design/pro-components"]
        patterns = build_import_patterns(packages)

        assert len(patterns) == len(packages)

        # The second pattern should match @ant-design/icons, not antd
        assert patterns[1].search("import X from '@ant-design/icons'")
        assert not patterns[1].search("import X from 'antd'")


# ---------------------------------------------------------------------------
# DocumentMetadata creation and to_dict()
# ---------------------------------------------------------------------------


class TestDocumentMetadata:
    def _make_metadata(self, **overrides) -> DocumentMetadata:
        defaults = {
            "library": "ant-design",
            "file_name": "Button.tsx",
            "file_path": "/src/components/Button/Button.tsx",
            "source_type": "component",
            "language": "typescript",
            "content_hash": "abc123",
            "chunk_index": 0,
            "total_chunks": 3,
            "ingested_at": "2026-02-17T00:00:00+00:00",
        }
        defaults.update(overrides)
        return DocumentMetadata(**defaults)

    def test_creation_with_required_fields(self):
        """DocumentMetadata can be created with only required fields."""
        meta = self._make_metadata()

        assert meta.library == "ant-design"
        assert meta.file_name == "Button.tsx"
        assert meta.source_type == "component"
        assert meta.language == "typescript"
        assert meta.chunk_index == 0
        assert meta.total_chunks == 3

    def test_optional_fields_default_to_none(self):
        """Optional fields default to None when not provided."""
        meta = self._make_metadata()

        assert meta.library_version is None
        assert meta.component is None
        assert meta.heading is None
        assert meta.export_name is None

    def test_optional_fields_can_be_set(self):
        """Optional fields are stored when provided."""
        meta = self._make_metadata(
            library_version="5.x",
            component="Button",
            heading="API Reference",
            export_name="Button",
        )

        assert meta.library_version == "5.x"
        assert meta.component == "Button"
        assert meta.heading == "API Reference"
        assert meta.export_name == "Button"

    def test_to_dict_returns_dict(self):
        """to_dict() returns a plain dict."""
        meta = self._make_metadata()
        d = meta.to_dict()

        assert isinstance(d, dict)

    def test_to_dict_contains_all_required_fields(self):
        """to_dict() contains all identity fields."""
        meta = self._make_metadata()
        d = meta.to_dict()

        assert d["library"] == "ant-design"
        assert d["file_name"] == "Button.tsx"
        assert d["file_path"] == "/src/components/Button/Button.tsx"
        assert d["source_type"] == "component"
        assert d["language"] == "typescript"
        assert d["content_hash"] == "abc123"
        assert d["chunk_index"] == 0
        assert d["total_chunks"] == 3
        assert d["ingested_at"] == "2026-02-17T00:00:00+00:00"

    def test_to_dict_contains_optional_fields_as_none(self):
        """to_dict() includes optional fields even when they are None."""
        meta = self._make_metadata()
        d = meta.to_dict()

        assert "library_version" in d
        assert d["library_version"] is None
        assert "component" in d
        assert d["component"] is None
        assert "heading" in d
        assert d["heading"] is None
        assert "export_name" in d
        assert d["export_name"] is None

    def test_to_dict_optional_fields_populated(self):
        """to_dict() correctly serialises set optional fields."""
        meta = self._make_metadata(
            library_version="5.x",
            component="Button",
        )
        d = meta.to_dict()

        assert d["library_version"] == "5.x"
        assert d["component"] == "Button"

    def test_to_dict_snake_case_keys(self):
        """All keys in to_dict() are snake_case."""
        meta = self._make_metadata()
        d = meta.to_dict()

        for key in d:
            assert key == key.lower(), f"Key {key!r} is not lowercase"
            assert " " not in key
            assert "-" not in key
