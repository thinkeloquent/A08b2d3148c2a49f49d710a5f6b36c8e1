"""Tests for file_compare_diff_snapshot core logic."""

import json
import os
import tempfile
from pathlib import Path

from file_compare_diff_snapshot.core import (
    build_snapshot,
    clean_snapshot,
    compute_diff,
    compute_snapshot_hash,
    get_cache_key,
    hash_diff,
    load_snapshot,
    run,
    save_snapshot,
    scan_files,
    verify_snapshot,
)
from file_compare_diff_snapshot.models import FileDiffEntry, Snapshot


def _make_dirs(tmp, files_a=None, files_b=None):
    """Helper: create dir_a and dir_b with given file contents."""
    dir_a = Path(tmp) / "dir_a"
    dir_b = Path(tmp) / "dir_b"
    dir_a.mkdir()
    dir_b.mkdir()

    for name, content in (files_a or {}).items():
        p = dir_a / name
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")

    for name, content in (files_b or {}).items():
        p = dir_b / name
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")

    return dir_a, dir_b


class TestScanFiles:
    def test_scans_all_files(self, tmp_path):
        dir_a, _ = _make_dirs(tmp_path, {"a.py": "x", "sub/b.py": "y"})
        result = scan_files(dir_a)
        assert [str(p) for p in result] == ["a.py", "sub/b.py"]

    def test_glob_filter(self, tmp_path):
        dir_a, _ = _make_dirs(tmp_path, {"a.py": "x", "b.txt": "y", "sub/c.py": "z"})
        result = scan_files(dir_a, "**/*.py")
        names = [str(p) for p in result]
        assert "a.py" in names
        assert "sub/c.py" in names
        assert "b.txt" not in names

    def test_empty_dir(self, tmp_path):
        dir_a, _ = _make_dirs(tmp_path)
        result = scan_files(dir_a)
        assert result == []


class TestComputeDiff:
    def test_identical_files(self, tmp_path):
        dir_a, dir_b = _make_dirs(tmp_path, {"f.txt": "hello\n"}, {"f.txt": "hello\n"})
        diff = compute_diff(dir_a / "f.txt", dir_b / "f.txt")
        assert diff == ""

    def test_different_files(self, tmp_path):
        dir_a, dir_b = _make_dirs(tmp_path, {"f.txt": "hello\n"}, {"f.txt": "world\n"})
        diff = compute_diff(dir_a / "f.txt", dir_b / "f.txt")
        assert "+hello" in diff
        assert "-world" in diff

    def test_missing_file_b(self, tmp_path):
        dir_a, dir_b = _make_dirs(tmp_path, {"f.txt": "hello\n"})
        diff = compute_diff(dir_a / "f.txt", None)
        assert "+hello" in diff

    def test_binary_file_returns_none(self, tmp_path):
        dir_a = tmp_path / "dir_a"
        dir_a.mkdir()
        binary = dir_a / "img.bin"
        binary.write_bytes(b"\x00\x01\x02\xff\xfe")
        result = compute_diff(binary, None)
        assert result is None


class TestHashDiff:
    def test_deterministic(self):
        h1 = hash_diff("some diff text")
        h2 = hash_diff("some diff text")
        assert h1 == h2
        assert len(h1) == 64

    def test_different_input(self):
        assert hash_diff("a") != hash_diff("b")


class TestComputeSnapshotHash:
    def test_deterministic(self):
        files = {"a.py": FileDiffEntry(hash="aaa"), "b.py": FileDiffEntry(hash="bbb")}
        h1 = compute_snapshot_hash(files)
        h2 = compute_snapshot_hash(files)
        assert h1 == h2

    def test_order_independent(self):
        files1 = {"b.py": FileDiffEntry(hash="bbb"), "a.py": FileDiffEntry(hash="aaa")}
        files2 = {"a.py": FileDiffEntry(hash="aaa"), "b.py": FileDiffEntry(hash="bbb")}
        assert compute_snapshot_hash(files1) == compute_snapshot_hash(files2)


