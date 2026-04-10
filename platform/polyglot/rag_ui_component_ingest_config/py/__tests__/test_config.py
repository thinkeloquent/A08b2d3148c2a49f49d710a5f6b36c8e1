"""Tests for RagUIComponentIngestConfig and SingleLibraryConfig."""

from __future__ import annotations

import json

import pytest

from rag_ui_component_ingest_config import (
    RagUIComponentIngestConfig,
    SingleLibraryConfig,
)
from rag_ui_component_ingest_config.defaults import DEFAULTS, DEFAULT_LIBRARY


# ---------------------------------------------------------------------------
# from_env()
# ---------------------------------------------------------------------------


class TestFromEnv:
    def test_from_env_creates_single_ant_design_library(self):
        """from_env() backward compat — creates exactly one Ant Design library."""
        cfg = RagUIComponentIngestConfig.from_env()

        assert len(cfg.libraries) == 1
        lib = cfg.libraries[0]
        assert lib.slug == "ant-design"
        assert lib.name == "Ant Design"

    def test_from_env_returns_correct_base_defaults(self):
        """from_env() returns a config whose base reflects DEFAULTS values."""
        cfg = RagUIComponentIngestConfig.from_env()
        base = cfg.base

        assert base.chunk_size == DEFAULTS["chunk_size"]
        assert base.chunk_overlap == DEFAULTS["chunk_overlap"]
        assert base.embeddings_model_name == DEFAULTS["embeddings_model_name"]
        assert base.vector_backend == DEFAULTS["vector_backend"]
        assert base.dataset_root == DEFAULTS["dataset_root"]
        assert base.persist_root == DEFAULTS["persist_root"]
        assert base.elasticsearch_host == DEFAULTS["elasticsearch_host"]
        assert base.elasticsearch_port == DEFAULTS["elasticsearch_port"]
        assert base.redis_host == DEFAULTS["redis_host"]
        assert base.redis_port == DEFAULTS["redis_port"]
        assert base.llm_provider == DEFAULTS["llm_provider"]
        assert base.openai_model == DEFAULTS["openai_model"]
        assert base.hybrid_alpha == DEFAULTS["hybrid_alpha"]
        assert base.score_threshold == DEFAULTS["score_threshold"]
        assert base.reranker_enabled == DEFAULTS["reranker_enabled"]
        assert base.retrieve_n == DEFAULTS["retrieve_n"]
        assert base.top_k == DEFAULTS["top_k"]
        assert base.postgres_enabled == DEFAULTS["postgres_enabled"]

    def test_from_env_ant_design_version(self):
        """from_env() library should carry the version from DEFAULT_LIBRARY."""
        cfg = RagUIComponentIngestConfig.from_env()
        assert cfg.libraries[0].version == DEFAULT_LIBRARY["version"]

    def test_from_env_ant_design_import_packages(self):
        """from_env() library import_packages matches DEFAULT_LIBRARY."""
        cfg = RagUIComponentIngestConfig.from_env()
        lib = cfg.libraries[0]
        assert set(lib.import_packages) == set(DEFAULT_LIBRARY["import_packages"])


# ---------------------------------------------------------------------------
# from_dict() round-trip
# ---------------------------------------------------------------------------


class TestFromDict:
    def test_round_trip_produces_same_library_values(self):
        """from_dict(config.to_dict()) should produce a config with matching library data."""
        original = RagUIComponentIngestConfig.from_env()
        serialised = original.to_dict()
        restored = RagUIComponentIngestConfig.from_dict(serialised)

        assert len(restored.libraries) == len(original.libraries)

        orig_lib = original.libraries[0]
        rest_lib = restored.libraries[0]
        assert rest_lib.slug == orig_lib.slug
        assert rest_lib.name == orig_lib.name
        assert rest_lib.version == orig_lib.version

    def test_round_trip_preserves_multiple_libraries(self):
        """from_dict() correctly restores multiple libraries."""
        from rag_ui_component_ingest_config import BaseIngestConfig, LibraryConfig

        base = BaseIngestConfig()
        cfg = RagUIComponentIngestConfig(
            base=base,
            libraries=[
                LibraryConfig(name="Ant Design", slug="ant-design", version="5.x",
                              import_packages=["antd"]),
                LibraryConfig(name="MUI", slug="mui", version="6.x",
                              import_packages=["@mui/material"]),
            ],
        )
        serialised = cfg.to_dict()
        restored = RagUIComponentIngestConfig.from_dict(serialised)

        assert len(restored.libraries) == 2
        slugs = [lib.slug for lib in restored.libraries]
        assert "ant-design" in slugs
        assert "mui" in slugs

    def test_round_trip_empty_libraries(self):
        """from_dict() with no libraries list returns an empty config."""
        restored = RagUIComponentIngestConfig.from_dict({})
        assert restored.libraries == []


