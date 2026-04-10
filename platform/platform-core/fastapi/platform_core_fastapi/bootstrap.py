"""
Platform Core FastAPI — Bootstrap

Server factory with full lifecycle management.
Supports booting with ZERO apps (empty server with just health).

Loader order: environment -> lifecycle -> plugins -> routes -> app-manifest -> static-frontend
"""

import asyncio
import copy
import logging
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

import uvicorn
from fastapi import FastAPI, Request

from platform_core_fastapi.config import PlatformConfig

log = logging.getLogger('platform.bootstrap')


def _resolve_path(base_dir: Path, raw_path: str) -> Path:
    """Resolve a path that may be relative (to base_dir) or absolute."""
    p = Path(raw_path)
    if p.is_absolute():
        return p
    return (base_dir / p).resolve()


def setup(config: Optional[PlatformConfig] = None) -> FastAPI:
    """Create and return a fully bootstrapped FastAPI instance.

    Handles the complete bootstrap sequence:
    1. Load environment modules
    2. Load lifecycle modules and extract hooks
    3. Create FastAPI app with lifespan management
    4. Execute onInit hooks
    5. Load route modules
    6. Load app manifests
    7. Mount static frontends
    8. Configure request state middleware
    """
    if config is None:
        config = PlatformConfig()

    # Convert PlatformConfig to dict for backwards compatibility with existing
    # lifecycle hooks that call config.get(...). The dict is passed to hooks
    # while the dataclass is used internally.
    from dataclasses import asdict
    if hasattr(config, '__dataclass_fields__'):
        config_dict = asdict(config)
    elif isinstance(config, dict):
        config_dict = config
    else:
        config_dict = vars(config) if hasattr(config, '__dict__') else {}

    boot_time = time.time()
    base_dir = Path(__file__).parent.resolve()

    log.info('Platform bootstrap starting (title=%s, profile=%s)', config.title, config.profile)

    paths = config.paths if isinstance(config.paths, dict) else config_dict.get('paths', {})

    def _merge_paths(config_val) -> list:
        """Resolve a paths entry into a list of absolute Path objects.

        Accepts a string, a list of strings, or None (returns empty list).
        Each item may be relative (resolved against base_dir) or absolute.
        """
        if config_val is None:
            return []
        items = [config_val] if isinstance(config_val, str) else list(config_val)
        return [_resolve_path(base_dir, p) for p in items]

    lifecycle_dirs = _merge_paths(paths.get('lifecycles'))
    routes_dirs = _merge_paths(paths.get('routes'))
    apps_dir = _resolve_path(base_dir, paths.get('apps', '../../fastapi_apps'))

    # --- Phase 1: Environment loader ---
    # Derive environment dirs as siblings of each lifecycle dir
    env_report = {}
    try:
        from platform_core_fastapi.loaders.environment_loader import load_environment
        env_dirs = [d.parent / 'environment' for d in lifecycle_dirs]
        env_report = load_environment(env_dirs)
        log.info('Environment loader complete')
    except ImportError:
        log.debug('Environment loader not available')

    # --- Phase 2: Lifecycle loader ---
    init_hooks = []
    startup_hooks = []
    shutdown_hooks = []
    lifecycle_report = {}
    try:
        from platform_core_fastapi.loaders.lifecycle_loader import load_lifecycles
        lifecycle_result = load_lifecycles(lifecycle_dirs)
        lifecycle_report = lifecycle_result['report']
        init_hooks = lifecycle_result['init_hooks']
        startup_hooks = lifecycle_result['startup_hooks']
        shutdown_hooks = lifecycle_result['shutdown_hooks']
        log.info('Lifecycle loader complete')
    except ImportError:
        log.debug('Lifecycle loader not available')

    # --- Build lifespan context manager ---
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        _startup_hooks = getattr(app.state, 'startup_hooks', [])
        _config = getattr(app.state, 'platform_config', config)
        log.debug('Executing startup hooks (count=%d)', len(_startup_hooks))
        for hook in _startup_hooks:
            hook_name = getattr(hook, '__name__', 'anonymous')
            try:
                if asyncio.iscoroutinefunction(hook):
                    await hook(app, _config)
                else:
                    hook(app, _config)
                log.debug('Startup hook completed: %s', hook_name)
            except Exception as exc:
                log.error('Startup hook failed: %s — %s', hook_name, str(exc))
        log.info('All startup hooks completed (count=%d)', len(_startup_hooks))

        yield

        _shutdown_hooks = getattr(app.state, 'shutdown_hooks', [])
        log.info('Executing shutdown hooks (count=%d)', len(_shutdown_hooks))
        for hook in _shutdown_hooks:
            hook_name = getattr(hook, '__name__', 'anonymous')
            try:
                if asyncio.iscoroutinefunction(hook):
                    await hook(app, _config)
                else:
                    hook(app, _config)
                log.debug('Shutdown hook completed: %s', hook_name)
            except Exception as exc:
                log.error('Shutdown hook failed: %s — %s', hook_name, str(exc))
        log.info('All shutdown hooks completed')

    # --- Create FastAPI app ---
    app = FastAPI(
        title=config.title,
        lifespan=lifespan,
    )

    # Store core state — use dict for backwards compat with lifecycle hooks
    app.state.platform_config = config_dict
    app.state.bootstrap_config = config_dict  # legacy key used by polyglot_server
    app.state.startup_hooks = startup_hooks
    app.state.shutdown_hooks = shutdown_hooks
    app.state.boot_time = boot_time
    app.state.loader_reports = {
        'environment': env_report,
        'lifecycle': lifecycle_report,
    }
    app.state.loaded_apps = []
    app.state.skipped_apps = []

    # --- Phase 3: Execute onInit hooks (pass dict config for backwards compat) ---
    if init_hooks:
        log.debug('Executing init hooks (count=%d)', len(init_hooks))
        for hook in init_hooks:
            hook_name = getattr(hook, '__name__', 'anonymous')
            try:
                hook(app, config_dict)
                log.debug('Init hook completed: %s', hook_name)
            except Exception as exc:
                log.error('Init hook failed: %s — %s', hook_name, str(exc))
        log.info('Init hooks completed (count=%d)', len(init_hooks))

    # --- Phase 4: Route loader ---
    try:
        from platform_core_fastapi.loaders.route_loader import load_routes
        route_report = load_routes(app, routes_dirs)
        app.state.loader_reports['routes'] = route_report
        log.info('Route loader complete')
    except ImportError:
        log.debug('Route loader not available')

    # --- Phase 5: App manifest loader ---
    try:
        from platform_core_fastapi.loaders.app_manifest_loader import load_app_manifests
        manifest_result = load_app_manifests(app, apps_dir, config.profile)
        app.state.loader_reports['app_manifests'] = manifest_result['report']
        app.state.loaded_apps = manifest_result['loaded_apps']
        app.state.skipped_apps = manifest_result['skipped_apps']
        log.info('App manifest loader complete')
    except ImportError:
        log.debug('App manifest loader not available')

    # --- Phase 6: Static frontend loader ---
    try:
        from platform_core_fastapi.loaders.static_frontend_loader import load_static_frontends
        manifests_with_frontend = []
        if hasattr(app.state, 'loader_reports') and 'app_manifests' in app.state.loader_reports:
            manifests_with_frontend = app.state.loader_reports['app_manifests'].get('manifests_with_frontend', [])
        static_report = load_static_frontends(app, manifests_with_frontend)
        app.state.loader_reports['static_frontends'] = static_report
        log.info('Static frontend loader complete')
    except ImportError:
        log.debug('Static frontend loader not available')

    # --- Per-request state middleware ---
    initial_state = config_dict.get('initial_state') or getattr(config, 'initial_state', None)
    if initial_state:
        @app.middleware('http')
        async def init_request_state_middleware(request: Request, call_next):
            state_copy = copy.deepcopy(initial_state)
            if isinstance(state_copy, dict):
                for key, value in state_copy.items():
                    setattr(request.state, key, value)
            return await call_next(request)

    elapsed = round((time.time() - boot_time) * 1000, 2)
    log.info(
        'Platform bootstrap complete (title=%s, profile=%s, elapsed_ms=%.2f, loaded_apps=%d)',
        config.title, config.profile, elapsed, len(app.state.loaded_apps),
    )
    return app


def create_app() -> FastAPI:
    """Factory function for uvicorn reload mode."""
    config = PlatformConfig()
    return setup(config)


def shutdown(app: FastAPI) -> None:
    """Signal graceful shutdown. Uvicorn handles the actual lifecycle via signals."""
    log.info('Shutdown requested')


def main() -> None:
    """Entry point for the platform-fastapi script."""
    import sys

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    )

    reload = '--reload' in sys.argv

    if reload:
        base_dir = Path(__file__).parent.resolve()
        uvicorn.run(
            'platform_core_fastapi.bootstrap:create_app',
            factory=True,
            host=os.environ.get('PLATFORM_HOST', '0.0.0.0'),
            port=int(os.environ.get('PLATFORM_PORT', '52000')),
            log_level=os.environ.get('LOG_LEVEL', 'info').lower(),
            reload=True,
            reload_dirs=[str(base_dir)],
        )
    else:
        config = PlatformConfig()
        app = setup(config)

        uvicorn_config = uvicorn.Config(
            app,
            host=config.host,
            port=config.port,
            log_level=config.log_level.lower(),
        )
        server = uvicorn.Server(uvicorn_config)
        asyncio.run(server.serve())
