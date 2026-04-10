"""
Proxy Test Routes for Gemini OpenAI integration.

Tests various client configurations with/without proxy and SSL disabled.
Uses multiple polyglot packages to demonstrate different approaches.

Routes:
- /healthz/admin/integration/gemini-openai-proxy/fetch-client (no proxy)
- /healthz/admin/integration/gemini-openai-proxy/fetch-client-proxy (with proxy)
- /healthz/admin/integration/gemini-openai-proxy/proxy-aware-client (no proxy)
- /healthz/admin/integration/gemini-openai-proxy/proxy-aware-client-proxy (with proxy)
- /healthz/admin/integration/gemini-openai-proxy/proxy-dispatcher (no proxy)
- /healthz/admin/integration/gemini-openai-proxy/proxy-dispatcher-proxy (with proxy)
- /healthz/admin/integration/gemini-openai-proxy/httpx (no proxy)
- /healthz/admin/integration/gemini-openai-proxy/httpx-proxy (with proxy)
"""
import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import httpx
from fastapi import FastAPI, Request

from fetch_httpx import create_logger
from auth_config import build_sdk_auth_options, resolve_api_key
from auth_encoding.sdk import encode_auth_sdk
from app_yaml_overwrites import ComputeScope, apply_resolved_overwrites
from app_yaml_static_config import get_config_from_app_state
from healthz_diagnostics import ConfigSanitizer, TimestampFormatter

client_logger = create_logger("fetch_httpx", "healthz_integration_gemini_openai_proxy")

PROVIDER_NAME = "gemini_openai"
INTEGRATION_NAME = "gemini-openai-proxy"
DEFAULT_AUTH_TYPE = "bearer"
DEFAULT_PROXY_URL = "http://proxy.dev.local:8080"
DEFAULT_TIMEOUT_MS = 20000

timestamp_formatter = TimestampFormatter()
config_sanitizer = ConfigSanitizer()


def build_auth_headers(provider_config: Dict[str, Any]) -> Dict[str, str]:
    """Build auth headers from provider config."""
    auth_options = build_sdk_auth_options(provider_config, DEFAULT_AUTH_TYPE)
    if not auth_options:
        return {}

    auth_type = auth_options.get("type", "")
    if not auth_type:
        return {}

    if auth_type == "bearer":
        credentials = {"token": auth_options.get("token")}
    elif auth_type == "basic":
        credentials = {
            "username": auth_options.get("username"),
            "password": auth_options.get("password"),
        }
    elif auth_type == "x-api-key":
        credentials = {"apiKey": auth_options.get("token")}
    elif auth_type == "custom":
        credentials = {
            "headerKey": auth_options.get("headerName", "Authorization"),
            "headerValue": auth_options.get("token"),
        }
    elif auth_type == "basic_email_token":
        credentials = {
            "email": auth_options.get("email"),
            "token": auth_options.get("token"),
        }
    else:
        return {}

    result = encode_auth_sdk(auth_type=auth_type, credentials=credentials)
    return result["headers"]


async def get_provider_config(request: Request) -> Dict[str, Any]:
    """Get resolved provider config from app state."""
    provider_config = None

    sdk = getattr(request.app.state, "sdk", None)
    if sdk and hasattr(sdk, "get_resolved"):
        try:
            resolved_config = await sdk.get_resolved(
                ComputeScope.REQUEST, {"request": request}
            )
            provider_config = resolved_config.get("providers", {}).get(
                PROVIDER_NAME, {}
            )
            provider_config = apply_resolved_overwrites(provider_config)
        except Exception as e:
            client_logger.warn(f"SDK resolution failed: {e}")

    if not provider_config:
        config = get_config_from_app_state(request.app.state)
        providers_config = config.get("providers", {}) if hasattr(config, "get") else {}
        provider_config = providers_config.get(PROVIDER_NAME, {})
        provider_config = apply_resolved_overwrites(provider_config)

    return provider_config


def get_proxy_url(provider_config: Dict[str, Any]) -> str:
    """Get proxy URL from config or environment."""
    network_config = provider_config.get("network", {})
    proxy_urls = network_config.get("proxy_urls", {})
    default_env = network_config.get("default_environment", "dev")
    return (
        proxy_urls.get(default_env)
        or os.environ.get("HTTPS_PROXY")
        or os.environ.get("HTTP_PROXY")
        or DEFAULT_PROXY_URL
    )


