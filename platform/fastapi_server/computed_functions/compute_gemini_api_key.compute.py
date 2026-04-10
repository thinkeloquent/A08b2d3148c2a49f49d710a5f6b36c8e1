"""
Compute function to get Gemini API key from environment.

This function is registered with ComputeRegistry and called when
resolving {{fn:compute_gemini_api_key}} templates.

Usage in YAML:
    endpoint_api_key: "{{fn:compute_gemini_api_key}}"
"""
from app_yaml_overwrites.options import ComputeScope
from env_resolver import resolve_gemini_env

_gemini_env = resolve_gemini_env()

# Module-level exports for auto-loading
NAME = "compute_gemini_api_key"
SCOPE = ComputeScope.STARTUP


def register(ctx: dict) -> str:
    """
    Compute function entry point for auto-loading.

    Args:
        ctx: Context dictionary with env, config, app, state, shared

    Returns:
        API key string from GEMINI_API_KEY environment variable
    """
    return ctx.get('env', {}).get('GEMINI_API_KEY', '') or _gemini_env.api_key or ''
