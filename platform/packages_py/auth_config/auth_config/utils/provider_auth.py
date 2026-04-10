"""
Provider authentication utilities for building SDK auth options.

This module centralizes the logic for resolving API keys and building
auth options for the fetch_client SDK.

Supports two resolution modes:
1. overwrite_from_context (new): Values pre-resolved by app_yaml_overwrites context resolver
2. overwrite_from_env (legacy): Manual env var resolution
"""
import os
from typing import Any, Dict, List, Optional, Union

from ..logger import create_logger

logger = create_logger('fetch_auth_config.utils', __file__)


def _is_unresolved_template(value: Any) -> bool:
    """Check if a value is an unresolved {{...}} template."""
    return isinstance(value, str) and "{{" in value


def get_resolved_provider_config(provider_name: str) -> Dict[str, Any]:
    """Get provider config from the STARTUP-resolved config (with {{fn:...}} expanded).

    Falls back to raw AppYamlConfig if resolved config is not available.

    Args:
        provider_name: Provider key (e.g. "openai_embeddings", "jira")

    Returns:
        Provider config dict, or empty dict if unavailable.
    """
    # 1. Try STARTUP-resolved config (templates expanded)
    try:
        from app_yaml_overwrites.integrations import fastapi as _fastapi_integration
        resolved = getattr(_fastapi_integration, '_startup_config', None)
        if resolved is not None:
            return (resolved.get("providers") or {}).get(provider_name) or {}
    except Exception:
        pass

    # 2. Fallback: raw AppYamlConfig
    try:
        from app_yaml_static_config import AppYamlConfig
        cfg = AppYamlConfig.get_instance()
        return cfg.get_nested("providers", provider_name, default={}) or {}
    except Exception:
        return {}


def _resolve_env_template(value: str) -> Optional[str]:
    """
    If value is an unresolved {{env.VAR_NAME}} template, resolve it
    from os.environ. Returns None if the env var is not set.
    Non-template strings are returned as-is.
    """
    if not isinstance(value, str):
        return value
    stripped = value.strip()
    if stripped.startswith("{{env.") and stripped.endswith("}}"):
        var_name = stripped[6:-2]  # extract VAR_NAME from {{env.VAR_NAME}}
        env_val = os.getenv(var_name)
        if env_val:
            logger.debug(f"Resolved env template {stripped} from environment")
            return env_val
        logger.debug(f"Env template {stripped}: variable {var_name} not set")
        return None
    return value


def resolve_context_value(
    overwrite_config: Optional[Dict[str, Any]],
    key: str,
    default_value: Optional[str] = None
) -> Optional[str]:
    """
    Resolve a value from overwrite_from_context config.

    With overwrite_from_context, values are pre-resolved by the context resolver,
    so the value is read directly from the config. If the value is still an
    unresolved {{env.VAR_NAME}} template, it will be resolved from os.environ.

    Args:
        overwrite_config: Dict containing resolved values from context
        key: The key to look up
        default_value: Value to return if key not found

    Returns:
        Resolved value or default_value
    """
    if not overwrite_config:
        return default_value

    value = overwrite_config.get(key)
    if value:
        resolved = _resolve_env_template(value)
        if resolved:
            logger.debug(f"Resolved {key} from context")
            return resolved

    return default_value


def resolve_env_value(
    overwrite_config: Optional[Dict[str, Any]],
    key: str,
    default_value: Optional[str] = None
) -> Optional[str]:
    """
    Resolve a value from environment variables based on overwrite_from_env config.

    DEPRECATED: Use overwrite_from_context with context resolver instead.

    Args:
        overwrite_config: Dict containing env var mappings (e.g., from provider config)
        key: The key to look up in the overwrite config
        default_value: Value to return if no env var is found

    Returns:
        Resolved value from environment or default_value
    """
    if not overwrite_config:
        return default_value

    env_vars = overwrite_config.get(key)
    if not env_vars:
        return default_value

    if isinstance(env_vars, list):
        for var_name in env_vars:
            value = os.getenv(var_name)
            if value:
                logger.info(f"Resolved {key} from env var: {var_name}")
                return value
        return None

    if isinstance(env_vars, str):
        value = os.getenv(env_vars)
        if value:
            logger.info(f"Resolved {key} from env var: {env_vars}")
        return value or None

    return default_value


def resolve_api_key(
    provider_config: Dict[str, Any],
    api_key_extractor: Optional[Union[callable, Any]] = None
) -> Optional[str]:
    """
    Resolve API key from provider config using overwrite_from_context (preferred)
    or overwrite_from_env (legacy fallback).

    Args:
        provider_config: Provider configuration dict from resolved config
        api_key_extractor: Optional callback to extract API key from config.
                           Should accept provider_config and return str or None.

    Returns:
        Resolved API key or None
    """
    # 0. Try custom extractor first if provided
    if api_key_extractor and callable(api_key_extractor):
        try:
            custom_key = api_key_extractor(provider_config)
            if custom_key:
                return custom_key
        except Exception as e:
            logger.warning(f"Error in api_key_extractor: {e}")

    # 1. First try overwrite_from_context (new pattern - values pre-resolved)
    context_config = provider_config.get("overwrite_from_context")
    if context_config:
        api_key = resolve_context_value(context_config, "endpoint_api_key")
        if api_key:
            return api_key

    # 2. Fallback to overwrite_from_env (legacy pattern)
    env_config = provider_config.get("overwrite_from_env")
    if env_config:
        api_key = resolve_env_value(env_config, "endpoint_api_key")
        if api_key:
            return api_key

    # 3. Final fallback to direct value
    return provider_config.get("endpoint_api_key")


