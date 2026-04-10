"""
Consolidated health check routes for all integration endpoints.

Registers /healthz/admin/integration/<name> and /healthz/admin/integration/<name>/config
for each configured provider using a data-driven registry.

Uses healthz-diagnostics SDK for health checks, timing, and diagnostics.
Uses AppYamlConfig from lifecycle (request.app.state.config) per standards_state_context.md.

Configuration source:
- server.dev.yaml (providers.*)
"""
import os
import time
import json
from typing import Optional
from fastapi import FastAPI, Request

from fetch_httpx import AsyncClient, create_logger
from auth_config import build_sdk_auth_options, resolve_api_key, resolve_context_value, resolve_email
from auth_encoding.sdk import encode_auth_sdk
from app_yaml_overwrites import ComputeScope, apply_resolved_overwrites
from app_yaml_static_config import get_config_from_app_state
from healthz_diagnostics import (
    HealthzDiagnosticsSDK,
    ConfigSanitizer,
    TimestampFormatter,
)

timestamp_formatter = TimestampFormatter()
config_sanitizer = ConfigSanitizer()


# ── Integration registry ────────────────────────────────────────────────────
#
# Each entry describes a provider's health check configuration.
#
# Fields:
#   provider_name          - YAML config key under providers.*
#   integration_name       - URL segment: /healthz/admin/integration/<integration_name>
#   default_auth_type      - passed to build_sdk_auth_options (bearer, x-api-key, custom_header, basic_email_token)
#   default_header_name    - (optional) custom header name for custom_header auth types
#   env_vars               - env var names shown in /config endpoint
#   resolve_base_url       - use resolve_context_value for base_url
#   check_base_url         - pre-validate base_url before health check
#   base_url_error_hint    - hint text appended to base_url error message
#   resolve_config_base_url- resolve base_url into config dict before SDK call
#   resolve_email          - resolve email into config dict before SDK call
#   auth_mode              - "username_basic" for saucelabs/servicenow custom auth
#   check_username         - pre-validate username
#   username_error_hint    - hint text for username error
#   credentials_error      - combined credentials error message (servicenow)
#   health_endpoint_username_substitution - replace :username in health_endpoint (saucelabs)
#   custom_client          - "gemini_openai" for ProxyDispatcherFactory client
#   config_uses_sdk_resolution - use SDK resolution in /config endpoint (gemini_openai)

