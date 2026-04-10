"""Async proxy URL resolution for OpenAI-compatible embedding providers.

Centralizes proxy lookup so it can be awaited from any transport builder.
Resolution order:

1. YAML ``providers.openai_embeddings.proxy_url``
   - ``false`` → disabled (return None)
   - string   → use it
   - ``null``  → inherit from global
2. YAML ``global.network.proxy_urls.{APP_ENV}``
3. ``OPENAI_EMBEDDINGS_PROXY_URL`` env var
4. None
"""

from __future__ import annotations

import os

from env_resolver import resolve_openai_env

_openai_env = resolve_openai_env()

_TAG = "[embedding-kwargs-openai]"


async def get_proxy(yaml_cfg=None) -> str | None:
    """Return the resolved proxy URL for OpenAI embeddings.

    Parameters
    ----------
    yaml_cfg:
        Optional YAML config object (AppYamlConfig instance or resolved dict).
        When ``None`` the YAML layer is skipped and only env vars are checked.
    """
    from .kwargs_openai import _yaml_get

    return _resolve(yaml_cfg, _yaml_get)


def get_proxy_sync(yaml_cfg=None) -> str | None:
    """Synchronous variant of :func:`get_proxy`."""
    from .kwargs_openai import _yaml_get

    return _resolve(yaml_cfg, _yaml_get)


def _resolve(yaml_cfg, yaml_get) -> str | None:
    """Shared resolution logic."""
    provider_proxy = yaml_get(yaml_cfg, "providers", "openai_embeddings", "proxy_url")

    if provider_proxy is not None:
        # Explicit false means "no proxy"
        if provider_proxy is False:
            print(f"{_TAG}   proxy: disabled (provider=false)")
            return None
        # Explicit string
        if isinstance(provider_proxy, str) and provider_proxy:
            print(f"{_TAG}   proxy: {provider_proxy} (provider)")
            return provider_proxy

    # Inherit from global network config
    app_env = os.environ.get("APP_ENV", "dev").lower()
    global_proxy = yaml_get(yaml_cfg, "global", "network", "proxy_urls", app_env)
    if global_proxy:
        print(f"{_TAG}   proxy: {global_proxy} (global.network.proxy_urls.{app_env})")
        return global_proxy

    # Env var fallback
    env_proxy = _openai_env.embeddings_proxy_url
    if env_proxy:
        print(f"{_TAG}   proxy: {env_proxy} (env)")
        return env_proxy

    print(f"{_TAG}   proxy: (none)")
    return None
