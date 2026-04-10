"""CLI entry point for testing the OpenAI Embeddings connection.

Sends a single short text to the configured embedding endpoint and
reports success/failure with timing and model info.

Usage:
    python -m chromadb_rag_ingest.cli_test_embedding
    # or via Makefile:
    make -f Makefile.chromadb-rag test-embedding
"""

import asyncio
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

_TAG = "[test-embedding]"
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

    # PYTHONPATH
    pythonpath = os.environ.get("PYTHONPATH", "(not set)")
    print(f"\n  PYTHONPATH:    {pythonpath}")

    # sys.path (first 5 entries)
    print(f"  sys.path (first 5):")
    for i, p in enumerate(sys.path[:5]):
        print(f"    [{i}] {p}")
    if len(sys.path) > 5:
        print(f"    ... ({len(sys.path)} total entries)")
    print()


def _print_config_debug(cfg: RagIngestConfig) -> None:
    """Print resolved configuration values."""
    print(f"{_SEP}")
    print("  Resolved Configuration")
    print(_SEP)
    print(f"  embeddings_model_name: {cfg.embeddings_model_name}")
    print(f"  library_slug:          {cfg.library_slug}")
    print(f"  library_name:          {cfg.library_name}")
    print(f"  chunk_size:            {cfg.chunk_size}")
    print(f"  chunk_overlap:         {cfg.chunk_overlap}")
    print(f"  vector_backend:        {cfg.vector_backend}")
    print(f"  dataset_root:          {cfg.dataset_root}")
    print(f"  persist_directory:     {cfg.persist_directory}")
    print(f"  source_directory:      {cfg.source_directory}")
    print()


