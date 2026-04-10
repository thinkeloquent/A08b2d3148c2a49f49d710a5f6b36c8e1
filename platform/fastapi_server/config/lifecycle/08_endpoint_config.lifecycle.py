"""
08_endpoint_config.lifecycle.py

Initializes the EndpointConfigSDK and stores it on app.state.
Equivalent to Fastify's 08-endpoint-config.lifecycle.mjs.
"""

import logging
import os

from fastapi import FastAPI
from app_yaml_endpoints import create_endpoint_config_sdk

logger = logging.getLogger("lifecycle:endpoint_config")


async def onStartup(app: FastAPI, config: dict):
    """Initialize EndpointConfigSDK during onStartup phase.

    Must run as onStartup (not onInit) so that 04_context_resolver has
    already resolved STARTUP-scoped compute functions into
    app.state.resolved_config.
    """
    logger.info("Starting endpoint_config lifecycle hook...")
    try:
        app_env = os.getenv("APP_ENV", "dev").lower()
        config_dir = os.getenv(
            "CONFIG_DIR",
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "common", "config"),
        )
        file_path = os.path.join(config_dir, f"endpoint.{app_env}.yaml")

        logger.debug("APP_ENV: %s", app_env)
        logger.debug("CONFIG_DIR: %s", config_dir)
        logger.debug("Endpoint config file: %s", file_path)

        sdk = create_endpoint_config_sdk(file_path=file_path)
        logger.debug("Created EndpointConfigSDK instance")

        # Use STARTUP-resolved config (from hook 04) so that STARTUP-scoped
        # compute functions (e.g. {{fn:compute_gemini_api_key}}) are already
        # resolved. Falls back to raw AppYamlConfig if resolver didn't run.
        resolved_config = getattr(app.state, "resolved_config", None) or {}
        app_config = getattr(app.state, "config", None)

        logger.debug(
            "resolved_config available: %s, app_config available: %s",
            bool(resolved_config), bool(app_config),
        )

        endpoints = resolved_config.get("endpoints") or (app_config.get("endpoints", {}) if app_config else {})
        intent_mapping = resolved_config.get("intent_mapping") or (app_config.get("intent_mapping", {}) if app_config else {})

        sdk.load_config({"endpoints": endpoints, "intent_mapping": intent_mapping})

        app.state.endpoint_config_sdk = sdk

        logger.info("EndpointConfigSDK initialized with keys=%s", sdk.list_keys())
        logger.info("endpoint_config lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("endpoint_config lifecycle hook failed: %s", exc, exc_info=True)
        raise
