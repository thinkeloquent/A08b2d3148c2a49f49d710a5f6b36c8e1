"""CLI entry point for RAG ingestion (run before server starts).

Usage:
    python -m chromadb_rag_ingest.cli_ingest
    python -m chromadb_rag_ingest.cli_ingest --slug ant-design
    # or via Makefile:
    make -f Makefile.chromadb-rag ingest-all
    make -f Makefile.chromadb-rag ingest SLUG=ant-design
"""

import argparse
import asyncio
import logging
import os
import platform
import ssl
import sys
import time
import traceback
from pathlib import Path

# Ensure fastapi_apps/ and polyglot modules are on sys.path
_root = Path(__file__).parent.parent.parent
_fastapi_apps = _root / "fastapi_apps"
_polyglot_rag_config = _root / "polyglot" / "rag_ui_component_ingest_config" / "py"
_polyglot_rag_embedding_config = _root / "polyglot" / "rag_embedding_config" / "py"
_polyglot_rag_embedding_client = _root / "polyglot" / "rag_embedding_client" / "py"
for p in [str(_fastapi_apps), str(_polyglot_rag_config), str(_polyglot_rag_embedding_config), str(_polyglot_rag_embedding_client)]:
    if p not in sys.path:
        sys.path.insert(0, p)

# NLTK data lives in project-local ./data/nltk_data (used by unstructured)
import nltk
nltk.data.path.insert(0, str(_root / "data" / "nltk_data"))

from chromadb_rag_ingest.config import RagIngestConfig
from chromadb_rag_ingest.embedding_client import get_embeddings
from chromadb_rag_ingest.services.ingest import run_ingest_sync, does_vectorstore_exist
from env_resolver import resolve_openai_env

_openai_env = resolve_openai_env()

LOG_PATH = _root / "logs" / "chromadb_rag_ingest.log"

_TAG = "[chromadb-rag-ingest]"
_SEP = "=" * 50


def _print_env_debug() -> None:
    """Print environment and runtime diagnostics."""
    print(f"\n{_SEP}")
    print("  Environment & Runtime")
    print(_SEP)
    print(f"  Python:        {sys.version}")
    print(f"  Platform:      {platform.platform()}")
    print(f"  SSL:           {ssl.OPENSSL_VERSION}")
    print(f"  cwd:           {os.getcwd()}")
    print(f"  project_root:  {_root}")
    print(f"  CPU count:     {os.cpu_count()}")

    # Embedding-related env vars
    embed_vars = [
        "OPENAI_EMBEDDINGS_BASE_URL",
        "OPENAI_EMBEDDINGS_API_KEY",
        "OPENAI_API_KEY",
        "OPENAI_EMBEDDINGS_ORG",
        "OPENAI_EMBEDDINGS_PROXY_URL",
        "OPENAI_EMBEDDINGS_TIMEOUT",
        "OPENAI_EMBEDDINGS_CA_BUNDLE",
        "RAG_EMBEDDING_BACKEND",
        "EMBEDDINGS_MODEL_NAME",
    ]
    print(f"\n  Embedding env vars:")
    for var in embed_vars:
        val = os.environ.get(var)
        if val is None:
            print(f"    {var} = (not set)")
        elif "KEY" in var or "API" in var:
            masked = val[:4] + "..." + val[-4:] if len(val) > 8 else "****"
            print(f"    {var} = {masked}")
        else:
            print(f"    {var} = {val}")

    # Network proxy env vars
    proxy_vars = ["HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY", "http_proxy", "https_proxy", "no_proxy"]
    has_proxy = any(os.environ.get(v) for v in proxy_vars)
    if has_proxy:
        print(f"\n  Network proxy env vars:")
        for var in proxy_vars:
            val = os.environ.get(var)
            if val:
                print(f"    {var} = {val}")
    print()


def _setup_logger() -> logging.Logger:
    from chromadb_rag_ingest.logging_setup import setup_logger
    logger = setup_logger(LOG_PATH)
    print(f"{_TAG} Logger initialised — file: {LOG_PATH}")
    return logger