INTEGRATIONS = [
    {
        "provider_name": "anthropic",
        "integration_name": "anthropic",
        "default_auth_type": "x-api-key",
        "env_vars": ["ANTHROPIC_API_KEY", "HTTPS_PROXY", "HTTP_PROXY"],
    },
    {
        "provider_name": "openai",
        "integration_name": "openai",
        "default_auth_type": "bearer",
        "env_vars": ["OPENAI_API_KEY", "HTTPS_PROXY", "HTTP_PROXY"],
    },
    {
        "provider_name": "openai_embeddings",
        "integration_name": "openai-embeddings",
        "default_auth_type": "bearer",
        "env_vars": ["OPENAI_API_KEY", "HTTPS_PROXY", "HTTP_PROXY"],
    },
    {
        "provider_name": "github",
        "integration_name": "github",
        "default_auth_type": "bearer",
        "env_vars": ["GITHUB_TOKEN", "GH_TOKEN", "GITHUB_ACCESS_TOKEN", "GITHUB_PAT", "HTTPS_PROXY", "HTTP_PROXY"],
    },
    {
        "provider_name": "figma",
        "integration_name": "figma",
        "default_auth_type": "custom_header",
        "default_header_name": "X-Figma-Token",
        "env_vars": ["FIGMA_TOKEN", "HTTPS_PROXY", "HTTP_PROXY"],
    },
    {
        "provider_name": "rally",
        "integration_name": "rally",
        "default_auth_type": "custom_header",
        "default_header_name": "ZSESSIONID",
        "check_base_url": True,
        "env_vars": ["RALLY_API_KEY", "HTTPS_PROXY", "HTTP_PROXY"],
    },
    {
        "provider_name": "statsig",
        "integration_name": "statsig",
        "default_auth_type": "custom_header",
        "default_header_name": "statsig-api-key",
        "check_base_url": True,
        "env_vars": ["STATSIG_API_KEY", "STATSIG_SERVER_SECRET", "HTTPS_PROXY", "HTTP_PROXY"],
    },
    {
        "provider_name": "sonar",
        "integration_name": "sonar",
        "default_auth_type": "bearer",
        "resolve_base_url": True,
        "check_base_url": True,
        "base_url_error_hint": "check SONAR_BASE_URL env var",
        "resolve_config_base_url": True,
        "env_vars": ["SONAR_TOKEN", "SONARQUBE_TOKEN", "SONARCLOUD_TOKEN", "SONAR_API_TOKEN", "SONAR_BASE_URL", "HTTPS_PROXY", "HTTP_PROXY"],
    },
    {
        "provider_name": "jira",
        "integration_name": "jira",
        "default_auth_type": "basic_email_token",
        "resolve_base_url": True,
        "check_base_url": True,
        "base_url_error_hint": "check jira.base_url in server config or JIRA_BASE_URL env var",
        "resolve_config_base_url": True,
        "resolve_email": True,
        "env_vars": ["JIRA_API_TOKEN", "JIRA_EMAIL", "JIRA_BASE_URL", "JIRA_PROJECT_KEY", "JIRA_BOARD_ID", "HTTPS_PROXY", "HTTP_PROXY"],
    },
    {
        "provider_name": "confluence",
        "integration_name": "confluence",
        "default_auth_type": "basic_email_token",
        "resolve_base_url": True,
        "check_base_url": True,
        "base_url_error_hint": "check confluence.base_url in server config or CONFLUENCE_BASE_URL env var",
        "resolve_config_base_url": True,
        "resolve_email": True,
        "env_vars": ["CONFLUENCE_API_TOKEN", "CONFLUENCE_EMAIL", "CONFLUENCE_BASE_URL", "CONFLUENCE_SPACE_KEY", "CONFLUENCE_PARENT_PAGE_ID", "HTTPS_PROXY", "HTTP_PROXY"],
    },
    {
        "provider_name": "saucelabs",
        "integration_name": "saucelabs",
        "auth_mode": "username_basic",
        "check_username": True,
        "username_error_hint": "check SAUCE_USERNAME env var",
        "health_endpoint_username_substitution": True,
        "env_vars": ["SAUCE_USERNAME", "SAUCELABS_USERNAME", "SAUCE_ACCESS_KEY", "SAUCELABS_ACCESS_KEY", "HTTPS_PROXY", "HTTP_PROXY"],
    },
    {
        "provider_name": "servicenow",
        "integration_name": "servicenow",
        "auth_mode": "username_basic",
        "check_base_url": True,
        "check_username": True,
        "credentials_error": "Credentials not configured",
        "env_vars": ["SERVICENOW_USERNAME", "SERVICENOW_PASSWORD", "HTTPS_PROXY", "HTTP_PROXY"],
    },
    {
        "provider_name": "gemini_openai",
        "integration_name": "gemini-openai",
        "default_auth_type": "bearer",
        "custom_client": "gemini_openai",
        "config_uses_sdk_resolution": True,
        "env_vars": ["GEMINI_API_KEY", "HTTPS_PROXY", "HTTP_PROXY"],
    },
]


# ── Redaction & connection details ──────────────────────────────────────────

_SENSITIVE_PATTERNS = [
    "api_key", "token", "password", "secret", "access_key",
    "client_secret", "access_token", "authorization",
]


def _partial_redact(value):
    """Redact a value: show first 10 chars then ***."""
    if value is None or isinstance(value, (bool, int, float)):
        return value
    s = str(value)
    if not s:
        return s
    if len(s) <= 20:
        return "***"
    return s[:15] + "***" + s[-5:]


def _is_sensitive_key(key: str) -> bool:
    lower = key.lower().replace("-", "_")
    return any(p in lower for p in _SENSITIVE_PATTERNS)


def _redact_headers(headers: dict) -> dict:
    if not headers or not isinstance(headers, dict):
        return headers
    return {k: (_partial_redact(v) if _is_sensitive_key(k) else v) for k, v in headers.items()}


def _redact_sensitive_keys(obj):
    """Recursively redact values whose keys match sensitive patterns."""
    if not obj or not isinstance(obj, dict):
        return obj
    result = {}
    for k, v in obj.items():
        if _is_sensitive_key(k) and isinstance(v, str):
            result[k] = _partial_redact(v)
        elif isinstance(v, dict):
            result[k] = _redact_sensitive_keys(v)
        elif isinstance(v, list):
            result[k] = [_redact_sensitive_keys(i) if isinstance(i, dict) else i for i in v]
        else:
            result[k] = v
    return result


