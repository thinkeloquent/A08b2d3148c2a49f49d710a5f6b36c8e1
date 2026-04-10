import asyncio
import copy
import importlib.util
import os
import re
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, List

import uvicorn
from fastapi import FastAPI, Request

from .logger import logger

log = logger.create("server", __file__)


def sort_by_numeric_prefix(files: List[Path]) -> List[Path]:
    """
    Sort files numerically by their leading number prefix.
    e.g., "01_foo.py" < "02_bar.py" < "20_baz.py" < "100_qux.py"
    """
    def get_prefix(path: Path) -> int:
        match = re.match(r'^(\d+)', path.name)
        return int(match.group(1)) if match else 0
    return sorted(files, key=get_prefix)

# --- Interface Implementation ---

def init(config: Dict[str, Any]) -> FastAPI:
    """Initialize and return a fully bootstrapped FastAPI instance.

    Handles the complete bootstrap sequence:
    1. Load environment modules (e.g., vault integration)
    2. Load lifecycle modules and extract hooks
    3. Create FastAPI app with lifespan management
    4. Execute onInit hooks
    5. Autoload routes
    6. Configure middleware (request state, request context)
    """
    log.debug("Initializing FastAPI server", {"title": config.get("title")})

    bootstrap = config.get("bootstrap", {})
    startup_hooks = []
    shutdown_hooks = []

    # Bootstrap: glob and execute env loader modules from directory
    if bootstrap.get("load_env"):
        env_dir = Path(bootstrap["load_env"])
        log.debug("Loading environment modules", {"path": str(env_dir)})
        if env_dir.exists():
            module_files = sort_by_numeric_prefix(list(env_dir.glob("*.env.py")))
            log.trace("Found env modules", {"count": len(module_files), "files": [str(f) for f in module_files]})
            for module_path in module_files:
                log.debug("Loading env module", {"module": str(module_path)})
                spec = importlib.util.spec_from_file_location(module_path.stem, str(module_path))
                if spec and spec.loader:
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)
            log.info("Environment modules loaded", {"count": len(module_files)})
        else:
            log.warn("Environment directory does not exist", {"path": str(env_dir)})

    # Bootstrap: glob and load lifecycle modules from directory
    init_hooks = []
    if bootstrap.get("lifecycle"):
        lifecycle_dir = Path(bootstrap["lifecycle"])
        log.debug("Loading lifecycle modules", {"path": str(lifecycle_dir)})
        if lifecycle_dir.exists():
            module_files = sort_by_numeric_prefix(list(lifecycle_dir.glob("*.lifecycle.py")))
            log.trace("Found lifecycle modules", {"count": len(module_files), "files": [str(f) for f in module_files]})
            for module_path in module_files:
                log.debug("Loading lifecycle module", {"module": str(module_path)})
                spec = importlib.util.spec_from_file_location(module_path.stem, str(module_path))
                if spec and spec.loader:
                    try:
                        module = importlib.util.module_from_spec(spec)
                        spec.loader.exec_module(module)
                    except Exception as exc:
                        log.error("Failed to load lifecycle module", {"module": str(module_path), "error": str(exc)})
                        continue
                    if hasattr(module, "onInit"):
                        init_hooks.append(module.onInit)
                    if hasattr(module, "onStartup"):
                        startup_hooks.append(module.onStartup)
                    if hasattr(module, "onShutdown"):
                        shutdown_hooks.append(module.onShutdown)
            log.info("Lifecycle modules loaded", {"count": len(module_files), "initHooks": len(init_hooks), "startupHooks": len(startup_hooks), "shutdownHooks": len(shutdown_hooks)})
        else:
            log.warn("Lifecycle directory does not exist", {"path": str(lifecycle_dir)})

    # Create FastAPI app with lifespan
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # Startup: Execute registered startup hooks
        startup_hooks = getattr(app.state, "startup_hooks", [])
        config = getattr(app.state, "bootstrap_config", {})

        # Run startup hooks with (server, config)
        log.debug("Executing startup hooks", {"count": len(startup_hooks)})
        for hook in startup_hooks:
            hook_name = getattr(hook, "__name__", "anonymous")
            log.trace("Running startup hook", {"hookName": hook_name})
            try:
                if asyncio.iscoroutinefunction(hook):
                    await hook(app, config)
                else:
                    hook(app, config)
            except Exception as exc:
                log.error("Startup hook failed", {"hookName": hook_name, "error": str(exc)})
        log.info("Startup hooks completed", {"count": len(startup_hooks)})

        yield

        # Shutdown: Execute registered shutdown hooks
        shutdown_hooks = getattr(app.state, "shutdown_hooks", [])

        # Run shutdown hooks with (server, config)
        log.info("Executing shutdown hooks", {"count": len(shutdown_hooks)})
        for hook in shutdown_hooks:
            hook_name = getattr(hook, "__name__", "anonymous")
            log.trace("Running shutdown hook", {"hookName": hook_name})
            try:
                if asyncio.iscoroutinefunction(hook):
                    await hook(app, config)
                else:
                    hook(app, config)
            except Exception as exc:
                log.error("Shutdown hook failed", {"hookName": hook_name, "error": str(exc)})
        log.info("Shutdown hooks completed")

    app = FastAPI(
        title=config.get("title", "API Server"),
        lifespan=lifespan
    )

    # Execute onInit hooks immediately (before middleware stack is built)
    # Use onInit for registering exception handlers, middleware, or other
    # setup that must happen before the ASGI app receives its first event.
    if init_hooks:
        log.debug("Executing init hooks", {"count": len(init_hooks)})
        for hook in init_hooks:
            hook_name = getattr(hook, "__name__", "anonymous")
            log.debug("Running init hook", {"hookName": hook_name})
            hook(app, config)
        log.info("Init hooks completed", {"count": len(init_hooks)})

    # Store hooks and config in app state for use in lifespan
    # Use bootstrap_config to avoid overwriting AppYamlConfig on app.state.config
    log.debug("Storing hooks and config in app state")
    app.state.startup_hooks = startup_hooks
    app.state.shutdown_hooks = shutdown_hooks
    app.state.bootstrap_config = config

    # Bootstrap: autoload routes
    from .autoload_routes import autoload_routes
    autoload_routes(app, bootstrap)

    # Feature: Initial Request State (REQ0002 - State Machine Pattern)
    # If config provides 'initial_state', initialize request.state with StateContainer
    initial_state = config.get("initial_state")
    if initial_state:
        log.debug("Configuring initial request state", {"keys": list(initial_state.keys())})
        app.state.initial_state = initial_state

        @app.middleware("http")
        async def init_request_state_middleware(request: Request, call_next):
            # Check if StateContainer class was provided by lifecycle hook (04_state_machine.py)
            StateContainerClass = getattr(request.app.state, 'StateContainerClass', None)
            initial = request.app.state.initial_state

            if StateContainerClass:
                # Use StateContainer pattern (REQ0002)
                # Note: cannot replace request.state directly due to Starlette's
                # _CachedRequest (from BaseHTTPMiddleware) lacking a state setter.
                # Instead, populate the existing state object with attributes.
                mode = initial.get("mode", "idle")
                context = copy.deepcopy(initial.get("context", {}))
                container = StateContainerClass(mode, context)
                request.state.state_container = container
                request.state.mode = container.mode
                request.state.context = container.context
                log.trace("Request state initialized with StateContainer", {"path": str(request.url.path), "mode": mode})
            else:
                # Fallback: set attributes directly on request.state
                state_copy = copy.deepcopy(initial)
                if isinstance(state_copy, dict):
                    for key, value in state_copy.items():
                        setattr(request.state, key, value)
                log.trace("Request state initialized (fallback)", {"path": str(request.url.path)})

            response = await call_next(request)
            return response

        log.info("Initial request state feature enabled")

    # Feature: Request Context Decorators (REQ0001 - Platform Tools)
    # Initialize request.context with sharedContext, context_registry, config_sdk
    @app.middleware("http")
    async def init_request_context_middleware(request: Request, call_next):
        from types import SimpleNamespace

        # Initialize request.context as SimpleNamespace for platform tools
        # This is SEPARATE from request.state (State Machine)
        request.context = SimpleNamespace()

        # Create child SharedContext for this request
        shared_context = getattr(request.app.state, 'sharedContext', None)
        if shared_context and hasattr(shared_context, 'create_child'):
            request.context.sharedContext = shared_context.create_child()
        else:
            request.context.sharedContext = shared_context

        # Copy context_registry to request.context
        context_registry = getattr(request.app.state, 'context_registry', None)
        if context_registry:
            request.context.context_registry = context_registry

        # Copy sdk to request.context (as config_sdk for consistency with Fastify)
        sdk = getattr(request.app.state, 'sdk', None)
        if sdk:
            request.context.config_sdk = sdk

        log.trace("Request context initialized", {"path": str(request.url.path)})

        response = await call_next(request)
        return response

    log.info("Request context decorators feature enabled")

    log.info("FastAPI server initialized", {"title": config.get("title")})
    return app


