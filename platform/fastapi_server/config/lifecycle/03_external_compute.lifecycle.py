"""
External/Cloud Compute Functions Registration Lifecycle

This lifecycle runs BEFORE 04_context_resolver to ensure external compute functions
are registered before YamlConfig overwrites are resolved.

Auto-loading from directories:
    Set EXTERNAL_COMPUTE_DIRS env var (colon-separated paths) to auto-load
    *.compute.py files from additional directories.

    Example: EXTERNAL_COMPUTE_DIRS=/app/cloud-compute:/app/provider-compute

Manual registration:
    Set app.state.external_compute_functions as a dict:
    {
        "function_name": {
            "fn": callable,  # The compute function (ctx) -> value
            "scope": ComputeScope.STARTUP  # or ComputeScope.REQUEST
        }
    }

    Or simply:
    {
        "function_name": callable  # defaults to STARTUP scope
    }

Cloud providers should import and call register_external_compute() to add their functions.
"""
import logging
import os
import glob
import importlib.util
from pathlib import Path
from fastapi import FastAPI
from typing import Callable, Dict, Any, Union, List

logger = logging.getLogger("lifecycle:external_compute")

try:
    from app_yaml_overwrites import ComputeScope
    HAS_COMPUTE_SCOPE = True
except ImportError:
    HAS_COMPUTE_SCOPE = False
    ComputeScope = None


def auto_load_from_directory(app: FastAPI, base_dir: str) -> List[str]:
    """
    Auto-load compute functions from *.compute.py files in a directory.

    Args:
        app: FastAPI application instance
        base_dir: Directory to scan

    Returns:
        List of loaded function names
    """
    base_path = Path(base_dir)
    if not base_path.exists():
        logger.debug("Directory does not exist, skipping: %s", base_dir)
        return []

    loaded = []
    pattern = str(base_path / "*.compute.py")

    for filepath in glob.glob(pattern):
        filepath = Path(filepath)
        module_name = filepath.stem
        func_name = module_name.replace(".compute", "")

        try:
            spec = importlib.util.spec_from_file_location(module_name, filepath)
            if spec is None or spec.loader is None:
                logger.warning("Could not load spec for %s", filepath)
                continue

            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)

            if not hasattr(module, "register"):
                logger.warning("%s does not export 'register' function, skipping", filepath)
                continue

            name = getattr(module, "NAME", func_name)
            scope = getattr(module, "SCOPE", ComputeScope.STARTUP if HAS_COMPUTE_SCOPE else None)

            # Store in external_compute_functions for later registration
            app.state.external_compute_functions[name] = {
                'fn': module.register,
                'scope': scope
            }
            loaded.append(name)
            logger.info("Loaded from %s: %s", base_dir, name)

        except Exception as e:
            logger.error("Error loading %s: %s", filepath, e, exc_info=True)

    return loaded


def register_external_compute(
    app: FastAPI,
    name: str,
    fn: Callable[[Dict[str, Any]], Any],
    scope: Any = None
) -> None:
    """
    Register an external compute function to be loaded before YAML resolution.

    Args:
        app: FastAPI application instance
        name: Function name (used as {{fn:name}} in YAML templates)
        fn: The compute function - receives ctx dict, returns value
        scope: ComputeScope.STARTUP (cached) or ComputeScope.REQUEST (per-call)
               Defaults to STARTUP if not specified
    """
    if not hasattr(app.state, 'external_compute_functions'):
        app.state.external_compute_functions = {}

    # Default to STARTUP scope
    if scope is None and HAS_COMPUTE_SCOPE:
        scope = ComputeScope.STARTUP

    app.state.external_compute_functions[name] = {
        'fn': fn,
        'scope': scope
    }
    logger.info("Registered external compute function: %s", name)


def register_external_compute_batch(
    app: FastAPI,
    functions: Dict[str, Union[Callable, Dict[str, Any]]]
) -> None:
    """
    Register multiple external compute functions at once.

    Args:
        app: FastAPI application instance
        functions: Dict mapping name -> fn or name -> {"fn": fn, "scope": scope}
    """
    for name, config in functions.items():
        if callable(config):
            register_external_compute(app, name, config)
        else:
            fn = config.get('fn')
            scope = config.get('scope')
            if fn:
                register_external_compute(app, name, fn, scope)


async def onStartup(app: FastAPI, config: dict):
    """
    Initialize external compute functions registry and auto-load from directories.

    Environment variables:
        EXTERNAL_COMPUTE_DIRS - Colon-separated paths to scan for *.compute.py files

    Cloud provider modules should have already called register_external_compute()
    before this lifecycle runs, or place files in EXTERNAL_COMPUTE_DIRS.
    """
    logger.info("Starting external_compute lifecycle hook...")
    try:
        logger.info("External compute registration lifecycle starting...")

        # Initialize the external_compute_functions dict if not exists
        if not hasattr(app.state, 'external_compute_functions'):
            app.state.external_compute_functions = {}

        # Auto-load from EXTERNAL_COMPUTE_DIRS environment variable
        external_dirs = os.environ.get('EXTERNAL_COMPUTE_DIRS', '')
        logger.debug(
            "Checking env var EXTERNAL_COMPUTE_DIRS: %s",
            "set" if external_dirs else "not set",
        )
        if external_dirs:
            dirs = [d.strip() for d in external_dirs.split(':') if d.strip()]
            logger.info("Loading from EXTERNAL_COMPUTE_DIRS: %s", dirs)

            for dir_path in dirs:
                loaded = auto_load_from_directory(app, dir_path)
                if loaded:
                    logger.info("Auto-loaded from %s: %s", dir_path, loaded)

        # Also check config for additional directories
        config_dirs = config.get('external_compute_dirs') or config.get('externalComputeDirs')
        if config_dirs and isinstance(config_dirs, list):
            logger.debug("Loading from config-defined directories: %s", config_dirs)
            for dir_path in config_dirs:
                loaded = auto_load_from_directory(app, dir_path)
                if loaded:
                    logger.info("Auto-loaded from config dir %s: %s", dir_path, loaded)

        # Log current state
        registered = list(app.state.external_compute_functions.keys())
        if registered:
            logger.info("Total external functions ready: %s", registered)
        else:
            logger.info("No external compute functions loaded")

        logger.info("external_compute lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("external_compute lifecycle hook failed: %s", exc, exc_info=True)
        raise
