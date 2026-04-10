#!/usr/bin/env python3
"""
python .bin/pyproject-sync-pkg-repo.py

Scans packages_py/, fastapi_apps/, fastapi_server/, and polyglot/*/py directories
and updates pyproject.toml files to include all local Python packages as editable dependencies.

Also reads cloud-packages.txt for CICD packages (added during AWS deployment).

Updates:
  - pyproject.toml (root): Local packages in [tool.poetry.dependencies]
  - fastapi_server/pyproject.toml:
    - dependencies[] (for uv/pip)
    - [tool.uv.sources] (for uv workspaces)
    - [tool.poetry.dependencies] (for poetry with relative path deps)
    - pip-registry deps synced from root [tool.poetry.dependencies]

Usage:
    python .bin/pyproject-sync-pkg-repo.py [--dry-run]

Options:
    --dry-run    Show what would be changed without modifying files

CICD Packages:
    Create cloud-packages.txt with one package name per line (hyphens, not underscores).
    These packages are added during CICD and exist in AWS packages_py/.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


def get_script_root() -> Path:
    """Get the monorepo root directory."""
    script_path = Path(__file__).resolve()
    # .bin is directly under root
    return script_path.parent.parent


def read_cloud_packages(root: Path) -> list[str]:
    """
    Read cloud/CICD-only packages from cloud-packages.txt.

    These are packages added during CICD (exist in AWS packages_py/ but not locally).
    One package name per line (use hyphens, not underscores).
    Lines starting with # are comments.
    """
    cloud_packages_file = root / 'cloud-packages.txt'
    if not cloud_packages_file.exists():
        return []

    packages = []
    for line in cloud_packages_file.read_text().splitlines():
        line = line.strip()
        # Skip empty lines and comments
        if line and not line.startswith('#'):
            packages.append(line)

    return packages


def find_python_packages(packages_dir: Path, show_skipped: bool = False) -> tuple[list[str], list[tuple[str, str]]]:
    """
    Find all valid Python packages in a directory.

    A valid package has a pyproject.toml file.

    Returns:
        (packages, skipped) - list of package names and list of (name, reason) for skipped
    """
    packages = []
    skipped = []

    if not packages_dir.exists():
        return packages, skipped

    for item in sorted(packages_dir.iterdir()):
        if item.is_dir():
            if item.name.startswith(('.', '_')):
                skipped.append((item.name, "starts with . or _"))
                continue
            # Check for pyproject.toml (Poetry/PEP 517 package)
            if (item / 'pyproject.toml').exists():
                packages.append(item.name)
            # Also check for setup.py (legacy)
            elif (item / 'setup.py').exists():
                packages.append(item.name)
            else:
                skipped.append((item.name, "no pyproject.toml or setup.py"))

    return packages, skipped


# Type alias for package info: (folder_name, base_dir)
PackageInfo = tuple[str, str]


SkippedInfo = tuple[str, str, str]  # (name, base_dir, reason)


def find_all_packages(root: Path) -> tuple[list[PackageInfo], list[SkippedInfo]]:
    """
    Find all Python packages in packages_py/, fastapi_apps/, fastapi_server/,
    and polyglot/*/py directories.

    Returns:
        (packages, skipped) - list of (folder_name, base_dir) tuples and skipped info
    """
    packages: list[PackageInfo] = []
    all_skipped: list[SkippedInfo] = []

    # Scan packages_py/
    packages_py_dir = root / 'packages_py'
    found, skipped = find_python_packages(packages_py_dir)
    for pkg in found:
        packages.append((pkg, 'packages_py'))
    for name, reason in skipped:
        all_skipped.append((name, 'packages_py', reason))

    # Scan fastapi_apps/
    fastapi_apps_dir = root / 'fastapi_apps'
    found, skipped = find_python_packages(fastapi_apps_dir)
    for pkg in found:
        packages.append((pkg, 'fastapi_apps'))
    for name, reason in skipped:
        all_skipped.append((name, 'fastapi_apps', reason))

    # Scan fastapi_server/
    fastapi_server_dir = root / 'fastapi_server'
    found, skipped = find_python_packages(fastapi_server_dir)
    for pkg in found:
        packages.append((pkg, 'fastapi_server'))
    for name, reason in skipped:
        all_skipped.append((name, 'fastapi_server', reason))

    # Scan polyglot/*/py directories
    polyglot_dir = root / 'polyglot'
    if polyglot_dir.exists():
        for item in sorted(polyglot_dir.iterdir()):
            if item.is_dir():
                if item.name.startswith(('.', '_')):
                    all_skipped.append((item.name, 'polyglot', "starts with . or _"))
                    continue
                py_dir = item / 'py'
                if py_dir.exists() and py_dir.is_dir():
                    # Check if py/ directory itself is a package
                    if (py_dir / 'pyproject.toml').exists():
                        # base_dir is "polyglot/{name}/py"
                        packages.append(('py', f'polyglot/{item.name}/py'))
                    else:
                        all_skipped.append((item.name, 'polyglot/*/py', "no pyproject.toml in py/"))
                else:
                    # polyglot dir without py/ subdirectory - not a Python package
                    pass

    # Scan platform-core/* directories
    platform_core_dir = root / 'platform-core'
    if platform_core_dir.exists():
        found, skipped = find_python_packages(platform_core_dir)
        for pkg in found:
            packages.append((pkg, 'platform-core'))
        for name, reason in skipped:
            all_skipped.append((name, 'platform-core', reason))

    return packages, all_skipped