# ---------------------------------------------------------------------------
# for_library()
# ---------------------------------------------------------------------------


class TestForLibrary:
    def test_for_library_returns_single_library_config(self):
        """for_library() returns a SingleLibraryConfig instance."""
        cfg = RagUIComponentIngestConfig.from_env()
        result = cfg.for_library("ant-design")

        assert isinstance(result, SingleLibraryConfig)

    def test_for_library_ant_design_identity_fields(self):
        """for_library('ant-design') has correct library_name, library_slug, source_directory."""
        cfg = RagUIComponentIngestConfig.from_env()
        result = cfg.for_library("ant-design")

        assert result.name == "Ant Design"
        assert result.slug == "ant-design"

        # source_directory is computed: {dataset_root}/{slug}/{component_path_segment}
        expected_source = (
            f"{DEFAULTS['dataset_root']}/ant-design/"
            f"{DEFAULT_LIBRARY['component_path_segment']}"
        )
        assert result.source_directory == expected_source

    def test_for_library_none_uses_first_library(self):
        """for_library(None) uses the first library in the list."""
        cfg = RagUIComponentIngestConfig.from_env()
        result_none = cfg.for_library(None)
        result_named = cfg.for_library("ant-design")

        assert result_none.slug == result_named.slug
        assert result_none.source_directory == result_named.source_directory

    def test_for_library_has_all_base_infrastructure_fields(self):
        """SingleLibraryConfig returned by for_library() carries all base fields."""
        cfg = RagUIComponentIngestConfig.from_env()
        result = cfg.for_library("ant-design")

        assert result.chunk_size == DEFAULTS["chunk_size"]
        assert result.chunk_overlap == DEFAULTS["chunk_overlap"]
        assert result.embeddings_model_name == DEFAULTS["embeddings_model_name"]
        assert result.vector_backend == DEFAULTS["vector_backend"]
        assert result.elasticsearch_host == DEFAULTS["elasticsearch_host"]
        assert result.elasticsearch_port == DEFAULTS["elasticsearch_port"]
        assert result.redis_host == DEFAULTS["redis_host"]
        assert result.redis_port == DEFAULTS["redis_port"]
        assert result.llm_provider == DEFAULTS["llm_provider"]

    def test_for_library_persist_directory_computed(self):
        """persist_directory is {persist_root}/{slug} when not explicitly set."""
        cfg = RagUIComponentIngestConfig.from_env()
        result = cfg.for_library("ant-design")

        expected = f"{DEFAULTS['persist_root']}/ant-design"
        assert result.persist_directory == expected

    def test_for_library_examples_directory_computed(self):
        """examples_directory is {dataset_root}/{slug}/components-examples when not set."""
        cfg = RagUIComponentIngestConfig.from_env()
        result = cfg.for_library("ant-design")

        expected = f"{DEFAULTS['dataset_root']}/ant-design/components-examples"
        assert result.examples_directory == expected

    def test_for_library_elasticsearch_index_computed(self):
        """elasticsearch_index is 'rag-{slug}' when not explicitly set."""
        cfg = RagUIComponentIngestConfig.from_env()
        result = cfg.for_library("ant-design")

        assert result.elasticsearch_index == "rag-ant-design"

    def test_for_library_raises_key_error_for_unknown_slug(self):
        """for_library() raises KeyError for an unknown slug."""
        cfg = RagUIComponentIngestConfig.from_env()

        with pytest.raises(KeyError, match="does-not-exist"):
            cfg.for_library("does-not-exist")

    def test_for_library_raises_index_error_on_empty_config(self):
        """for_library(None) raises IndexError when no libraries are registered."""
        from rag_ui_component_ingest_config import BaseIngestConfig

        cfg = RagUIComponentIngestConfig(base=BaseIngestConfig(), libraries=[])

        with pytest.raises(IndexError):
            cfg.for_library()


