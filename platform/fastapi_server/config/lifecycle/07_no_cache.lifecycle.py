"""
No-Cache Headers Lifecycle Module

Adds cache-control headers to prevent browsers from serving stale
assets during development. Only applies in non-production environments.
Reads cache header values from security.yml via AppYamlConfig.

Uses onInit hook because middleware must be added before app starts.
"""

import logging
import os
from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("lifecycle:no_cache")


class NoCacheMiddleware(BaseHTTPMiddleware):
    """Middleware that sets no-cache headers on all responses."""

    def __init__(self, app, cache_control: str, pragma: str, expires: str):
        super().__init__(app)
        self.cache_control = cache_control
        self.pragma = pragma
        self.expires = expires

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers['Cache-Control'] = self.cache_control
        response.headers['Pragma'] = self.pragma
        response.headers['Expires'] = self.expires
        return response


def onInit(app: FastAPI, config: dict) -> None:
    """Configure no-cache middleware on init (before app starts)."""
    logger.info("Starting no_cache lifecycle hook...")
    try:
        env = os.getenv('NODE_ENV', os.getenv('APP_ENV', 'development'))
        logger.debug("Current environment: %s", env)

        if env == 'production':
            logger.info("Production environment detected, skipping no-cache middleware")
            return

        # Read cache config from security.yml
        no_cache = True
        cache_control = "no-cache, no-store, must-revalidate"
        pragma = "no-cache"
        expires = "0"

        if hasattr(app.state, 'config'):
            logger.debug("Reading cache config from app.state.config")
            no_cache = app.state.config.get_nested('cache', 'noCache', default=True)
            cache_control = app.state.config.get_nested(
                'cache', 'headers', 'cacheControl', default=cache_control
            )
            pragma = app.state.config.get_nested(
                'cache', 'headers', 'pragma', default=pragma
            )
            expires = app.state.config.get_nested(
                'cache', 'headers', 'expires', default=expires
            )
        else:
            logger.warning("app.state.config not available, using no-cache defaults")

        logger.debug("no_cache=%s, cache_control=%s, pragma=%s, expires=%s",
                     no_cache, cache_control, pragma, expires)

        if not no_cache:
            logger.info("No-cache disabled via config (cache.noCache=false), skipping")
            return

        app.add_middleware(
            NoCacheMiddleware,
            cache_control=cache_control,
            pragma=pragma,
            expires=expires,
        )

        logger.info("No-cache headers enabled (non-production)")
        logger.info("no_cache lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("no_cache lifecycle hook failed: %s", exc, exc_info=True)
        raise