# Alias for backwards compatibility
def resolve_api_key_from_env(provider_config: Dict[str, Any]) -> Optional[str]:
    """
    DEPRECATED: Use resolve_api_key() instead.

    Resolve API key from provider config.
    """
    return resolve_api_key(provider_config)


def resolve_provider_field(
    provider_config: Dict[str, Any],
    field_name: str,
    default_value: Optional[str] = None
) -> Optional[str]:
    """
    Resolve any field from provider config using overwrite_from_context (preferred)
    or direct value fallback.

    Args:
        provider_config: Provider configuration dict from resolved config
        field_name: The field name to resolve (e.g. "base_url", "email")
        default_value: Value to return if field not found

    Returns:
        Resolved value or default_value
    """
    # 1. First try overwrite_from_context (new pattern - values pre-resolved)
    context_config = provider_config.get("overwrite_from_context")
    if context_config:
        value = resolve_context_value(context_config, field_name)
        if value:
            return value

    # 2. Final fallback to direct value
    return provider_config.get(field_name) or default_value


def resolve_email(
    provider_config: Dict[str, Any]
) -> Optional[str]:
    """
    Resolve email from provider config using overwrite_from_context (preferred)
    or direct value fallback.

    Args:
        provider_config: Provider configuration dict from resolved config

    Returns:
        Resolved email or None
    """
    return resolve_provider_field(provider_config, "email")


def build_sdk_auth_options(
    provider_config: Dict[str, Any],
    default_auth_type: str = "bearer",
    default_header_name: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    Build SDK auth options from provider configuration.

    This function resolves the API key and builds the auth options dict
    that can be passed to fetch_client's createSDKClient.

    Args:
        provider_config: Provider configuration dict containing:
            - overwrite_from_context: Pre-resolved values from context (preferred)
            - overwrite_from_env: Env var mappings (legacy)
            - endpoint_api_key: Direct API key value
            - endpoint_auth_type: Auth type (bearer, x-api-key, basic, custom, custom_header)
            - api_auth_header_name: Custom header name for custom auth types
        default_auth_type: Default auth type if not specified in config
        default_header_name: Default header name for custom auth types

    Returns:
        Auth options dict for SDK client, or None if no API key available

    Example:
        >>> provider_config = {
        ...     "endpoint_auth_type": "bearer",
        ...     "overwrite_from_context": {"endpoint_api_key": "resolved-api-key"}
        ... }
        >>> auth_opts = build_sdk_auth_options(provider_config)
        >>> # Returns: {"type": "bearer", "token": "resolved-api-key"}
    """
    api_key = resolve_api_key(provider_config)
    if not api_key:
        return None

    auth_type = (provider_config.get("endpoint_auth_type") or default_auth_type).lower()
    logger.debug(f"Building auth options for type: {auth_type}")

    auth_options = None

    if auth_type == "bearer":
        auth_options = {"type": "bearer", "token": api_key}

    elif auth_type == "x-api-key":
        auth_options = {"type": "x-api-key", "token": api_key}

    elif auth_type == "basic":
        # Basic auth with empty username, API key as password
        auth_options = {"type": "basic", "username": "", "password": api_key}

    elif auth_type == "basic_email_token":
        email = resolve_email(provider_config)
        auth_options = {"type": "basic_email_token", "email": email or "", "token": api_key}

    elif auth_type in ("custom", "custom_header"):
        header_name = provider_config.get("api_auth_header_name") or default_header_name or "Authorization"
        auth_options = {"type": "custom", "token": api_key, "headerName": header_name}

    else:
        # Unknown type, fall back to default
        logger.warning(f"Unknown auth type '{auth_type}', using default: {default_auth_type}")
        if default_auth_type == "bearer":
            auth_options = {"type": "bearer", "token": api_key}
        elif default_auth_type == "x-api-key":
            auth_options = {"type": "x-api-key", "token": api_key}
        else:
            header_name = provider_config.get("api_auth_header_name") or default_header_name or "Authorization"
            auth_options = {"type": "custom", "token": api_key, "headerName": header_name}

    # Print resolved fetch auth config (redacted)
    print(f"[fetch_auth_config] build_sdk_auth_options: endpoint_auth_type={auth_type}, "
          f"has_base_url={bool(provider_config.get('base_url'))}, "
          f"has_api_key={bool(api_key)}, "
          f"resolved_type={auth_options.get('type') if auth_options else None}")

    return auth_options