def _build_connection_details(provider_config: dict, integration: dict, env_vars: list) -> dict:
    """Build connection details for debugging, with secrets partially redacted."""
    if integration.get("resolve_base_url"):
        resolved_base_url = _resolve_base_url(provider_config)
    else:
        resolved_base_url = provider_config.get("base_url", "")

    client_config = provider_config.get("client", {}) or {}
    custom_headers = provider_config.get("headers", {}) or {}
    proxy_url_config = provider_config.get("proxy_url")
    verify_ssl = provider_config.get("verify_ssl", True)

    # Build auth info and resolved headers — reflect overrides when present
    auth_override = provider_config.get("_auth_header_override")

    if auth_override:
        auth_info = {
            "auth_mode": "override",
            "source": "ui_override",
            "header_name": auth_override["name"],
            "header_value": _partial_redact(auth_override["value"]),
        }
        resolved_auth_headers = {auth_override["name"]: _partial_redact(auth_override["value"])}
    elif integration.get("auth_mode") == "username_basic":
        username = _resolve_username(provider_config)
        auth_info = {
            "auth_mode": "username_basic",
            "source": "server_config",
            "endpoint_auth_type": provider_config.get("endpoint_auth_type", "basic"),
            "username": username,
            "api_key": _partial_redact(resolve_api_key(provider_config)),
        }
        resolved_auth_headers = {}
        try:
            auth_options = _build_username_basic_auth_options(provider_config)
            raw_auth_headers = build_auth_headers(auth_options)
            resolved_auth_headers = {k: _partial_redact(v) for k, v in raw_auth_headers.items()}
        except Exception:
            pass
    else:
        auth_type = integration.get("default_auth_type", "bearer")
        auth_info = {
            "auth_mode": "standard",
            "source": "server_config",
            "endpoint_auth_type": provider_config.get("endpoint_auth_type") or auth_type,
            "endpoint_auth_token_resolver": provider_config.get("endpoint_auth_token_resolver"),
            "api_auth_header_name": provider_config.get("api_auth_header_name"),
            "api_key": _partial_redact(resolve_api_key(provider_config)),
        }
        if provider_config.get("email"):
            auth_info["email"] = provider_config["email"]
        resolved_auth_headers = {}
        try:
            header_name = integration.get("default_header_name")
            if header_name:
                auth_options = build_sdk_auth_options(provider_config, auth_type, header_name)
            else:
                auth_options = build_sdk_auth_options(provider_config, auth_type)
            raw_auth_headers = build_auth_headers(auth_options)
            resolved_auth_headers = {k: _partial_redact(v) for k, v in raw_auth_headers.items()}
        except Exception:
            pass

    # Proxy resolution details
    if proxy_url_config is False:
        proxy_details = {"configured": False, "mode": "disabled", "url": None}
    elif isinstance(proxy_url_config, str) and proxy_url_config:
        proxy_details = {"configured": True, "mode": "explicit", "url": proxy_url_config}
    elif proxy_url_config is None:
        proxy_details = {
            "configured": True,
            "mode": "system_env",
            "HTTPS_PROXY": os.environ.get("HTTPS_PROXY"),
            "HTTP_PROXY": os.environ.get("HTTP_PROXY"),
            "NO_PROXY": os.environ.get("NO_PROXY"),
        }
    else:
        proxy_details = {"configured": False, "mode": "unknown", "raw_value": proxy_url_config}

    # Env var availability
    env_vars_available = {v: (v in os.environ) for v in (env_vars or [])}

    overwrite_from_env = provider_config.get("overwrite_from_env")
    overwrite_from_context = provider_config.get("overwrite_from_context")

    return {
        "base_url": resolved_base_url,
        "health_endpoint": provider_config.get("health_endpoint"),
        "model": provider_config.get("model"),
        "method": provider_config.get("method", "GET"),
        "auth": auth_info,
        "resolved_auth_headers": resolved_auth_headers,
        "headers": _redact_headers(custom_headers),
        "proxy": proxy_details,
        "ssl": {
            "verify_ssl": verify_ssl if verify_ssl is not True else True,
            "ca_bundle": provider_config.get("ca_bundle"),
            "cert": provider_config.get("cert"),
        },
        "client": {
            "timeout_ms": client_config.get("timeout_ms", 30000),
            "timeout_seconds": client_config.get("timeout_seconds"),
            **{k: v for k, v in client_config.items() if k not in ("timeout_ms", "timeout_seconds")},
        },
        "overwrite_from_env": _redact_sensitive_keys(overwrite_from_env) if overwrite_from_env else None,
        "overwrite_from_context": _redact_sensitive_keys(overwrite_from_context) if overwrite_from_context else None,
        "env_vars_available": env_vars_available,
    }


# ── Shared helpers ──────────────────────────────────────────────────────────

