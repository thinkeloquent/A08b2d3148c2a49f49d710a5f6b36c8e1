#!/usr/bin/env python3
"""
python_lint_dep_find.py - Validate Python package build configs use hatchling

Ensures every pyproject.toml under packages_py/ and polyglot/*/py/ uses
hatchling as the build backend with an explicit `packages` list.
Setuptools auto-discovery can silently produce empty wheels, causing
ModuleNotFoundError in cloud deployments.

Usage:
    python3 .bin/python_lint_dep_find.py            # Check all packages
    python3 .bin/python_lint_dep_find.py --staged    # Check only staged pyproject.toml files
    python3 .bin/python_lint_dep_find.py --verbose   # Show passing files too
"""

import argparse
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# Directories containing Python packages with pyproject.toml
SCAN_GLOBS = [
    "packages_py/*/pyproject.toml",
    "polyglot/*/py/pyproject.toml",
]

# Colors
RED = "\033[0;31m"
GREEN = "\033[0;32m"
YELLOW = "\033[1;33m"
NC = "\033[0m"


def log_ok(msg: str) -> None:
    print(f"{GREEN}[OK]{NC} {msg}")


def log_error(msg: str) -> None:
    print(f"{RED}[ERROR]{NC} {msg}")


def log_warn(msg: str) -> None:
    print(f"{YELLOW}[WARN]{NC} {msg}")


def parse_build_config(path: Path) -> dict:
    """Minimal TOML parser for build-system and hatch wheel config.

    Only extracts the fields we need — avoids requiring tomllib on 3.11.
    """
    text = path.read_text()
    result = {
        "build_requires": None,
        "build_backend": None,
        "has_setuptools_section": False,
        "has_poetry_section": False,
        "hatch_packages": None,
    }

    in_build_system = False
    in_hatch_wheel = False

    for raw_line in text.splitlines():
        line = raw_line.strip()

        # Track sections
        if line.startswith("["):
            in_build_system = line == "[build-system]"
            in_hatch_wheel = line == "[tool.hatch.build.targets.wheel]"
            if line.startswith("[tool.setuptools"):
                result["has_setuptools_section"] = True
            if line.startswith("[tool.poetry"):
                result["has_poetry_section"] = True
            continue

        if "=" not in line:
            continue

        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()

        if in_build_system:
            if key == "requires":
                result["build_requires"] = value
            elif key == "build-backend":
                result["build_backend"] = value.strip('"').strip("'")

        if in_hatch_wheel and key == "packages":
            result["hatch_packages"] = value

    return result


def validate_pyproject(path: Path) -> list[str]:
    """Return list of error strings for a pyproject.toml file."""
    errors = []
    rel = path.relative_to(REPO_ROOT)
    cfg = parse_build_config(path)

    # 1. Must use hatchling
    if cfg["build_backend"] != "hatchling.build":
        backend = cfg["build_backend"] or "(missing)"
        errors.append(f"{rel}: build-backend is '{backend}', expected 'hatchling.build'")

    if cfg["build_requires"] and "hatchling" not in cfg["build_requires"]:
        errors.append(f"{rel}: requires does not include 'hatchling'")

    # 2. Must have explicit packages
    if cfg["hatch_packages"] is None:
        errors.append(f"{rel}: missing [tool.hatch.build.targets.wheel] packages")
    elif cfg["hatch_packages"] in ('[""]', "['.']", '["."]', "['']"):
        errors.append(f"{rel}: packages value is invalid: {cfg['hatch_packages']}")

    # 3. Must not have leftover setuptools/poetry sections
    if cfg["has_setuptools_section"]:
        errors.append(f"{rel}: still has [tool.setuptools.*] section — remove after migration")

    if cfg["has_poetry_section"]:
        errors.append(f"{rel}: still has [tool.poetry.*] section — remove after migration")

    return errors


def get_staged_pyprojects() -> list[Path]:
    """Get pyproject.toml files that are staged in git."""
    result = subprocess.run(
        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
        capture_output=True,
        text=True,
        cwd=REPO_ROOT,
    )
    staged = []
    for line in result.stdout.strip().splitlines():
        if not line.endswith("pyproject.toml"):
            continue
        p = REPO_ROOT / line
        # Only check package dirs, not root pyproject.toml
        if p.parent == REPO_ROOT:
            continue
        for glob in SCAN_GLOBS:
            if p in REPO_ROOT.glob(glob):
                staged.append(p)
                break
    return staged


def collect_all_pyprojects() -> list[Path]:
    """Collect all pyproject.toml files matching SCAN_GLOBS."""
    found = []
    for glob in SCAN_GLOBS:
        found.extend(sorted(REPO_ROOT.glob(glob)))
    return found


def main() -> None:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--staged",
        action="store_true",
        help="Only check staged pyproject.toml files (for pre-commit hooks)",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Show passing files too",
    )
    args = parser.parse_args()

    if args.staged:
        targets = get_staged_pyprojects()
        if not targets:
            sys.exit(0)
    else:
        targets = collect_all_pyprojects()

    all_errors: list[str] = []
    passed = 0

    for path in targets:
        errors = validate_pyproject(path)
        if errors:
            for e in errors:
                log_error(e)
            all_errors.extend(errors)
        else:
            passed += 1
            if args.verbose:
                log_ok(str(path.relative_to(REPO_ROOT)))

    total = len(targets)
    failed = total - passed

    if all_errors:
        print()
        log_error(f"{failed}/{total} pyproject.toml files have build config issues")
        print()
        print("Fix: migrate to hatchling with explicit packages:")
        print('  [build-system]')
        print('  requires = ["hatchling"]')
        print('  build-backend = "hatchling.build"')
        print()
        print('  [tool.hatch.build.targets.wheel]')
        print('  packages = ["your_package"]')
        sys.exit(1)
    else:
        log_ok(f"All {total} pyproject.toml files use hatchling with explicit packages")
        sys.exit(0)


if __name__ == "__main__":
    main()