def parse_existing_local_packages(content: str) -> dict[str, str]:
    """
    Parse existing local package entries from pyproject.toml.

    Returns dict of package_name -> full line
    """
    packages = {}

    # Match lines like: package-name = {path = "packages_py/package_name", develop = true}
    # or: package-name = {path = "fastapi_apps/package_name", develop = true}
    # or: package-name = {path = "polyglot/fetch_types/py", develop = true}
    # or: package-name = {path = "platform-core/fastapi", develop = true}
    pattern = r'^([\w-]+)\s*=\s*\{path\s*=\s*"(?:packages_py|fastapi_apps|fastapi_server|polyglot|platform-core)/[^"]+",\s*develop\s*=\s*true\}'

    for line in content.split('\n'):
        match = re.match(pattern, line.strip())
        if match:
            pkg_name = match.group(1)
            packages[pkg_name] = line.strip()

    return packages


def folder_to_package_name(folder_name: str) -> str:
    """Convert folder name to package name (keep as-is, no conversion)."""
    return folder_name


def read_package_name_from_pyproject(package_dir: Path) -> str | None:
    """Read the package name from a package's pyproject.toml.

    Returns the exact name as specified in pyproject.toml (no normalization).
    """
    pyproject_file = package_dir / 'pyproject.toml'
    if not pyproject_file.exists():
        return None

    content = pyproject_file.read_text()
    # Match: name = "package-name" or name = 'package-name'
    match = re.search(r'^name\s*=\s*["\']([^"\']+)["\']', content, re.MULTILINE)
    if match:
        # Return exact name as specified (no normalization)
        return match.group(1)
    return None


def generate_package_entry(folder_name: str, base_dir: str, root: Path) -> str:
    """Generate a pyproject.toml entry for a local package."""
    # For polyglot packages, base_dir already contains the full path (e.g., "polyglot/fetch_types/py")
    if base_dir.startswith('polyglot/'):
        package_dir = root / base_dir
        pkg_name = read_package_name_from_pyproject(package_dir)
        if not pkg_name:
            # Extract package name from path like "polyglot/fetch_types/py"
            pkg_name = base_dir.split('/')[1]
        return f'{pkg_name} = {{path = "{base_dir}", develop = true}}'

    # Standard packages: base_dir is just the directory name
    package_dir = root / base_dir / folder_name
    pkg_name = read_package_name_from_pyproject(package_dir)

    # Fallback to folder name conversion if we can't read it
    if not pkg_name:
        pkg_name = folder_to_package_name(folder_name)

    return f'{pkg_name} = {{path = "{base_dir}/{folder_name}", develop = true}}'