def build_auth_headers(auth_options):
    """Build auth headers from SDK auth options using auth_encoding."""
    if not auth_options:
        return {}
    auth_type = auth_options.get("type", "")
    if not auth_type:
        return {}
    if auth_type == "bearer":
        credentials = {"token": auth_options.get("token")}
    elif auth_type == "basic":
        credentials = {"username": auth_options.get("username"), "password": auth_options.get("password")}
    elif auth_type == "x-api-key":
        credentials = {"apiKey": auth_options.get("token")}
    elif auth_type == "custom":
        credentials = {"headerKey": auth_options.get("headerName", "Authorization"), "headerValue": auth_options.get("token")}
    elif auth_type == "basic_email_token":
        credentials = {"email": auth_options.get("email"), "token": auth_options.get("token")}
    else:
        return {}
    result = encode_auth_sdk(auth_type=auth_type, credentials=credentials)
    return result["headers"]


def get_config_from_request(request: Request) -> dict:
    """Get resolved config from app.state (values pre-resolved by context resolver)."""
    return get_config_from_app_state(request.app.state)


def _resolve_base_url(provider_config: dict) -> str:
    """Resolve base_url from overwrite_from_context (resolved by SDK)."""
    base_url = resolve_context_value(provider_config.get("overwrite_from_context"), "base_url")
    if base_url:
        return base_url
    return provider_config.get("base_url") or ""


def _resolve_username(provider_config: dict) -> Optional[str]:
    """Resolve username from overwrite_from_context (resolved by SDK)."""
    username = resolve_context_value(provider_config.get("overwrite_from_context"), "username")
    if username:
        return username
    return provider_config.get("username")


def _build_username_basic_auth_options(provider_config: dict) -> Optional[dict]:
    """Build auth options for providers using username + api_key basic auth."""
    api_key = resolve_api_key(provider_config)
    username = _resolve_username(provider_config)
    if not api_key or not username:
        return None
    return {"type": "basic", "username": username, "password": api_key}


def _make_error_result(provider_name, error_msg, model=None):
    """Create a standard error health check result."""
    return {
        "provider": provider_name,
        "healthy": False,
        "status_code": None,
        "latency_ms": 0,
        "error": error_msg,
        "endpoint": None,
        "model": model,
        "timestamp": timestamp_formatter.format(),
        "diagnostics": [{"type": "request:error", "timestamp": timestamp_formatter.format(), "error": error_msg}],
    }


# ── Client creation ─────────────────────────────────────────────────────────

def _create_standard_client(provider_config, request, integration):
    """Standard client creation using fetch_httpx.AsyncClient."""
    provider_name = integration["provider_name"]
    base_logger = integration["_base_logger"]

    if integration.get("resolve_base_url"):
        base_url = _resolve_base_url(provider_config)
    else:
        base_url = provider_config.get("base_url", "")

    client_config = provider_config.get("client", {})
    timeout_ms = client_config.get("timeout_ms", 30000)
    custom_headers = provider_config.get("headers", {})

    auth_override = provider_config.get("_auth_header_override")
    if auth_override:
        auth_headers = {auth_override["name"]: auth_override["value"]}
    else:
        if integration.get("auth_mode") == "username_basic":
            auth_options = _build_username_basic_auth_options(provider_config)
        else:
            auth_type = integration.get("default_auth_type", "bearer")
            header_name = integration.get("default_header_name")
            if header_name:
                auth_options = build_sdk_auth_options(provider_config, auth_type, header_name)
            else:
                auth_options = build_sdk_auth_options(provider_config, auth_type)
        auth_headers = build_auth_headers(auth_options)

    all_headers = {**custom_headers, **auth_headers}

    base_logger.info(f"Creating SDK client for {base_url} (proxy-aware)")
    print(f"[fetch_config] provider={provider_name}, base_url={base_url}, "
          f"endpoint_auth_type={provider_config.get('endpoint_auth_type')}, "
          f"has_auth_headers={bool(auth_headers)}, "
          f"custom_headers={list(custom_headers.keys())}, "
          f"timeout_ms={timeout_ms}, "
          f"proxy_url={provider_config.get('proxy_url')}, "
          f"headers_auth={({k: v[:15] + '...' for k, v in auth_headers.items()} if auth_headers else None)}")

    proxy_url_config = provider_config.get("proxy_url")
    if proxy_url_config is False:
        proxies = None
        trust_env = False
    elif isinstance(proxy_url_config, str) and proxy_url_config:
        proxies = proxy_url_config
        trust_env = False
    else:
        proxies = None
        trust_env = True

    return AsyncClient(
        base_url=base_url,
        headers=all_headers,
        timeout=timeout_ms / 1000,
        verify=provider_config.get("verify_ssl", True),
        proxies=proxies,
        trust_env=trust_env,
    )