def _ingest_single(slug: str, logger: logging.Logger) -> None:
    """Ingest a single framework by slug (skips auto_ingest / exists checks).

    Async (get_embeddings) and sync (run_ingest_sync) phases are separated
    so that run_ingest_sync executes outside any event loop — this avoids
    nested-loop errors from fetch_httpx's sync Client wrapper.
    """
    yaml_path = str(_root / "common" / "config" / "llm_rag.yml")
    project_root = str(_root)

    print(f"{_TAG}:{slug} Loading config from {yaml_path}")
    try:
        cfg = RagIngestConfig(yaml_path=yaml_path, library_slug=slug, project_root=project_root)
    except Exception as e:
        print(f"{_TAG}:{slug} CONFIG ERROR: {type(e).__name__}: {e}")
        traceback.print_exc()
        sys.exit(1)

    print(f"{_TAG}:{slug} Config loaded — model={cfg.embeddings_model_name}, source={cfg.source_directory}")

    # Verify source directory
    source_dir = Path(cfg.source_directory)
    if not source_dir.exists():
        print(f"{_TAG}:{slug} ERROR: source directory does not exist: {source_dir}")
        sys.exit(1)
    elif not source_dir.is_dir():
        print(f"{_TAG}:{slug} ERROR: source path is not a directory: {source_dir}")
        sys.exit(1)
    else:
        file_count = sum(1 for _ in source_dir.rglob("*") if _.is_file())
        print(f"{_TAG}:{slug} Source directory verified: {file_count} files found")

    # Async phase: build embeddings client (needs await)
    print(f"{_TAG}:{slug} Building embeddings client...")
    try:
        embeddings = asyncio.run(get_embeddings(cfg))
        print(f"{_TAG}:{slug} Embeddings client ready: {type(embeddings).__qualname__}")
    except Exception as e:
        print(f"{_TAG}:{slug} EMBEDDINGS CLIENT ERROR: {type(e).__name__}: {e}")
        _print_connection_debug(e)
        traceback.print_exc()
        sys.exit(1)

    # Sync phase: run ingestion OUTSIDE any event loop so that
    # LangChain → embed_documents → fetch_httpx sync Client.post works
    print(f"{_TAG}:{slug} Starting ingestion from {cfg.source_directory}")
    try:
        result = run_ingest_sync(cfg, embeddings)
        chunks = result.get("chunks", 0)
        tokens = result.get("est_tokens", 0)
        cost = result.get("est_cost_usd", 0.0)
        print(f"{_TAG}:{slug} Ingestion complete — {result.get('message', 'done')}")
        print(f"{_TAG}:{slug}   chunks={chunks:,}  est_tokens={tokens:,}  est_cost=${cost:.4f}")
    except Exception as e:
        logger.exception("Ingestion failed for %s", slug)
        print(f"{_TAG}:{slug} INGESTION ERROR: {type(e).__name__}: {e}")
        _print_connection_debug(e)
        traceback.print_exc()
        print(f"{_TAG}:{slug} (full log: {LOG_PATH})")
        sys.exit(1)