def update_pyproject_toml(
    pyproject_path: Path,
    packages: list[PackageInfo],
    root: Path,
    dry_run: bool = False
) -> tuple[bool, list[str], list[str]]:
    """
    Update pyproject.toml with local packages.

    Args:
        packages: List of (folder_name, base_dir) tuples
        root: Monorepo root path

    Returns:
        (changed, added, removed) - whether file changed, packages added, packages removed
    """
    content = pyproject_path.read_text()

    # Find existing local packages
    existing = parse_existing_local_packages(content)
    existing_names = set(existing.keys())

    # Get actual package names from their pyproject.toml files
    def get_pkg_name(folder_name: str, base_dir: str) -> str:
        # For polyglot packages, base_dir contains the full path
        if base_dir.startswith('polyglot/'):
            pkg_name = read_package_name_from_pyproject(root / base_dir)
            if not pkg_name:
                # Extract from path like "polyglot/fetch_types/py"
                pkg_name = base_dir.split('/')[1]
            return pkg_name
        # Standard packages
        pkg_name = read_package_name_from_pyproject(root / base_dir / folder_name)
        return pkg_name if pkg_name else folder_to_package_name(folder_name)

    desired_names = set(get_pkg_name(f, b) for f, b in packages)

    # Calculate diff
    to_add = sorted(desired_names - existing_names)
    to_remove = sorted(existing_names - desired_names)

    if not to_add and not to_remove:
        return False, [], []

    # Find the local packages section
    # Look for the comment marker
    marker = "# Local packages"

    if marker not in content:
        print(f"ERROR: Could not find marker '{marker}' in pyproject.toml")
        print("Please add this comment before the local packages section.")
        sys.exit(1)

    # Split content at marker
    before_marker, after_marker = content.split(marker, 1)

    # Find where the local packages section ends (next section or empty lines)
    lines_after = after_marker.split('\n')

    # Skip the marker line itself (empty after split)
    section_end_idx = 1
    for i, line in enumerate(lines_after[1:], start=1):
        stripped = line.strip()
        # End of section: empty line followed by [section] or end of file
        if stripped == '':
            # Check if next non-empty line is a section header
            for j in range(i + 1, len(lines_after)):
                next_stripped = lines_after[j].strip()
                if next_stripped:
                    if next_stripped.startswith('['):
                        section_end_idx = i
                    break
            if section_end_idx != 1:
                break
        elif stripped.startswith('['):
            section_end_idx = i
            break

    # Build new local packages section
    # Group by base_dir for organized output
    packages_py_entries = []
    fastapi_apps_entries = []
    fastapi_server_entries = []
    polyglot_entries = []
    platform_core_entries = []

    for folder_name, base_dir in sorted(packages, key=lambda x: (x[1], x[0])):
        entry = generate_package_entry(folder_name, base_dir, root)
        if base_dir == 'packages_py':
            packages_py_entries.append(entry)
        elif base_dir == 'fastapi_apps':
            fastapi_apps_entries.append(entry)
        elif base_dir == 'fastapi_server':
            fastapi_server_entries.append(entry)
        elif base_dir.startswith('polyglot/'):
            polyglot_entries.append(entry)
        elif base_dir == 'platform-core':
            platform_core_entries.append(entry)

    new_entries = packages_py_entries
    if fastapi_apps_entries:
        new_entries.append('')
        new_entries.append('# FastAPI apps')
        new_entries.extend(fastapi_apps_entries)
    if fastapi_server_entries:
        new_entries.append('')
        new_entries.append('# FastAPI server')
        new_entries.extend(fastapi_server_entries)
    if polyglot_entries:
        new_entries.append('')
        new_entries.append('# Polyglot packages (Python)')
        new_entries.extend(polyglot_entries)
    if platform_core_entries:
        new_entries.append('')
        new_entries.append('# Platform core packages')
        new_entries.extend(platform_core_entries)

    # Reconstruct content
    new_content = (
        before_marker +
        marker + '\n' +
        '\n'.join(new_entries) + '\n' +
        '\n'.join(lines_after[section_end_idx:])
    )

    # Clean up multiple blank lines
    new_content = re.sub(r'\n{3,}', '\n\n', new_content)

    if not dry_run:
        pyproject_path.write_text(new_content)

    return True, to_add, to_remove


