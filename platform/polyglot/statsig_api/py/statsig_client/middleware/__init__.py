"""Middleware package for the Statsig Console API client."""

from .error_handler import register_error_handlers

__all__ = ["register_error_handlers"]
