"""Middleware components for the Sauce Labs API SDK."""

from .error_handler import register_error_handlers

__all__ = ["register_error_handlers"]
