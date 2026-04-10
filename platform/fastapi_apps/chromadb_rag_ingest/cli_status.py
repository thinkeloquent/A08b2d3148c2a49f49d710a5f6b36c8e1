"""CLI entry point for RAG ingest status reporting.

Usage:
    python -m chromadb_rag_ingest.cli_status
    python -m chromadb_rag_ingest.cli_status --json
    python -m chromadb_rag_ingest.cli_status --slug ant-design
    # or via Makefile:
    make -f Makefile.chromadb-rag status
    make -f Makefile.chromadb-rag status-json
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Ensure fastapi_apps/ and polyglot config are on sys.path
_root = Path(__file__).parent.parent.parent
_fastapi_apps = _root / "fastapi_apps"
_polyglot_rag_config = _root / "polyglot" / "rag_ui_component_ingest_config" / "py"
for p in [str(_fastapi_apps), str(_polyglot_rag_config)]:
    if p not in sys.path:
        sys.path.insert(0, p)

# NLTK data lives in project-local ./data/nltk_data (used by unstructured)
import nltk
nltk.data.path.insert(0, str(_root / "data" / "nltk_data"))

_TAG = "[rag-status]"


def _get_chroma_info(persist_dir: str) -> dict:
    """Check if a ChromaDB vectorstore exists with actual embeddings."""
    db_path = os.path.join(persist_dir, "chroma.sqlite3")
    if os.path.exists(db_path):
        size_bytes = os.path.getsize(db_path)
        chunk_count = _get_chunk_count(db_path)
        return {
            "ingested": chunk_count > 0,
            "chunk_count": chunk_count,
            "db_path": db_path,
            "size_bytes": size_bytes,
            "size_human": _human_size(size_bytes),
        }
    return {"ingested": False, "chunk_count": 0, "db_path": db_path, "size_bytes": 0, "size_human": "\u2014"}


def _get_chunk_count(db_path: str) -> int:
    """Query the ChromaDB sqlite file for the actual embedding count."""
    import sqlite3
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM embeddings")
        count = cursor.fetchone()[0]
        conn.close()
        return count
    except Exception:
        return 0


def _human_size(size_bytes: int) -> str:
    """Format bytes as human-readable string."""
    if size_bytes == 0:
        return "0 B"
    units = ["B", "KB", "MB", "GB"]
    i = 0
    size = float(size_bytes)
    while size >= 1024.0 and i < len(units) - 1:
        size /= 1024.0
        i += 1
    return f"{size:.1f} {units[i]}"


def gather_status(yaml_path: str, project_root: str, slug_filter: str = None, verbose: bool = True) -> list:
    """Gather status for all (or one) configured frameworks."""
    import yaml
    from rag_ui_component_ingest_config import RagUIComponentIngestConfig

    if verbose:
        print(f"{_TAG} Loading YAML config from {yaml_path}", file=sys.stderr)

    with open(yaml_path, "r", encoding="utf-8") as fh:
        raw = yaml.safe_load(fh) or {}

    section = raw.get("component_ingest", {})
    defaults = section.get("defaults", {})
    frameworks_raw = section.get("framework", {})
    default_auto_ingest = defaults.get("auto_ingest", False)

    if verbose:
        print(f"{_TAG} YAML loaded — {len(frameworks_raw)} framework(s) defined", file=sys.stderr)
        print(f"{_TAG} Parsing multi-library config (enabled_only=False)...", file=sys.stderr)

    multi = RagUIComponentIngestConfig.from_yaml(
        yaml_path, enabled_only=False, project_root=project_root,
    )

    if verbose:
        print(f"{_TAG} Found {len(multi.libraries)} total library config(s)", file=sys.stderr)
        if slug_filter:
            print(f"{_TAG} Filtering to slug={slug_filter}", file=sys.stderr)

    results = []
    for lib in multi.libraries:
        if slug_filter and lib.slug != slug_filter:
            continue

        resolved = lib.resolve(multi.base)
        fw_data = frameworks_raw.get(lib.slug, {})
        auto_ingest = fw_data.get("auto_ingest", default_auto_ingest)

        if verbose:
            print(f"{_TAG}:{lib.slug} Checking ChromaDB at {resolved.persist_directory}", file=sys.stderr)

        chroma = _get_chroma_info(resolved.persist_directory)

        if verbose:
            if chroma["ingested"]:
                status = f"ingested ({chroma['chunk_count']} chunks, {chroma['size_human']})"
            elif chroma["chunk_count"] == 0 and os.path.exists(chroma["db_path"]):
                status = "db exists but empty (0 chunks)"
            else:
                status = "not ingested"
            print(f"{_TAG}:{lib.slug} {status}", file=sys.stderr)

        results.append({
            "slug": lib.slug,
            "name": lib.name,
            "enabled": lib.enabled,
            "auto_ingest": auto_ingest,
            "ingested": chroma["ingested"],
            "chunk_count": chroma["chunk_count"],
            "size_bytes": chroma["size_bytes"],
            "size_human": chroma["size_human"],
            "persist_directory": resolved.persist_directory,
            "source_directory": resolved.source_directory,
            "version": lib.version,
        })

    if verbose:
        ingested = sum(1 for r in results if r["ingested"])
        print(f"{_TAG} Status gathered — {len(results)} framework(s), {ingested} ingested", file=sys.stderr)

    return results


def print_table(rows: list) -> None:
    """Print a human-readable status table."""
    if not rows:
        print("No frameworks found.")
        return

    # Column headers and widths
    headers = ["Slug", "Name", "Enabled", "Auto", "Ingested", "Chunks", "Size"]
    col_data = [
        [r["slug"] for r in rows],
        [r["name"] for r in rows],
        ["yes" if r["enabled"] else "no" for r in rows],
        ["yes" if r["auto_ingest"] else "no" for r in rows],
        ["yes" if r["ingested"] else "no" for r in rows],
        [str(r["chunk_count"]) if r["chunk_count"] > 0 else "\u2014" for r in rows],
        [r["size_human"] for r in rows],
    ]

    widths = [
        max(len(h), max(len(v) for v in col))
        for h, col in zip(headers, col_data)
    ]

    header_line = "  ".join(h.ljust(w) for h, w in zip(headers, widths))
    sep_line = "  ".join("-" * w for w in widths)

    print(f"\n  {header_line}")
    print(f"  {sep_line}")
    for i, r in enumerate(rows):
        vals = [col[i] for col in col_data]
        print(f"  {'  '.join(v.ljust(w) for v, w in zip(vals, widths))}")

    ingested_count = sum(1 for r in rows if r["ingested"])
    total_size = sum(r["size_bytes"] for r in rows)
    print(f"\n  {ingested_count}/{len(rows)} ingested, total size: {_human_size(total_size)}\n")


def main():
    parser = argparse.ArgumentParser(description="RAG ingest status reporter")
    parser.add_argument("--json", action="store_true", help="Output JSON instead of table")
    parser.add_argument("--slug", type=str, default=None, help="Filter to a single framework")
    args = parser.parse_args()

    yaml_path = str(_root / "common" / "config" / "llm_rag.yml")
    project_root = str(_root)

    # verbose output goes to stderr so --json stdout stays clean
    is_json = args.json
    print(f"{_TAG} CLI started — format={'json' if is_json else 'table'}"
          + (f", slug={args.slug}" if args.slug else ""), file=sys.stderr)

    rows = gather_status(yaml_path, project_root, slug_filter=args.slug, verbose=True)

    if is_json:
        print(json.dumps(rows, indent=2))
    else:
        print_table(rows)

    print(f"{_TAG} CLI finished", file=sys.stderr)


if __name__ == "__main__":
    main()
