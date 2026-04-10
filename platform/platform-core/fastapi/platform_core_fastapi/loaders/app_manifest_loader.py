"""App manifest loader — discovers app.manifest.yaml files and registers FastAPI routers.

Contract (5 steps):
1. Discover  — glob app.manifest.yaml files in the apps directory
2. Validate  — runtime must be 'fastapi', required fields present
3. Import    — dynamically load the app's router module
4. Register  — include the router in the FastAPI app
5. Report    — return loader report dict
"""
import importlib.util
import logging
from pathlib import Path
from typing import Any, Dict, List

import yaml
from fastapi import FastAPI

log = logging.getLogger("platform.loaders.app_manifests")

REQUIRED_FIELDS = ("id", "runtime")


def _validate_manifest(manifest: Dict[str, Any]) -> List[str]:
    errs = []
    for field in REQUIRED_FIELDS:
        if field not in manifest:
            errs.append(f"missing required field '{field}'")
    if "runtime" in manifest and manifest["runtime"] != "fastapi":
        errs.append(f"runtime '{manifest['runtime']}' is not 'fastapi'")
    backend = manifest.get("backend", {})
    if not backend.get("entrypoint"):
        errs.append("missing backend.entrypoint")
    return errs


def _profile_matches(manifest: Dict[str, Any], active_profile: str) -> bool:
    profiles = manifest.get("profiles")
    exclude_profiles = manifest.get("exclude_profiles", [])
    if exclude_profiles and active_profile in exclude_profiles:
        return False
    if profiles and active_profile not in profiles:
        return False
    return True


def load_app_manifests(app: FastAPI, apps_dir: Path, active_profile: str) -> Dict[str, Any]:
    """Discover app.manifest.yaml files, validate them, and register routers."""
    loader = "app_manifest_loader"
    discovered = []
    validated = []
    registered = []
    skipped = []
    errors = []
    loaded_apps = []
    skipped_apps = []
    manifests_with_frontend = []

    if not apps_dir.exists():
        log.debug("Apps directory not found, skipping: %s", apps_dir)
        return {
            "loaded_apps": [], "skipped_apps": [], "manifests_with_frontend": [],
            "report": {
                "loader": loader, "discovered": 0, "validated": 0,
                "registered": 0, "skipped": 0, "errors": [],
            },
        }

    manifest_files = sorted(apps_dir.rglob("app.manifest.yaml"))
    discovered = [str(f.relative_to(apps_dir)) for f in manifest_files]

    for manifest_path in manifest_files:
        rel = str(manifest_path.relative_to(apps_dir))
        app_dir = manifest_path.parent

        try:
            with open(manifest_path, "r") as fh:
                manifest = yaml.safe_load(fh) or {}
        except Exception as exc:
            errors.append(f"{rel}: {exc}")
            skipped_apps.append(rel)
            continue

        validation_errors = _validate_manifest(manifest)
        if validation_errors:
            skipped.append(rel)
            skipped_apps.append(manifest.get("id", rel))
            continue

        app_name = manifest["id"]
        if not _profile_matches(manifest, active_profile):
            skipped.append(rel)
            skipped_apps.append(app_name)
            continue

        validated.append(rel)
        backend = manifest.get("backend", {})
        router_rel = backend.get("entrypoint", "")
        router_path = Path(router_rel)
        if not router_path.is_absolute():
            router_path = (app_dir / router_rel).resolve()

        if not router_path.exists():
            errors.append(f"{app_name}: router not found at {router_path}")
            skipped_apps.append(app_name)
            continue

        try:
            module_name = f"_platform_app_{app_name.replace('-', '_').replace('.', '_')}"
            spec = importlib.util.spec_from_file_location(module_name, str(router_path))
            if not (spec and spec.loader):
                raise ImportError(f"Cannot create spec for {router_path}")
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
        except Exception as exc:
            errors.append(f"{app_name}: {exc}")
            skipped_apps.append(app_name)
            continue

        if not hasattr(module, "router"):
            errors.append(f"{app_name}: missing 'router' attribute")
            skipped_apps.append(app_name)
            continue

        try:
            api_prefix = backend.get("apiPrefix", f"/api/{app_name}")
            app.include_router(module.router, prefix=api_prefix)
            registered.append(rel)
            loaded_apps.append(app_name)
        except Exception as exc:
            errors.append(f"{app_name}: {exc}")
            skipped_apps.append(app_name)
            continue

        frontend_config = manifest.get("frontend", {})
        if frontend_config.get("bundlePath"):
            manifests_with_frontend.append({
                "name": app_name, "manifest": manifest, "app_dir": app_dir,
            })

    report = {
        "loader": loader,
        "discovered": len(discovered),
        "validated": len(validated),
        "registered": len(registered),
        "skipped": len(skipped),
        "errors": errors,
    }
    log.info("App manifests loaded (loaded=%d, skipped=%d)", len(loaded_apps), len(skipped_apps))

    return {
        "loaded_apps": loaded_apps,
        "skipped_apps": skipped_apps,
        "manifests_with_frontend": manifests_with_frontend,
        "report": report,
    }