def _create_gemini_openai_client(provider_config, request, integration):
    """Client creation for gemini_openai using fetch_httpx.AsyncClient."""
    provider_name = integration["provider_name"]
    base_logger = integration["_base_logger"]
    auth_type = integration.get("default_auth_type", "bearer")

    base_url = provider_config.get("base_url", "")
    client_config = provider_config.get("client", {})
    timeout_ms = client_config.get("timeout_ms", 30000)
    custom_headers = provider_config.get("headers", {})

    auth_override = provider_config.get("_auth_header_override")
    if auth_override:
        auth_headers = {auth_override["name"]: auth_override["value"]}
    else:
        auth_options = build_sdk_auth_options(provider_config, auth_type)
        auth_headers = build_auth_headers(auth_options)

    all_headers = {**custom_headers, **auth_headers}

    base_logger.info(f"Creating SDK client for {base_url} (proxy-aware)")
    print(f"[fetch_config] provider={provider_name}, base_url={base_url}, "
          f"endpoint_auth_type={provider_config.get('endpoint_auth_type')}, "
          f"has_auth_headers={bool(auth_headers)}, "
          f"custom_headers={list(custom_headers.keys())}, "
          f"timeout_ms={timeout_ms}, "
          f"proxy_url={provider_config.get('proxy_url')}, "
          f"headers_auth={({k: v[:15] + '...' for k, v in auth_headers.items()} if auth_headers else None)}")

    proxy_url_config = provider_config.get("proxy_url")
    if proxy_url_config is False:
        proxies = None
        trust_env = False
    elif isinstance(proxy_url_config, str) and proxy_url_config:
        proxies = proxy_url_config
        trust_env = False
    else:
        proxies = None
        trust_env = True

    return AsyncClient(
        base_url=base_url,
        headers=all_headers,
        timeout=timeout_ms / 1000,
        verify=provider_config.get("verify_ssl", True),
        proxies=proxies,
        trust_env=trust_env,
    )


# ── Health check logic ──────────────────────────────────────────────────────

async def _check_provider_health(provider_name, provider_config, request, integration):
    """Execute health check with provider-specific pre-validation and config resolution."""
    client_logger = integration["_client_logger"]
    model = provider_config.get("model")

    # Skip HTTP fetch for compute-type providers
    if provider_config.get("_type") == "compute":
        client_logger.info(f"Skipping HTTP health check for compute provider {provider_name}")
        return {
            "provider": provider_name,
            "healthy": True,
            "_type": "compute",
            "status_code": None,
            "latency_ms": 0,
            "error": None,
            "endpoint": None,
            "model": model,
            "timestamp": timestamp_formatter.format(),
            "diagnostics": [{"type": "compute:skip", "timestamp": timestamp_formatter.format(), "metadata": {"reason": "compute provider — no HTTP health check"}}],
        }

    # Pre-validate base_url if required
    if integration.get("check_base_url"):
        if integration.get("resolve_base_url"):
            base_url = _resolve_base_url(provider_config)
        else:
            base_url = provider_config.get("base_url", "")
        if not base_url:
            hint = integration.get("base_url_error_hint", "")
            error_msg = f"base_url not configured ({hint})" if hint else "base_url not configured"
            client_logger.error(f"No base_url configured for {provider_name}")
            return _make_error_result(provider_name, error_msg, model)

    # Pre-validate credentials (skip if auth header is overridden)
    if not provider_config.get("_auth_header_override"):
        if integration.get("check_username"):
            username = _resolve_username(provider_config)
            api_key = resolve_api_key(provider_config)
            if integration.get("credentials_error"):
                # ServiceNow: combined check
                if not username or not api_key:
                    error_msg = integration["credentials_error"]
                    client_logger.error(f"{error_msg} for {provider_name}")
                    return _make_error_result(provider_name, error_msg, model)
            else:
                # SauceLabs: separate checks
                if not username:
                    hint = integration.get("username_error_hint", "")
                    error_msg = f"username not configured ({hint})" if hint else "username not configured"
                    client_logger.error(f"No username configured for {provider_name}")
                    return _make_error_result(provider_name, error_msg, model)
                if not api_key:
                    client_logger.error(f"No API key available for {provider_name}")
                    return _make_error_result(provider_name, "API key not configured", model)
        else:
            # Standard API key check
            api_key = resolve_api_key(provider_config)
            if not api_key:
                client_logger.error(f"No API key available for {provider_name}")
                return _make_error_result(provider_name, "API key not configured", model)

    # Build resolved config for SDK (provider-specific transforms)
    resolved_config = provider_config
    needs_resolution = (integration.get("resolve_config_base_url") or
                        integration.get("resolve_email") or
                        integration.get("health_endpoint_username_substitution"))
    if needs_resolution:
        resolved_config = dict(provider_config)
        if integration.get("resolve_config_base_url"):
            resolved_config["base_url"] = _resolve_base_url(provider_config)
        if integration.get("resolve_email"):
            resolved_config["email"] = resolve_email(provider_config)
        if integration.get("health_endpoint_username_substitution"):
            username = _resolve_username(provider_config)
            health_endpoint = resolved_config.get("health_endpoint", "/rest/v1/users/:username")
            resolved_config["health_endpoint"] = health_endpoint.replace(":username", username)

    # Create SDK and run health check
    create_client_fn = integration["_create_client_fn"]
    sdk = HealthzDiagnosticsSDK.create(
        lambda config, _req=request, _integ=integration: create_client_fn(config, _req, _integ)
    )
    client_logger.info(f"Executing health check for {provider_name} via SDK")
    result = await sdk.check_health(provider_name, resolved_config)
    client_logger.info(f"Health check completed: {result['status_code']} in {result['latency_ms']}ms")
    response_data = result.pop('data', None)
    if response_data is not None:
        client_logger.info(f"Response data: {response_data}")
    return result


