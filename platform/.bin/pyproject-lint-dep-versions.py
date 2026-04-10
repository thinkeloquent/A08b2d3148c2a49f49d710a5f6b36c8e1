#!/usr/bin/env python3
"""
Lint sub-package dependency versions against the root pyproject.toml.

Scans pyproject.toml files in:
  - fastapi_apps/
  - fastapi_apps/chromadb_rag_ingest/
  - packages_py/
  - polyglot/*/py/

Checks:
  1. Every pip-registry dependency in a sub-package exists in root [tool.poetry.dependencies]
  2. Where both root and sub-package pin a version, the versions match
  3. Both root pyproject.toml files declare the same pip-registry packages

Usage:
    python .bin/pyproject-lint-dep-versions.py
    python .bin/pyproject-lint-dep-versions.py --fix   # future: auto-fix mismatches

Exit codes:
    0 - No violations
    1 - Violations found
"""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

# Try tomllib (Python 3.11+) or fall back to tomli
try:
    import tomllib
except ImportError:
    try:
        import tomli as tomllib  # type: ignore[no-redef]
    except ImportError:
        print("Error: tomllib (Python 3.11+) or tomli package required.")
        sys.exit(1)


def normalize_name(name: str) -> str:
    """Normalize a Python package name per PEP 503 (lowercase, collapse [-_.]+)."""
    return re.sub(r"[-_.]+", "-", name).lower()


@dataclass
class DepSpec:
    """A parsed dependency: name + version constraint (if any)."""
    raw_name: str
    version: str  # e.g. "==0.128.0", ">=1.0.0", "" if unpinned
    extras: list[str] = field(default_factory=list)

    @property
    def normalized(self) -> str:
        return normalize_name(self.raw_name)


@dataclass
class Violation:
    sub_path: str          # relative path to sub-package pyproject.toml
    dep_name: str          # normalized dependency name
    kind: str              # "missing" or "mismatch"
    sub_version: str       # version in sub-package
    root_version: str      # version in root (or "—" if missing)


def get_project_root() -> Path:
    return Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------------------
# Parse root [tool.poetry.dependencies]
# ---------------------------------------------------------------------------

def parse_root_deps(root: Path) -> dict[str, DepSpec]:
    """Parse pip-registry deps from root pyproject.toml [tool.poetry.dependencies]."""
    pyproject = root / "pyproject.toml"
    with open(pyproject, "rb") as f:
        data = tomllib.load(f)

    poetry_deps = data.get("tool", {}).get("poetry", {}).get("dependencies", {})
    result: dict[str, DepSpec] = {}

    for name, spec in poetry_deps.items():
        if name.lower() == "python":
            continue
        # Skip local/path dependencies
        if isinstance(spec, dict) and "path" in spec:
            continue
        # Extract version string
        if isinstance(spec, str):
            version = spec
            extras: list[str] = []
        elif isinstance(spec, dict):
            version = spec.get("version", "")
            extras = spec.get("extras", [])
        else:
            continue

        dep = DepSpec(raw_name=name, version=version, extras=extras)
        result[dep.normalized] = dep

    return result


# ---------------------------------------------------------------------------
# Parse sub-package [project].dependencies (PEP 621)
# ---------------------------------------------------------------------------

_PEP508_RE = re.compile(
    r"^"
    r"(?P<name>[A-Za-z0-9]([A-Za-z0-9._-]*[A-Za-z0-9])?)"
    r"(\[(?P<extras>[^\]]+)\])?"
    r"(?P<version>[<>=!~].*)?$"
)


def parse_pep621_dep(dep_str: str) -> DepSpec | None:
    """Parse a PEP 508 / PEP 621 dependency string like 'httpx[http2]>=0.28.1'."""
    dep_str = dep_str.strip()
    if not dep_str or dep_str.startswith("#"):
        return None
    # Strip environment markers (e.g. ; python_version >= "3.11")
    dep_str = dep_str.split(";")[0].strip()
    m = _PEP508_RE.match(dep_str)
    if not m:
        return None
    name = m.group("name")
    extras_str = m.group("extras") or ""
    extras = [e.strip() for e in extras_str.split(",") if e.strip()]
    version = (m.group("version") or "").strip()
    return DepSpec(raw_name=name, version=version, extras=extras)