async def _test_embedding() -> None:
    yaml_path = str(_root / "common" / "config" / "llm_rag.yml")
    project_root = str(_root)

    # ── Environment diagnostics ──
    _print_env_debug()

    # ── YAML config ──
    print(f"{_TAG} Loading YAML config from {yaml_path}")
    yaml_exists = Path(yaml_path).exists()
    print(f"{_TAG}   file exists: {yaml_exists}")
    if not yaml_exists:
        print(f"{_TAG}   WARNING: YAML config file not found — will fall back to env defaults")

    from rag_ui_component_ingest_config import RagUIComponentIngestConfig

    print(f"{_TAG} Discovering enabled frameworks...")
    multi = RagUIComponentIngestConfig.from_yaml(
        yaml_path, enabled_only=True, project_root=project_root,
    )
    enabled = multi.get_enabled_libraries()
    all_libs = multi.list_libraries()
    print(f"{_TAG}   total frameworks: {len(all_libs)}")
    print(f"{_TAG}   enabled frameworks: {len(enabled)}")
    for lib in all_libs:
        marker = "+" if lib["enabled"] else "-"
        print(f"{_TAG}     [{marker}] {lib['slug']} ({lib['name']})")

    if not enabled:
        print(f"{_TAG} No enabled frameworks — using defaults")
        slug = None
    else:
        slug = enabled[0].slug
        print(f"{_TAG} Using first enabled framework: {slug}")

    # ── Config resolution ──
    print(f"{_TAG} Building RagIngestConfig (slug={slug})...")
    cfg = RagIngestConfig(
        yaml_path=yaml_path, library_slug=slug, project_root=project_root,
    )
    _print_config_debug(cfg)

    # ── Client construction ──
    print(f"{_TAG} Building embeddings client...")
    embeddings = await get_embeddings(cfg)
    client_type = type(embeddings).__module__ + "." + type(embeddings).__qualname__
    print(f"{_TAG}   client type: {client_type}")

    # Print client internals when available
    if hasattr(embeddings, "_base_url"):
        print(f"{_TAG}   client._base_url: {embeddings._base_url}")
    if hasattr(embeddings, "_endpoint"):
        print(f"{_TAG}   client._endpoint: {embeddings._endpoint}")
    if hasattr(embeddings, "_timeout"):
        print(f"{_TAG}   client._timeout: {embeddings._timeout}")
    if hasattr(embeddings, "_proxy_url"):
        proxy_val = embeddings._proxy_url or "(none)"
        print(f"{_TAG}   client._proxy_url: {proxy_val}")
    if hasattr(embeddings, "model"):
        print(f"{_TAG}   client.model: {embeddings.model}")

    model_name = cfg.embeddings_model_name
    base_url = os.environ.get("OPENAI_EMBEDDINGS_BASE_URL", "(default OpenAI)")

    print(f"\n{_SEP}")
    print("  Embedding Connection Test")
    print(_SEP)
    print(f"  Model:     {model_name}")
    print(f"  Endpoint:  {base_url}")
    print(f"  Backend:   {os.environ.get('RAG_EMBEDDING_BACKEND', 'httpx (default)')}")
    print()

    try:
        test_text = "Hello, this is a connection test."
        print(f"{_TAG} Sending embed request to API...")
        print(f"  Sending:   \"{test_text}\"")

        start = time.perf_counter()
        result = await embeddings.aembed_query(test_text)
        elapsed = time.perf_counter() - start

        print(f"{_TAG} Response received ({elapsed:.3f}s)")

        dim = len(result)
        preview = result[:5]
        preview_str = ", ".join(f"{v:.6f}" for v in preview)

        print("  Status:    OK")
        print(f"  Latency:   {elapsed:.3f}s")
        print(f"  Dimension: {dim}")
        print(f"  Preview:   [{preview_str}, ...]")
        print(f"  Vec norm:  {sum(v**2 for v in result) ** 0.5:.6f}")
        print(_SEP)
        print("  Result: SUCCESS")
        print(_SEP)
        print()

    except Exception as exc:
        elapsed = time.perf_counter() - start
        print(f"{_TAG} API call failed after {elapsed:.3f}s")
        print(f"  Status:    FAILED")
        print(f"  Error:     {type(exc).__name__}: {exc}")

        # Connection-specific diagnostics
        exc_str = str(exc).lower()
        if "connect" in exc_str or "timeout" in exc_str:
            print(f"\n  Connection debug:")
            print(f"    target:  {base_url}")
            print(f"    proxy:   {os.environ.get('OPENAI_EMBEDDINGS_PROXY_URL', '(none)')}")
            print(f"    timeout: {os.environ.get('OPENAI_EMBEDDINGS_TIMEOUT', '120 (default)')}s")
        if "ssl" in exc_str or "certificate" in exc_str:
            print(f"\n  SSL debug:")
            print(f"    OpenSSL:   {ssl.OPENSSL_VERSION}")
            print(f"    ca_bundle: {os.environ.get('OPENAI_EMBEDDINGS_CA_BUNDLE', '(not set)')}")
            print(f"    cert_file: {ssl.get_default_verify_paths().cafile}")
            print(f"    cert_path: {ssl.get_default_verify_paths().capath}")
        if "401" in str(exc) or "auth" in exc_str or "key" in exc_str:
            api_key = os.environ.get("OPENAI_EMBEDDINGS_API_KEY") or os.environ.get("OPENAI_API_KEY", "")
            print(f"\n  Auth debug:")
            key_display = api_key[:4] + "..." + api_key[-4:] if len(api_key) > 8 else "(empty or short)"
            print(f"    api_key source: {'OPENAI_EMBEDDINGS_API_KEY' if os.environ.get('OPENAI_EMBEDDINGS_API_KEY') else 'OPENAI_API_KEY (fallback)'}")
            print(f"    api_key value:  {key_display}")

        print(f"\n  Full traceback:")
        traceback.print_exc()
        print(_SEP)
        print("  Result: FAILED")
        print(_SEP)
        print()
        sys.exit(1)


def main():
    print(f"{_TAG} CLI started")
    asyncio.run(_test_embedding())
    print(f"{_TAG} CLI finished")


if __name__ == "__main__":
    main()
