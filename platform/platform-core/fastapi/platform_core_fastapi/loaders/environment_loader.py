"""Environment loader — discovers and executes *.env.py files.

Contract (5 steps):
1. Discover  — glob *.env.py files in the environment directory
2. Validate  — check file is readable
3. Import    — load via importlib.util (files self-execute on load)
4. Register  — nothing to register; side-effects happen at import time
5. Report    — return loader report dict
"""
import importlib.util
import logging
import re
from pathlib import Path
from typing import Any, Dict, List

log = logging.getLogger("platform.loaders.environment")


def _sort_by_numeric_prefix(files: List[Path]) -> List[Path]:
    def get_prefix(path: Path) -> int:
        match = re.match(r'^(\d+)', path.name)
        return int(match.group(1)) if match else 0
    return sorted(files, key=get_prefix)


def load_environment(env_dir) -> Dict[str, Any]:
    """Discover, load, and self-execute all *.env.py files in env_dir.

    Args:
        env_dir: A single Path (or str) or a list of Paths to search.
                 All directories are scanned; files are merged and sorted
                 by numeric prefix before execution.
    """
    loader = "environment_loader"
    discovered = []
    validated = []
    registered = []
    skipped = []
    errors = []

    # Normalise to a list of resolved Path objects
    if isinstance(env_dir, (str, Path)):
        dirs = [Path(env_dir)]
    else:
        dirs = [Path(d) for d in env_dir]

    active_dirs = [d for d in dirs if d.exists()]
    if not active_dirs:
        for d in dirs:
            log.debug("Environment directory not found, skipping: %s", d)
        return {
            "loader": loader, "discovered": 0, "validated": 0,
            "registered": 0, "skipped": 0, "errors": [],
        }

    raw_files: List[Path] = []
    for d in active_dirs:
        raw_files.extend(d.glob("*.env.py"))
    module_files = _sort_by_numeric_prefix(raw_files)
    discovered = [f.name for f in module_files]

    for module_path in module_files:
        name = module_path.name
        if not module_path.is_file():
            skipped.append(name)
            continue
        validated.append(name)

        try:
            spec = importlib.util.spec_from_file_location(module_path.stem, str(module_path))
            if spec and spec.loader:
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                registered.append(name)
            else:
                skipped.append(name)
        except Exception as exc:
            log.error("Failed to load env module %s: %s", name, exc)
            errors.append(f"{name}: {exc}")

    report = {
        "loader": loader,
        "discovered": len(discovered),
        "validated": len(validated),
        "registered": len(registered),
        "skipped": len(skipped),
        "errors": errors,
    }
    log.info("Environment modules loaded (count=%d)", len(registered))
    return report
