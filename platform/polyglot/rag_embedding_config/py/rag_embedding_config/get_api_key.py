"""Async API key resolution for OpenAI-compatible embedding providers.

Centralizes API key lookup so it can be awaited from any transport builder.
Resolution order (first non-empty wins):

1. YAML ``providers.openai_embeddings.endpoint_api_key``
2. ``OPENAI_EMBEDDINGS_API_KEY`` env var
3. ``OPENAI_API_KEY`` env var
4. Empty string (allow provider to fail with its own error)
"""

from __future__ import annotations

from env_resolver import resolve_openai_env

_openai_env = resolve_openai_env()


async def get_api_key(yaml_cfg=None) -> str:
    """Return the resolved API key for OpenAI embeddings.

    Parameters
    ----------
    yaml_cfg:
        Optional YAML config object (AppYamlConfig instance or resolved dict).
        When ``None`` the YAML layer is skipped and only env vars are checked.
    """
    from .kwargs_openai import _yaml_get

    return (
        _yaml_get(yaml_cfg, "providers", "openai_embeddings", "endpoint_api_key")
        or _openai_env.embeddings_api_key
        or _openai_env.api_key
        or ""
    )


def get_api_key_sync(yaml_cfg=None) -> str:
    """Synchronous variant of :func:`get_api_key`."""
    from .kwargs_openai import _yaml_get

    return (
        _yaml_get(yaml_cfg, "providers", "openai_embeddings", "endpoint_api_key")
        or _openai_env.embeddings_api_key
        or _openai_env.api_key
        or ""
    )
