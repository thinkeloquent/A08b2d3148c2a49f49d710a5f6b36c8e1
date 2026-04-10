"""Top-level orchestrator for rag_ui_component_ingest_config."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any, Optional

from .base_config import BaseIngestConfig
from .defaults import DEFAULT_LIBRARY
from .library_config import LibraryConfig, ResolvedLibraryConfig
from .logger import create_logger

_log = create_logger("config")


# ---------------------------------------------------------------------------
# SingleLibraryConfig — flattened, backwards-compatible view
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class SingleLibraryConfig:
    """Flattened view combining all base infrastructure + resolved library fields.

    This is a drop-in replacement for the legacy ``RagIngestConfig`` that
    contained exactly one library's worth of configuration.
    """

    # ---- Base infrastructure --------------------------------------------
    dataset_root: str
    persist_root: str
    embeddings_model_name: str
    chunk_size: int
    chunk_overlap: int
    vector_backend: str
    elasticsearch_host: str
    elasticsearch_port: int
    elasticsearch_scheme: str
    redis_host: str
    redis_port: int
    llm_provider: str
    openai_model: str
    anthropic_model: str
    gemini_model: str
    hybrid_alpha: float
    score_threshold: float
    reranker_enabled: bool
    reranker_model: str
    retrieve_n: int
    top_k: int
    postgres_enabled: bool

    # ---- Library identity -----------------------------------------------
    name: str
    slug: str
    version: Optional[str]
    component_path_segment: str
    import_packages: list[str]

    # ---- Resolved paths -------------------------------------------------
    source_directory: str
    persist_directory: str
    examples_directory: str
    elasticsearch_index: str

    # ---- Resolved file filtering ----------------------------------------
    file_extensions: list[str]
    ignored_directories: list[str]

    # ---- Status ---------------------------------------------------------
    enabled: bool

    def __getattr__(self, item: str) -> Any:
        """Provide backward-compatible aliases for library identity fields."""
        if item == "library_name":
            return self.name
        if item == "library_slug":
            return self.slug
        raise AttributeError(f"'{type(self).__name__}' object has no attribute {item!r}")

    @classmethod
    def from_resolved(cls, resolved: ResolvedLibraryConfig) -> "SingleLibraryConfig":
        """Build a ``SingleLibraryConfig`` from a ``ResolvedLibraryConfig``."""
        d = resolved.to_dict()
        return cls(**d)  # type: ignore[arg-type]

    def to_dict(self) -> dict[str, Any]:
        """Return a plain dict of all fields."""
        return {
            # Base infrastructure
            "dataset_root": self.dataset_root,
            "persist_root": self.persist_root,
            "embeddings_model_name": self.embeddings_model_name,
            "chunk_size": self.chunk_size,
            "chunk_overlap": self.chunk_overlap,
            "vector_backend": self.vector_backend,
            "elasticsearch_host": self.elasticsearch_host,
            "elasticsearch_port": self.elasticsearch_port,
            "elasticsearch_scheme": self.elasticsearch_scheme,
            "redis_host": self.redis_host,
            "redis_port": self.redis_port,
            "llm_provider": self.llm_provider,
            "openai_model": self.openai_model,
            "anthropic_model": self.anthropic_model,
            "gemini_model": self.gemini_model,
            "hybrid_alpha": self.hybrid_alpha,
            "score_threshold": self.score_threshold,
            "reranker_enabled": self.reranker_enabled,
            "reranker_model": self.reranker_model,
            "retrieve_n": self.retrieve_n,
            "top_k": self.top_k,
            "postgres_enabled": self.postgres_enabled,
            # Library identity
            "name": self.name,
            "slug": self.slug,
            "version": self.version,
            "component_path_segment": self.component_path_segment,
            "import_packages": list(self.import_packages),
            # Paths
            "source_directory": self.source_directory,
            "persist_directory": self.persist_directory,
            "examples_directory": self.examples_directory,
            "elasticsearch_index": self.elasticsearch_index,
            # File filtering
            "file_extensions": list(self.file_extensions),
            "ignored_directories": list(self.ignored_directories),
            # Status
            "enabled": self.enabled,
        }


# ---------------------------------------------------------------------------
# RagUIComponentIngestConfig — multi-library orchestrator
# ---------------------------------------------------------------------------


@dataclass
class RagUIComponentIngestConfig:
    """Multi-library RAG ingest configuration.

    Composes a shared ``BaseIngestConfig`` with one or more ``LibraryConfig``
    instances.  Libraries are lazily resolved on demand.
    """

    base: BaseIngestConfig = field(default_factory=BaseIngestConfig)
    libraries: list[LibraryConfig] = field(default_factory=list)

    # ------------------------------------------------------------------
    # Construction helpers
    # ------------------------------------------------------------------

    @classmethod
    def from_env(cls) -> "RagUIComponentIngestConfig":
        """Build from environment variables with a single default Ant Design library."""
        base = BaseIngestConfig()
        default_lib = LibraryConfig(
            name=DEFAULT_LIBRARY["name"],
            slug=DEFAULT_LIBRARY["slug"],
            version=DEFAULT_LIBRARY["version"],
            import_packages=list(DEFAULT_LIBRARY["import_packages"]),
            component_path_segment=DEFAULT_LIBRARY["component_path_segment"],
            file_extensions=list(DEFAULT_LIBRARY["file_extensions"]),
            ignored_directories=list(DEFAULT_LIBRARY["ignored_directories"]),
        )
        cfg = cls(base=base, libraries=[default_lib])
        _log.info(
            "RagUIComponentIngestConfig.from_env(): loaded base config + 1 default library (%s)",
            default_lib.slug,
        )
        return cfg

    @classmethod
    def from_yaml(
        cls,
        path: str,
        section: str = "component_ingest",
        enabled_only: bool = False,
        project_root: Optional[str] = None,
    ) -> "RagUIComponentIngestConfig":
        """Load libraries from a YAML config file with framework entries.

        Reads the ``component_ingest.framework`` dict, merges each entry with
        ``component_ingest.defaults``, and builds a ``LibraryConfig`` per
        framework.  Falls back to ``from_env()`` if the file does not exist.

        The framework dict key is used as the ``slug`` (via ``setdefault``).

        String values containing ``${project_root}`` are expanded when
        *project_root* is provided.

        Args:
            path: Absolute or relative path to the YAML config file.
            section: Top-level YAML key to read (default ``"component_ingest"``).
            enabled_only: When ``True``, skip frameworks with ``enabled: false``.
            project_root: If provided, ``${project_root}`` in string values is
                replaced with this path.
        """
        import pathlib

        yaml_path = pathlib.Path(path)
        if not yaml_path.exists():
            _log.warning(
                "YAML config not found at '%s' — falling back to from_env()", path
            )
            return cls.from_env()

        try:
            import yaml  # type: ignore[import-untyped]
        except ImportError as exc:  # pragma: no cover
            raise ImportError(
                "PyYAML is required to load YAML config. "
                "Install it with: pip install pyyaml"
            ) from exc

        with yaml_path.open("r", encoding="utf-8") as fh:
            raw = yaml.safe_load(fh) or {}

        section_data: dict[str, Any] = raw.get(section, {})
        defaults: dict[str, Any] = section_data.get("defaults", {})
        frameworks: dict[str, dict[str, Any]] = section_data.get("framework", {})

        if not frameworks:
            _log.warning(
                "No frameworks found in '%s.framework' — falling back to from_env()",
                section,
            )
            return cls.from_env()

        base = BaseIngestConfig()
        libraries: list[LibraryConfig] = []

        for fw_key, fw_data in frameworks.items():
            # Merge defaults (base) with framework-specific (override)
            merged: dict[str, Any] = {**defaults, **fw_data}
            merged.setdefault("slug", fw_key)
            if enabled_only and not merged.get("enabled", True):
                continue
            if project_root:
                _expand_project_root(merged, project_root)
            libraries.append(_library_from_dict(merged))

        cfg = cls(base=base, libraries=libraries)
        _log.info(
            "RagUIComponentIngestConfig.from_yaml('%s'): loaded %d libraries",
            path,
            len(libraries),
        )
        return cfg

    @classmethod
    def from_manifest(cls, path: str, **base_overrides: Any) -> "RagUIComponentIngestConfig":
        """Load libraries from a YAML or JSON manifest file.

        The manifest must be a mapping with a ``"libraries"`` key whose value is
        a list of library config dicts.  Optional top-level keys are merged as
        ``base_overrides``.

        Args:
            path: Absolute or relative path to the manifest file.
            **base_overrides: Additional keyword arguments forwarded to
                ``BaseIngestConfig`` (currently unused because BaseIngestConfig
                is frozen and relies solely on env vars — overrides are logged
                for informational purposes).
        """
        import pathlib

        manifest_path = pathlib.Path(path)
        raw: dict[str, Any]

        if manifest_path.suffix in {".yaml", ".yml"}:
            try:
                import yaml  # type: ignore[import-untyped]
            except ImportError as exc:  # pragma: no cover
                raise ImportError(
                    "PyYAML is required to load YAML manifests. "
                    "Install it with: pip install pyyaml"
                ) from exc
            with manifest_path.open("r", encoding="utf-8") as fh:
                raw = yaml.safe_load(fh) or {}
        else:
            with manifest_path.open("r", encoding="utf-8") as fh:
                raw = json.load(fh)

        base = BaseIngestConfig()
        libraries_data: list[dict[str, Any]] = raw.get("libraries", [])
        libraries = [_library_from_dict(lib_data) for lib_data in libraries_data]

        cfg = cls(base=base, libraries=libraries)
        _log.info(
            "RagUIComponentIngestConfig.from_manifest('%s'): loaded %d libraries",
            path,
            len(libraries),
        )
        return cfg

    @classmethod
    def from_args(cls, args: dict[str, Any]) -> "RagUIComponentIngestConfig":
        """Build from a CLI/SDK argument dict.

        The dict may contain a top-level ``"libraries"`` list plus any base
        infrastructure keys that are handled via environment variables.
        """
        base = BaseIngestConfig()
        libraries_data: list[dict[str, Any]] = args.get("libraries", [])

        if not libraries_data:
            # Build a single library from flat args
            lib_data: dict[str, Any] = {
                k: v
                for k, v in args.items()
                if k
                in {
                    "name",
                    "slug",
                    "version",
                    "source_directory",
                    "persist_directory",
                    "examples_directory",
                    "elasticsearch_index",
                    "component_path_segment",
                    "import_packages",
                    "chunk_size",
                    "chunk_overlap",
                    "file_extensions",
                    "ignored_directories",
                    "enabled",
                }
            }
            if lib_data.get("name") and lib_data.get("slug"):
                libraries_data = [lib_data]

        libraries = [_library_from_dict(d) for d in libraries_data]
        cfg = cls(base=base, libraries=libraries)
        _log.info(
            "RagUIComponentIngestConfig.from_args(): built config with %d libraries",
            len(libraries),
        )
        return cfg

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "RagUIComponentIngestConfig":
        """Deserialise from a plain dict (e.g. from JSON or YAML)."""
        base = BaseIngestConfig()
        libraries_data: list[dict[str, Any]] = data.get("libraries", [])
        libraries = [_library_from_dict(d) for d in libraries_data]
        return cls(base=base, libraries=libraries)

    @classmethod
    def from_json(cls, json_str: str) -> "RagUIComponentIngestConfig":
        """Deserialise from a JSON string."""
        data: dict[str, Any] = json.loads(json_str)
        return cls.from_dict(data)

    # ------------------------------------------------------------------
    # Library access
    # ------------------------------------------------------------------

    def _resolved(self) -> list[ResolvedLibraryConfig]:
        return [lib.resolve(self.base) for lib in self.libraries]

    def get_library(self, slug: str) -> ResolvedLibraryConfig:
        """Return the resolved config for a library identified by *slug*.

        Raises ``KeyError`` when no library with that slug is registered.
        """
        for lib in self.libraries:
            if lib.slug == slug:
                return lib.resolve(self.base)
        raise KeyError(f"No library with slug '{slug}' found in configuration")

    def get_enabled_libraries(self) -> list[ResolvedLibraryConfig]:
        """Return resolved configs for all libraries whose ``enabled`` flag is ``True``."""
        return [lib.resolve(self.base) for lib in self.libraries if lib.enabled]

    def for_library(self, slug: Optional[str] = None) -> SingleLibraryConfig:
        """Return a flattened ``SingleLibraryConfig`` for *slug*.

        When *slug* is ``None`` the first library in the list is used.

        Raises ``IndexError`` when the library list is empty.
        Raises ``KeyError`` when *slug* is provided but not found.
        """
        if slug is None:
            if not self.libraries:
                raise IndexError("No libraries are configured")
            resolved = self.libraries[0].resolve(self.base)
        else:
            resolved = self.get_library(slug)
        return SingleLibraryConfig.from_resolved(resolved)

    def list_libraries(self) -> list[dict[str, Any]]:
        """Return a list of summary dicts for all registered libraries."""
        return [
            {
                "name": lib.name,
                "slug": lib.slug,
                "version": lib.version,
                "enabled": lib.enabled,
            }
            for lib in self.libraries
        ]

    # ------------------------------------------------------------------
    # Serialisation
    # ------------------------------------------------------------------

    def to_dict(self) -> dict[str, Any]:
        """Return a plain dict with ``base`` and ``libraries`` sections."""
        return {
            "base": self.base.to_dict(),
            "libraries": [lib.resolve(self.base).to_dict() for lib in self.libraries],
        }

    def to_json(self, indent: int = 2) -> str:
        """Serialise to a JSON string."""
        return json.dumps(self.to_dict(), indent=indent, default=str)

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------

    def validate(self) -> list[str]:
        """Run consistency checks across all libraries.

        Returns a (possibly empty) list of human-readable error strings.
        """
        errors: list[str] = []
        slugs: list[str] = []

        for i, lib in enumerate(self.libraries):
            label = f"libraries[{i}] (slug={lib.slug!r})"

            if lib.slug in slugs:
                errors.append(f"{label}: duplicate slug '{lib.slug}'")
            slugs.append(lib.slug)

            # Chunk overlap sanity when library overrides both values
            if lib.chunk_size is not None and lib.chunk_overlap is not None:
                if lib.chunk_overlap >= lib.chunk_size:
                    errors.append(
                        f"{label}: chunk_overlap ({lib.chunk_overlap}) must be "
                        f"less than chunk_size ({lib.chunk_size})"
                    )

        return errors


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _expand_project_root(data: dict[str, Any], project_root: str) -> None:
    """Replace ``${project_root}`` in string values of *data* (in-place)."""
    for key, value in data.items():
        if isinstance(value, str) and "${project_root}" in value:
            data[key] = value.replace("${project_root}", project_root)


def _library_from_dict(data: dict[str, Any]) -> LibraryConfig:
    """Construct a ``LibraryConfig`` from a raw dict, ignoring unknown keys."""
    known_keys = {
        "name",
        "slug",
        "version",
        "source_directory",
        "persist_directory",
        "examples_directory",
        "elasticsearch_index",
        "component_path_segment",
        "import_packages",
        "chunk_size",
        "chunk_overlap",
        "file_extensions",
        "ignored_directories",
        "enabled",
    }
    filtered = {k: v for k, v in data.items() if k in known_keys}
    return LibraryConfig(**filtered)  # type: ignore[arg-type]
