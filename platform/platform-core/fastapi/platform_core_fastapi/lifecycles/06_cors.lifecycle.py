"""
CORS Configuration Lifecycle Module

Enables Cross-Origin Resource Sharing for the FastAPI server.
This allows the frontend app served from a different port to make API requests.

Uses onInit hook (not onStartup) because middleware must be added before app starts.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger("lifecycle:cors")


def onInit(app: FastAPI, config: dict) -> None:
    """Configure CORS middleware on init (before app starts)."""
    logger.info("Starting cors lifecycle hook...")
    try:
        logger.info("Configuring CORS middleware")

        # Read CORS settings from config (loaded by 01_app_yaml.lifecycle.py)
        origins = []
        methods = ["GET", "POST", "PUT", "DELETE", "PATCH"]
        allowed_headers = ["Content-Type", "Authorization"]
        credentials = True
        max_age = 86400

        if hasattr(app.state, 'config'):
            logger.debug("Reading CORS config from app.state.config")
            origins = app.state.config.get_nested('cors', 'origins', default=[])
            methods = app.state.config.get_nested('cors', 'methods', default=methods)
            allowed_headers = app.state.config.get_nested('cors', 'allowedHeaders', default=allowed_headers)
            credentials = app.state.config.get_nested('cors', 'credentials', default=credentials)
            max_age = app.state.config.get_nested('cors', 'maxAge', default=max_age)
        else:
            logger.warning("app.state.config not available, using CORS defaults")

        if not origins:
            raise ValueError("No CORS origins provided in config. Set cors.origins in security.yml")

        import json
        logger.debug("CORS origins: %s", json.dumps(origins))
        logger.debug("CORS methods: %s", methods)
        logger.debug("CORS allowedHeaders: %s", allowed_headers)
        logger.debug("CORS credentials: %s, maxAge: %s", credentials, max_age)

        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=credentials,
            allow_methods=methods,
            allow_headers=allowed_headers,
            max_age=max_age,
        )

        logger.info("CORS enabled for %d origins", len(origins))
        logger.info("cors lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("cors lifecycle hook failed: %s", exc, exc_info=True)
        raise