def parse_sub_deps(pyproject_path: Path) -> list[DepSpec]:
    """Parse pip-registry dependencies from a sub-package pyproject.toml."""
    with open(pyproject_path, "rb") as f:
        data = tomllib.load(f)

    deps: list[DepSpec] = []

    # PEP 621: [project].dependencies
    pep621_deps = data.get("project", {}).get("dependencies", [])
    for raw in pep621_deps:
        spec = parse_pep621_dep(raw)
        if spec:
            deps.append(spec)

    # Also check [tool.poetry.dependencies] (some sub-packages use this)
    poetry_deps = data.get("tool", {}).get("poetry", {}).get("dependencies", {})
    for name, spec_val in poetry_deps.items():
        if name.lower() == "python":
            continue
        if isinstance(spec_val, dict) and "path" in spec_val:
            continue
        if isinstance(spec_val, str):
            version = spec_val
            extras: list[str] = []
        elif isinstance(spec_val, dict):
            version = spec_val.get("version", "")
            extras = spec_val.get("extras", [])
        else:
            continue
        deps.append(DepSpec(raw_name=name, version=version, extras=extras))

    return deps


# ---------------------------------------------------------------------------
# Find sub-packages
# ---------------------------------------------------------------------------

def find_sub_pyprojects(root: Path) -> list[Path]:
    """Find all sub-package pyproject.toml files to lint."""
    results: list[Path] = []

    scan_dirs = [
        root / "packages_py",
        root / "fastapi_apps",
        root / "fastapi_apps" / "chromadb_rag_ingest",
    ]

    for scan_dir in scan_dirs:
        if not scan_dir.exists():
            continue
        for item in sorted(scan_dir.iterdir()):
            if not item.is_dir() or item.name.startswith((".", "_")):
                continue
            pp = item / "pyproject.toml"
            if pp.exists():
                results.append(pp)
        # Also check if the scan_dir itself has a pyproject.toml (chromadb_rag_ingest)
        pp = scan_dir / "pyproject.toml"
        if pp.exists() and pp not in results:
            results.append(pp)

    # polyglot/*/py/
    polyglot_dir = root / "polyglot"
    if polyglot_dir.exists():
        for item in sorted(polyglot_dir.iterdir()):
            if not item.is_dir() or item.name.startswith((".", "_")):
                continue
            pp = item / "py" / "pyproject.toml"
            if pp.exists():
                results.append(pp)

    return results


# ---------------------------------------------------------------------------
# Lint logic
# ---------------------------------------------------------------------------

def lint(root_deps: dict[str, DepSpec], sub_path: Path, root: Path) -> list[Violation]:
    """Check one sub-package against root deps. Returns list of violations."""
    violations: list[Violation] = []
    rel = str(sub_path.relative_to(root))
    sub_deps = parse_sub_deps(sub_path)

    # Collect all local package names from root so we can skip them in sub-packages
    root_pyproject = root / "pyproject.toml"
    with open(root_pyproject, "rb") as f:
        root_data = tomllib.load(f)
    local_pkg_names: set[str] = set()
    for name, spec in root_data.get("tool", {}).get("poetry", {}).get("dependencies", {}).items():
        if isinstance(spec, dict) and "path" in spec:
            local_pkg_names.add(normalize_name(name))

    for dep in sub_deps:
        norm = dep.normalized
        # Skip local workspace packages
        if norm in local_pkg_names:
            continue

        if norm not in root_deps:
            # Check 1: missing from root
            violations.append(Violation(
                sub_path=rel,
                dep_name=norm,
                kind="missing",
                sub_version=dep.version or "(unpinned)",
                root_version="—",
            ))
        elif dep.version:
            # Check 2: version mismatch
            root_ver = root_deps[norm].version
            if root_ver and dep.version != root_ver:
                violations.append(Violation(
                    sub_path=rel,
                    dep_name=norm,
                    kind="mismatch",
                    sub_version=dep.version,
                    root_version=root_ver,
                ))

    return violations


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def parse_fastapi_server_poetry_deps(root: Path) -> dict[str, DepSpec]:
    """Parse pip-registry deps from fastapi_server/pyproject.toml [tool.poetry.dependencies]."""
    pyproject = root / "fastapi_server" / "pyproject.toml"
    if not pyproject.exists():
        return {}
    with open(pyproject, "rb") as f:
        data = tomllib.load(f)

    poetry_deps = data.get("tool", {}).get("poetry", {}).get("dependencies", {})
    result: dict[str, DepSpec] = {}

    for name, spec in poetry_deps.items():
        if name.lower() == "python":
            continue
        if isinstance(spec, dict) and "path" in spec:
            continue
        if isinstance(spec, str):
            version = spec
            extras: list[str] = []
        elif isinstance(spec, dict):
            version = spec.get("version", "")
            extras = spec.get("extras", [])
        else:
            continue
        dep = DepSpec(raw_name=name, version=version, extras=extras)
        result[dep.normalized] = dep

    return result