def parse_fastapi_server_dependencies(content: str) -> set[str]:
    """Parse existing dependencies from fastapi_server/pyproject.toml.

    Normalizes underscores to hyphens for consistent comparison.
    """
    deps = set()
    # Match lines like: "package-name", or "package-name>=1.0.0",
    in_deps = False
    for line in content.split('\n'):
        stripped = line.strip()
        if stripped.startswith('dependencies = ['):
            in_deps = True
            continue
        if in_deps:
            if stripped == ']':
                break
            # Extract package name from "package-name", or "package-name>=1.0.0",
            match = re.match(r'"([a-zA-Z0-9_-]+)', stripped)
            if match:
                # Keep exact name as specified
                deps.add(match.group(1))
    return deps


def parse_poetry_path_dependencies(content: str) -> dict[str, str]:
    """Parse existing [tool.poetry.dependencies] path entries.

    Returns dict of package_name -> path
    """
    deps = {}
    in_poetry_deps = False
    for line in content.split('\n'):
        stripped = line.strip()
        if stripped == '[tool.poetry.dependencies]':
            in_poetry_deps = True
            continue
        if in_poetry_deps:
            if stripped.startswith('[') and stripped != '[tool.poetry.dependencies]':
                break
            # Match: package-name = {path = "../some/path", develop = true}
            match = re.match(r'^([\w-]+)\s*=\s*\{path\s*=\s*"([^"]+)"', stripped)
            if match:
                # Keep exact name as specified
                deps[match.group(1)] = match.group(2)
    return deps


def generate_poetry_path_entry(pkg_name: str, base_dir: str, relative_to: str = 'fastapi_server') -> str:
    """Generate a poetry path dependency entry with relative path.

    Args:
        pkg_name: Package name (exact name from pyproject.toml)
        base_dir: Base directory from root (e.g., 'packages_py/hello' or 'polyglot/fetch_types/py')
        relative_to: Directory we're generating paths relative to
    """
    # Path is relative from fastapi_server/ to root, then to package
    if relative_to == 'fastapi_server':
        rel_path = f"../{base_dir}"
    else:
        rel_path = base_dir
    return f'{pkg_name} = {{path = "{rel_path}", develop = true}}'


def parse_fastapi_server_sources(content: str) -> set[str]:
    """Parse existing [tool.uv.sources] entries from fastapi_server/pyproject.toml.

    Returns exact names as specified (no normalization).
    """
    sources = set()
    in_sources = False
    for line in content.split('\n'):
        stripped = line.strip()
        if stripped == '[tool.uv.sources]':
            in_sources = True
            continue
        if in_sources:
            if stripped.startswith('['):
                break
            # Match: package-name = {workspace = true}
            match = re.match(r'^([\w-]+)\s*=\s*\{workspace\s*=\s*true\}', stripped)
            if match:
                # Keep exact name as specified
                sources.add(match.group(1))
    return sources


