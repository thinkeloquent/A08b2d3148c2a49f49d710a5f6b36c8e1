"""Component Registry Service — ELT pipeline for .md docs and .fnc.py modules.

Scans the examples_directory, upserts into PostgreSQL, and provides
query/execute methods for the API layer.
"""

import hashlib
import importlib.util
import inspect
import logging
from pathlib import Path

from sqlalchemy import delete, select

from ..config import RagIngestConfig
from ..db_models import RagComponentDocument, RagComponentFunctionModule

logger = logging.getLogger("chromadb_rag_ingest.component_registry")


class ComponentRegistryService:
    """ELT pipeline + query layer for component reference docs and functions."""

    def __init__(self, config: RagIngestConfig, db_manager):
        self.config = config
        self.db_manager = db_manager
        self._loaded_modules: dict[str, object] = {}

    # ------------------------------------------------------------------
    # ELT pipeline
    # ------------------------------------------------------------------

    async def run_ingest(self) -> dict:
        """Full ELT: extract files, load/update PostgreSQL, transform metadata."""
        examples_dir = Path(self.config.examples_directory)
        if not examples_dir.is_dir():
            return {"error": f"examples_directory not found: {examples_dir}", "docs": 0, "functions": 0}

        library_slug = self.config.library_slug

        # --- EXTRACT ---
        md_files: dict[str, Path] = {}
        fnc_files: dict[str, Path] = {}

        for f in sorted(examples_dir.iterdir()):
            if f.suffix == ".md":
                md_files[f.stem] = f
            elif f.name.endswith(".fnc.py"):
                fnc_files[f.name.removesuffix(".fnc.py")] = f

        stats = {"docs_upserted": 0, "docs_skipped": 0, "docs_deleted": 0,
                 "fns_upserted": 0, "fns_skipped": 0, "fns_deleted": 0}

        async with self.db_manager.async_session() as session:
            # --- LOAD documents ---
            existing_docs = {
                row.file_id: row
                for row in (await session.execute(
                    select(RagComponentDocument).where(
                        RagComponentDocument.library_slug == library_slug
                    )
                )).scalars().all()
            }

            seen_doc_ids: set[str] = set()
            for component_name, path in md_files.items():
                file_id = f"{library_slug}--{component_name}"
                seen_doc_ids.add(file_id)
                content = path.read_text(encoding="utf-8")
                content_hash = hashlib.sha256(content.encode()).hexdigest()

                existing = existing_docs.get(file_id)
                if existing and existing.content_hash == content_hash:
                    stats["docs_skipped"] += 1
                    continue

                if existing:
                    existing.content = content
                    existing.content_hash = content_hash
                    existing.component_name = component_name
                else:
                    session.add(RagComponentDocument(
                        file_id=file_id,
                        library_slug=library_slug,
                        component_name=component_name,
                        content=content,
                        content_hash=content_hash,
                    ))
                stats["docs_upserted"] += 1

            # Delete orphaned docs
            orphaned_doc_ids = set(existing_docs.keys()) - seen_doc_ids
            if orphaned_doc_ids:
                await session.execute(
                    delete(RagComponentDocument).where(
                        RagComponentDocument.file_id.in_(orphaned_doc_ids)
                    )
                )
                stats["docs_deleted"] = len(orphaned_doc_ids)

            # --- LOAD + TRANSFORM function modules ---
            existing_fns = {
                row.file_id: row
                for row in (await session.execute(
                    select(RagComponentFunctionModule).where(
                        RagComponentFunctionModule.library_slug == library_slug
                    )
                )).scalars().all()
            }

            seen_fn_ids: set[str] = set()
            for component_name, path in fnc_files.items():
                file_id = f"{library_slug}--{component_name}"
                seen_fn_ids.add(file_id)
                raw = path.read_bytes()
                content_hash = hashlib.sha256(raw).hexdigest()

                # Always load the module so execute_function works
                self._load_module(file_id, path)

                existing = existing_fns.get(file_id)
                if existing and existing.content_hash == content_hash:
                    stats["fns_skipped"] += 1
                    continue

                # TRANSFORM: extract function metadata via inspect on already-loaded module
                fn_meta = self._extract_function_metadata_from_module(file_id)

                if existing:
                    existing.content_hash = content_hash
                    existing.component_name = component_name
                    existing.function_metadata = fn_meta
                    existing.file_path = str(path.resolve())
                else:
                    session.add(RagComponentFunctionModule(
                        file_id=file_id,
                        library_slug=library_slug,
                        component_name=component_name,
                        content_hash=content_hash,
                        function_metadata=fn_meta,
                        file_path=str(path.resolve()),
                    ))
                stats["fns_upserted"] += 1

            # Delete orphaned functions
            orphaned_fn_ids = set(existing_fns.keys()) - seen_fn_ids
            if orphaned_fn_ids:
                await session.execute(
                    delete(RagComponentFunctionModule).where(
                        RagComponentFunctionModule.file_id.in_(orphaned_fn_ids)
                    )
                )
                stats["fns_deleted"] = len(orphaned_fn_ids)

        total_docs = len(md_files)
        total_fns = len(fnc_files)
        logger.info("Ingest complete: %d docs, %d function modules", total_docs, total_fns)
        return {"docs": total_docs, "functions": total_fns, **stats}

    # ------------------------------------------------------------------
    # Query methods
    # ------------------------------------------------------------------

    async def get_documents(self, components: list[str]) -> dict[str, str]:
        """Return {component_name: markdown_content} for requested components."""
        if not components:
            return {}
        library_slug = self.config.library_slug
        file_ids = [f"{library_slug}--{c}" for c in components]

        async with self.db_manager.async_session() as session:
            rows = (await session.execute(
                select(RagComponentDocument).where(
                    RagComponentDocument.file_id.in_(file_ids)
                )
            )).scalars().all()

        return {row.component_name: row.content for row in rows}

    async def get_functions(self, components: list[str]) -> dict[str, list[dict]]:
        """Return {component_name: [fn_metadata...]} for requested components."""
        if not components:
            return {}
        library_slug = self.config.library_slug
        file_ids = [f"{library_slug}--{c}" for c in components]

        async with self.db_manager.async_session() as session:
            rows = (await session.execute(
                select(RagComponentFunctionModule).where(
                    RagComponentFunctionModule.file_id.in_(file_ids)
                )
            )).scalars().all()

        return {row.component_name: row.function_metadata for row in rows}

    def execute_function(self, file_id: str, fn_name: str, params: dict | None = None):
        """Execute a function from a .fnc.py module by file_id + fn_name.

        Looks up file_path from DB cache, imports module, calls function.
        Returns the function's result (must be JSON-serializable).
        """
        module = self._loaded_modules.get(file_id)
        if module is None:
            raise ValueError(f"Module not found for file_id: {file_id}")

        fn = getattr(module, fn_name, None)
        if fn is None or not callable(fn) or fn_name.startswith("_"):
            raise ValueError(f"Function '{fn_name}' not found in module '{file_id}'")

        return fn(params)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _load_module(self, file_id: str, path: Path) -> None:
        """Import a .fnc.py file and cache it in _loaded_modules."""
        if file_id in self._loaded_modules:
            return
        try:
            spec = importlib.util.spec_from_file_location(
                f"_fnc_{path.stem}", str(path)
            )
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            self._loaded_modules[file_id] = mod
        except Exception as e:
            logger.warning("Failed to load module %s: %s", file_id, e)

    def _extract_function_metadata_from_module(self, file_id: str) -> list[dict]:
        """Extract public function signatures from an already-loaded module."""
        mod = self._loaded_modules.get(file_id)
        if mod is None:
            return []
        functions = []
        for name, obj in inspect.getmembers(mod, inspect.isfunction):
            if name.startswith("_"):
                continue
            sig = inspect.signature(obj)
            params = [
                {"name": p.name, "default": repr(p.default) if p.default is not inspect.Parameter.empty else None}
                for p in sig.parameters.values()
            ]
            functions.append({
                "fn": name,
                "description": (inspect.getdoc(obj) or "").strip(),
                "params": params,
            })
        return functions
