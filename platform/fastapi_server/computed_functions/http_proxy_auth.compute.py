"""
Compute function for HTTP proxy authentication.

Resolves proxy auth credentials for providers that route through a proxy.
Uses GLOBAL scope: resolved at STARTUP (from env) and re-resolved per
REQUEST (from headers, falling back to env).

Usage in YAML:
    overwrite_from_context:
      proxy_url: "{{fn:http_proxy_auth}}"
"""
from app_yaml_overwrites.options import ComputeScope


# Module-level exports for auto-loading
NAME = "http_proxy_auth"
SCOPE = ComputeScope.GLOBAL


def register(ctx: dict) -> str:
    """
    Compute function entry point for auto-loading.

    At STARTUP: ctx.request is None, resolves from env var.
    At REQUEST: checks x-proxy-auth header first, falls back to env var.

    Args:
        ctx: Context dictionary with env, config, request, state, shared

    Returns:
        Proxy auth token string
    """
    # Try request header first (only available during REQUEST scope)
    request = ctx.get("request")
    if request:
        headers = request.get("headers", {}) if isinstance(request, dict) else {}
        token = headers.get("x-proxy-auth")
        if token:
            return token

    # Fall back to env var (always available)
    return ctx.get("env", {}).get("HTTP_PROXY_AUTH", "")