def update_fastapi_server_pyproject(
    pyproject_path: Path,
    packages: list[PackageInfo],
    root: Path,
    dry_run: bool = False
) -> tuple[bool, list[str], list[str]]:
    """
    Update fastapi_server/pyproject.toml with local package dependencies.

    Adds local packages to:
    - dependencies list (for uv/pip)
    - [tool.uv.sources] section (for uv workspaces)
    - [tool.poetry.dependencies] section (for poetry with path deps)

    Excludes fastapi-server itself from the list.

    Returns:
        (changed, added, removed) - whether file changed, packages added, packages removed
    """
    content = pyproject_path.read_text()

    # Get existing dependencies and sources
    existing_deps = parse_fastapi_server_dependencies(content)
    existing_sources = parse_fastapi_server_sources(content)
    existing_poetry_deps = parse_poetry_path_dependencies(content)

    # Build package info: (pkg_name, full_path_from_root)
    def get_pkg_info(folder_name: str, base_dir: str) -> tuple[str, str]:
        if base_dir.startswith('polyglot/'):
            pkg_name = read_package_name_from_pyproject(root / base_dir)
            if not pkg_name:
                pkg_name = base_dir.split('/')[1]
            return pkg_name, base_dir
        pkg_name = read_package_name_from_pyproject(root / base_dir / folder_name)
        if not pkg_name:
            pkg_name = folder_to_package_name(folder_name)
        return pkg_name, f"{base_dir}/{folder_name}"

    # Build mapping of pkg_name -> path_from_root
    local_packages: dict[str, str] = {}
    for folder_name, base_dir in packages:
        pkg_name, full_path = get_pkg_info(folder_name, base_dir)
        # Exclude fastapi-server itself
        if pkg_name != 'fastapi-server':
            local_packages[pkg_name] = full_path

    # Add cloud packages (packages that exist in AWS but not locally)
    cloud_packages = read_cloud_packages(root)
    for pkg_name in cloud_packages:
        if pkg_name != 'fastapi-server' and pkg_name not in local_packages:
            # Cloud packages don't have local paths - skip for poetry
            local_packages[pkg_name] = ''

    local_pkg_names = set(local_packages.keys())

    # Calculate what needs to be added (only add packages that aren't already there)
    deps_to_add = sorted(local_pkg_names - existing_deps)
    sources_to_add = sorted(local_pkg_names - existing_sources)
    poetry_deps_to_add = sorted(local_pkg_names - set(existing_poetry_deps.keys()))

    if not deps_to_add and not sources_to_add and not poetry_deps_to_add:
        return False, [], []

    new_content = content

    # Update dependencies section
    if deps_to_add:
        # Find the dependencies array by parsing line-by-line
        # to avoid matching ] inside package specs like uvicorn[standard]
        lines = new_content.split('\n')
        in_deps = False
        deps_end_line = -1
        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped.startswith('dependencies = ['):
                in_deps = True
                continue
            if in_deps and stripped == ']':
                deps_end_line = i
                break

        if deps_end_line > 0:
            # Insert new dependencies before the closing ]
            new_deps_lines = [f'  "{pkg}",' for pkg in deps_to_add]
            lines = lines[:deps_end_line] + new_deps_lines + lines[deps_end_line:]
            new_content = '\n'.join(lines)

    # Update [tool.uv.sources] section
    if sources_to_add:
        # Find [tool.uv.sources] section
        sources_marker = '[tool.uv.sources]'
        if sources_marker in new_content:
            # Find the next section or end of file
            marker_pos = new_content.find(sources_marker)
            after_marker = new_content[marker_pos + len(sources_marker):]

            # Find where section ends (next [section] or end)
            next_section = re.search(r'\n\[', after_marker)
            if next_section:
                section_end = marker_pos + len(sources_marker) + next_section.start()
            else:
                section_end = len(new_content)

            # Insert new sources before section end
            new_sources = '\n'.join(f'{pkg} = {{workspace = true}}' for pkg in sources_to_add)
            new_content = (
                new_content[:section_end] +
                '\n' + new_sources +
                new_content[section_end:]
            )

    # Update [tool.poetry.dependencies] section
    if poetry_deps_to_add:
        poetry_marker = '[tool.poetry.dependencies]'
        if poetry_marker in new_content:
            # Find where section ends (next [section] or end)
            marker_pos = new_content.find(poetry_marker)
            after_marker = new_content[marker_pos + len(poetry_marker):]

            next_section = re.search(r'\n\[', after_marker)
            if next_section:
                section_end = marker_pos + len(poetry_marker) + next_section.start()
            else:
                section_end = len(new_content)

            # Generate poetry path entries (only for packages with local paths)
            new_poetry_entries = []
            for pkg in poetry_deps_to_add:
                path = local_packages.get(pkg, '')
                if path:  # Skip cloud packages without local paths
                    entry = generate_poetry_path_entry(pkg, path)
                    new_poetry_entries.append(entry)

            if new_poetry_entries:
                new_content = (
                    new_content[:section_end] +
                    '\n' + '\n'.join(new_poetry_entries) +
                    new_content[section_end:]
                )
        else:
            # No poetry section exists - create one
            # Insert before [build-system] or at end
            build_system_marker = '[build-system]'
            if build_system_marker in new_content:
                insert_pos = new_content.find(build_system_marker)
            else:
                insert_pos = len(new_content)

            # Generate full poetry section
            poetry_lines = [
                '[tool.poetry]',
                'name = "fastapi-server"',
                'version = "0.1.0"',
                'description = "FastAPI Server with Polyglot Integration"',
                'authors = ["Admin <admin@example.com>"]',
                '',
                '[tool.poetry.dependencies]',
                'python = ">=3.11"',
                'fastapi = ">=0.115.0"',
                'uvicorn = {extras = ["standard"], version = ">=0.32.0"}',
                'httpx = {extras = ["http2"], version = ">=0.28.1"}',
            ]

            # Add all local packages with paths
            for pkg in sorted(local_packages.keys()):
                path = local_packages[pkg]
                if path:  # Skip cloud packages
                    poetry_lines.append(generate_poetry_path_entry(pkg, path))

            poetry_section = '\n'.join(poetry_lines) + '\n\n'
            new_content = new_content[:insert_pos] + poetry_section + new_content[insert_pos:]

    if not dry_run:
        pyproject_path.write_text(new_content)

    all_added = sorted(set(deps_to_add) | set(sources_to_add) | set(poetry_deps_to_add))
    return True, all_added, []


