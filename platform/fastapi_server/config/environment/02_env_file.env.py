"""
Environment File Loader for FastAPI Server

Loads environment variables from .env files in order:
1. <ROOT>/.env (shared config)
2. <ROOT>/fastapi_server/.env (server-specific config)

Server-specific values override root values.
"""

import logging
import os
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger("env:env_file")

# Resolve paths relative to this file's location
_THIS_DIR = Path(__file__).resolve().parent
_SERVER_ROOT = _THIS_DIR.parent.parent  # fastapi_server/
_PROJECT_ROOT = _SERVER_ROOT.parent     # mta-v800/

# Environment file paths
ROOT_ENV_FILE = _PROJECT_ROOT / ".env"
SERVER_ENV_FILE = _SERVER_ROOT / ".env"


def load_env_files(override: bool = True) -> dict:
    """
    Load environment files in priority order.

    Args:
        override: If True, later files override earlier values.
                  If False, existing values are preserved.

    Returns:
        dict with load status for each file
    """
    result = {
        "loaded": [],
        "not_found": [],
        "root_env": str(ROOT_ENV_FILE),
        "server_env": str(SERVER_ENV_FILE),
    }

    logger.debug("Loading env files (override=%s)", override)
    logger.debug("Root env file: %s", ROOT_ENV_FILE)
    logger.debug("Server env file: %s", SERVER_ENV_FILE)

    try:
        # Load root .env first (lowest priority)
        if ROOT_ENV_FILE.exists():
            load_dotenv(ROOT_ENV_FILE, override=override)
            result["loaded"].append(str(ROOT_ENV_FILE))
            logger.info("Loaded root env file: %s", ROOT_ENV_FILE)
        else:
            result["not_found"].append(str(ROOT_ENV_FILE))
            logger.debug("Root env file not found: %s", ROOT_ENV_FILE)

        # Load server-specific .env second (highest priority)
        if SERVER_ENV_FILE.exists():
            load_dotenv(SERVER_ENV_FILE, override=override)
            result["loaded"].append(str(SERVER_ENV_FILE))
            logger.info("Loaded server env file: %s", SERVER_ENV_FILE)
        else:
            result["not_found"].append(str(SERVER_ENV_FILE))
            logger.debug("Server env file not found: %s", SERVER_ENV_FILE)

        logger.info(
            "env_file loader complete: loaded=%s, not_found=%s",
            result["loaded"], result["not_found"],
        )
    except Exception as exc:
        logger.error("env_file loader failed: %s", exc, exc_info=True)

    return result


# Auto-load on import
try:
    _load_result = load_env_files(override=True)
except Exception as _exc:
    logger.error("env_file env loader failed during import: %s", _exc, exc_info=True)
    _load_result = {"loaded": [], "not_found": [], "root_env": str(ROOT_ENV_FILE), "server_env": str(SERVER_ENV_FILE)}


def get_load_result() -> dict:
    """Return the result of the initial env file load."""
    return _load_result


def get(key: str, default: str = None) -> str:
    """Get an environment variable with optional default."""
    return os.environ.get(key, default)


def get_or_throw(key: str) -> str:
    """Get an environment variable or raise if not found."""
    value = os.environ.get(key)
    if value is None:
        raise EnvironmentError(f"Required environment variable '{key}' is not set")
    return value
