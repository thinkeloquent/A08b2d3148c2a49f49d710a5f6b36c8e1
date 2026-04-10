import logging
import os
import glob
import importlib.util
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI

logger = logging.getLogger("lifecycle:context_resolver")

# Load registry module (numeric prefix prevents standard imports)
_registry_spec = importlib.util.spec_from_file_location(
    "context_resolver_registry",
    Path(__file__).parent / "04_context_resolver_registry.py",
)
_registry_mod = importlib.util.module_from_spec(_registry_spec)
_registry_spec.loader.exec_module(_registry_mod)
register_compute_functions = _registry_mod.register_compute_functions

try:
    from app_yaml_overwrites import create_registry, ComputeScope, create_sdk, create_shared_context
    from app_yaml_overwrites.integrations.fastapi import resolve_startup
    HAS_RESOLVER = True
except ImportError:
    HAS_RESOLVER = False


def auto_load_compute_functions(registry, base_dir=None):
    """
    Auto-load compute functions from *.compute.py files in computed_functions directory.

    Each file should expose:
    - register: callable - The compute function to register
    - NAME (optional): str - Name to register under (defaults to filename without .compute.py)
    - SCOPE (optional): ComputeScope - Scope for the function (defaults to ComputeScope.STARTUP)
    """
    if base_dir is None:
        base_dir = Path(__file__).parent.parent.parent / "computed_functions"
    else:
        base_dir = Path(base_dir)

    if not base_dir.exists():
        logger.debug("computed_functions directory not found: %s", base_dir)
        return []

    loaded = []
    pattern = str(base_dir / "*.compute.py")

    # Log files that don't match the *.compute.py pattern
    all_py_files = list(base_dir.glob("*.py"))
    compute_files = [Path(f) for f in glob.glob(pattern)]
    ignored_files = [f for f in all_py_files if f not in compute_files]
    if ignored_files:
        logger.debug(
            "Ignored files in computed_functions/ (don't match *.compute.py pattern): %s",
            [f.name for f in ignored_files],
        )

    for filepath in glob.glob(pattern):
        filepath = Path(filepath)
        module_name = filepath.stem  # e.g., "my_func.compute"
        func_name = module_name.replace(".compute", "")  # e.g., "my_func"

        try:
            # Dynamic import
            spec = importlib.util.spec_from_file_location(module_name, filepath)
            if spec is None or spec.loader is None:
                logger.warning("Could not load spec for %s", filepath)
                continue

            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)

            # Get required register function
            if not hasattr(module, "register"):
                logger.warning("%s does not export 'register' function, skipping", filepath)
                continue

            register_func = module.register

            # Get optional NAME (defaults to filename)
            name = getattr(module, "NAME", func_name)

            # Get optional SCOPE (defaults to STARTUP)
            scope = getattr(module, "SCOPE", ComputeScope.STARTUP)

            # Register the function
            registry.register(name, register_func, scope)
            loaded.append(name)
            logger.debug("Loaded compute function: %s (scope: %s)", name, scope)

        except Exception as e:
            logger.error("Error loading compute function from %s: %s", filepath, e, exc_info=True)

    return loaded




async def onStartup(app: FastAPI, config: dict):
    """Initialize app_yaml_overwrites on startup."""
    logger.info("Starting context_resolver lifecycle hook...")
    try:
        if not HAS_RESOLVER:
            logger.warning("app_yaml_overwrites not installed, context resolver skipping.")
            return

        logger.info("Initializing app_yaml_overwrites...")

        # Get config from app.state (set by 01_app_yaml)
        app_config = getattr(app.state, "config", None)
        if not app_config:
            logger.warning("app.state.config not found. Context resolver skipping.")
            return

        logger.debug("Retrieved app_config from app.state")

        # Get raw config dictionary
        if hasattr(app_config, "get_all"):
            raw_config = app_config.get_all()
        elif hasattr(app_config, "to_dict"):
            raw_config = app_config.to_dict()
        else:
            raw_config = {}

        registry = create_registry()
        logger.debug("Created compute registry")
        register_compute_functions(registry, ComputeScope)
        logger.debug("Registered built-in compute functions")

        # Auto-load compute functions from computed_functions directory
        auto_loaded = auto_load_compute_functions(registry)
        if auto_loaded:
            logger.info("Auto-loaded compute functions: %s", auto_loaded)
        else:
            logger.debug("No auto-loaded compute functions found")

        # Register external/cloud compute functions from app.state
        # These should be set by an earlier lifecycle (e.g., 02.5_cloud_compute.lifecycle.py)
        external_compute_functions = getattr(app.state, 'external_compute_functions', None)
        if external_compute_functions:
            external_loaded = []
            for name, func_config in external_compute_functions.items():
                try:
                    fn = func_config.get('fn') if isinstance(func_config, dict) else func_config
                    scope = func_config.get('scope', ComputeScope.STARTUP) if isinstance(func_config, dict) else ComputeScope.STARTUP
                    registry.register(name, fn, scope)
                    external_loaded.append(name)
                except Exception as e:
                    logger.error("Error registering external compute function '%s': %s", name, e, exc_info=True)
            if external_loaded:
                logger.info("Registered external compute functions: %s", external_loaded)
        else:
            logger.debug("No external compute functions found on app.state")

        # Store registry on app.state for route access
        app.state.context_registry = registry
        app.state.context_raw_config = raw_config

        # Create SDK (Standard Compliance)
        app.state.sdk = create_sdk({"config": raw_config, "registry": registry})
        logger.debug("Created SDK and stored on app.state")

        # SharedContext is now created in 02_create_shared_context.py
        # Just use existing or create fallback
        shared_context = getattr(app.state, 'sharedContext', None) or create_shared_context()
        if getattr(app.state, 'sharedContext', None) is None:
            app.state.sharedContext = shared_context
            logger.info("Created fallback SharedContext instance")
        else:
            logger.info("Using existing app.state.sharedContext from 02_create_shared_context.py")

        # Resolve STARTUP config and store in app.state.resolved_config
        logger.info("Resolving STARTUP-scoped compute functions...")
        await resolve_startup(
            app=app,
            config=raw_config,
            registry=registry,
            state_property="resolved_config",
            shared_context=shared_context
        )
        logger.debug("STARTUP resolution complete")

        # Log all registered compute functions
        all_functions = registry.list()
        logger.info("app_yaml_overwrites initialized.")
        logger.info("Registered compute functions (%d):", len(all_functions))
        for func_name in all_functions:
            logger.debug("  - %s", func_name)

        logger.info("context_resolver lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("context_resolver lifecycle hook failed: %s", exc, exc_info=True)
        raise
