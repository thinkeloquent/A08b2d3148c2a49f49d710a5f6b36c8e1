"""
Root .env File Loader

Loads environment variables from <PROJECT_ROOT>/.env if the file exists.
Uses dotenv; variables are injected into os.environ.
"""

import logging
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger("env:root_env_file_dev_only")

# Resolve project root relative to this file
_THIS_DIR = Path(__file__).resolve().parent
_PROJECT_ROOT = _THIS_DIR.parent.parent.parent  # mta-v800/

ROOT_ENV_FILE = _PROJECT_ROOT / ".env"

_loaded = False

logger.debug("Root env file path: %s", ROOT_ENV_FILE)

try:
    if ROOT_ENV_FILE.exists():
        load_dotenv(ROOT_ENV_FILE, override=True)
        _loaded = True
        logger.info("Loaded root env file (dev-only): %s", ROOT_ENV_FILE)
    else:
        logger.debug("Root env file not found (dev-only): %s", ROOT_ENV_FILE)
except Exception as _exc:
    logger.error(
        "root_env_file_dev_only env loader failed: %s", _exc, exc_info=True
    )


def is_loaded() -> bool:
    """Return whether the root .env file was found and loaded."""
    return _loaded