def normalize_name(name: str) -> str:
    """Normalize package name per PEP 503."""
    return re.sub(r'[-_.]+', '-', name).lower()


def parse_root_pip_registry_deps(content: str) -> dict[str, str]:
    """Parse pip-registry (non-path) deps from root [tool.poetry.dependencies].

    Returns dict of normalized_name -> original full line.
    """
    deps: dict[str, str] = {}
    in_section = False
    for line in content.split('\n'):
        stripped = line.strip()
        if stripped == '[tool.poetry.dependencies]':
            in_section = True
            continue
        if in_section:
            if stripped.startswith('['):
                break
            if not stripped or stripped.startswith('#'):
                continue
            # Skip path deps
            if 'path =' in stripped:
                continue
            # Match: name = "version" or name = {version = ...}
            match = re.match(r'^([\w-]+)\s*=\s*(.+)$', stripped)
            if match:
                name = match.group(1)
                if name.lower() == 'python':
                    continue
                deps[normalize_name(name)] = stripped
    return deps


def parse_fs_poetry_pip_deps(content: str) -> dict[str, str]:
    """Parse pip-registry (non-path) deps from fastapi_server [tool.poetry.dependencies].

    Returns dict of normalized_name -> original full line.
    """
    deps: dict[str, str] = {}
    in_section = False
    for line in content.split('\n'):
        stripped = line.strip()
        if stripped == '[tool.poetry.dependencies]':
            in_section = True
            continue
        if in_section:
            if stripped.startswith('['):
                break
            if not stripped or stripped.startswith('#'):
                continue
            if 'path =' in stripped:
                continue
            match = re.match(r'^([\w-]+)\s*=\s*(.+)$', stripped)
            if match:
                name = match.group(1)
                if name.lower() == 'python':
                    continue
                deps[normalize_name(name)] = stripped
    return deps


def poetry_spec_to_pep508(line: str) -> str | None:
    """Convert a poetry dep line to PEP 508 string for [project].dependencies.

    Examples:
        'fastapi = "==0.128.0"'            -> 'fastapi==0.128.0'
        'uvicorn = {extras = ["standard"], version = "==0.40.0"}' -> 'uvicorn[standard]==0.40.0'
        'sqlalchemy = {extras = ["asyncio"], version = "==2.0.22"}' -> 'sqlalchemy[asyncio]==2.0.22'
        'elasticsearch = ">=8.0.0,<9.0.0"' -> 'elasticsearch>=8.0.0,<9.0.0'
    """
    match = re.match(r'^([\w-]+)\s*=\s*(.+)$', line.strip())
    if not match:
        return None
    name = match.group(1)
    spec = match.group(2).strip()

    # Simple string: name = "version"
    simple = re.match(r'^"([^"]+)"$', spec)
    if simple:
        return f'{name}{simple.group(1)}'

    # Inline table: name = {extras = [...], version = "..."}
    extras_match = re.search(r'extras\s*=\s*\[([^\]]*)\]', spec)
    version_match = re.search(r'version\s*=\s*"([^"]+)"', spec)

    extras_str = ''
    if extras_match:
        extras_raw = extras_match.group(1)
        extras_list = [e.strip().strip('"').strip("'") for e in extras_raw.split(',') if e.strip()]
        if extras_list:
            extras_str = f'[{",".join(extras_list)}]'

    version_str = ''
    if version_match:
        version_str = version_match.group(1)

    if not version_str and not extras_str:
        return None

    return f'{name}{extras_str}{version_str}'


