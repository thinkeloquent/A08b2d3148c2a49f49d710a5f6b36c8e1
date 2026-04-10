"""
Vault Secret File Loader for FastAPI Server

Loads environment variables from the file specified by VAULT_SECRET_FILE env var.
This runs first (01) before other env loaders.
"""

import logging
import os
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger("env:vault_file")

VAULT_SECRET_FILE = os.environ.get("VAULT_SECRET_FILE")


def load_vault_file() -> dict:
    """
    Load environment variables from vault secret file.

    Returns:
        dict with load status
    """
    result = {
        "loaded": False,
        "path": VAULT_SECRET_FILE,
        "error": None,
    }

    logger.debug(
        "Checking env var VAULT_SECRET_FILE: %s",
        "set" if VAULT_SECRET_FILE else "not set",
    )

    if not VAULT_SECRET_FILE:
        logger.info("VAULT_SECRET_FILE not set, skipping vault file load")
        return result

    try:
        vault_path = Path(VAULT_SECRET_FILE)
        if not vault_path.exists():
            error_msg = f"Vault secret file not found: {VAULT_SECRET_FILE}"
            result["error"] = error_msg
            logger.warning("%s", error_msg)
            return result

        load_dotenv(vault_path, override=True)
        result["loaded"] = True
        logger.info("Loaded vault secret file: %s", VAULT_SECRET_FILE)
    except Exception as exc:
        result["error"] = str(exc)
        logger.error("Failed to load vault secret file %s: %s", VAULT_SECRET_FILE, exc, exc_info=True)

    return result


# Auto-load on import
try:
    _load_result = load_vault_file()
except Exception as _exc:
    logger.error("vault_file env loader failed during import: %s", _exc, exc_info=True)
    _load_result = {"loaded": False, "path": VAULT_SECRET_FILE, "error": str(_exc)}


def get_load_result() -> dict:
    """Return the result of the vault file load."""
    return _load_result