def get_method(provider_config: Dict[str, Any]) -> str:
    """Get HTTP method from provider config (default: POST)."""
    return (provider_config.get("method") or "POST").upper()


async def make_health_request(
    client_fn, provider_config: Dict[str, Any], client_type: str
) -> Dict[str, Any]:
    """Make health check request and return standardized result."""
    start_time = time.time()
    base_url = provider_config.get("base_url", "")
    health_endpoint = provider_config.get("health_endpoint", "")
    url = f"{base_url}{health_endpoint}"

    try:
        response = await client_fn(url)
        latency_ms = int((time.time() - start_time) * 1000)

        status_code = response.get("status") or response.get("status_code")
        ok = response.get("ok", status_code and 200 <= status_code < 300)

        # Extract response data (JSON or text)
        response_data = response.get("data") or response.get("json") or response.get("text")

        return {
            "client_type": client_type,
            "healthy": ok,
            "status_code": status_code,
            "latency_ms": latency_ms,
            "endpoint": url,
            "model": provider_config.get("model"),
            "timestamp": timestamp_formatter.format(),
            "proxy_used": "proxy" in client_type,
            "ssl_verify": False,
            "response": response_data,
        }
    except Exception as err:
        latency_ms = int((time.time() - start_time) * 1000)
        return {
            "client_type": client_type,
            "healthy": False,
            "status_code": None,
            "latency_ms": latency_ms,
            "endpoint": url,
            "model": provider_config.get("model"),
            "timestamp": timestamp_formatter.format(),
            "error": str(err),
            "proxy_used": "proxy" in client_type,
            "ssl_verify": False,
            "response": None,
        }