def sync_pip_registry_deps(
    fastapi_server_pyproject: Path,
    root_pyproject: Path,
    dry_run: bool = False,
) -> tuple[bool, list[str]]:
    """Sync pip-registry deps from root to fastapi_server/pyproject.toml.

    Ensures every non-path dep in root [tool.poetry.dependencies] also
    appears in fastapi_server's [tool.poetry.dependencies] and PEP 621
    dependencies[].

    Returns:
        (changed, added_names)
    """
    root_content = root_pyproject.read_text()
    fs_content = fastapi_server_pyproject.read_text()

    root_pip = parse_root_pip_registry_deps(root_content)
    fs_pip = parse_fs_poetry_pip_deps(fs_content)

    to_add = sorted(set(root_pip.keys()) - set(fs_pip.keys()))
    if not to_add:
        return False, []

    new_content = fs_content

    # --- Add to [tool.poetry.dependencies] ---
    poetry_marker = '[tool.poetry.dependencies]'
    if poetry_marker in new_content:
        # Find "# Local packages" inside poetry deps, or end of section
        marker_pos = new_content.find(poetry_marker)
        after_marker = new_content[marker_pos + len(poetry_marker):]

        # Try to insert before "# Local packages" comment
        local_comment = '# Local packages'
        local_pos = after_marker.find(local_comment)
        if local_pos >= 0:
            insert_pos = marker_pos + len(poetry_marker) + local_pos
        else:
            # Insert before next section
            next_section = re.search(r'\n\[', after_marker)
            if next_section:
                insert_pos = marker_pos + len(poetry_marker) + next_section.start()
            else:
                insert_pos = len(new_content)

        new_lines = []
        for norm_name in to_add:
            new_lines.append(root_pip[norm_name])
        new_content = (
            new_content[:insert_pos] +
            '\n'.join(new_lines) + '\n' +
            new_content[insert_pos:]
        )

    # --- Add to PEP 621 dependencies[] ---
    # Find the "# Local packages" comment inside dependencies[] to insert before it
    lines = new_content.split('\n')
    in_deps = False
    insert_line = -1
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('dependencies = ['):
            in_deps = True
            continue
        if in_deps:
            if stripped == ']':
                # Fallback: insert before closing bracket
                if insert_line < 0:
                    insert_line = i
                break
            # Insert before the "# Local packages" comment
            if '# Local packages' in stripped and insert_line < 0:
                insert_line = i

    if insert_line > 0:
        new_dep_lines = []
        for norm_name in to_add:
            pep508 = poetry_spec_to_pep508(root_pip[norm_name])
            if pep508:
                new_dep_lines.append(f'  "{pep508}",')
        lines = lines[:insert_line] + new_dep_lines + lines[insert_line:]
        new_content = '\n'.join(lines)

    if not dry_run:
        fastapi_server_pyproject.write_text(new_content)

    return True, to_add