def _ingest_all(logger: logging.Logger) -> None:
    """Ingest all enabled frameworks with auto_ingest=true (original behavior).

    Async (get_embeddings) and sync (run_ingest_sync) phases are separated
    so that run_ingest_sync executes outside any event loop.
    """
    yaml_path = str(_root / "common" / "config" / "llm_rag.yml")
    project_root = str(_root)

    # Read auto_ingest flag from YAML
    print(f"{_TAG} Loading YAML config from {yaml_path}")
    yaml_exists = Path(yaml_path).exists()
    print(f"{_TAG}   file exists: {yaml_exists}")
    if not yaml_exists:
        print(f"{_TAG} ERROR: YAML config not found at {yaml_path}")
        sys.exit(1)

    try:
        import yaml
        with open(yaml_path, "r", encoding="utf-8") as fh:
            raw = yaml.safe_load(fh) or {}
    except Exception as e:
        print(f"{_TAG} YAML PARSE ERROR: {type(e).__name__}: {e}")
        traceback.print_exc()
        sys.exit(1)

    section = raw.get("component_ingest", {})
    defaults = section.get("defaults", {})
    frameworks_raw = section.get("framework", {})
    default_auto_ingest = defaults.get("auto_ingest", False)
    print(f"{_TAG} YAML loaded — {len(frameworks_raw)} framework(s) defined, default auto_ingest={default_auto_ingest}")

    # Discover enabled frameworks
    print(f"{_TAG} Discovering enabled frameworks...")
    from rag_ui_component_ingest_config import RagUIComponentIngestConfig
    try:
        multi = RagUIComponentIngestConfig.from_yaml(
            yaml_path, enabled_only=True, project_root=project_root,
        )
    except Exception as e:
        print(f"{_TAG} CONFIG PARSE ERROR: {type(e).__name__}: {e}")
        traceback.print_exc()
        sys.exit(1)

    enabled_libs = multi.get_enabled_libraries()
    print(f"{_TAG} Found {len(enabled_libs)} enabled framework(s)")

    if not enabled_libs:
        print(f"{_TAG} No enabled frameworks found — skipping")
        return

    # Filter to frameworks with auto_ingest enabled (per-framework or default)
    print(f"{_TAG} Filtering by auto_ingest flag...")
    libs_to_ingest = []
    for lib in enabled_libs:
        fw_data = frameworks_raw.get(lib.slug, {})
        auto_ingest = fw_data.get("auto_ingest", default_auto_ingest)
        source_exists = Path(lib.source_directory).exists() if hasattr(lib, "source_directory") else "?"
        if auto_ingest:
            libs_to_ingest.append(lib)
            print(f"{_TAG}:{lib.slug} auto_ingest=true, source_exists={source_exists} — will ingest")
        else:
            print(f"{_TAG}:{lib.slug} auto_ingest=false — skipping")

    if not libs_to_ingest:
        print(f"{_TAG} No frameworks with auto_ingest enabled — skipping")
        return

    print(f"{_TAG} {len(libs_to_ingest)} framework(s) selected for ingestion")

    # Async phase: load embeddings model once (shared)
    print(f"{_TAG} Building embeddings client (shared instance)...")
    try:
        first_cfg = RagIngestConfig(yaml_path=yaml_path, library_slug=libs_to_ingest[0].slug, project_root=project_root)
        embeddings = asyncio.run(get_embeddings(first_cfg))
        print(f"{_TAG} Embeddings client ready: {type(embeddings).__qualname__}")
    except Exception as e:
        print(f"{_TAG} EMBEDDINGS CLIENT ERROR: {type(e).__name__}: {e}")
        _print_connection_debug(e)
        traceback.print_exc()
        sys.exit(1)

    # Sync phase: ingest each framework that has no data
    total_chunks = 0
    total_tokens = 0
    total_cost = 0.0
    succeeded = 0
    failed = 0
    skipped = 0
    for idx, lib in enumerate(libs_to_ingest, 1):
        print(f"\n{_TAG}:{lib.slug} [{idx}/{len(libs_to_ingest)}] Loading config...")
        try:
            cfg = RagIngestConfig(yaml_path=yaml_path, library_slug=lib.slug, project_root=project_root)
        except Exception as e:
            print(f"{_TAG}:{lib.slug} CONFIG ERROR: {type(e).__name__}: {e}")
            traceback.print_exc()
            failed += 1
            continue

        print(f"{_TAG}:{lib.slug} Checking vectorstore at {cfg.persist_directory}")
        if does_vectorstore_exist(cfg.persist_directory):
            print(f"{_TAG}:{lib.slug} Already ingested — skipping")
            skipped += 1
            continue

        # Verify source directory
        source_dir = Path(cfg.source_directory)
        if not source_dir.exists():
            print(f"{_TAG}:{lib.slug} WARNING: source directory does not exist: {source_dir} — skipping")
            skipped += 1
            continue

        print(f"{_TAG}:{lib.slug} Starting ingestion from {cfg.source_directory}")
        try:
            result = run_ingest_sync(cfg, embeddings)
            chunks = result.get("chunks", 0)
            tokens = result.get("est_tokens", 0)
            cost = result.get("est_cost_usd", 0.0)
            print(f"{_TAG}:{lib.slug} Ingestion complete — {result.get('message', 'done')}")
            print(f"{_TAG}:{lib.slug}   chunks={chunks:,}  est_tokens={tokens:,}  est_cost=${cost:.4f}")
            total_chunks += chunks
            total_tokens += tokens
            total_cost += cost
            succeeded += 1
        except Exception as e:
            logger.exception("Ingestion failed for %s", lib.slug)
            print(f"{_TAG}:{lib.slug} INGESTION ERROR: {type(e).__name__}: {e}")
            _print_connection_debug(e)
            traceback.print_exc()
            print(f"{_TAG}:{lib.slug} (full log: {LOG_PATH})")
            failed += 1

    print(f"\n{_SEP}")
    print("  Embedding Cost Summary (All Frameworks)")
    print(_SEP)
    print(f"  Model:            {first_cfg.embeddings_model_name}")
    print(f"  Frameworks:       {len(libs_to_ingest)} (succeeded={succeeded}, failed={failed}, skipped={skipped})")
    print(f"  Total chunks:     {total_chunks:,}")
    print(f"  Total est. tokens:{total_tokens:,}")
    print(f"  Total est. cost:  ${total_cost:.4f}")
    print("  Rate:             $0.02 / 1M tokens")
    print(_SEP)
    print(f"{_TAG} All frameworks processed")

    if failed > 0:
        print(f"{_TAG} WARNING: {failed} framework(s) failed — see log: {LOG_PATH}")
        sys.exit(1)