# ── Override application ─────────────────────────────────────────────────────

def _apply_overrides(provider_config: dict, overrides: dict) -> dict:
    """Apply UI overrides to a copy of the provider config."""
    if not overrides or not isinstance(overrides, dict):
        return provider_config
    has_override = (
        "proxy_url" in overrides or
        "verify_ssl" in overrides or
        "ca_bundle" in overrides or
        (overrides.get("auth_header_name") and overrides.get("auth_header_value"))
    )
    if not has_override:
        return provider_config

    config = dict(provider_config)
    if "proxy_url" in overrides:
        config["proxy_url"] = overrides["proxy_url"]
    if "verify_ssl" in overrides:
        config["verify_ssl"] = overrides["verify_ssl"]
    if "ca_bundle" in overrides:
        config["ca_bundle"] = overrides["ca_bundle"]
    if overrides.get("auth_header_name") and overrides.get("auth_header_value"):
        config["_auth_header_override"] = {
            "name": overrides["auth_header_name"],
            "value": overrides["auth_header_value"],
        }
    return config


# ── Route registration ──────────────────────────────────────────────────────

def _register_integration(app: FastAPI, integration: dict):
    """Register /healthz/admin/integration/<name> and /config routes for one provider."""
    provider_name = integration["provider_name"]
    integration_name = integration["integration_name"]
    env_vars = integration["env_vars"]

    # Create per-integration loggers
    client_logger = create_logger("fetch_httpx", f"healthz_integration_{provider_name}")
    base_logger = create_logger("fetch_httpx", f"healthz_integration_{provider_name}")
    integration["_client_logger"] = client_logger
    integration["_base_logger"] = base_logger

    # Select client creation function
    if integration.get("custom_client") == "gemini_openai":
        integration["_create_client_fn"] = _create_gemini_openai_client
    else:
        integration["_create_client_fn"] = _create_standard_client

    # ── Health check route ──────────────────────────────────────────────

    @app.get(f"/healthz/admin/integration/{integration_name}")
    async def healthz_check(request: Request):
        base_logger.info(f"Health check: {provider_name}")
        try:
            provider_config = None

            # Try to get fully resolved config from SDK (includes REQUEST scope compute functions)
            sdk = getattr(request.app.state, 'sdk', None)
            if sdk and hasattr(sdk, 'get_resolved'):
                try:
                    resolved_config = await sdk.get_resolved(ComputeScope.REQUEST, {"request": request})
                    provider_config = resolved_config.get("providers", {}).get(provider_name, {})
                    provider_config = apply_resolved_overwrites(provider_config)
                    base_logger.info("Using SDK-resolved config with REQUEST scope")
                except Exception as e:
                    base_logger.warn(f"SDK resolution failed, falling back: {e}")

            # Fallback to pre-resolved startup config or raw config
            if not provider_config:
                config = get_config_from_request(request)
                providers_config = config.get("providers", {}) if hasattr(config, 'get') else {}
                provider_config = providers_config.get(provider_name, {})
                provider_config = apply_resolved_overwrites(provider_config)
                base_logger.info("Using fallback config (startup-resolved or raw)")

            if not provider_config:
                return {"healthy": False, "timestamp": timestamp_formatter.format(), "error": f"{provider_name} provider not configured"}

            health_result = await _check_provider_health(provider_name, provider_config, request, integration)
            connection_details = _build_connection_details(provider_config, integration, env_vars)
            return {**health_result, "connection_details": connection_details}
        except Exception as e:
            base_logger.error(f"Health check failed: {e}")
            return {"healthy": False, "timestamp": timestamp_formatter.format(), "error": str(e)}

    healthz_check.__name__ = f"healthz_integration_{provider_name}"

    # ── Health check route (POST with overrides) ─────────────────────

    @app.post(f"/healthz/admin/integration/{integration_name}")
    async def healthz_check_post(request: Request):
        base_logger.info(f"Health check (POST with overrides): {provider_name}")
        overrides = {}
        try:
            overrides = await request.json()
        except Exception:
            pass

        try:
            provider_config = None

            sdk = getattr(request.app.state, 'sdk', None)
            if sdk and hasattr(sdk, 'get_resolved'):
                try:
                    resolved_config = await sdk.get_resolved(ComputeScope.REQUEST, {"request": request})
                    provider_config = resolved_config.get("providers", {}).get(provider_name, {})
                    provider_config = apply_resolved_overwrites(provider_config)
                except Exception as e:
                    base_logger.warn(f"SDK resolution failed, falling back: {e}")

            if not provider_config:
                config = get_config_from_request(request)
                providers_config = config.get("providers", {}) if hasattr(config, 'get') else {}
                provider_config = providers_config.get(provider_name, {})
                provider_config = apply_resolved_overwrites(provider_config)

            if not provider_config:
                return {"healthy": False, "timestamp": timestamp_formatter.format(), "error": f"{provider_name} provider not configured"}

            # Apply UI overrides
            provider_config = _apply_overrides(provider_config, overrides)

            health_result = await _check_provider_health(provider_name, provider_config, request, integration)
            connection_details = _build_connection_details(provider_config, integration, env_vars)
            connection_details["_overrides_applied"] = {
                "proxy": "proxy_url" in overrides,
                "ssl": "verify_ssl" in overrides or "ca_bundle" in overrides,
                "auth": bool(overrides.get("auth_header_name") and overrides.get("auth_header_value")),
            }
            return {**health_result, "connection_details": connection_details}
        except Exception as e:
            base_logger.error(f"Health check failed: {e}")
            return {"healthy": False, "timestamp": timestamp_formatter.format(), "error": str(e)}

    healthz_check_post.__name__ = f"healthz_integration_{provider_name}_post"

    # ── Config route ────────────────────────────────────────────────────

    if integration.get("config_uses_sdk_resolution"):
        @app.get(f"/healthz/admin/integration/{integration_name}/config")
        async def config_check_with_sdk(request: Request):
            base_logger.info("Config check")
            try:
                provider_config = None

                sdk = getattr(request.app.state, 'sdk', None)
                if sdk and hasattr(sdk, 'get_resolved'):
                    try:
                        resolved_config = await sdk.get_resolved(ComputeScope.REQUEST, {"request": request})
                        provider_config = resolved_config.get("providers", {}).get(provider_name, {})
                        provider_config = apply_resolved_overwrites(provider_config)
                        base_logger.info("Using SDK-resolved config with REQUEST scope")
                    except Exception as e:
                        base_logger.warn(f"SDK resolution failed, falling back: {e}")

                if not provider_config:
                    config = get_config_from_request(request)
                    providers_config = config.get("providers", {}) if hasattr(config, 'get') else {}
                    provider_config = providers_config.get(provider_name, {})
                    provider_config = apply_resolved_overwrites(provider_config)
                    base_logger.info("Using fallback config (raw)")

                return {
                    "initialized": True,
                    "lifecycle_state": {
                        "config": hasattr(request.app.state, 'config'),
                        "sharedContext": hasattr(request.app.state, 'sharedContext'),
                        "sdk": hasattr(request.app.state, 'sdk'),
                        "configSdk": hasattr(request.app.state, 'configSdk'),
                    },
                    "packages_loaded": {"fetch_httpx": True, "auth_config": True, "auth_encoding": True, "healthz_diagnostics": True},
                    "sdk_version": "1.0.0",
                    provider_name: config_sanitizer.sanitize(provider_config),
                    "env_vars_available": config_sanitizer.check_env_vars(env_vars),
                }
            except Exception as e:
                return {"initialized": False, "error": str(e)}

        config_check_with_sdk.__name__ = f"healthz_integration_{provider_name}_config"
    else:
        @app.get(f"/healthz/admin/integration/{integration_name}/config")
        async def config_check(request: Request):
            base_logger.info("Config check")
            try:
                config = get_config_from_request(request)
                providers_config = config.get("providers", {}) if hasattr(config, 'get') else {}
                provider_config = providers_config.get(provider_name, {})

                return {
                    "initialized": True,
                    "lifecycle_state": {
                        "config": hasattr(request.app.state, 'config'),
                        "sharedContext": hasattr(request.app.state, 'sharedContext'),
                        "sdk": hasattr(request.app.state, 'sdk'),
                        "configSdk": hasattr(request.app.state, 'configSdk'),
                    },
                    "packages_loaded": {"fetch_httpx": True, "auth_config": True, "auth_encoding": True, "healthz_diagnostics": True},
                    "sdk_version": "1.0.0",
                    provider_name: config_sanitizer.sanitize(provider_config),
                    "env_vars_available": config_sanitizer.check_env_vars(env_vars),
                }
            except Exception as e:
                return {"initialized": False, "error": str(e)}

        config_check.__name__ = f"healthz_integration_{provider_name}_config"


