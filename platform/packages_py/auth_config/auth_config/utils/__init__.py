"""Utility functions for fetch_auth_config."""
from .provider_auth import (
    build_sdk_auth_options,
    resolve_context_value,
    resolve_env_value,
    resolve_api_key,
    resolve_api_key_from_env,  # deprecated alias
    resolve_provider_field,
    resolve_email,
)

__all__ = [
    'build_sdk_auth_options',
    'resolve_context_value',
    'resolve_env_value',
    'resolve_api_key',
    'resolve_api_key_from_env',  # deprecated alias
    'resolve_provider_field',
    'resolve_email',
]