def mount(app: FastAPI):
    """Mount all proxy test routes."""

    @app.get(f"/healthz/admin/integration/{INTEGRATION_NAME}/fetch-client")
    async def test_fetch_client(request: Request):
        """1. fetch-client without proxy"""
        client_logger.info("Testing fetch-client without proxy")

        try:
            provider_config = await get_provider_config(request)
            auth_headers = build_auth_headers(provider_config)

            method = get_method(provider_config)
            async def do_request(url):
                health_endpoint = provider_config.get("health_endpoint", "")
                async with httpx.AsyncClient(
                    base_url=provider_config.get("base_url", ""),
                    headers=auth_headers,
                    verify=False,
                    timeout=provider_config.get("client", {}).get("timeout_ms", DEFAULT_TIMEOUT_MS) / 1000,
                ) as client:
                    response = await client.request(method, health_endpoint)
                    try:
                        data = response.json()
                    except Exception:
                        data = response.text
                    return {
                        "ok": 200 <= response.status_code < 300,
                        "status": response.status_code,
                        "status_code": response.status_code,
                        "data": data,
                    }

            result = await make_health_request(do_request, provider_config, "fetch-client")
            return result
        except Exception as err:
            client_logger.error(f"fetch-client error: {err}")
            return {
                "client_type": "fetch-client",
                "healthy": False,
                "error": str(err),
                "timestamp": timestamp_formatter.format(),
            }

    @app.get(f"/healthz/admin/integration/{INTEGRATION_NAME}/fetch-client-proxy")
    async def test_fetch_client_proxy(request: Request):
        """2. fetch-client with proxy"""
        client_logger.info("Testing fetch-client with proxy")

        try:
            provider_config = await get_provider_config(request)
            auth_headers = build_auth_headers(provider_config)
            proxy_url = get_proxy_url(provider_config)

            method = get_method(provider_config)
            async def do_request(url):
                health_endpoint = provider_config.get("health_endpoint", "")
                async with httpx.AsyncClient(
                    base_url=provider_config.get("base_url", ""),
                    headers=auth_headers,
                    verify=False,
                    timeout=provider_config.get("client", {}).get("timeout_ms", DEFAULT_TIMEOUT_MS) / 1000,
                    proxy=proxy_url,
                ) as client:
                    response = await client.request(method, health_endpoint)
                    try:
                        data = response.json()
                    except Exception:
                        data = response.text
                    return {
                        "ok": 200 <= response.status_code < 300,
                        "status": response.status_code,
                        "status_code": response.status_code,
                        "data": data,
                    }

            result = await make_health_request(
                do_request, provider_config, "fetch-client-proxy"
            )
            return {**result, "proxy_url": config_sanitizer.mask_url(proxy_url)}
        except Exception as err:
            client_logger.error(f"fetch-client-proxy error: {err}")
            return {
                "client_type": "fetch-client-proxy",
                "healthy": False,
                "error": str(err),
                "timestamp": timestamp_formatter.format(),
            }

    @app.get(f"/healthz/admin/integration/{INTEGRATION_NAME}/proxy-aware-client")
    async def test_proxy_aware_client(request: Request):
        """3. proxy-aware-client without proxy"""
        client_logger.info("Testing proxy-aware-client without proxy")

        try:
            provider_config = await get_provider_config(request)
            auth_headers = build_auth_headers(provider_config)
            timeout_sec = provider_config.get("client", {}).get("timeout_ms", DEFAULT_TIMEOUT_MS) / 1000

            async with httpx.AsyncClient(
                base_url=provider_config.get("base_url", ""),
                headers=auth_headers,
                timeout=timeout_sec,
                verify=False,
                trust_env=False,
            ) as client:
                method = get_method(provider_config)
                async def do_request(url):
                    health_endpoint = provider_config.get("health_endpoint", "")
                    response = await client.request(method, health_endpoint)
                    try:
                        data = response.json()
                    except Exception:
                        data = response.text
                    return {
                        "ok": 200 <= response.status_code < 300,
                        "status": response.status_code,
                        "status_code": response.status_code,
                        "data": data,
                    }

                result = await make_health_request(
                    do_request, provider_config, "proxy-aware-client"
                )
                return result
        except Exception as err:
            client_logger.error(f"proxy-aware-client error: {err}")
            return {
                "client_type": "proxy-aware-client",
                "healthy": False,
                "error": str(err),
                "timestamp": timestamp_formatter.format(),
            }

    @app.get(f"/healthz/admin/integration/{INTEGRATION_NAME}/proxy-aware-client-proxy")
    async def test_proxy_aware_client_proxy(request: Request):
        """4. proxy-aware-client with proxy"""
        client_logger.info("Testing proxy-aware-client with proxy")

        try:
            provider_config = await get_provider_config(request)
            auth_headers = build_auth_headers(provider_config)
            proxy_url = get_proxy_url(provider_config)
            timeout_sec = provider_config.get("client", {}).get("timeout_ms", DEFAULT_TIMEOUT_MS) / 1000

            async with httpx.AsyncClient(
                base_url=provider_config.get("base_url", ""),
                headers=auth_headers,
                timeout=timeout_sec,
                verify=False,
                proxy=proxy_url,
                trust_env=False,
            ) as client:
                method = get_method(provider_config)
                async def do_request(url):
                    health_endpoint = provider_config.get("health_endpoint", "")
                    response = await client.request(method, health_endpoint)
                    try:
                        data = response.json()
                    except Exception:
                        data = response.text
                    return {
                        "ok": 200 <= response.status_code < 300,
                        "status": response.status_code,
                        "status_code": response.status_code,
                        "data": data,
                    }

                result = await make_health_request(
                    do_request, provider_config, "proxy-aware-client-proxy"
                )
                return {**result, "proxy_url": config_sanitizer.mask_url(proxy_url)}
        except Exception as err:
            client_logger.error(f"proxy-aware-client-proxy error: {err}")
            return {
                "client_type": "proxy-aware-client-proxy",
                "healthy": False,
                "error": str(err),
                "timestamp": timestamp_formatter.format(),
            }

    @app.get(f"/healthz/admin/integration/{INTEGRATION_NAME}/proxy-dispatcher")
    async def test_proxy_dispatcher(request: Request):
        """5. proxy-dispatcher without proxy"""
        client_logger.info("Testing proxy-dispatcher without proxy")

        try:
            provider_config = await get_provider_config(request)
            auth_headers = build_auth_headers(provider_config)
            timeout_sec = provider_config.get("client", {}).get("timeout_ms", DEFAULT_TIMEOUT_MS) / 1000

            base_url = provider_config.get("base_url", "")
            health_endpoint = provider_config.get("health_endpoint", "")
            url = f"{base_url}{health_endpoint}"
            method = get_method(provider_config)

            async def do_request(target_url):
                async with httpx.AsyncClient(
                    verify=False,
                    timeout=timeout_sec,
                ) as client:
                    response = await client.request(method, target_url, headers=auth_headers)
                    try:
                        data = response.json()
                    except Exception:
                        data = response.text
                    return {
                        "ok": 200 <= response.status_code < 300,
                        "status": response.status_code,
                        "status_code": response.status_code,
                        "data": data,
                    }

            health_result = await make_health_request(
                do_request, provider_config, "proxy-dispatcher"
            )
            return health_result
        except Exception as err:
            client_logger.error(f"proxy-dispatcher error: {err}")
            return {
                "client_type": "proxy-dispatcher",
                "healthy": False,
                "error": str(err),
                "timestamp": timestamp_formatter.format(),
            }

    @app.get(f"/healthz/admin/integration/{INTEGRATION_NAME}/proxy-dispatcher-proxy")
    async def test_proxy_dispatcher_proxy(request: Request):
        """6. proxy-dispatcher with proxy"""
        client_logger.info("Testing proxy-dispatcher with proxy")

        try:
            provider_config = await get_provider_config(request)
            auth_headers = build_auth_headers(provider_config)
            proxy_url = get_proxy_url(provider_config)
            timeout_sec = provider_config.get("client", {}).get("timeout_ms", DEFAULT_TIMEOUT_MS) / 1000

            base_url = provider_config.get("base_url", "")
            health_endpoint = provider_config.get("health_endpoint", "")
            url = f"{base_url}{health_endpoint}"
            method = get_method(provider_config)

            async def do_request(target_url):
                async with httpx.AsyncClient(
                    verify=False,
                    timeout=timeout_sec,
                    proxy=proxy_url,
                ) as client:
                    response = await client.request(method, target_url, headers=auth_headers)
                    try:
                        data = response.json()
                    except Exception:
                        data = response.text
                    return {
                        "ok": 200 <= response.status_code < 300,
                        "status": response.status_code,
                        "status_code": response.status_code,
                        "data": data,
                    }

            health_result = await make_health_request(
                do_request, provider_config, "proxy-dispatcher-proxy"
            )
            return {**health_result, "proxy_url": config_sanitizer.mask_url(proxy_url)}
        except Exception as err:
            client_logger.error(f"proxy-dispatcher-proxy error: {err}")
            return {
                "client_type": "proxy-dispatcher-proxy",
                "healthy": False,
                "error": str(err),
                "timestamp": timestamp_formatter.format(),
            }

    @app.get(f"/healthz/admin/integration/{INTEGRATION_NAME}/httpx")
    async def test_httpx(request: Request):
        """7. httpx without proxy"""
        client_logger.info("Testing httpx without proxy")

        try:
            provider_config = await get_provider_config(request)
            auth_headers = build_auth_headers(provider_config)
            timeout_sec = provider_config.get("client", {}).get("timeout_ms", DEFAULT_TIMEOUT_MS) / 1000

            base_url = provider_config.get("base_url", "")
            health_endpoint = provider_config.get("health_endpoint", "")
            url = f"{base_url}{health_endpoint}"
            method = get_method(provider_config)

            async def do_request(target_url):
                async with httpx.AsyncClient(
                    verify=False,
                    timeout=timeout_sec,
                ) as client:
                    response = await client.request(method, target_url, headers=auth_headers)
                    try:
                        data = response.json()
                    except Exception:
                        data = response.text
                    return {
                        "ok": 200 <= response.status_code < 300,
                        "status": response.status_code,
                        "status_code": response.status_code,
                        "data": data,
                    }

            result = await make_health_request(do_request, provider_config, "httpx")
            return result
        except Exception as err:
            client_logger.error(f"httpx error: {err}")
            return {
                "client_type": "httpx",
                "healthy": False,
                "error": str(err),
                "timestamp": timestamp_formatter.format(),
            }

    @app.get(f"/healthz/admin/integration/{INTEGRATION_NAME}/httpx-proxy")
    async def test_httpx_proxy(request: Request):
        """8. httpx with proxy"""
        client_logger.info("Testing httpx with proxy")

        try:
            provider_config = await get_provider_config(request)
            auth_headers = build_auth_headers(provider_config)
            proxy_url = get_proxy_url(provider_config)
            timeout_sec = provider_config.get("client", {}).get("timeout_ms", DEFAULT_TIMEOUT_MS) / 1000

            base_url = provider_config.get("base_url", "")
            health_endpoint = provider_config.get("health_endpoint", "")
            url = f"{base_url}{health_endpoint}"
            method = get_method(provider_config)

            async def do_request(target_url):
                async with httpx.AsyncClient(
                    verify=False,
                    timeout=timeout_sec,
                    proxy=proxy_url,
                ) as client:
                    response = await client.request(method, target_url, headers=auth_headers)
                    try:
                        data = response.json()
                    except Exception:
                        data = response.text
                    return {
                        "ok": 200 <= response.status_code < 300,
                        "status": response.status_code,
                        "status_code": response.status_code,
                        "data": data,
                    }

            result = await make_health_request(do_request, provider_config, "httpx-proxy")
            return {**result, "proxy_url": config_sanitizer.mask_url(proxy_url)}
        except Exception as err:
            client_logger.error(f"httpx-proxy error: {err}")
            return {
                "client_type": "httpx-proxy",
                "healthy": False,
                "error": str(err),
                "timestamp": timestamp_formatter.format(),
            }

    @app.get(f"/healthz/admin/integration/{INTEGRATION_NAME}/all")
    async def test_all(request: Request):
        """Summary endpoint - runs all tests"""
        client_logger.info("Running all proxy tests")

        endpoints = [
            "fetch-client",
            "fetch-client-proxy",
            "proxy-aware-client",
            "proxy-aware-client-proxy",
            "proxy-dispatcher",
            "proxy-dispatcher-proxy",
            "httpx",
            "httpx-proxy",
        ]

        results = {}
        test_functions = {
            "fetch-client": test_fetch_client,
            "fetch-client-proxy": test_fetch_client_proxy,
            "proxy-aware-client": test_proxy_aware_client,
            "proxy-aware-client-proxy": test_proxy_aware_client_proxy,
            "proxy-dispatcher": test_proxy_dispatcher,
            "proxy-dispatcher-proxy": test_proxy_dispatcher_proxy,
            "httpx": test_httpx,
            "httpx-proxy": test_httpx_proxy,
        }

        for endpoint in endpoints:
            try:
                results[endpoint] = await test_functions[endpoint](request)
            except Exception as err:
                results[endpoint] = {"healthy": False, "error": str(err)}

        healthy_count = sum(1 for r in results.values() if r.get("healthy"))
        unhealthy_count = len(endpoints) - healthy_count

        return {
            "timestamp": timestamp_formatter.format(),
            "summary": {
                "total": len(endpoints),
                "healthy": healthy_count,
                "unhealthy": unhealthy_count,
            },
            "results": results,
        }

    @app.get(f"/healthz/admin/integration/{INTEGRATION_NAME}/config")
    async def config_check(request: Request):
        """Config endpoint"""
        client_logger.info("Config check")

        try:
            provider_config = await get_provider_config(request)

            return {
                "initialized": True,
                "provider": PROVIDER_NAME,
                "routes": [
                    f"/{INTEGRATION_NAME}/fetch-client",
                    f"/{INTEGRATION_NAME}/fetch-client-proxy",
                    f"/{INTEGRATION_NAME}/proxy-aware-client",
                    f"/{INTEGRATION_NAME}/proxy-aware-client-proxy",
                    f"/{INTEGRATION_NAME}/proxy-dispatcher",
                    f"/{INTEGRATION_NAME}/proxy-dispatcher-proxy",
                    f"/{INTEGRATION_NAME}/httpx",
                    f"/{INTEGRATION_NAME}/httpx-proxy",
                    f"/{INTEGRATION_NAME}/all",
                ],
                "config": config_sanitizer.sanitize(provider_config),
            }
        except Exception as err:
            return {"initialized": False, "error": str(err)}
