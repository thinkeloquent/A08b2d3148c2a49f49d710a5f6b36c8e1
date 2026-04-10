#!/usr/bin/env python3
"""
Sync missing dependencies from root package.json and pyproject.toml
into test/integration/** package.json and pyproject.toml files.

Only adds dependencies that are NOT already defined in the integration
test file. Does not modify existing dependency versions.

Sources:
  - platform/package.json          -> pip-registry deps + workspace deps (relative path)
  - platform/pyproject.toml        -> pip-registry deps + local path deps (relative path)

Targets:
  - platform/test/integration/**/package.json
  - platform/test/integration/**/pyproject.toml

Usage:
    python .bin/test_integration_pkg_sync.py             # dry-run (report only)
    python .bin/test_integration_pkg_sync.py --write      # apply changes
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

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


def normalize_py_name(name: str) -> str:
    """Normalize a Python package name per PEP 503."""
    return re.sub(r"[-_.]+", "-", name).lower()


# ---------------------------------------------------------------------------
# Parse root sources — npm
# ---------------------------------------------------------------------------

def parse_root_npm_registry_deps(root: Path) -> dict[str, str]:
    """Parse non-workspace npm deps from root package.json."""
    pkg_path = root / "package.json"
    with open(pkg_path) as f:
        data = json.load(f)

    result: dict[str, str] = {}
    for section in ("dependencies", "devDependencies"):
        for name, version in data.get(section, {}).items():
            if version.startswith("workspace:"):
                continue
            result[name] = version
    return result


def build_npm_workspace_map(root: Path) -> dict[str, Path]:
    """Scan pnpm workspace dirs to build {package-name: absolute-dir-path}.

    Reads the 'workspaces' globs from root package.json and resolves each
    pattern to find package.json files, building a name -> directory map.
    """
    pkg_path = root / "package.json"
    with open(pkg_path) as f:
        data = json.load(f)

    ws_patterns = data.get("workspaces", [])
    name_to_dir: dict[str, Path] = {}

    for pattern in ws_patterns:
        # Expand glob pattern to find directories
        # patterns like "packages_mjs/*", "fastify_apps/*", "polyglot/*/mjs"
        import glob
        expanded = glob.glob(str(root / pattern), recursive=False)
        for dir_path_str in expanded:
            dir_path = Path(dir_path_str)
            pkg_json = dir_path / "package.json"
            if pkg_json.exists():
                try:
                    with open(pkg_json) as f:
                        pkg_data = json.load(f)
                    pkg_name = pkg_data.get("name")
                    if pkg_name:
                        name_to_dir[pkg_name] = dir_path
                except (json.JSONDecodeError, KeyError):
                    pass

    return name_to_dir


def parse_root_npm_workspace_deps(root: Path) -> dict[str, str]:
    """Parse workspace:* dep names from root package.json."""
    pkg_path = root / "package.json"
    with open(pkg_path) as f:
        data = json.load(f)

    result: dict[str, str] = {}
    for section in ("dependencies", "devDependencies"):
        for name, version in data.get(section, {}).items():
            if version.startswith("workspace:"):
                result[name] = version
    return result


# ---------------------------------------------------------------------------
# Parse root sources — Python
# ---------------------------------------------------------------------------

def parse_root_py_registry_deps(root: Path) -> dict[str, dict]:
    """Parse non-local pip deps from root pyproject.toml.

    Returns {normalized_name: {raw_name, version, extras}} for pip-registry deps.
    """
    pyproject = root / "pyproject.toml"
    with open(pyproject, "rb") as f:
        data = tomllib.load(f)

    poetry_deps = data.get("tool", {}).get("poetry", {}).get("dependencies", {})
    result: dict[str, dict] = {}

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

        norm = normalize_py_name(name)
        result[norm] = {"raw_name": name, "version": version, "extras": extras}

    return result


def parse_root_py_local_deps(root: Path) -> dict[str, dict]:
    """Parse local path deps from root pyproject.toml.

    Returns {normalized_name: {raw_name, path, develop, extras}} for local deps.
    The 'path' is relative to the platform root (e.g. "packages_py/can_use_http2").
    """
    pyproject = root / "pyproject.toml"
    with open(pyproject, "rb") as f:
        data = tomllib.load(f)

    poetry_deps = data.get("tool", {}).get("poetry", {}).get("dependencies", {})
    result: dict[str, dict] = {}

    for name, spec in poetry_deps.items():
        if name.lower() == "python":
            continue
        if not (isinstance(spec, dict) and "path" in spec):
            continue

        norm = normalize_py_name(name)
        result[norm] = {
            "raw_name": name,
            "path": spec["path"],
            "develop": spec.get("develop", True),
            "extras": spec.get("extras", []),
        }

    return result


# ---------------------------------------------------------------------------
# Find integration test files
# ---------------------------------------------------------------------------

def find_integration_files(root: Path, filename: str) -> list[Path]:
    """Find all instances of filename under test/integration/."""
    test_dir = root / "test" / "integration"
    if not test_dir.exists():
        return []
    return sorted(
        p for p in test_dir.rglob(filename)
        if ".venv" not in p.parts and "node_modules" not in p.parts
    )


# ---------------------------------------------------------------------------
# Relative path computation
# ---------------------------------------------------------------------------

def relative_path(from_dir: Path, to_path: Path) -> str:
    """Compute a POSIX relative path from from_dir to to_path."""
    return os.path.relpath(to_path, from_dir).replace("\\", "/")


# ---------------------------------------------------------------------------
# Sync npm deps into package.json
# ---------------------------------------------------------------------------

def sync_npm(
    root: Path,
    registry_deps: dict[str, str],
    workspace_deps: dict[str, str],
    workspace_map: dict[str, Path],
    dry_run: bool,
) -> int:
    """Add missing npm deps to integration test package.json files."""
    targets = find_integration_files(root, "package.json")
    total_added = 0

    for pkg_path in targets:
        with open(pkg_path) as f:
            data = json.load(f)

        existing: set[str] = set()
        for section in ("dependencies", "devDependencies"):
            existing.update(data.get(section, {}).keys())

        pkg_dir = pkg_path.parent

        # Build the full set of deps to add
        to_add: dict[str, str] = {}

        # Registry deps
        for name, version in registry_deps.items():
            if name not in existing:
                to_add[name] = version

        # Workspace deps -> relative file: references
        for name in workspace_deps:
            if name in existing:
                continue
            if name in workspace_map:
                rel = relative_path(pkg_dir, workspace_map[name])
                to_add[name] = f"file:{rel}"

        if not to_add:
            continue

        rel_display = pkg_path.relative_to(root)
        total_added += len(to_add)

        if dry_run:
            print(f"  {rel_display}")
            for name, ver in sorted(to_add.items()):
                print(f"    + {name}: {ver}")
        else:
            deps = data.setdefault("dependencies", {})
            deps.update(to_add)
            data["dependencies"] = dict(sorted(deps.items()))
            with open(pkg_path, "w") as f:
                json.dump(data, f, indent=2)
                f.write("\n")
            print(f"  {rel_display} — added {len(to_add)} dep(s)")

    return total_added


# ---------------------------------------------------------------------------
# Sync Python deps into pyproject.toml
# ---------------------------------------------------------------------------

def get_existing_py_deps(pyproject_path: Path) -> set[str]:
    """Get normalized names of all existing Python deps in a pyproject.toml."""
    with open(pyproject_path, "rb") as f:
        data = tomllib.load(f)

    existing: set[str] = set()

    # [tool.poetry.dependencies]
    poetry_deps = data.get("tool", {}).get("poetry", {}).get("dependencies", {})
    for name in poetry_deps:
        if name.lower() != "python":
            existing.add(normalize_py_name(name))

    # [project].dependencies (PEP 621)
    pep621 = data.get("project", {}).get("dependencies", [])
    for raw in pep621:
        m = re.match(r"^([A-Za-z0-9]([A-Za-z0-9._-]*[A-Za-z0-9])?)", raw.strip())
        if m:
            existing.add(normalize_py_name(m.group(1)))

    return existing


def format_registry_dep_line(dep_info: dict) -> str:
    """Format a pip-registry dep as a TOML line."""
    name = dep_info["raw_name"]
    version = dep_info["version"]
    extras = dep_info.get("extras", [])

    if extras:
        return f'{name} = {{extras = {json.dumps(extras)}, version = "{version}"}}'
    return f'{name} = "{version}"'


def format_local_dep_line(dep_info: dict, rel_path: str) -> str:
    """Format a local path dep as a TOML line with relative path."""
    name = dep_info["raw_name"]
    develop = dep_info.get("develop", True)
    extras = dep_info.get("extras", [])

    parts = [f'path = "{rel_path}"', f"develop = {str(develop).lower()}"]
    if extras:
        parts.insert(0, f"extras = {json.dumps(extras)}")
    return f'{name} = {{{", ".join(parts)}}}'


def sync_python(
    root: Path,
    registry_deps: dict[str, dict],
    local_deps: dict[str, dict],
    dry_run: bool,
) -> int:
    """Add missing Python deps to integration test pyproject.toml files."""
    targets = find_integration_files(root, "pyproject.toml")
    total_added = 0

    for toml_path in targets:
        existing = get_existing_py_deps(toml_path)
        toml_dir = toml_path.parent

        # Build lines to add: (sort_key, formatted_line)
        lines_to_add: list[tuple[str, str]] = []

        # Registry deps
        for norm, info in registry_deps.items():
            if norm not in existing:
                lines_to_add.append((norm, format_registry_dep_line(info)))

        # Local path deps -> relative paths
        for norm, info in local_deps.items():
            if norm not in existing:
                abs_pkg_path = root / info["path"]
                rel = relative_path(toml_dir, abs_pkg_path)
                lines_to_add.append((norm, format_local_dep_line(info, rel)))

        if not lines_to_add:
            continue

        lines_to_add.sort(key=lambda t: t[0])
        rel_display = toml_path.relative_to(root)
        total_added += len(lines_to_add)

        if dry_run:
            print(f"  {rel_display}")
            for _, line in lines_to_add:
                print(f"    + {line}")
        else:
            content = toml_path.read_text()
            dep_block = "\n".join(line for _, line in lines_to_add)

            # Insert before [build-system] if it exists, otherwise append
            if "[build-system]" in content:
                content = content.replace(
                    "[build-system]",
                    dep_block + "\n\n[build-system]",
                )
            elif "[tool.poetry.dependencies]" in content:
                lines = content.split("\n")
                insert_idx = None
                in_section = False
                for i, line in enumerate(lines):
                    if line.strip() == "[tool.poetry.dependencies]":
                        in_section = True
                        continue
                    if in_section:
                        if line.strip().startswith("[") and not line.strip().startswith("[tool.poetry.dependencies"):
                            insert_idx = i
                            break
                if insert_idx is not None:
                    lines.insert(insert_idx, dep_block)
                else:
                    lines.append(dep_block)
                content = "\n".join(lines)
            else:
                content = content.rstrip() + "\n" + dep_block + "\n"

            toml_path.write_text(content)
            print(f"  {rel_display} — added {len(lines_to_add)} dep(s)")

    return total_added


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    write_mode = "--write" in sys.argv
    root = get_project_root()

    # npm
    npm_registry = parse_root_npm_registry_deps(root)
    npm_workspace = parse_root_npm_workspace_deps(root)
    npm_ws_map = build_npm_workspace_map(root)

    # Python
    py_registry = parse_root_py_registry_deps(root)
    py_local = parse_root_py_local_deps(root)

    print(f"Root npm deps:    {len(npm_registry)} registry, {len(npm_workspace)} workspace ({len(npm_ws_map)} resolved)")
    print(f"Root Python deps: {len(py_registry)} registry, {len(py_local)} local path")
    print()

    mode_label = "WRITING" if write_mode else "DRY RUN"
    print(f"=== {mode_label}: npm (package.json) ===")
    npm_count = sync_npm(root, npm_registry, npm_workspace, npm_ws_map, dry_run=not write_mode)
    print()

    print(f"=== {mode_label}: Python (pyproject.toml) ===")
    py_count = sync_python(root, py_registry, py_local, dry_run=not write_mode)
    print()

    total = npm_count + py_count
    if total == 0:
        print("All integration test files are in sync — nothing to add.")
    elif write_mode:
        print(f"Done — added {npm_count} npm dep(s), {py_count} Python dep(s).")
    else:
        print(f"Would add {npm_count} npm dep(s), {py_count} Python dep(s).")
        print("Run with --write to apply.")


if __name__ == "__main__":
    main()