# ---------------------------------------------------------------------------
# get_enabled_libraries()
# ---------------------------------------------------------------------------


class TestGetEnabledLibraries:
    def test_returns_only_enabled_libraries(self, multi_library_config):
        """get_enabled_libraries() returns only libraries with enabled=True."""
        enabled = multi_library_config.get_enabled_libraries()

        assert len(enabled) == 1
        assert enabled[0].slug == "ant-design"

    def test_all_enabled_when_none_disabled(self):
        """get_enabled_libraries() returns all libraries when all are enabled."""
        from rag_ui_component_ingest_config import BaseIngestConfig, LibraryConfig

        cfg = RagUIComponentIngestConfig(
            base=BaseIngestConfig(),
            libraries=[
                LibraryConfig(name="Ant Design", slug="ant-design", enabled=True),
                LibraryConfig(name="MUI", slug="mui", enabled=True),
            ],
        )
        enabled = cfg.get_enabled_libraries()
        assert len(enabled) == 2

    def test_empty_when_all_disabled(self):
        """get_enabled_libraries() returns empty list when all libraries are disabled."""
        from rag_ui_component_ingest_config import BaseIngestConfig, LibraryConfig

        cfg = RagUIComponentIngestConfig(
            base=BaseIngestConfig(),
            libraries=[
                LibraryConfig(name="Ant Design", slug="ant-design", enabled=False),
            ],
        )
        assert cfg.get_enabled_libraries() == []


# ---------------------------------------------------------------------------
# list_libraries()
# ---------------------------------------------------------------------------


class TestListLibraries:
    def test_returns_correct_structure(self, multi_library_config):
        """list_libraries() returns a list of dicts with name, slug, version, enabled."""
        listing = multi_library_config.list_libraries()

        assert len(listing) == 2
        for entry in listing:
            assert "name" in entry
            assert "slug" in entry
            assert "version" in entry
            assert "enabled" in entry

    def test_listing_slug_values(self, multi_library_config):
        """list_libraries() includes both library slugs."""
        listing = multi_library_config.list_libraries()
        slugs = {entry["slug"] for entry in listing}

        assert "ant-design" in slugs
        assert "mui" in slugs

    def test_listing_reflects_enabled_flag(self, multi_library_config):
        """list_libraries() correctly reflects the enabled flag for each library."""
        listing = multi_library_config.list_libraries()
        by_slug = {entry["slug"]: entry for entry in listing}

        assert by_slug["ant-design"]["enabled"] is True
        assert by_slug["mui"]["enabled"] is False


# ---------------------------------------------------------------------------
# to_dict() / to_json()
# ---------------------------------------------------------------------------


class TestSerialisation:
    def test_to_dict_produces_snake_case_keys(self):
        """to_dict() keys are all snake_case (no camelCase or hyphens)."""
        cfg = RagUIComponentIngestConfig.from_env()
        d = cfg.to_dict()

        assert "base" in d
        assert "libraries" in d
        base_keys = list(d["base"].keys())

        for key in base_keys:
            assert key == key.lower(), f"Key {key!r} is not lowercase"
            # snake_case: no spaces, no hyphens
            assert " " not in key
            assert "-" not in key

    def test_to_dict_base_section_has_all_defaults(self):
        """to_dict() base section contains all DEFAULTS keys."""
        cfg = RagUIComponentIngestConfig.from_env()
        base_dict = cfg.to_dict()["base"]

        for key in DEFAULTS:
            assert key in base_dict, f"Expected key {key!r} in base dict"

    def test_to_dict_libraries_is_a_list(self):
        """to_dict() libraries value is a list."""
        cfg = RagUIComponentIngestConfig.from_env()
        assert isinstance(cfg.to_dict()["libraries"], list)

    def test_to_json_produces_valid_json(self):
        """to_json() output is parseable by json.loads()."""
        cfg = RagUIComponentIngestConfig.from_env()
        json_str = cfg.to_json()

        parsed = json.loads(json_str)
        assert "base" in parsed
        assert "libraries" in parsed

    def test_to_json_default_indent(self):
        """to_json() uses indent=2 by default producing a multi-line string."""
        cfg = RagUIComponentIngestConfig.from_env()
        json_str = cfg.to_json()

        assert "\n" in json_str


