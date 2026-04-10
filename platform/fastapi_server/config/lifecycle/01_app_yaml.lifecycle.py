import logging
from fastapi import FastAPI
from app_yaml_load import load_app_yaml_config

logger = logging.getLogger("lifecycle:app_yaml")


def onInit(app: FastAPI, config: dict):
    """
    Initialize App Yaml Config during onInit phase.
    This runs before onStartup, making config available to other lifecycle hooks.
    """
    logger.info("Starting app_yaml lifecycle hook...")
    try:
        result = load_app_yaml_config()

        app.state.config = result.config
        app.state.sdk = result.sdk

        logger.info("App Yaml Config loaded: %s", app.state.sdk.list_providers())

        # Debug: log security config values
        cors_origins = result.config.get_nested('cors', 'origins', default=[])
        csp_directives = result.config.get_nested('contentSecurityPolicy', 'directives', default={})
        logger.debug("[security.yml] cors.origins: %s", cors_origins)
        for directive, values in csp_directives.items():
            logger.debug("[security.yml] contentSecurityPolicy.directives.%s: %s", directive, values)

        logger.info("app_yaml lifecycle hook completed successfully")
    except Exception as exc:
        logger.error("app_yaml lifecycle hook failed: %s", exc, exc_info=True)
        raise
