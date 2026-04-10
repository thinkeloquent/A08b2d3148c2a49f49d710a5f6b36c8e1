import os
import logging
from typing import Optional, Any

# Map string levels to logging constants
LOG_LEVEL_MAP = {
    'debug': logging.DEBUG,
    'info': logging.INFO,
    'warn': logging.WARNING,
    'warning': logging.WARNING,
    'error': logging.ERROR,
}

def create_logger(name: str, filename: str) -> logging.Logger:
    """
    Create a logger instance with standardized formatting and level from environment.
    
    Args:
        name: Package name (e.g., 'fetch_auth_config')
        filename: Calling filename (e.g., __file__)
        
    Returns:
        Configured logging.Logger instance
    """
    logger_name = f"{name}:{os.path.basename(filename)}"
    logger = logging.getLogger(logger_name)
    
    # Only configure if no handlers exist to avoid duplicates
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '[%(name)s] %(levelname)s: %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        # Set level from environment or default to DEBUG
        env_level = os.environ.get('LOG_LEVEL', 'debug').lower()
        level = LOG_LEVEL_MAP.get(env_level, logging.DEBUG)
        logger.setLevel(level)
        
    return logger
