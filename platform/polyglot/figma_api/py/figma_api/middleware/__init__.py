"""Middleware barrel exports — Figma API SDK"""

from .error_handler import register_error_handlers
from .figma_hooks import (
    json_fallback_hook,
    rate_limit_hook,
    request_id_hook,
    response_204_hook,
)

__all__ = [
    "register_error_handlers",
    "response_204_hook",
    "json_fallback_hook",
    "request_id_hook",
    "rate_limit_hook",
]