def main():
    parser = argparse.ArgumentParser(
        description='Sync local Python packages with pyproject.toml dependencies'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be changed without modifying files'
    )
    args = parser.parse_args()

    root = get_script_root()
    pyproject_path = root / 'pyproject.toml'

    print(f"Scanning: {root / 'packages_py'}")
    print(f"Scanning: {root / 'fastapi_apps'}")
    print(f"Scanning: {root / 'fastapi_server'}")
    print(f"Scanning: {root / 'polyglot' / '*' / 'py'}")
    print(f"Scanning: {root / 'platform-core' / '*'}")
    print(f"Target:   {pyproject_path}")
    print(f"Target:   {root / 'fastapi_server' / 'pyproject.toml'}")
    print()

    if not pyproject_path.exists():
        print(f"ERROR: pyproject.toml not found at {pyproject_path}")
        sys.exit(1)

    # Find all packages from all directories
    packages, skipped = find_all_packages(root)

    # Group for display
    packages_py = [(f, b) for f, b in packages if b == 'packages_py']
    fastapi_apps = [(f, b) for f, b in packages if b == 'fastapi_apps']
    fastapi_server = [(f, b) for f, b in packages if b == 'fastapi_server']
    polyglot = [(f, b) for f, b in packages if b.startswith('polyglot/')]

    print(f"Found {len(packages_py)} packages in packages_py/:")
    for pkg, _ in packages_py:
        print(f"  - {pkg}")

    # Show skipped directories (excluding hidden dirs like .cache, .ruff_cache)
    skipped_visible = [(n, b, r) for n, b, r in skipped if not n.startswith('.')]
    if skipped_visible:
        print(f"\nSkipped {len(skipped_visible)} directories:")
        for name, base_dir, reason in skipped_visible:
            print(f"  - {base_dir}/{name}: {reason}")

    if fastapi_apps:
        print(f"\nFound {len(fastapi_apps)} apps in fastapi_apps/:")
        for pkg, _ in fastapi_apps:
            print(f"  - {pkg}")

    if fastapi_server:
        print(f"\nFound {len(fastapi_server)} packages in fastapi_server/:")
        for pkg, _ in fastapi_server:
            print(f"  - {pkg}")

    if polyglot:
        print(f"\nFound {len(polyglot)} packages in polyglot/*/py:")
        for _, base_dir in polyglot:
            # Extract the package name from path like "polyglot/fetch_types/py"
            pkg_name = base_dir.split('/')[1]
            print(f"  - {pkg_name}")

    platform_core = [(f, b) for f, b in packages if b == 'platform-core']
    if platform_core:
        print(f"\nFound {len(platform_core)} packages in platform-core/:")
        for pkg, _ in platform_core:
            print(f"  - {pkg}")

    # Read cloud packages (AWS-only packages)
    cloud_packages = read_cloud_packages(root)
    if cloud_packages:
        print(f"\nFound {len(cloud_packages)} cloud packages in cloud-packages.txt:")
        for pkg in cloud_packages:
            print(f"  - {pkg}")
    print()

    # Update root pyproject.toml
    changed, added, removed = update_pyproject_toml(
        pyproject_path,
        packages,
        root,
        dry_run=args.dry_run
    )

    if changed:
        print("Root pyproject.toml:")
        if added:
            print(f"  Added {len(added)} package(s):")
            for pkg in added:
                print(f"    + {pkg}")
        if removed:
            print(f"  Removed {len(removed)} package(s):")
            for pkg in removed:
                print(f"    - {pkg}")
    else:
        print("Root pyproject.toml is already up to date.")

    print()

    # Update fastapi_server/pyproject.toml
    fastapi_server_pyproject = root / 'fastapi_server' / 'pyproject.toml'
    fs_changed = False
    pip_changed = False
    if fastapi_server_pyproject.exists():
        fs_changed, fs_added, fs_removed = update_fastapi_server_pyproject(
            fastapi_server_pyproject,
            packages,
            root,
            dry_run=args.dry_run
        )

        if fs_changed:
            print("fastapi_server/pyproject.toml (local packages):")
            if fs_added:
                print(f"  Added {len(fs_added)} package(s) to dependencies, uv.sources, and poetry.dependencies:")
                for pkg in fs_added:
                    print(f"    + {pkg}")
        else:
            print("fastapi_server/pyproject.toml local packages are up to date.")

        # Sync pip-registry deps from root -> fastapi_server
        pip_changed, pip_added = sync_pip_registry_deps(
            fastapi_server_pyproject,
            pyproject_path,
            dry_run=args.dry_run,
        )

        if pip_changed:
            print(f"\nfastapi_server/pyproject.toml (pip-registry deps):")
            print(f"  Synced {len(pip_added)} dep(s) from root:")
            for pkg in pip_added:
                print(f"    + {pkg}")
        else:
            print("fastapi_server/pyproject.toml pip-registry deps are in sync with root.")
    else:
        print("fastapi_server/pyproject.toml not found, skipping.")

    print()

    any_changed = changed or fs_changed or pip_changed
    if args.dry_run and any_changed:
        print("DRY RUN: Would update files. Run without --dry-run to apply.")
    else:
        if any_changed:
            print("Files updated successfully.")
            print()
            print("Next steps:")
            print("  For uv:    uv sync")
            print("  For poetry: poetry lock && poetry install")
        else:
            print("All files are already up to date.")


if __name__ == '__main__':
    main()
