#!/usr/bin/env python3
"""
python .bin/pyproject-merge-pkg.py <source> <target>

Merges dependencies from a source pyproject.toml into a target pyproject.toml.

ARG01 (source): pyproject.toml — reads all deps from [tool.poetry.dependencies]
ARG02 (target): pyproject.toml — merges deps into without duplication, including
                local relative packages in dependencies[], [tool.uv.sources],
                and [tool.poetry.dependencies].

Local path deps from the source are rewritten as relative paths from the target's
directory. Pip-registry deps are copied verbatim.

Usage:
    python .bin/pyproject-merge-pkg.py pyproject.toml fastapi_server/pyproject.toml
    python .bin/pyproject-merge-pkg.py pyproject.toml fastapi_server/pyproject.toml --dry-run
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


def normalize_name(name: str) -> str:
    """Normalize package name per PEP 503 for comparison."""
    return re.sub(r'[-_.]+', '-', name).lower()


def parse_poetry_deps(content: str) -> dict[str, dict]:
    """Parse all deps from [tool.poetry.dependencies].

    Returns dict of exact_name -> {
        'line': str,           # original line
        'is_local': bool,
        'path': str | None,    # path value if local
        'spec': str,           # the value part after `name = `
    }
    """
    deps: dict[str, dict] = {}
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
            match = re.match(r'^([\w-]+)\s*=\s*(.+)$', stripped)
            if match:
                name = match.group(1)
                spec = match.group(2).strip()
                if name.lower() == 'python':
                    continue
                is_local = 'path =' in spec
                path_val = None
                if is_local:
                    path_match = re.search(r'path\s*=\s*"([^"]+)"', spec)
                    if path_match:
                        path_val = path_match.group(1)
                deps[name] = {
                    'line': stripped,
                    'is_local': is_local,
                    'path': path_val,
                    'spec': spec,
                }
    return deps


def parse_target_pep621_deps(content: str) -> set[str]:
    """Parse existing dependency names from PEP 621 dependencies[].

    Returns set of normalized names.
    """
    deps = set()
    in_deps = False
    for line in content.split('\n'):
        stripped = line.strip()
        if stripped.startswith('dependencies = ['):
            in_deps = True
            continue
        if in_deps:
            if stripped == ']':
                break
            match = re.match(r'"([a-zA-Z0-9_-]+)', stripped)
            if match:
                deps.add(normalize_name(match.group(1)))
    return deps


def parse_target_uv_sources(content: str) -> set[str]:
    """Parse existing names from [tool.uv.sources]."""
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
            match = re.match(r'^([\w-]+)\s*=', stripped)
            if match:
                sources.add(normalize_name(match.group(1)))
    return sources


def parse_target_poetry_deps(content: str) -> set[str]:
    """Parse existing dep names from target [tool.poetry.dependencies]."""
    deps = set()
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
            match = re.match(r'^([\w-]+)\s*=', stripped)
            if match:
                deps.add(normalize_name(match.group(1)))
    return deps


def poetry_spec_to_pep508(name: str, spec: str) -> str | None:
    """Convert a poetry dep spec to PEP 508 string.

    Examples:
        'fastapi', '"==0.128.0"'  -> 'fastapi==0.128.0'
        'uvicorn', '{extras = ["standard"], version = "==0.40.0"}' -> 'uvicorn[standard]==0.40.0'
    """
    # Simple string: "version"
    simple = re.match(r'^"([^"]+)"$', spec)
    if simple:
        return f'{name}{simple.group(1)}'

    # Inline table with extras and/or version
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


def rebase_path(source_path: str, source_dir: Path, target_dir: Path) -> str:
    """Recompute a relative path from source's perspective to target's perspective.

    source_path is relative to source_dir.
    Returns a path relative to target_dir.
    """
    # Resolve the absolute path of the package
    abs_path = (source_dir / source_path).resolve()
    # Compute relative path from target directory
    try:
        rel = abs_path.relative_to(target_dir.resolve())
        return str(rel)
    except ValueError:
        # Not a subpath — use os.path.relpath equivalent
        from os.path import relpath
        return relpath(abs_path, target_dir.resolve())


def merge_into_target(
    source_deps: dict[str, dict],
    target_content: str,
    source_dir: Path,
    target_dir: Path,
    dry_run: bool = False,
) -> tuple[str, list[str], list[str]]:
    """Merge source deps into target content.

    Returns (new_content, pip_added, local_added).
    """
    existing_pep621 = parse_target_pep621_deps(target_content)
    existing_uv = parse_target_uv_sources(target_content)
    existing_poetry = parse_target_poetry_deps(target_content)

    pip_deps: list[tuple[str, str, str]] = []     # (name, spec, pep508)
    local_deps: list[tuple[str, str]] = []         # (name, rebased_path)

    for name, info in sorted(source_deps.items()):
        norm = normalize_name(name)
        if info['is_local']:
            if info['path']:
                rebased = rebase_path(info['path'], source_dir, target_dir)
                local_deps.append((name, rebased))
        else:
            pep508 = poetry_spec_to_pep508(name, info['spec'])
            if pep508:
                pip_deps.append((name, info['spec'], pep508))

    new_content = target_content
    pip_added = []
    local_added = []

    # --- Merge into PEP 621 dependencies[] ---
    lines = new_content.split('\n')
    in_deps = False
    deps_end_line = -1
    local_comment_line = -1
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('dependencies = ['):
            in_deps = True
            continue
        if in_deps:
            if stripped == ']':
                deps_end_line = i
                break
            if '# Local packages' in stripped and local_comment_line < 0:
                local_comment_line = i

    if deps_end_line > 0:
        new_pip_lines = []
        new_local_lines = []

        for name, spec, pep508 in pip_deps:
            if normalize_name(name) not in existing_pep621:
                new_pip_lines.append(f'  "{pep508}",')
                pip_added.append(name)

        for name, rebased in local_deps:
            if normalize_name(name) not in existing_pep621:
                new_local_lines.append(f'  "{name}",')
                local_added.append(name)

        # Insert pip deps before local comment (or before closing bracket)
        insert_pip_at = local_comment_line if local_comment_line > 0 else deps_end_line
        # Insert local deps before closing bracket
        insert_local_at = deps_end_line

        # Apply local first (higher line number) to preserve indices
        if new_local_lines:
            # Adjust for pip insertions
            adjusted = insert_local_at + len(new_pip_lines) if insert_pip_at <= insert_local_at else insert_local_at
            lines = lines[:adjusted] + new_local_lines + lines[adjusted:]
        if new_pip_lines:
            lines = lines[:insert_pip_at] + new_pip_lines + lines[insert_pip_at:]

        new_content = '\n'.join(lines)

    # --- Merge into [tool.uv.sources] ---
    uv_marker = '[tool.uv.sources]'
    if uv_marker in new_content:
        new_uv_lines = []
        for name, rebased in local_deps:
            if normalize_name(name) not in existing_uv:
                new_uv_lines.append(f'{name} = {{workspace = true}}')

        if new_uv_lines:
            marker_pos = new_content.find(uv_marker)
            after_marker = new_content[marker_pos + len(uv_marker):]
            next_section = re.search(r'\n\[', after_marker)
            if next_section:
                section_end = marker_pos + len(uv_marker) + next_section.start()
            else:
                section_end = len(new_content)
            new_content = (
                new_content[:section_end] +
                '\n' + '\n'.join(new_uv_lines) +
                new_content[section_end:]
            )

    # --- Merge into [tool.poetry.dependencies] ---
    poetry_marker = '[tool.poetry.dependencies]'
    if poetry_marker in new_content:
        new_poetry_pip = []
        new_poetry_local = []

        for name, spec, pep508 in pip_deps:
            if normalize_name(name) not in existing_poetry:
                # Copy the poetry line verbatim from source
                new_poetry_pip.append(f'{name} = {spec}')

        for name, rebased in local_deps:
            if normalize_name(name) not in existing_poetry:
                new_poetry_local.append(
                    f'{name} = {{path = "{rebased}", develop = true}}'
                )

        all_new_poetry = new_poetry_pip + new_poetry_local
        if all_new_poetry:
            marker_pos = new_content.find(poetry_marker)
            after_marker = new_content[marker_pos + len(poetry_marker):]

            # Try to insert before "# Local packages" comment
            local_comment = '# Local packages'
            local_pos = after_marker.find(local_comment)

            if local_pos >= 0:
                # Insert pip deps before local comment, local deps at end of section
                pip_insert = marker_pos + len(poetry_marker) + local_pos
                next_section = re.search(r'\n\[', after_marker)
                local_insert = marker_pos + len(poetry_marker) + next_section.start() if next_section else len(new_content)

                if new_poetry_local:
                    new_content = (
                        new_content[:local_insert] +
                        '\n' + '\n'.join(new_poetry_local) +
                        new_content[local_insert:]
                    )
                if new_poetry_pip:
                    new_content = (
                        new_content[:pip_insert] +
                        '\n'.join(new_poetry_pip) + '\n' +
                        new_content[pip_insert:]
                    )
            else:
                next_section = re.search(r'\n\[', after_marker)
                if next_section:
                    insert_pos = marker_pos + len(poetry_marker) + next_section.start()
                else:
                    insert_pos = len(new_content)
                new_content = (
                    new_content[:insert_pos] +
                    '\n' + '\n'.join(all_new_poetry) +
                    new_content[insert_pos:]
                )

    return new_content, pip_added, local_added


def main():
    parser = argparse.ArgumentParser(
        description='Merge dependencies from source pyproject.toml into target pyproject.toml'
    )
    parser.add_argument(
        'source',
        type=Path,
        help='Source pyproject.toml — all deps are read from [tool.poetry.dependencies]'
    )
    parser.add_argument(
        'target',
        type=Path,
        help='Target pyproject.toml — deps are merged into without duplication'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be changed without modifying files'
    )
    args = parser.parse_args()

    source_path: Path = args.source.resolve()
    target_path: Path = args.target.resolve()

    if not source_path.exists():
        print(f"ERROR: Source not found: {source_path}")
        sys.exit(1)
    if not target_path.exists():
        print(f"ERROR: Target not found: {target_path}")
        sys.exit(1)

    source_dir = source_path.parent
    target_dir = target_path.parent

    print(f"Source: {source_path}")
    print(f"Target: {target_path}")
    print()

    # Parse source deps
    source_content = source_path.read_text()
    source_deps = parse_poetry_deps(source_content)

    pip_count = sum(1 for d in source_deps.values() if not d['is_local'])
    local_count = sum(1 for d in source_deps.values() if d['is_local'])
    print(f"Source deps: {pip_count} pip-registry, {local_count} local path")

    # Parse and merge into target
    target_content = target_path.read_text()
    new_content, pip_added, local_added = merge_into_target(
        source_deps, target_content, source_dir, target_dir, dry_run=args.dry_run
    )

    if pip_added or local_added:
        if pip_added:
            print(f"\nAdded {len(pip_added)} pip-registry dep(s):")
            for name in sorted(pip_added):
                print(f"  + {name}")
        if local_added:
            print(f"\nAdded {len(local_added)} local package(s):")
            for name in sorted(local_added):
                print(f"  + {name}")

        if not args.dry_run:
            target_path.write_text(new_content)
            print(f"\nTarget updated: {target_path}")
        else:
            print("\nDRY RUN: No files modified.")
    else:
        print("\nTarget is already up to date — no changes needed.")


if __name__ == '__main__':
    main()
