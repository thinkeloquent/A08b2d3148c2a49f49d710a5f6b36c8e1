#!/usr/bin/env python3
"""
Lint pyproject.toml files to ensure no 'readme' field is declared.

Hatchling (and other build backends) validate the readme path at metadata
generation time.  When the declared file is absent from the Docker / cloud
build context the build fails with:

    OSError: Readme file does not exist: docs/README.md

Removing the field entirely avoids this class of failure — the readme is
optional metadata that is not required for package installation.

Scans the same sub-package directories as pyproject-lint-dep-versions.py:
  - packages_py/
  - fastapi_apps/
  - fastapi_apps/chromadb_rag_ingest/
  - polyglot/*/py/
  - root pyproject.toml
  - fastapi_server/pyproject.toml

Usage:
    python .bin/pyproject-lint-no-readme.py          # lint (exit 1 on violations)
    python .bin/pyproject-lint-no-readme.py --fix     # remove readme fields in-place

Exit codes:
    0 - No violations
    1 - Violations found (or fixed with --fix)
"""

from __future__ import annotations

import re
import sys
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


def get_project_root() -> Path:
    return Path(__file__).resolve().parent.parent


def find_pyprojects(root: Path) -> list[Path]:
    """Find all pyproject.toml files to check."""
    results: list[Path] = []

    # Root-level files
    for name in ("pyproject.toml", "fastapi_server/pyproject.toml"):
        pp = root / name
        if pp.exists():
            results.append(pp)

    # Sub-package directories
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
        # Also check if the scan_dir itself has a pyproject.toml
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


def has_readme_field(pyproject_path: Path) -> str | None:
    """Return the readme value if [project].readme is set, else None."""
    with open(pyproject_path, "rb") as f:
        data = tomllib.load(f)
    readme = data.get("project", {}).get("readme")
    if readme is None:
        return None
    if isinstance(readme, str):
        return readme
    if isinstance(readme, dict):
        return readme.get("file", readme.get("text", "<inline>"))
    return str(readme)


# Matches lines like:  readme = "docs/README.md"  or  readme = {file = "..."}
_README_LINE_RE = re.compile(r"^readme\s*=\s*.+\n?", re.MULTILINE)


def remove_readme_field(pyproject_path: Path) -> bool:
    """Remove the readme line from a pyproject.toml file. Returns True if modified."""
    text = pyproject_path.read_text(encoding="utf-8")
    new_text = _README_LINE_RE.sub("", text)
    if new_text != text:
        pyproject_path.write_text(new_text, encoding="utf-8")
        return True
    return False


def main() -> None:
    fix_mode = "--fix" in sys.argv
    root = get_project_root()
    pyprojects = find_pyprojects(root)

    print(f"Scanning {len(pyprojects)} pyproject.toml files for readme fields\n")

    violations: list[tuple[str, str]] = []

    for pp in pyprojects:
        readme_val = has_readme_field(pp)
        if readme_val is not None:
            rel = str(pp.relative_to(root))
            violations.append((rel, readme_val))

    if not violations:
        print("OK — no readme fields found.")
        sys.exit(0)

    if fix_mode:
        for rel, readme_val in violations:
            pp = root / rel
            removed = remove_readme_field(pp)
            status = "fixed" if removed else "manual removal needed"
            print(f"  ✓ {rel}: readme = {readme_val!r} ({status})")
        print(f"\nFixed {len(violations)} file(s).")
        sys.exit(0)

    for rel, readme_val in violations:
        print(f"  ✗ {rel}")
        print(f"    readme = {readme_val!r}")
    print(f"\nTOTAL: {len(violations)} violation(s) found.")
    print("Run with --fix to remove readme fields automatically.")
    sys.exit(1)


if __name__ == "__main__":
    main()
