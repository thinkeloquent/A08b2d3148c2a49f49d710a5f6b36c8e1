"""Per-extension document loaders with NLTK fallback.

Each loader returns a list of Documents with enriched metadata.
The LOADER_REGISTRY is sorted longest-suffix-first so that compound
extensions like `.stories.tsx` match before `.tsx`.
"""

import os
from typing import Callable, List

from langchain_community.document_loaders import (
    TextLoader,
    UnstructuredMarkdownLoader,
)
from langchain_core.documents import Document

_TAG = "[loaders]"

LoaderFn = Callable[[str, str], List[Document]]

# ---------------------------------------------------------------------------
# NLTK availability check
# ---------------------------------------------------------------------------

def _check_nltk_available() -> bool:
    """Return True if the NLTK averaged-perceptron tagger is usable."""
    try:
        import nltk
        nltk.data.find("taggers/averaged_perceptron_tagger_eng")
        return True
    except (LookupError, ImportError):
        return False


NLTK_OK: bool = _check_nltk_available()

if not NLTK_OK:
    print(
        f"{_TAG} NLTK tagger not available — "
        "UnstructuredMarkdownLoader will fall back to TextLoader"
    )

# ---------------------------------------------------------------------------
# Metadata enrichment
# ---------------------------------------------------------------------------

def _enrich_metadata(
    docs: List[Document], file_path: str, library_slug: str,
) -> List[Document]:
    """Add file_name, file_path, library, and component to each document."""
    for doc in docs:
        doc.metadata["file_name"] = os.path.basename(file_path)
        doc.metadata["file_path"] = file_path
        doc.metadata["library"] = library_slug
        parts = file_path.split(os.sep)
        if "components" in parts:
            idx = parts.index("components")
            if idx + 1 < len(parts):
                doc.metadata["component"] = parts[idx + 1]
    return docs

# ---------------------------------------------------------------------------
# Per-type loaders
# ---------------------------------------------------------------------------

def load_markdown(file_path: str, library_slug: str) -> List[Document]:
    """.md / .mdx — UnstructuredMarkdownLoader with TextLoader fallback."""
    if NLTK_OK:
        try:
            docs = UnstructuredMarkdownLoader(file_path).load()
            return _enrich_metadata(docs, file_path, library_slug)
        except Exception:
            pass  # fall through to TextLoader
    docs = TextLoader(file_path, encoding="utf8").load()
    return _enrich_metadata(docs, file_path, library_slug)


def load_text(file_path: str, library_slug: str) -> List[Document]:
    """.tsx, .jsx, .ts, .js, .json, .css, .less"""
    docs = TextLoader(file_path, encoding="utf8").load()
    return _enrich_metadata(docs, file_path, library_slug)


def load_stories_tsx(file_path: str, library_slug: str) -> List[Document]:
    """.stories.tsx"""
    docs = TextLoader(file_path, encoding="utf8").load()
    return _enrich_metadata(docs, file_path, library_slug)


def load_stories_jsx(file_path: str, library_slug: str) -> List[Document]:
    """.stories.jsx"""
    docs = TextLoader(file_path, encoding="utf8").load()
    return _enrich_metadata(docs, file_path, library_slug)

# ---------------------------------------------------------------------------
# Registry — longest suffix first so `.stories.tsx` matches before `.tsx`
# ---------------------------------------------------------------------------

LOADER_REGISTRY: list[tuple[str, LoaderFn]] = [
    (".stories.tsx", load_stories_tsx),
    (".stories.jsx", load_stories_jsx),
    (".mdx",         load_markdown),
    (".md",          load_markdown),
    (".tsx",         load_text),
    (".jsx",         load_text),
    (".ts",          load_text),
    (".js",          load_text),
    (".json",        load_text),
    (".css",         load_text),
    (".less",        load_text),
]

SUPPORTED_EXTENSIONS: list[str] = [ext for ext, _ in LOADER_REGISTRY]

# ---------------------------------------------------------------------------
# Lookup helpers
# ---------------------------------------------------------------------------

def matches_supported_extension(filename: str) -> bool:
    """Return True if *filename* matches any supported extension."""
    return any(filename.endswith(ext) for ext in SUPPORTED_EXTENSIONS)


def get_loader_for_file(file_path: str) -> LoaderFn | None:
    """Return the loader function for *file_path*, or None."""
    for ext, loader_fn in LOADER_REGISTRY:
        if file_path.endswith(ext):
            return loader_fn
    return None

# ---------------------------------------------------------------------------
# Main dispatch
# ---------------------------------------------------------------------------

def load_single_document(file_path: str, library_slug: str) -> List[Document]:
    """Load a single file, dispatching to the appropriate per-type loader."""
    if os.path.getsize(file_path) == 0:
        return []

    loader_fn = get_loader_for_file(file_path)
    if loader_fn is None:
        return []

    try:
        return loader_fn(file_path, library_slug)
    except Exception as e:
        print(f"{_TAG} ERROR loading {file_path}: {type(e).__name__}: {e}")
        return []
