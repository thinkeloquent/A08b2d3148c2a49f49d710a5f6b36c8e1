"""Static frontend loader — mounts built frontend bundles as static file servers.

Contract (5 steps):
1. Discover  — receive list of manifests that declare frontend.bundlePath
2. Validate  — check that the dist directory actually exists on disk
3. Import    — (N/A — uses starlette.staticfiles directly)
4. Register  — mount StaticFiles at the declared mount path
5. Report    — return loader report dict
"""
import logging
from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI
from starlette.staticfiles import StaticFiles

log = logging.getLogger("platform.loaders.static_frontends")


def load_static_frontends(
    app: FastAPI,
    manifests_with_frontend: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Mount static file servers for each frontend bundle found in manifests."""
    loader = "static_frontend_loader"
    discovered = []
    validated = []
    registered = []
    skipped = []
    errors = []

    discovered = [entry["name"] for entry in manifests_with_frontend]

    for entry in manifests_with_frontend:
        app_name = entry["name"]
        manifest = entry["manifest"]
        app_dir = entry["app_dir"]

        frontend_config = manifest.get("frontend", {})
        bundle_path_raw = frontend_config.get("bundlePath", "")
        mount_path = frontend_config.get("mountPath", f"/{app_name}/static")

        if not bundle_path_raw:
            skipped.append(app_name)
            continue

        bundle_path = Path(bundle_path_raw)
        if not bundle_path.is_absolute():
            bundle_path = (app_dir / bundle_path).resolve()

        if not bundle_path.exists() or not bundle_path.is_dir():
            skipped.append(app_name)
            continue

        validated.append(app_name)

        try:
            app.mount(
                mount_path,
                StaticFiles(directory=str(bundle_path), html=True),
                name=f"static_{app_name}",
            )
            registered.append(app_name)
            log.info("Frontend mounted: %s at %s", app_name, mount_path)
        except Exception as exc:
            log.error("Failed to mount frontend %s: %s", app_name, exc)
            errors.append(f"{app_name}: {exc}")

    return {
        "loader": loader,
        "discovered": len(discovered),
        "validated": len(validated),
        "registered": len(registered),
        "skipped": len(skipped),
        "errors": errors,
    }
