"""
Composite compute function that resolves API keys for all providers.

Returns a dict keyed by provider name, each holding the resolved
API key from the environment.  Uses a fake async delay to validate
that the resolver correctly awaits async compute functions.

Usage in YAML (Option 4 — property access):
    endpoint_api_key: "{{fn:provider_api_keys.openai}}"
    endpoint_api_key: "{{fn:provider_api_keys.anthropic}}"
"""

import asyncio

from app_yaml_overwrites.options import ComputeScope
from env_resolver import (
    resolve_openai_env, resolve_anthropic_env, resolve_gemini_env,
    resolve_figma_env, resolve_github_env, resolve_jira_env,
    resolve_confluence_env, resolve_saucelabs_env, resolve_servicenow_env,
    resolve_rally_env, resolve_statsig_env, resolve_sonarqube_env,
)

NAME = "provider_api_keys"
SCOPE = ComputeScope.GLOBAL


async def register(ctx: dict) -> dict:
    """
    Compute function entry point for auto-loading.

    Args:
        ctx: Context dictionary with env, config, app, state, shared, request

    Returns:
        Dict keyed by provider name → resolved API key string
    """
    # Fake async wait — proves the resolver awaits async compute functions
    await asyncio.sleep(0.005)

    result = {
        "openai":            resolve_openai_env().api_key or "",
        "openai_embeddings": resolve_openai_env().api_key or "",
        "anthropic":         resolve_anthropic_env().api_key or "",
        "gemini_openai":     resolve_gemini_env().api_key or "",
        "figma":             resolve_figma_env().token or "",
        "github":            resolve_github_env().token or "",
        "jira":              resolve_jira_env().api_token or "",
        "confluence":        resolve_confluence_env().api_token or "",
        "saucelabs":         resolve_saucelabs_env().access_key or "",
        "servicenow":        resolve_servicenow_env().password or "",
        "rally":             resolve_rally_env().api_key or "",
        "statsig":           resolve_statsig_env().api_key or "",
        "sonar":             resolve_sonarqube_env().api_token or "",
    }

    return result