async def start(server: FastAPI, config: Dict[str, Any]) -> None:
    """Start the server with uvicorn."""
    log.info("Starting server", {"title": config.get("title")})

    # Configure Uvicorn
    host = config.get("host", "0.0.0.0")
    port = int(os.getenv("PORT", config.get("port", 8080)))
    log_level = config.get("log_level", "info").lower()

    log.info("Configuring Uvicorn server", {"host": host, "port": port, "log_level": log_level})
    uvicorn_config = uvicorn.Config(
        server,
        host=host,
        port=port,
        log_level=log_level,
    )

    server_instance = uvicorn.Server(uvicorn_config)

    # Uvicorn handles SIGINT/SIGTERM and triggers lifespan shutdown.
    log.info("Starting HTTP listener", {"host": host, "port": port})
    await server_instance.serve()
    log.info("Server stopped")


async def stop(server: FastAPI, config: Dict[str, Any]) -> None:
    """
    Gracefully stop the server.
    Note: When running with uvicorn.run or Server.serve(),
    stopping is usually handled by signal interruption.
    This method is exposed for programmatic stopping if needed,
    but typically uvicorn handles the loop.
    """
    log.info("Stop requested", {"title": config.get("title")})
    log.debug("Stop is a placeholder - uvicorn handles shutdown via signals")
    pass
