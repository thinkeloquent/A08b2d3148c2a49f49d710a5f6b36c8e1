"""Tests for LibraryConfig and ResolvedLibraryConfig."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from rag_ui_component_ingest_config import (
    BaseIngestConfig,
    LibraryConfig,
    ResolvedLibraryConfig,
)
from rag_ui_component_ingest_config.defaults import DEFAULT_LIBRARY, DEFAULTS


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _base() -> BaseIngestConfig:
    """Return a default BaseIngestConfig (uses DEFAULTS, no env overrides expected)."""
    return BaseIngestConfig()


# ---------------------------------------------------------------------------
# Inheritance of base values when no overrides are set
# ---------------------------------------------------------------------------


class TestNoOverridesInheritsBase:
    def test_chunk_size_inherits_from_base(self):
        """A library without chunk_size override inherits base chunk_size."""
        lib = LibraryConfig(name="Ant Design", slug="ant-design")
        resolved = lib.resolve(_base())

        assert resolved.chunk_size == DEFAULTS["chunk_size"]

    def test_chunk_overlap_inherits_from_base(self):
        """A library without chunk_overlap override inherits base chunk_overlap."""
        lib = LibraryConfig(name="Ant Design", slug="ant-design")
        resolved = lib.resolve(_base())

        assert resolved.chunk_overlap == DEFAULTS["chunk_overlap"]

    def test_embeddings_model_name_inherited(self):
        """embeddings_model_name is forwarded from base when library does not override it."""
        lib = LibraryConfig(name="Ant Design", slug="ant-design")
        resolved = lib.resolve(_base())

        assert resolved.embeddings_model_name == DEFAULTS["embeddings_model_name"]

    def test_vector_backend_inherited(self):
        lib = LibraryConfig(name="Ant Design", slug="ant-design")
        resolved = lib.resolve(_base())

        assert resolved.vector_backend == DEFAULTS["vector_backend"]

    def test_file_extensions_fall_back_to_default_library(self):
        """file_extensions falls back to DEFAULT_LIBRARY values when not set."""
        lib = LibraryConfig(name="Ant Design", slug="ant-design")
        resolved = lib.resolve(_base())

        assert resolved.file_extensions == list(DEFAULT_LIBRARY["file_extensions"])

    def test_ignored_directories_fall_back_to_default_library(self):
        """ignored_directories falls back to DEFAULT_LIBRARY values when not set."""
        lib = LibraryConfig(name="Ant Design", slug="ant-design")
        resolved = lib.resolve(_base())

        assert resolved.ignored_directories == list(DEFAULT_LIBRARY["ignored_directories"])

    def test_all_base_infrastructure_fields_forwarded(self):
        """All base infrastructure fields are present on ResolvedLibraryConfig."""
        lib = LibraryConfig(name="Ant Design", slug="ant-design")
        resolved = lib.resolve(_base())

        assert resolved.elasticsearch_host == DEFAULTS["elasticsearch_host"]
        assert resolved.elasticsearch_port == DEFAULTS["elasticsearch_port"]
        assert resolved.elasticsearch_scheme == DEFAULTS["elasticsearch_scheme"]
        assert resolved.redis_host == DEFAULTS["redis_host"]
        assert resolved.redis_port == DEFAULTS["redis_port"]
        assert resolved.llm_provider == DEFAULTS["llm_provider"]
        assert resolved.openai_model == DEFAULTS["openai_model"]
        assert resolved.anthropic_model == DEFAULTS["anthropic_model"]
        assert resolved.gemini_model == DEFAULTS["gemini_model"]
        assert resolved.hybrid_alpha == DEFAULTS["hybrid_alpha"]
        assert resolved.score_threshold == DEFAULTS["score_threshold"]
        assert resolved.reranker_enabled == DEFAULTS["reranker_enabled"]
        assert resolved.reranker_model == DEFAULTS["reranker_model"]
        assert resolved.retrieve_n == DEFAULTS["retrieve_n"]
        assert resolved.top_k == DEFAULTS["top_k"]
        assert resolved.postgres_enabled == DEFAULTS["postgres_enabled"]


# ---------------------------------------------------------------------------
# Library-level overrides win over base
# ---------------------------------------------------------------------------


class TestOverridesWinOverBase:
    def test_chunk_size_override_wins(self):
        """Library chunk_size=1500 overrides the base default of 1200."""
        lib = LibraryConfig(name="Ant Design", slug="ant-design", chunk_size=1500)
        resolved = lib.resolve(_base())

        assert resolved.chunk_size == 1500

    def test_chunk_overlap_override_wins(self):
        """Library chunk_overlap=100 overrides the base default of 150."""
        lib = LibraryConfig(name="Ant Design", slug="ant-design",
                            chunk_size=1500, chunk_overlap=100)
        resolved = lib.resolve(_base())

        assert resolved.chunk_overlap == 100

    def test_explicit_file_extensions_override_default_library(self):
        """Explicit file_extensions replaces DEFAULT_LIBRARY file_extensions."""
        custom_exts = [".tsx", ".mdx"]
        lib = LibraryConfig(name="Ant Design", slug="ant-design",
                            file_extensions=custom_exts)
        resolved = lib.resolve(_base())

        assert resolved.file_extensions == custom_exts

    def test_explicit_ignored_directories_override_default_library(self):
        """Explicit ignored_directories replaces DEFAULT_LIBRARY ignored_directories."""
        custom_ignored = ["node_modules", "dist"]
        lib = LibraryConfig(name="Ant Design", slug="ant-design",
                            ignored_directories=custom_ignored)
        resolved = lib.resolve(_base())

        assert resolved.ignored_directories == custom_ignored

    def test_explicit_source_directory_wins(self):
        """Explicit source_directory is used verbatim over the computed path."""
        lib = LibraryConfig(name="Ant Design", slug="ant-design",
                            source_directory="/custom/path/to/src")
        resolved = lib.resolve(_base())

        assert resolved.source_directory == "/custom/path/to/src"

    def test_explicit_persist_directory_wins(self):
        lib = LibraryConfig(name="Ant Design", slug="ant-design",
                            persist_directory="/custom/persist")
        resolved = lib.resolve(_base())

        assert resolved.persist_directory == "/custom/persist"

    def test_explicit_elasticsearch_index_wins(self):
        lib = LibraryConfig(name="Ant Design", slug="ant-design",
                            elasticsearch_index="custom-index")
        resolved = lib.resolve(_base())

        assert resolved.elasticsearch_index == "custom-index"

    def test_explicit_examples_directory_wins(self):
        lib = LibraryConfig(name="Ant Design", slug="ant-design",
                            examples_directory="/custom/examples")
        resolved = lib.resolve(_base())

        assert resolved.examples_directory == "/custom/examples"


# ---------------------------------------------------------------------------
# Computed defaults
# ---------------------------------------------------------------------------


class TestComputedDefaults:
    def test_source_directory_computed_from_dataset_root_slug_segment(self):
        """source_directory = {dataset_root}/{slug}/{component_path_segment}."""
        lib = LibraryConfig(name="MUI", slug="mui", component_path_segment="src")
        base = _base()
        resolved = lib.resolve(base)

        assert resolved.source_directory == f"{base.dataset_root}/mui/src"

    def test_source_directory_uses_default_components_segment(self):
        """source_directory defaults to using 'components' as the path segment."""
        lib = LibraryConfig(name="Ant Design", slug="ant-design")
        base = _base()
        resolved = lib.resolve(base)

        assert resolved.source_directory == f"{base.dataset_root}/ant-design/components"

    def test_persist_directory_computed_from_persist_root_and_slug(self):
        """persist_directory = {persist_root}/{slug}."""
        lib = LibraryConfig(name="MUI", slug="mui")
        base = _base()
        resolved = lib.resolve(base)

        assert resolved.persist_directory == f"{base.persist_root}/mui"

    def test_elasticsearch_index_computed_as_rag_slug(self):
        """elasticsearch_index = 'rag-{slug}'."""
        lib = LibraryConfig(name="MUI", slug="mui")
        resolved = lib.resolve(_base())

        assert resolved.elasticsearch_index == "rag-mui"

    def test_examples_directory_computed(self):
        """examples_directory = {dataset_root}/{slug}/components-examples."""
        lib = LibraryConfig(name="MUI", slug="mui")
        base = _base()
        resolved = lib.resolve(base)

        assert resolved.examples_directory == f"{base.dataset_root}/mui/components-examples"


# ---------------------------------------------------------------------------
# Slug validation
# ---------------------------------------------------------------------------


class TestSlugValidation:
    def test_valid_slug_hyphenated(self):
        """A typical hyphenated slug like 'ant-design' is accepted."""
        lib = LibraryConfig(name="Ant Design", slug="ant-design")
        assert lib.slug == "ant-design"

    def test_valid_slug_simple(self):
        """A simple lowercase slug like 'mui' is accepted."""
        lib = LibraryConfig(name="MUI", slug="mui")
        assert lib.slug == "mui"

    def test_valid_slug_two_chars(self):
        """A two-character slug like 'a1' is accepted (minimum length)."""
        lib = LibraryConfig(name="A1", slug="a1")
        assert lib.slug == "a1"

    def test_invalid_slug_uppercase(self):
        """Uppercase letters in slug are rejected."""
        with pytest.raises(ValidationError):
            LibraryConfig(name="Bad", slug="INVALID")

    def test_invalid_slug_with_spaces(self):
        """Slug containing spaces is rejected."""
        with pytest.raises(ValidationError):
            LibraryConfig(name="Bad", slug="has spaces")

    def test_invalid_slug_starts_with_dash(self):
        """Slug that begins with a dash is rejected."""
        with pytest.raises(ValidationError):
            LibraryConfig(name="Bad", slug="-starts-with-dash")

    def test_invalid_slug_ends_with_dash(self):
        """Slug that ends with a dash is rejected."""
        with pytest.raises(ValidationError):
            LibraryConfig(name="Bad", slug="ends-with-dash-")

    def test_invalid_slug_single_char(self):
        """A single-character slug is rejected (regex requires at least 2 chars)."""
        with pytest.raises(ValidationError):
            LibraryConfig(name="Bad", slug="a")

    def test_invalid_slug_empty_string(self):
        """An empty slug string is rejected."""
        with pytest.raises(ValidationError):
            LibraryConfig(name="Bad", slug="")


# ---------------------------------------------------------------------------
# resolve() produces a ResolvedLibraryConfig
# ---------------------------------------------------------------------------


class TestResolve:
    def test_resolve_returns_resolved_library_config_type(self):
        """resolve() returns a ResolvedLibraryConfig instance."""
        lib = LibraryConfig(name="Ant Design", slug="ant-design")
        resolved = lib.resolve(_base())

        assert isinstance(resolved, ResolvedLibraryConfig)

    def test_resolved_is_frozen(self):
        """ResolvedLibraryConfig is immutable (frozen dataclass)."""
        lib = LibraryConfig(name="Ant Design", slug="ant-design")
        resolved = lib.resolve(_base())

        with pytest.raises((AttributeError, TypeError)):
            resolved.slug = "something-else"  # type: ignore[misc]

    def test_resolved_has_name_and_slug(self):
        lib = LibraryConfig(name="Ant Design", slug="ant-design", version="5.x")
        resolved = lib.resolve(_base())

        assert resolved.name == "Ant Design"
        assert resolved.slug == "ant-design"
        assert resolved.version == "5.x"

    def test_resolved_carries_import_packages(self):
        lib = LibraryConfig(
            name="Ant Design",
            slug="ant-design",
            import_packages=["antd", "@ant-design/icons"],
        )
        resolved = lib.resolve(_base())

        assert "antd" in resolved.import_packages
        assert "@ant-design/icons" in resolved.import_packages

    def test_resolved_enabled_flag_preserved(self):
        """enabled flag is forwarded to ResolvedLibraryConfig."""
        lib_enabled = LibraryConfig(name="Ant Design", slug="ant-design", enabled=True)
        lib_disabled = LibraryConfig(name="MUI", slug="mui", enabled=False)

        assert lib_enabled.resolve(_base()).enabled is True
        assert lib_disabled.resolve(_base()).enabled is False


# ---------------------------------------------------------------------------
# ResolvedLibraryConfig.to_dict()
# ---------------------------------------------------------------------------


class TestResolvedToDictect:
    def test_to_dict_contains_all_identity_fields(self):
        """to_dict() includes name, slug, version, component_path_segment, import_packages."""
        lib = LibraryConfig(
            name="Ant Design",
            slug="ant-design",
            version="5.x",
            import_packages=["antd"],
        )
        d = lib.resolve(_base()).to_dict()

        assert d["name"] == "Ant Design"
        assert d["slug"] == "ant-design"
        assert d["version"] == "5.x"
        assert d["component_path_segment"] == "components"
        assert "antd" in d["import_packages"]

    def test_to_dict_contains_all_path_fields(self):
        lib = LibraryConfig(name="Ant Design", slug="ant-design")
        d = lib.resolve(_base()).to_dict()

        assert "source_directory" in d
        assert "persist_directory" in d
        assert "examples_directory" in d
        assert "elasticsearch_index" in d

    def test_to_dict_contains_chunking_fields(self):
        lib = LibraryConfig(name="Ant Design", slug="ant-design", chunk_size=1500)
        d = lib.resolve(_base()).to_dict()

        assert d["chunk_size"] == 1500
        assert "chunk_overlap" in d

    def test_to_dict_snake_case_keys_only(self):
        """All keys in to_dict() are snake_case."""
        lib = LibraryConfig(name="Ant Design", slug="ant-design")
        d = lib.resolve(_base()).to_dict()

        for key in d:
            assert key == key.lower(), f"Key {key!r} is not lowercase"
            assert " " not in key
            assert "-" not in key

    def test_to_dict_contains_base_infrastructure_keys(self):
        """to_dict() also exposes base infrastructure fields like dataset_root."""
        lib = LibraryConfig(name="Ant Design", slug="ant-design")
        d = lib.resolve(_base()).to_dict()

        for key in DEFAULTS:
            assert key in d, f"Expected DEFAULTS key {key!r} in resolved to_dict()"

    def test_to_dict_file_extensions_is_list(self):
        lib = LibraryConfig(name="Ant Design", slug="ant-design")
        d = lib.resolve(_base()).to_dict()

        assert isinstance(d["file_extensions"], list)
        assert len(d["file_extensions"]) > 0

    def test_to_dict_ignored_directories_is_list(self):
        lib = LibraryConfig(name="Ant Design", slug="ant-design")
        d = lib.resolve(_base()).to_dict()

        assert isinstance(d["ignored_directories"], list)
        assert len(d["ignored_directories"]) > 0