def cross_check_roots(root_deps: dict[str, DepSpec], fs_deps: dict[str, DepSpec]) -> list[Violation]:
    """Check that both root pyproject.toml files declare the same pip-registry deps."""
    violations: list[Violation] = []
    all_names = sorted(set(root_deps.keys()) | set(fs_deps.keys()))

    for name in all_names:
        in_root = name in root_deps
        in_fs = name in fs_deps
        if in_root and not in_fs:
            violations.append(Violation(
                sub_path="fastapi_server/pyproject.toml",
                dep_name=name,
                kind="missing-from-fastapi-server",
                sub_version="—",
                root_version=root_deps[name].version,
            ))
        elif in_fs and not in_root:
            violations.append(Violation(
                sub_path="pyproject.toml (root)",
                dep_name=name,
                kind="missing-from-root",
                sub_version=fs_deps[name].version,
                root_version="—",
            ))
        elif in_root and in_fs:
            rv = root_deps[name].version
            fv = fs_deps[name].version
            if rv and fv and rv != fv:
                violations.append(Violation(
                    sub_path="fastapi_server/pyproject.toml vs pyproject.toml",
                    dep_name=name,
                    kind="root-mismatch",
                    sub_version=fv,
                    root_version=rv,
                ))
    return violations


def main() -> None:
    root = get_project_root()

    root_deps = parse_root_deps(root)
    fs_deps = parse_fastapi_server_poetry_deps(root)
    print(f"Root: {len(root_deps)} pip-registry deps in pyproject.toml")
    print(f"FastAPI server: {len(fs_deps)} pip-registry deps in fastapi_server/pyproject.toml")

    sub_pyprojects = find_sub_pyprojects(root)
    print(f"Scanning: {len(sub_pyprojects)} sub-package pyproject.toml files\n")

    all_violations: list[Violation] = []

    # Check 3: cross-check between the two root files
    all_violations.extend(cross_check_roots(root_deps, fs_deps))

    for pp in sub_pyprojects:
        violations = lint(root_deps, pp, root)
        all_violations.extend(violations)

    if not all_violations:
        print("OK — no violations found.")
        sys.exit(0)

    # Group violations by kind
    root_sync = [v for v in all_violations if v.kind in ("missing-from-fastapi-server", "missing-from-root", "root-mismatch")]
    missing = [v for v in all_violations if v.kind == "missing"]
    mismatches = [v for v in all_violations if v.kind == "mismatch"]

    if root_sync:
        print(f"ROOT SYNC ({len(root_sync)}):")
        print("  The two root pyproject.toml files are out of sync.\n")
        for v in sorted(root_sync, key=lambda v: (v.dep_name, v.sub_path)):
            if v.kind == "root-mismatch":
                print(f"  ✗ {v.dep_name}  root={v.root_version}  fastapi_server={v.sub_version}")
            else:
                print(f"  ✗ {v.dep_name}  missing from {v.sub_path}")
        print()

    if missing:
        print(f"MISSING FROM ROOT ({len(missing)}):")
        print("  These pip packages appear in sub-packages but NOT in root pyproject.toml.\n")
        for v in sorted(missing, key=lambda v: (v.dep_name, v.sub_path)):
            print(f"  ✗ {v.dep_name} {v.sub_version}")
            print(f"    └─ {v.sub_path}")
        print()

    if mismatches:
        print(f"VERSION MISMATCH ({len(mismatches)}):")
        print("  These packages specify a different version than root.\n")
        for v in sorted(mismatches, key=lambda v: (v.dep_name, v.sub_path)):
            print(f"  ✗ {v.dep_name}")
            print(f"    root:  {v.root_version}")
            print(f"    sub:   {v.sub_version}")
            print(f"    └─ {v.sub_path}")
        print()

    total = len(all_violations)
    print(f"TOTAL: {total} violation(s) found.")
    sys.exit(1)


if __name__ == "__main__":
    main()
