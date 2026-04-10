import logging
import os


def create(package_name: str, filename: str) -> logging.Logger:
    """Create a package-local logger with prefixed formatting.

    Args:
        package_name: The package name for log prefix.
        filename: The source filename for log prefix.

    Returns:
        A configured logging.Logger instance.
    """
    name = f"{package_name}:{filename}"
    logger = logging.getLogger(name)

    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(f"[{package_name}:{filename}] %(message)s")
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    level = os.environ.get("LOG_LEVEL", "WARNING").upper()
    logger.setLevel(getattr(logging, level, logging.WARNING))

    return logger
