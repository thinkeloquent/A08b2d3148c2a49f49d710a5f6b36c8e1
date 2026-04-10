#!/usr/bin/env python3
"""
Standalone Proxy Example -- fetch-httpx (Python)

Demonstrates all proxy configuration patterns available in the platform.

Run: python 9.standalone-example-python.py

Requirements: pip install fetch-httpx proxy-url-builder
"""
import asyncio
import os

from fetch_httpx import AsyncClient
from fetch_httpx._config import Proxy, get_proxy_from_env
from proxy_url_builder import build_proxy_url


# ============================================================
# Example 1: Explicit Proxy URL
# ============================================================
async def explicit_proxy():
    print("--- Example 1: Explicit Proxy URL ---")

    async with AsyncClient(
        base_url="https://api.figma.com/v1",
        headers={"X-Figma-Token": os.environ.get("FIGMA_TOKEN", "test")},
        timeout=30.0,
        proxies="http://proxy.example.com:8080",
    ) as client:
        try:
            response = await client.get("/me")
            print(f"Status: {response.status_code}")
            print(f"OK: {response.is_success}")
        except Exception as e:
            print(f"Error: {e}")
    print()


# ============================================================
# Example 2: Authenticated Proxy (credentials in URL)
# ============================================================
async def authenticated_proxy():
    print("--- Example 2: Authenticated Proxy ---")

    # Build proxy URL from separate credentials (safe encoding)
    proxy_url = build_proxy_url(
        os.environ.get("PROXY_USER", "user"),
        os.environ.get("PROXY_PASS", "p@ss"),
        os.environ.get("PROXY_HOST", "proxy.example.com:8080"),
    )
    # Mask credentials for logging (CodeQL py/clear-text-logging-sensitive-data)
    masked = proxy_url.split("@")
    print(f"Proxy URL (sanitized): ***:***@{masked[-1]}" if "@" in proxy_url else "Proxy URL (sanitized): *******")

    async with AsyncClient(
        base_url="https://api.example.com",
        proxies=proxy_url,
    ) as client:
        try:
            response = await client.get("/health")
            print(f"Status: {response.status_code}")
        except Exception as e:
            print(f"Error: {e}")
    print()


# ============================================================
# Example 3: Proxy Object with Auth
# ============================================================
async def proxy_with_object():
    print("--- Example 3: Proxy Object with Auth ---")

    proxy = Proxy(
        "http://proxy.example.com:8080",
        auth=("user", "pass"),
        headers={"X-Proxy-Client": "mta-v800"},
    )

    async with AsyncClient(
        base_url="https://api.example.com",
        proxies=proxy,
    ) as client:
        try:
            response = await client.get("/health")
            print(f"Status: {response.status_code}")
        except Exception as e:
            print(f"Error: {e}")
    print()


# ============================================================
# Example 4: Scheme-Based Proxy Dict
# ============================================================
async def scheme_proxy():
    print("--- Example 4: Scheme-Based Proxy Dict ---")

    async with AsyncClient(
        base_url="https://api.example.com",
        proxies={
            "https://": "http://https-proxy:8080",
            "http://": "http://http-proxy:8080",
        },
    ) as client:
        try:
            response = await client.get("/health")
            print(f"Status: {response.status_code}")
        except Exception as e:
            print(f"Error: {e}")
    print()


# ============================================================
# Example 5: Environment-Based Proxy (trust_env)
# ============================================================
async def env_proxy():
    print("--- Example 5: Environment-Based Proxy ---")
    print(f"HTTPS_PROXY: {os.environ.get('HTTPS_PROXY', '(not set)')}")
    print(f"HTTP_PROXY: {os.environ.get('HTTP_PROXY', '(not set)')}")

    async with AsyncClient(
        base_url="https://api.example.com",
        trust_env=True,  # reads HTTPS_PROXY / HTTP_PROXY
    ) as client:
        try:
            response = await client.get("/health")
            print(f"Status: {response.status_code}")
        except Exception as e:
            print(f"Error: {e}")
    print()


# ============================================================
# Example 6: AppYamlConfig Pattern (health check style)
# ============================================================
async def app_yaml_config_pattern():
    print("--- Example 6: AppYamlConfig Resolution Pattern ---")

    # Simulating provider config from AppYamlConfig
    provider_config = {
        "base_url": "https://api.figma.com/v1",
        "proxy_url": "http://proxy.corp.local:8080",  # Could be False, None, or string
        "verify_ssl": True,
    }

    # Resolution logic (same as healthz_integration.route.py)
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

    print(f"Resolved proxy: {proxies or '(none)'}")

    async with AsyncClient(
        base_url=provider_config["base_url"],
        proxies=proxies,
        trust_env=trust_env,
        verify=provider_config.get("verify_ssl", True),
    ) as client:
        try:
            response = await client.get("/me")
            print(f"Status: {response.status_code}")
        except Exception as e:
            print(f"Error: {e}")
    print()


# ============================================================

async def main():
    print("=" * 60)
    print("fetch-httpx Proxy Examples")
    print("=" * 60)
    print()

    await explicit_proxy()
    await authenticated_proxy()
    await proxy_with_object()
    await scheme_proxy()
    await env_proxy()
    await app_yaml_config_pattern()


if __name__ == "__main__":
    asyncio.run(main())
