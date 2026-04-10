"""Centralized kwargs builders for OpenAI-compatible embedding providers.

Organizes kwargs by **LLM provider** (not transport layer) so each
provider file exports builders for every transport.  This file covers
the OpenAI provider with two transports:

- ``get_httpx_kwargs``      kwargs for ``HttpxEmbeddingClient(**kwargs)``
- ``get_langchain_kwargs``  kwargs for ``OpenAIEmbeddings(**kwargs)``

``get_embeddings_kwargs`` is kept as a backward-compatible alias for
``get_langchain_kwargs``.

Environment variables (all optional -- omit to use OpenAI defaults):

    OPENAI_EMBEDDINGS_BASE_URL   Custom API base URL
    OPENAI_EMBEDDINGS_API_KEY    API key (overrides OPENAI_API_KEY)
    OPENAI_EMBEDDINGS_ORG        Organization ID
    OPENAI_EMBEDDINGS_PROXY_URL  HTTP/SOCKS proxy for outbound requests
    OPENAI_EMBEDDINGS_TIMEOUT    Request timeout in seconds (default: 120)
    OPENAI_EMBEDDINGS_CA_BUNDLE  Path to CA certificate bundle
"""

from __future__ import annotations

from typing import Any

from .constants import DEFAULT_EMBEDDINGS_BASE_URL
from env_resolver import resolve_openai_env

_openai_env = resolve_openai_env()

_TAG = "[embedding-kwargs-openai]"


# ------------------------------------------------------------------
# YAML config helpers
# ------------------------------------------------------------------

def _try_yaml_config():
    """Return the resolved config dict or AppYamlConfig singleton.

    Prefers ``app.state.resolved_config`` (STARTUP-resolved by
    04_context_resolver lifecycle hook, with ``{{fn:...}}`` templates
    already expanded).  Falls back to the raw ``AppYamlConfig`` singleton
    for CLI usage where no FastAPI lifecycle runs.
    """
    # 1. Try STARTUP-resolved config (with {{fn:...}} templates expanded)
    #    The fastapi integration module caches this at module level during lifespan init.
    try:
        from app_yaml_overwrites.integrations import fastapi as _fastapi_integration
        resolved = getattr(_fastapi_integration, '_startup_config', None)
        if resolved is not None:
            return resolved
    except Exception:
        pass

    # 2. Fallback: raw AppYamlConfig singleton (CLI / no lifecycle)
    try:
        from app_yaml_static_config import AppYamlConfig
        return AppYamlConfig.get_instance()
    except Exception:
        return None


def _yaml_get(yaml_cfg, *keys, default=None):
    """Convenience wrapper that works with both AppYamlConfig and plain dicts.

    Supports ``get_nested()`` (AppYamlConfig) or dict key traversal
    (resolved_config dict from app.state).
    """
    if yaml_cfg is None:
        return default
    # AppYamlConfig instance
    if hasattr(yaml_cfg, 'get_nested'):
        return yaml_cfg.get_nested(*keys, default=default)
    # Plain dict (resolved_config)
    current = yaml_cfg
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return default
    return current


# ------------------------------------------------------------------
# Shared config resolution (YAML → env → default)
# ------------------------------------------------------------------

def _resolve_config() -> dict[str, Any]:
    """Resolve embedding config using YAML-first cascade.

    Resolution order for each field:
      1. YAML ``providers.openai_embeddings.*``
      2. Environment variable
      3. Hardcoded default
    """
    yaml_cfg = _try_yaml_config()
    yaml_source = "yaml" if yaml_cfg is not None else "env-only"
    print(f"{_TAG} _resolve_config (source={yaml_source})")

    # --- base_url ---
    base_url = (
        _yaml_get(yaml_cfg, "providers", "openai_embeddings", "base_url")
        or _openai_env.embeddings_base_url
        or DEFAULT_EMBEDDINGS_BASE_URL
    )
    base_url = base_url.rstrip("/")

    # --- api_key ---
    from .get_api_key import get_api_key_sync
    api_key = get_api_key_sync(yaml_cfg)

    # --- organization ---
    org = (
        _yaml_get(yaml_cfg, "providers", "openai_embeddings", "organization")
        or _openai_env.embeddings_org
    )

    # --- timeout ---
    yaml_timeout = _yaml_get(yaml_cfg, "providers", "openai_embeddings", "client", "timeout_seconds")
    timeout_str = _openai_env.embeddings_timeout
    if yaml_timeout is not None:
        timeout = float(yaml_timeout)
    elif timeout_str:
        timeout = float(timeout_str)
    else:
        timeout = 120.0

    # --- ca_bundle ---
    ca_bundle = _openai_env.embeddings_ca_bundle
    if ca_bundle is None and yaml_cfg is not None:
        ca_bundle = _yaml_get(yaml_cfg, "global", "network", "ca_bundle") or None
    verify: str | bool = ca_bundle if ca_bundle else True

    # --- proxy_url (Req 3) ---
    # Cascade: provider YAML → global YAML → env var → None
    from .get_proxy import get_proxy_sync
    proxy_url = get_proxy_sync(yaml_cfg)

    return {
        "base_url": base_url,
        "api_key": api_key,
        "org": org,
        "proxy_url": proxy_url,
        "timeout": timeout,
        "timeout_str": timeout_str,
        "ca_bundle": ca_bundle,
        "verify": verify,
    }



