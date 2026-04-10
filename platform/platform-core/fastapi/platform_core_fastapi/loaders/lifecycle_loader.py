"""Lifecycle loader — discovers and loads *.lifecycle.py files.

Contract (5 steps):
1. Discover  — glob *.lifecycle.py files in lifecycles directory
2. Validate  — check file is readable
3. Import    — load via importlib.util
4. Register  — collect onInit / onStartup / onShutdown hooks
5. Report    — return hooks and loader report dict
"""
import importlib.util
import logging
import re
from pathlib import Path
from typing import Any, Callable, Dict, List

log = logging.getLogger("platform.loaders.lifecycle")


def _sort_by_numeric_prefix(files: List[Path]) -> List[Path]:
    def get_prefix(path: Path) -> int:
        match = re.match(r'^(\d+)', path.name)
        return int(match.group(1)) if match else 0
    return sorted(files, key=get_prefix)


def load_lifecycles(lifecycle_dir) -> Dict[str, Any]:
    """Discover and load all *.lifecycle.py files, collecting hooks.

    Args:
        lifecycle_dir: A single Path (or str) or a list of Paths to search.
                       All directories are scanned; files are merged and sorted
                       by numeric prefix before loading.

    Returns:
        {
            'init_hooks': [...],
            'startup_hooks': [...],
            'shutdown_hooks': [...],
            'report': { loader report dict },
        }
    """
    loader = "lifecycle_loader"
    init_hooks: List[Callable] = []
    startup_hooks: List[Callable] = []
    shutdown_hooks: List[Callable] = []
    discovered = []
    validated = []
    registered = []
    skipped = []
    errors = []

    # Normalise to a list of resolved Path objects
    if isinstance(lifecycle_dir, (str, Path)):
        dirs = [Path(lifecycle_dir)]
    else:
        dirs = [Path(d) for d in lifecycle_dir]

    active_dirs = [d for d in dirs if d.exists()]
    if not active_dirs:
        for d in dirs:
            log.debug("Lifecycle directory not found, skipping: %s", d)
        return {
            "init_hooks": [], "startup_hooks": [], "shutdown_hooks": [],
            "report": {
                "loader": loader, "discovered": 0, "validated": 0,
                "registered": 0, "skipped": 0, "errors": [],
            },
        }

    raw_files: List[Path] = []
    for d in active_dirs:
        raw_files.extend(d.glob("*.lifecycle.py"))
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
            if not (spec and spec.loader):
                skipped.append(name)
                continue
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
        except Exception as exc:
            log.error("Failed to load lifecycle module %s: %s", name, exc)
            errors.append(f"{name}: {exc}")
            continue

        hooks_found = []
        if hasattr(module, "onInit"):
            init_hooks.append(module.onInit)
            hooks_found.append("onInit")
        if hasattr(module, "onStartup"):
            startup_hooks.append(module.onStartup)
            hooks_found.append("onStartup")
        if hasattr(module, "onShutdown"):
            shutdown_hooks.append(module.onShutdown)
            hooks_found.append("onShutdown")

        registered.append(name)
        log.debug("Lifecycle module loaded: %s (hooks: %s)", name, hooks_found)

    report = {
        "loader": loader,
        "discovered": len(discovered),
        "validated": len(validated),
        "registered": len(registered),
        "skipped": len(skipped),
        "errors": errors,
        "init_hooks": len(init_hooks),
        "startup_hooks": len(startup_hooks),
        "shutdown_hooks": len(shutdown_hooks),
    }
    log.info("Lifecycle modules loaded (count=%d, startup=%d, shutdown=%d)",
             len(registered), len(startup_hooks), len(shutdown_hooks))

    return {
        "init_hooks": init_hooks,
        "startup_hooks": startup_hooks,
        "shutdown_hooks": shutdown_hooks,
        "report": report,
    }
