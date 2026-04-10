"""Core business logic for file comparison diff snapshots."""

import difflib
import hashlib
import json
import sys
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from .models import FileDiffEntry, Snapshot

SNAPSHOT_VERSION = 1


def scan_files(dir_a, glob_pattern=None):
    """Scan dir_a with optional glob filter, return sorted relative paths."""
    dir_a = Path(dir_a)
    if glob_pattern:
        paths = dir_a.rglob(glob_pattern)
    else:
        paths = dir_a.rglob("*")
    return sorted(
        p.relative_to(dir_a)
        for p in paths
        if p.is_file()
    )


def compute_diff(file_a, file_b):
    """Compute unified diff between two files. Missing file_b diffs against empty."""
    file_a = Path(file_a)
    file_b = Path(file_b) if file_b is not None else None

    try:
        lines_a = file_a.read_text(encoding="utf-8").splitlines(keepends=True)
    except UnicodeDecodeError:
        return None  # binary file

    if file_b is not None and file_b.exists():
        try:
            lines_b = file_b.read_text(encoding="utf-8").splitlines(keepends=True)
        except UnicodeDecodeError:
            return None  # binary file
    else:
        lines_b = []

    diff = difflib.unified_diff(
        lines_b,
        lines_a,
        fromfile=str(file_b) if file_b else "/dev/null",
        tofile=str(file_a),
    )
    return "".join(diff)


def hash_diff(diff_text):
    """SHA-256 hex digest of diff text."""
    return hashlib.sha256(diff_text.encode("utf-8")).hexdigest()


def compute_snapshot_hash(file_hashes):
    """Compute aggregate hash: sort by path, concat 'path:hash', SHA-256."""
    parts = sorted(file_hashes.items())
    combined = "\n".join(f"{path}:{entry.hash}" for path, entry in parts)
    return hashlib.sha256(combined.encode("utf-8")).hexdigest()


def build_snapshot(dir_a, dir_b, glob_pattern=None):
    """Orchestrate scan -> diff -> hash -> return Snapshot."""
    dir_a = Path(dir_a).resolve()
    dir_b = Path(dir_b).resolve()

    rel_paths = scan_files(dir_a, glob_pattern)
    files = {}
    skipped = []

    for rel in rel_paths:
        file_a = dir_a / rel
        file_b = dir_b / rel

        diff_text = compute_diff(file_a, file_b if file_b.exists() else None)
        if diff_text is None:
            skipped.append(str(rel))
            continue

        files[str(rel)] = FileDiffEntry(hash=hash_diff(diff_text))

    snapshot_hash = compute_snapshot_hash(files)

    return Snapshot(
        version=SNAPSHOT_VERSION,
        dir_a=str(dir_a),
        dir_b=str(dir_b),
        glob=glob_pattern or "",
        created_at=datetime.now(timezone.utc).isoformat(),
        files=files,
        snapshot_hash=snapshot_hash,
    ), skipped


def get_cache_key(dir_a, dir_b, glob_pattern=None):
    """SHA-256 of absolute paths + glob, first 16 hex chars."""
    dir_a = str(Path(dir_a).resolve())
    dir_b = str(Path(dir_b).resolve())
    key_input = f"{dir_a}\n{dir_b}\n{glob_pattern or ''}"
    return hashlib.sha256(key_input.encode("utf-8")).hexdigest()[:16]


def save_snapshot(snapshot, cache_path):
    """Write snapshot as JSON."""
    cache_path = Path(cache_path)
    cache_path.parent.mkdir(parents=True, exist_ok=True)

    data = asdict(snapshot)
    cache_path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def load_snapshot(cache_path):
    """Read JSON, reconstruct Snapshot, validate version."""
    cache_path = Path(cache_path)
    if not cache_path.exists():
        return None

    try:
        data = json.loads(cache_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        raise RuntimeError(
            f"Corrupt snapshot at {cache_path}: {exc}\n"
            "Run with --clean to remove it."
        )

    if data.get("version") != SNAPSHOT_VERSION:
        raise RuntimeError(
            f"Snapshot version mismatch (got {data.get('version')}, expected {SNAPSHOT_VERSION}).\n"
            "Run with --clean to remove stale snapshot."
        )

    files = {
        path: FileDiffEntry(hash=entry["hash"])
        for path, entry in data["files"].items()
    }

    return Snapshot(
        version=data["version"],
        dir_a=data["dir_a"],
        dir_b=data["dir_b"],
        glob=data["glob"],
        created_at=data["created_at"],
        files=files,
        snapshot_hash=data["snapshot_hash"],
    )


def verify_snapshot(cached, current):
    """Compare hashes. Return (matches: bool, changes: list[str])."""
    changes = []
    cached_paths = set(cached.files.keys())
    current_paths = set(current.files.keys())

    for path in sorted(current_paths - cached_paths):
        changes.append(f"ADDED   {path}")

    for path in sorted(cached_paths - current_paths):
        changes.append(f"REMOVED {path}")

    for path in sorted(cached_paths & current_paths):
        if cached.files[path].hash != current.files[path].hash:
            changes.append(f"CHANGED {path}")

    matches = len(changes) == 0
    return matches, changes


def clean_snapshot(cache_dir, dir_a, dir_b, glob_pattern=None):
    """Delete cached snapshot file if it exists."""
    cache_dir = Path(cache_dir)
    key = get_cache_key(dir_a, dir_b, glob_pattern)
    cache_path = cache_dir / f"{key}.json"

    if cache_path.exists():
        cache_path.unlink()
        return True
    return False


def run(dir_a, dir_b, glob_pattern=None, cache_dir=None, verbose=False):
    """Main orchestrator. Returns exit code (0=success, 1=mismatch, 2=error)."""
    dir_a = Path(dir_a)
    dir_b = Path(dir_b)

    if not dir_a.is_dir():
        print(f"Error: dir_a does not exist: {dir_a}", file=sys.stderr)
        return 2
    if not dir_b.is_dir():
        print(f"Error: dir_b does not exist: {dir_b}", file=sys.stderr)
        return 2

    if cache_dir is None:
        cache_dir = Path.cwd() / ".cache" / "file_compare_diff_snapshot"
    cache_dir = Path(cache_dir)

    key = get_cache_key(dir_a, dir_b, glob_pattern)
    cache_path = cache_dir / f"{key}.json"

    # Build current snapshot
    try:
        current, skipped = build_snapshot(dir_a, dir_b, glob_pattern)
    except Exception as exc:
        print(f"Error building snapshot: {exc}", file=sys.stderr)
        return 2

    if skipped and verbose:
        for s in skipped:
            print(f"  [skip] binary file: {s}")

    file_count = len(current.files)
    if file_count == 0:
        print("Warning: no files matched — empty snapshot created.")

    # Load cached snapshot
    try:
        cached = load_snapshot(cache_path)
    except RuntimeError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2

    if cached is None:
        # First run — save and exit
        save_snapshot(current, cache_path)
        print(f"Snapshot created ({file_count} files)")
        if verbose:
            for path in sorted(current.files.keys()):
                print(f"  {path}")
        print(f"Cache: {cache_path}")
        return 0

    # Verify against cached
    matches, changes = verify_snapshot(cached, current)

    if matches:
        print(f"Verified: snapshot matches ({file_count} files)")
        return 0

    # Mismatch
    print(f"Snapshot MISMATCH ({len(changes)} change(s)):")
    for change in changes:
        print(f"  {change}")
    print()
    print("Run with --clean then re-run to create a fresh snapshot.")
    return 1