class TestBuildSnapshot:
    def test_builds_with_matching_files(self, tmp_path):
        dir_a, dir_b = _make_dirs(
            tmp_path,
            {"x.py": "line1\n", "y.py": "line2\n"},
            {"x.py": "line1\n", "y.py": "different\n"},
        )
        snap, skipped = build_snapshot(dir_a, dir_b, "**/*.py")
        assert len(snap.files) == 2
        assert skipped == []
        assert snap.snapshot_hash

    def test_file_only_in_a(self, tmp_path):
        dir_a, dir_b = _make_dirs(tmp_path, {"only_a.py": "content\n"})
        snap, _ = build_snapshot(dir_a, dir_b)
        assert "only_a.py" in snap.files

    def test_skips_binary(self, tmp_path):
        dir_a = tmp_path / "dir_a"
        dir_b = tmp_path / "dir_b"
        dir_a.mkdir()
        dir_b.mkdir()
        (dir_a / "ok.py").write_text("hello\n")
        (dir_a / "bin.dat").write_bytes(b"\x00\xff\xfe")
        snap, skipped = build_snapshot(dir_a, dir_b)
        assert "ok.py" in snap.files
        assert "bin.dat" not in snap.files
        assert "bin.dat" in skipped


class TestGetCacheKey:
    def test_deterministic(self, tmp_path):
        k1 = get_cache_key(tmp_path / "a", tmp_path / "b", "*.py")
        k2 = get_cache_key(tmp_path / "a", tmp_path / "b", "*.py")
        assert k1 == k2
        assert len(k1) == 16

    def test_different_dirs(self, tmp_path):
        k1 = get_cache_key(tmp_path / "a", tmp_path / "b")
        k2 = get_cache_key(tmp_path / "a", tmp_path / "c")
        assert k1 != k2


class TestSaveLoadSnapshot:
    def test_round_trip(self, tmp_path):
        dir_a, dir_b = _make_dirs(tmp_path, {"f.py": "x\n"}, {"f.py": "y\n"})
        snap, _ = build_snapshot(dir_a, dir_b)
        cache_path = tmp_path / "cache" / "test.json"
        save_snapshot(snap, cache_path)
        loaded = load_snapshot(cache_path)
        assert loaded.snapshot_hash == snap.snapshot_hash
        assert loaded.files.keys() == snap.files.keys()
        for path in snap.files:
            assert loaded.files[path].hash == snap.files[path].hash

    def test_load_missing_returns_none(self, tmp_path):
        assert load_snapshot(tmp_path / "nonexistent.json") is None

    def test_load_corrupt_raises(self, tmp_path):
        bad_file = tmp_path / "bad.json"
        bad_file.write_text("not json!!!")
        try:
            load_snapshot(bad_file)
            assert False, "Should have raised"
        except RuntimeError as exc:
            assert "--clean" in str(exc)

    def test_load_wrong_version_raises(self, tmp_path):
        bad_file = tmp_path / "old.json"
        bad_file.write_text(json.dumps({"version": 999, "files": {}}))
        try:
            load_snapshot(bad_file)
            assert False, "Should have raised"
        except RuntimeError as exc:
            assert "version mismatch" in str(exc).lower()


