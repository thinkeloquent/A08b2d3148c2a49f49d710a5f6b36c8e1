"""Content hashing for deduplication."""

import hashlib


def content_hash(text: str) -> str:
    """Return MD5 hex digest of text content."""
    return hashlib.md5(text.encode()).hexdigest()