# ---------------------------------------------------------------------------
# validate()
# ---------------------------------------------------------------------------


class TestValidate:
    def test_valid_config_returns_empty_list(self):
        """validate() returns an empty list for a correctly formed config."""
        cfg = RagUIComponentIngestConfig.from_env()
        errors = cfg.validate()

        assert errors == []

    def test_duplicate_slugs_detected(self):
        """validate() reports an error when two libraries share the same slug."""
        from rag_ui_component_ingest_config import BaseIngestConfig, LibraryConfig

        cfg = RagUIComponentIngestConfig(
            base=BaseIngestConfig(),
            libraries=[
                LibraryConfig(name="Ant Design", slug="ant-design"),
                LibraryConfig(name="Ant Design Copy", slug="ant-design"),
            ],
        )
        errors = cfg.validate()

        assert len(errors) == 1
        assert "ant-design" in errors[0]

    def test_chunk_overlap_gte_chunk_size_detected(self):
        """validate() reports an error when library chunk_overlap >= chunk_size."""
        from rag_ui_component_ingest_config import BaseIngestConfig, LibraryConfig

        cfg = RagUIComponentIngestConfig(
            base=BaseIngestConfig(),
            libraries=[
                LibraryConfig(
                    name="Ant Design",
                    slug="ant-design",
                    chunk_size=500,
                    chunk_overlap=500,  # equal — should be flagged
                ),
            ],
        )
        errors = cfg.validate()

        assert len(errors) == 1
        assert "chunk_overlap" in errors[0]

    def test_no_error_when_library_does_not_override_chunk(self):
        """validate() does not flag libraries that defer chunk settings to base."""
        from rag_ui_component_ingest_config import BaseIngestConfig, LibraryConfig

        # Only chunk_size is overridden; chunk_overlap is None → falls back to base
        cfg = RagUIComponentIngestConfig(
            base=BaseIngestConfig(),
            libraries=[
                LibraryConfig(
                    name="Ant Design",
                    slug="ant-design",
                    chunk_size=1500,
                    chunk_overlap=None,
                ),
            ],
        )
        errors = cfg.validate()

        assert errors == []


# ---------------------------------------------------------------------------
# from_args()
# ---------------------------------------------------------------------------


class TestFromArgs:
    def test_from_args_with_libraries_list(self):
        """from_args() accepts a 'libraries' key containing a list of library dicts."""
        args = {
            "libraries": [
                {
                    "name": "Ant Design",
                    "slug": "ant-design",
                    "version": "5.x",
                    "chunk_size": 800,
                    "import_packages": ["antd"],
                }
            ]
        }
        cfg = RagUIComponentIngestConfig.from_args(args)

        assert len(cfg.libraries) == 1
        lib = cfg.libraries[0]
        assert lib.slug == "ant-design"
        assert lib.chunk_size == 800

    def test_from_args_flat_dict_creates_single_library(self):
        """from_args() with flat name/slug keys builds a single LibraryConfig."""
        args = {
            "name": "My Library",
            "slug": "my-lib",
            "chunk_size": 600,
        }
        cfg = RagUIComponentIngestConfig.from_args(args)

        assert len(cfg.libraries) == 1
        assert cfg.libraries[0].slug == "my-lib"
        assert cfg.libraries[0].chunk_size == 600

    def test_from_args_chunk_size_override_applied(self):
        """from_args() chunk_size override is carried through to for_library()."""
        args = {
            "libraries": [
                {
                    "name": "Ant Design",
                    "slug": "ant-design",
                    "chunk_size": 2000,
                    "import_packages": ["antd"],
                }
            ]
        }
        cfg = RagUIComponentIngestConfig.from_args(args)
        result = cfg.for_library("ant-design")

        assert result.chunk_size == 2000

    def test_from_args_empty_dict_no_libraries(self):
        """from_args({}) with neither 'libraries' nor name/slug produces zero libraries."""
        cfg = RagUIComponentIngestConfig.from_args({})
        assert cfg.libraries == []

    def test_from_args_ignores_unknown_keys(self):
        """from_args() ignores flat args that don't map to library fields."""
        args = {
            "name": "My Library",
            "slug": "my-lib",
            "unknown_key": "ignored",
        }
        cfg = RagUIComponentIngestConfig.from_args(args)
        # Should not raise; library is still built
        assert len(cfg.libraries) == 1