class TestVerifySnapshot:
    def test_matching(self, tmp_path):
        dir_a, dir_b = _make_dirs(tmp_path, {"f.py": "x\n"}, {"f.py": "y\n"})
        snap1, _ = build_snapshot(dir_a, dir_b)
        snap2, _ = build_snapshot(dir_a, dir_b)
        matches, changes = verify_snapshot(snap1, snap2)
        assert matches is True
        assert changes == []

    def test_added_file(self, tmp_path):
        dir_a, dir_b = _make_dirs(tmp_path, {"f.py": "x\n"}, {"f.py": "x\n"})
        snap1, _ = build_snapshot(dir_a, dir_b)
        # Add a new file
        (dir_a / "g.py").write_text("new\n")
        snap2, _ = build_snapshot(dir_a, dir_b)
        matches, changes = verify_snapshot(snap1, snap2)
        assert matches is False
        assert any("ADDED" in c and "g.py" in c for c in changes)

    def test_removed_file(self, tmp_path):
        dir_a, dir_b = _make_dirs(
            tmp_path, {"f.py": "x\n", "g.py": "y\n"}, {"f.py": "x\n"}
        )
        snap1, _ = build_snapshot(dir_a, dir_b)
        # Remove a file
        (dir_a / "g.py").unlink()
        snap2, _ = build_snapshot(dir_a, dir_b)
        matches, changes = verify_snapshot(snap1, snap2)
        assert matches is False
        assert any("REMOVED" in c and "g.py" in c for c in changes)

    def test_changed_file(self, tmp_path):
        dir_a, dir_b = _make_dirs(tmp_path, {"f.py": "x\n"}, {"f.py": "y\n"})
        snap1, _ = build_snapshot(dir_a, dir_b)
        # Modify the file
        (dir_a / "f.py").write_text("z\n")
        snap2, _ = build_snapshot(dir_a, dir_b)
        matches, changes = verify_snapshot(snap1, snap2)
        assert matches is False
        assert any("CHANGED" in c and "f.py" in c for c in changes)


class TestCleanSnapshot:
    def test_removes_existing(self, tmp_path):
        cache_dir = tmp_path / "cache"
        dir_a, dir_b = _make_dirs(tmp_path, {"f.py": "x\n"})
        snap, _ = build_snapshot(dir_a, dir_b)
        key = get_cache_key(dir_a, dir_b)
        cache_path = cache_dir / f"{key}.json"
        save_snapshot(snap, cache_path)
        assert cache_path.exists()
        result = clean_snapshot(cache_dir, dir_a, dir_b)
        assert result is True
        assert not cache_path.exists()

    def test_returns_false_if_missing(self, tmp_path):
        result = clean_snapshot(tmp_path / "cache", tmp_path / "a", tmp_path / "b")
        assert result is False


class TestRun:
    def test_first_run_creates_snapshot(self, tmp_path):
        dir_a, dir_b = _make_dirs(tmp_path, {"f.py": "x\n"}, {"f.py": "y\n"})
        cache_dir = tmp_path / "cache"
        code = run(dir_a, dir_b, cache_dir=cache_dir)
        assert code == 0
        # Cache file should exist
        assert any(cache_dir.iterdir())

    def test_second_run_verifies(self, tmp_path):
        dir_a, dir_b = _make_dirs(tmp_path, {"f.py": "x\n"}, {"f.py": "y\n"})
        cache_dir = tmp_path / "cache"
        assert run(dir_a, dir_b, cache_dir=cache_dir) == 0
        assert run(dir_a, dir_b, cache_dir=cache_dir) == 0

    def test_mismatch_returns_1(self, tmp_path):
        dir_a, dir_b = _make_dirs(tmp_path, {"f.py": "x\n"}, {"f.py": "y\n"})
        cache_dir = tmp_path / "cache"
        assert run(dir_a, dir_b, cache_dir=cache_dir) == 0
        # Modify file
        (dir_a / "f.py").write_text("z\n")
        assert run(dir_a, dir_b, cache_dir=cache_dir) == 1

    def test_missing_dir_returns_2(self, tmp_path):
        code = run(tmp_path / "nope", tmp_path / "nada", cache_dir=tmp_path / "c")
        assert code == 2

    def test_no_files_warns(self, tmp_path):
        dir_a, dir_b = _make_dirs(tmp_path)
        cache_dir = tmp_path / "cache"
        code = run(dir_a, dir_b, glob_pattern="**/*.xyz", cache_dir=cache_dir)
        assert code == 0

    def test_verbose_output(self, tmp_path, capsys):
        dir_a, dir_b = _make_dirs(tmp_path, {"f.py": "x\n"}, {"f.py": "y\n"})
        cache_dir = tmp_path / "cache"
        run(dir_a, dir_b, cache_dir=cache_dir, verbose=True)
        captured = capsys.readouterr()
        assert "f.py" in captured.out
