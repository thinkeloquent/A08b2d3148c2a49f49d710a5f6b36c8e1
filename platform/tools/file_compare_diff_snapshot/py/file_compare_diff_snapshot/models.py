"""Data models for file comparison snapshots."""

from dataclasses import dataclass, field


@dataclass
class FileDiffEntry:
    """SHA-256 hash of a single file's unified diff."""
    hash: str


@dataclass
class Snapshot:
    """Full snapshot of diff hashes for a directory pair."""
    version: int
    dir_a: str
    dir_b: str
    glob: str
    created_at: str
    files: dict  # dict[str, FileDiffEntry]
    snapshot_hash: str
