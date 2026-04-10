"""File scanning and document-loading execution strategies.

Provides sequential (default) and multiprocessing-pool modes.
The pool mode falls back to sequential on error.
"""

import os
import time
import traceback
from functools import partial
from multiprocessing import Pool
from typing import List

from langchain_core.documents import Document

from .loaders import (
    load_single_document,
    matches_supported_extension,
    SUPPORTED_EXTENSIONS,
)

_TAG = "[executor]"

IGNORE_DIRS: frozenset[str] = frozenset({
    "node_modules", "dist", "build", ".git",
    "storybook-static", "__tests__", "coverage", "es", "lib",
})

# ---------------------------------------------------------------------------
# File scanning
# ---------------------------------------------------------------------------

def scan_source_directory(
    source_dir: str, ignored_files: List[str] | None = None,
) -> list[str]:
    """Walk *source_dir*, match supported extensions, return filtered paths."""
    ignored_set = set(ignored_files or [])
    all_files: list[str] = []

    print(f"{_TAG} Scanning source directory: {source_dir}")
    if not os.path.exists(source_dir):
        print(f"{_TAG} ERROR: source directory does not exist: {source_dir}")
        return []
    if not os.path.isdir(source_dir):
        print(f"{_TAG} ERROR: source path is not a directory: {source_dir}")
        return []

    scan_start = time.perf_counter()
    total_scanned = 0
    total_dirs = 0
    skipped_dirs = 0

    for root, dirs, files in os.walk(source_dir):
        before_filter = len(dirs)
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        skipped_dirs += before_filter - len(dirs)
        total_dirs += len(dirs)
        total_scanned += len(files)
        for file in files:
            if matches_supported_extension(file):
                all_files.append(os.path.join(root, file))

    scan_elapsed = time.perf_counter() - scan_start

    filtered_files = [f for f in all_files if f not in ignored_set]
    new_files = len(filtered_files)
    existing_files = len(all_files) - new_files

    print(f"{_TAG} Scan complete ({scan_elapsed:.2f}s)")
    print(f"{_TAG}   total files scanned:    {total_scanned}")
    print(f"{_TAG}   directories traversed:  {total_dirs}")
    print(f"{_TAG}   directories skipped:    {skipped_dirs}")
    print(f"{_TAG}   matched by extension:   {len(all_files)}")
    print(f"{_TAG}   already indexed:        {existing_files}")
    print(f"{_TAG}   new files to load:      {new_files}")

    if not filtered_files:
        print(f"{_TAG} No new files to load")
        return []

    # Extension breakdown
    ext_counts: dict[str, int] = {}
    for f in filtered_files:
        for ext in SUPPORTED_EXTENSIONS:
            if f.endswith(ext):
                ext_counts[ext] = ext_counts.get(ext, 0) + 1
                break
    print(f"{_TAG}   extension breakdown:")
    for ext, count in sorted(ext_counts.items(), key=lambda x: -x[1]):
        print(f"{_TAG}     {ext}: {count}")

    return filtered_files

# ---------------------------------------------------------------------------
# Sequential loading (default)
# ---------------------------------------------------------------------------

def load_files_sequential(
    file_paths: list[str], library_slug: str,
) -> list[Document]:
    """Load files one-by-one with per-file progress output."""
    results: list[Document] = []
    total = len(file_paths)
    loaded_docs = 0
    failed_files = 0

    print(f"{_TAG} Loading {total} files sequentially...")
    load_start = time.perf_counter()

    for idx, fpath in enumerate(file_paths, 1):
        pct = idx * 100 // total
        try:
            docs = load_single_document(fpath, library_slug)
            if docs:
                results.extend(docs)
                loaded_docs += len(docs)
                status = "OK"
            else:
                status = "SKIP"
        except Exception as e:
            print(f"{_TAG}   LOAD ERROR {fpath}: {type(e).__name__}: {e}")
            failed_files += 1
            status = "FAIL"
        print(f"{_TAG}   [{pct:3d}%] ({idx}/{total}) {status}  {os.path.basename(fpath)}")

    load_elapsed = time.perf_counter() - load_start
    _print_load_summary(results, loaded_docs, failed_files, load_elapsed)
    return results

# ---------------------------------------------------------------------------
# Pool loading
# ---------------------------------------------------------------------------

def _pool_worker(library_slug: str, file_path: str) -> List[Document]:
    """Top-level picklable worker for multiprocessing.Pool."""
    return load_single_document(file_path, library_slug)


def load_files_pool(
    file_paths: list[str],
    library_slug: str,
    pool_size: int | None = None,
) -> list[Document]:
    """Load files using a multiprocessing pool.

    Falls back to sequential loading on any pool error.
    """
    cpu_count = pool_size or os.cpu_count() or 1
    print(f"{_TAG} Loading {len(file_paths)} files using {cpu_count} worker processes...")

    load_start = time.perf_counter()
    loaded_docs = 0
    failed_files = 0

    worker = partial(_pool_worker, library_slug)

    try:
        results: list[Document] = []
        with Pool(processes=cpu_count) as pool:
            for docs in pool.imap_unordered(worker, file_paths):
                if docs:
                    results.extend(docs)
                    loaded_docs += len(docs)
                else:
                    failed_files += 1
    except Exception as e:
        print(f"{_TAG} MULTIPROCESSING ERROR: {type(e).__name__}: {e}")
        traceback.print_exc()
        print(f"{_TAG} Falling back to sequential loading...")
        return load_files_sequential(file_paths, library_slug)

    load_elapsed = time.perf_counter() - load_start
    _print_load_summary(results, loaded_docs, failed_files, load_elapsed)
    return results

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _print_load_summary(
    results: list[Document], loaded_docs: int, failed_files: int, elapsed: float,
) -> None:
    total_chars = sum(len(doc.page_content) for doc in results)
    print(f"{_TAG} Loading complete ({elapsed:.2f}s)")
    print(f"{_TAG}   documents loaded:  {loaded_docs}")
    print(f"{_TAG}   files with errors: {failed_files}")
    print(f"{_TAG}   total characters:  {total_chars:,}")
    if loaded_docs > 0:
        avg_chars = total_chars // loaded_docs
        print(f"{_TAG}   avg chars/doc:     {avg_chars:,}")

# ---------------------------------------------------------------------------
# Unified entry point
# ---------------------------------------------------------------------------

def load_documents(
    source_dir: str,
    library_slug: str,
    ignored_files: List[str] | None = None,
    use_pool: bool = False,
    pool_size: int | None = None,
) -> List[Document]:
    """Scan *source_dir* and load all matching files.

    Parameters
    ----------
    use_pool : bool
        If True, use multiprocessing pool (falls back to sequential on error).
        Default is False (sequential).
    pool_size : int | None
        Number of worker processes when *use_pool* is True.
    """
    file_paths = scan_source_directory(source_dir, ignored_files)
    if not file_paths:
        return []

    if use_pool:
        return load_files_pool(file_paths, library_slug, pool_size)
    return load_files_sequential(file_paths, library_slug)