def _print_connection_debug(exc: Exception) -> None:
    """Print context-sensitive debug info based on the exception type."""
    exc_str = str(exc).lower()
    exc_type = type(exc).__name__

    if "connect" in exc_str or "timeout" in exc_str or "Timeout" in exc_type:
        base_url = _openai_env.embeddings_base_url or "(default OpenAI)"
        print(f"\n  Connection debug:")
        print(f"    target:  {base_url}")
        print(f"    proxy:   {_openai_env.embeddings_proxy_url or '(none)'}")
        print(f"    timeout: {_openai_env.embeddings_timeout or '120 (default)'}s")

    if "ssl" in exc_str or "certificate" in exc_str or "SSL" in exc_type:
        print(f"\n  SSL debug:")
        print(f"    OpenSSL:   {ssl.OPENSSL_VERSION}")
        print(f"    ca_bundle: {_openai_env.embeddings_ca_bundle or '(not set)'}")
        print(f"    cert_file: {ssl.get_default_verify_paths().cafile}")
        print(f"    cert_path: {ssl.get_default_verify_paths().capath}")

    if "401" in str(exc) or "auth" in exc_str or "key" in exc_str:
        api_key = _openai_env.embeddings_api_key or _openai_env.api_key or ""
        print(f"\n  Auth debug:")
        key_display = api_key[:4] + "..." + api_key[-4:] if len(api_key) > 8 else "(empty or short)"
        print(f"    api_key source: {'embeddings_api_key' if _openai_env.embeddings_api_key else 'api_key (fallback)'}")
        print(f"    api_key value:  {key_display}")

    if "chroma" in exc_str or "sqlite" in exc_str or "persist" in exc_str:
        print(f"\n  ChromaDB debug:")
        print(f"    persist root: {os.environ.get('RAG_PERSIST_ROOT', 'data/chroma (default)')}")
        print(f"    cwd:          {os.getcwd()}")

    if "no module" in exc_str or "import" in exc_str or "ModuleNotFound" in exc_type:
        print(f"\n  Import debug:")
        print(f"    PYTHONPATH: {os.environ.get('PYTHONPATH', '(not set)')}")
        print(f"    sys.path (first 5):")
        for i, p in enumerate(sys.path[:5]):
            print(f"      [{i}] {p}")


def main():
    parser = argparse.ArgumentParser(description="RAG ingestion CLI")
    parser.add_argument("--slug", type=str, default=None, help="Ingest a single framework by slug")
    args = parser.parse_args()

    print(f"{_TAG} CLI started — mode={'single (slug=' + args.slug + ')' if args.slug else 'all'}")

    _print_env_debug()

    logger = _setup_logger()

    if args.slug:
        _ingest_single(args.slug, logger)
    else:
        _ingest_all(logger)

    print(f"{_TAG} CLI finished")


if __name__ == "__main__":
    main()
