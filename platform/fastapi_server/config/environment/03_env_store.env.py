import logging
import os
from vault_file import EnvStore

logger = logging.getLogger("env:env_store")


# EnvStore logic to load from VAULT_SECRET_FILE if present
def load_env_vars():
    env_file = os.environ.get("VAULT_SECRET_FILE")

    logger.debug(
        "Checking env var VAULT_SECRET_FILE: %s",
        "set" if env_file else "not set",
    )

    try:
        if not env_file:
            logger.info("VAULT_SECRET_FILE not set — skipping EnvStore file load (cloud/container mode)")
            # Initialize EnvStore without a file so .get() / .getOrThrow() still work
            # against process env vars.  Pass /dev/null: it exists, parses 0 vars, no warning.
            result = EnvStore.on_startup("/dev/null")
            logger.info("Vault File loaded (env-only): %d vars", result.total_vars_loaded)
            return

        logger.info("Loading Vault File integration... %s", env_file)
        result = EnvStore.on_startup(env_file)
        logger.info("Vault File loaded: %d vars", result.total_vars_loaded)
    except Exception as exc:
        logger.error("env_store loader failed: %s", exc, exc_info=True)
        raise


try:
    load_env_vars()
except Exception as _exc:
    logger.error("env_store env loader failed during import: %s", _exc, exc_info=True)
