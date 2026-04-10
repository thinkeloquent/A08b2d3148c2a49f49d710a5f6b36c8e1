"""Route loader — discovers and mounts *.routes.py and *.route.py files.

Contract (5 steps):
1. Discover  — glob route files in routes directory
2. Validate  — check file exports a mount() function
3. Import    — load via importlib.util
4. Register  — call mount(app) for each module
5. Report    — return loader report dict
"""
import importlib.util
import logging
import re
from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI

log = logging.getLogger("platform.loaders.routes")


def _sort_by_numeric_prefix(files: List[Path]) -> List[Path]:
    def get_prefix(path: Path) -> int:
        match = re.match(r'^(\d+)', path.name)
        return int(match.group(1)) if match else 0
    return sorted(files, key=get_prefix)


def load_routes(app: FastAPI, routes_dir) -> Dict[str, Any]:
    """Discover and mount all route files against the FastAPI app.

    Args:
        app: The FastAPI instance to mount routes onto.
        routes_dir: A single Path (or str) or a list of Paths to search.
                    All directories are scanned; files are merged and sorted
                    by numeric prefix before mounting.
    """
    loader = "route_loader"
    discovered = []
    validated = []
    registered = []
    skipped = []
    errors = []

    # Normalise to a list of resolved Path objects
    if isinstance(routes_dir, (str, Path)):
        dirs = [Path(routes_dir)]
    else:
        dirs = [Path(d) for d in routes_dir]

    active_dirs = [d for d in dirs if d.exists()]
    if not active_dirs:
        for d in dirs:
            log.debug("Routes directory not found, skipping: %s", d)
        return {
            "loader": loader, "discovered": 0, "validated": 0,
            "registered": 0, "skipped": 0, "errors": [],
        }

    # Support both *.routes.py and *.route.py during migration
    routes_files: set = set()
    for d in active_dirs:
        routes_files.update(d.glob("*.routes.py"))
        routes_files.update(d.glob("*.route.py"))
    module_files = _sort_by_numeric_prefix(list(routes_files))
    discovered = [f.name for f in module_files]

    for module_path in module_files:
        name = module_path.name
        try:
            spec = importlib.util.spec_from_file_location(module_path.stem, str(module_path))
            if not (spec and spec.loader):
                skipped.append(name)
                continue
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
        except Exception as exc:
            log.error("Failed to import route module %s: %s", name, exc)
            errors.append(f"{name}: {exc}")
            continue

        if not hasattr(module, "mount"):
            skipped.append(name)
            continue
        validated.append(name)

        try:
            module.mount(app)
            registered.append(name)
        except Exception as exc:
            log.error("Route mount() failed for %s: %s", name, exc)
            errors.append(f"{name}: {exc}")

    return {
        "loader": loader,
        "discovered": len(discovered),
        "validated": len(validated),
        "registered": len(registered),
        "skipped": len(skipped),
        "errors": errors,
    }