# ── Catch-all for YAML-only providers (e.g. _type=compute) ──────────────────
# FastAPI matches specific routes before parametric, so this only fires for
# providers that are NOT in the INTEGRATIONS registry.

def _register_catchall_route(app: FastAPI):
    registered_names = {i["integration_name"] for i in INTEGRATIONS}
    base_logger = create_logger("fetch_httpx", "healthz_integration_catchall")

    @app.get("/healthz/admin/integration/{integration_name}")
    async def healthz_catchall(integration_name: str, request: Request):
        # Normalize: route segment uses hyphens, YAML keys use underscores
        provider_name = integration_name.replace("-", "_")
        base_logger.info(f"Catch-all health check: {provider_name}")

        try:
            provider_config = None
            config_resolution_source = "fallback_startup"

            sdk = getattr(request.app.state, 'sdk', None)
            if sdk and hasattr(sdk, 'get_resolved'):
                try:
                    resolved_config = await sdk.get_resolved(ComputeScope.REQUEST, {"request": request})
                    provider_config = resolved_config.get("providers", {}).get(provider_name)
                    if provider_config:
                        provider_config = apply_resolved_overwrites(provider_config)
                        config_resolution_source = "sdk_resolved"
                except Exception as e:
                    base_logger.warn(f"SDK resolution failed, falling back: {e}")

            if not provider_config:
                config = get_config_from_request(request)
                providers_config = config.get("providers", {}) if hasattr(config, 'get') else {}
                provider_config = providers_config.get(provider_name, {})
                provider_config = apply_resolved_overwrites(provider_config)

            if not provider_config:
                return {"healthy": False, "timestamp": timestamp_formatter.format(), "error": f"{provider_name} provider not configured"}

            # Compute providers: return config without HTTP fetch
            if provider_config.get("_type") == "compute":
                connection_details = _build_connection_details(provider_config, {"provider_name": provider_name, "env_vars": []}, [])
                return {
                    "provider": provider_name,
                    "healthy": True,
                    "_type": "compute",
                    "status_code": None,
                    "latency_ms": 0,
                    "error": None,
                    "endpoint": None,
                    "model": provider_config.get("model"),
                    "timestamp": timestamp_formatter.format(),
                    "diagnostics": [{"type": "compute:skip", "timestamp": timestamp_formatter.format(), "metadata": {"reason": "compute provider — no HTTP health check"}}],
                    "connection_details": connection_details,
                }

            # Non-compute, unknown provider — no registered health check
            return {"healthy": False, "timestamp": timestamp_formatter.format(), "error": f"No health check registered for {provider_name}"}
        except Exception as e:
            base_logger.error(f"Catch-all health check failed: {e}")
            return {"healthy": False, "timestamp": timestamp_formatter.format(), "error": str(e)}

    @app.get("/healthz/admin/integration/{integration_name}/config")
    async def config_catchall(integration_name: str, request: Request):
        provider_name = integration_name.replace("-", "_")
        try:
            config = get_config_from_request(request)
            providers_config = config.get("providers", {}) if hasattr(config, 'get') else {}
            provider_config = providers_config.get(provider_name, {})
            return {
                "initialized": True,
                "_type": provider_config.get("_type"),
                provider_name: config_sanitizer.sanitize(provider_config),
            }
        except Exception as e:
            return {"initialized": False, "error": str(e)}


def mount(app: FastAPI):
    for integration in INTEGRATIONS:
        _register_integration(app, integration)

    # Register catch-all for YAML-only providers (must be last — parametric)
    _register_catchall_route(app)