def _mask_key(key: str) -> str:
    if not key:
        return "(not set)"
    return key[:4] + "..." + key[-4:] if len(key) > 8 else "****"


# ------------------------------------------------------------------
# Httpx transport
# ------------------------------------------------------------------

async def get_httpx_kwargs(cfg) -> dict[str, Any]:
    """Return kwargs dict for ``HttpxEmbeddingClient(**kwargs)``."""
    env = _resolve_config()

    print(f"{_TAG} Using HttpxEmbeddingClient (model={cfg.embeddings_model_name})")
    print(f"{_TAG}   base_url = {env['base_url']}")
    print(f"{_TAG}   api_key  = {_mask_key(env['api_key'])}")
    if env["org"]:
        print(f"{_TAG}   org      = {env['org']}")
    if env["proxy_url"]:
        print(f"{_TAG}   proxy    = {env['proxy_url']}")
    if env["timeout_str"]:
        print(f"{_TAG}   timeout  = {env['timeout']}s")
    if env["ca_bundle"]:
        print(f"{_TAG}   ca_bundle = {env['ca_bundle']}")

    return {
        "model": cfg.embeddings_model_name,
        "api_key": env["api_key"],
        "base_url": env["base_url"],
        "verify": env["verify"],
        "organization": env["org"],
        "proxy_url": env["proxy_url"],
        "timeout": env["timeout"],
        "ca_bundle": env["ca_bundle"],
    }


# ------------------------------------------------------------------
# LangChain transport
# ------------------------------------------------------------------

async def get_langchain_kwargs(cfg) -> dict[str, Any]:
    """Return kwargs dict for ``OpenAIEmbeddings(**kwargs)``."""
    from rag_embedding_client.client_httpx import build_client_async, build_client_sync

    httpx_settings = await get_httpx_kwargs(cfg)

    print(f"{_TAG} Building OpenAIEmbeddings kwargs...")

    kwargs: dict[str, Any] = {
        "model": httpx_settings["model"],
    }

    if httpx_settings["base_url"] != DEFAULT_EMBEDDINGS_BASE_URL:
        kwargs["openai_api_base"] = httpx_settings["base_url"]

    if httpx_settings["api_key"]:
        kwargs["openai_api_key"] = httpx_settings["api_key"]

    if httpx_settings["organization"]:
        kwargs["openai_organization"] = httpx_settings["organization"]

    # Build custom httpx clients when transport-level config is needed
    if httpx_settings["proxy_url"] or httpx_settings["ca_bundle"]:
        kwargs["http_client"] = build_client_sync(
            timeout=httpx_settings["timeout"],
            proxy_url=httpx_settings["proxy_url"],
            verify=httpx_settings["verify"],
        )
        kwargs["http_async_client"] = build_client_async(
            timeout=httpx_settings["timeout"],
            proxy_url=httpx_settings["proxy_url"],
            verify=httpx_settings["verify"],
        )
        print(f"{_TAG}   custom httpx clients built (proxy={bool(httpx_settings['proxy_url'])}, ca={bool(httpx_settings['ca_bundle'])})")

    print(f"{_TAG} kwargs ready ({len(kwargs)} keys)")
    return kwargs


# Backward-compatible alias
get_embeddings_kwargs = get_langchain_kwargs
