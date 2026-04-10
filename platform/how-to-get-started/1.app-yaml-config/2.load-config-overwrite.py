#!/usr/bin/env python3
"""
Example: Loading YAML configuration and applying overwrites using app_yaml_overwrites

This example demonstrates how to:
1. Load static config from app_yaml_static_config (via step 1)
2. Use ConfigSDK to resolve template placeholders like {{app.name}}, {{env.VAR}}, etc.
3. Resolve at STARTUP scope (cached, run once)
4. Resolve at REQUEST scope (per-request with request context)
"""
import sys
import json
import asyncio
from pathlib import Path
from typing import Optional, Dict, Any

# Add polyglot packages to path
polyglot_base = Path(__file__).parent.parent.parent / "polyglot"
sys.path.insert(0, str(polyglot_base / "app_yaml_static_config" / "py" / "src"))
sys.path.insert(0, str(polyglot_base / "app_yaml_overwrites" / "py" / "src"))

import os
from app_yaml_static_config import AppYamlConfig, InitOptions
from app_yaml_overwrites import ConfigSDK, ComputeScope, MissingStrategy, apply_overwrites_from_context, AppliedMergerOptions

# Configuration file paths
CONFIG_DIR = Path(__file__).parent.parent.parent / "common" / "config"
BASE_CONFIG = CONFIG_DIR / "base.yml"
SERVER_CONFIG = CONFIG_DIR / "server.dev.yaml"
PROVIDER = 'openai'

# Global SDK instance (initialized once at startup)
_sdk: Optional[ConfigSDK] = None


# =============================================================================
# Common/Shared Functions
# =============================================================================

async def initialize_sdk() -> ConfigSDK:
    """
    Initialize static config and ConfigSDK (call once at startup).
    Returns the SDK instance for later use.
    """
    global _sdk

    # Initialize static config
    AppYamlConfig.initialize(
        InitOptions(
            files=[str(BASE_CONFIG), str(SERVER_CONFIG)],
            config_dir=str(CONFIG_DIR)
        )
    )

    # Initialize ConfigSDK
    _sdk = await ConfigSDK.initialize({
        'missing_strategy': MissingStrategy.IGNORE
    })

    return _sdk


def get_sdk() -> ConfigSDK:
    """Get the initialized SDK instance."""
    if _sdk is None:
        raise RuntimeError("SDK not initialized. Call initialize_sdk() first.")
    return _sdk


def build_context(
    raw_config: Dict[str, Any],
    request: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Build context for template resolution.

    Args:
        raw_config: The raw configuration dictionary
        request: Optional request context with headers, query, params

    Returns:
        Context dictionary for template resolution
    """
    context = {
        "env": dict(os.environ),
        "config": raw_config,
        "app": raw_config.get("app", {}),
    }

    if request:
        context["request"] = request

    return context


async def resolve_config(
    sdk: ConfigSDK,
    scope: ComputeScope,
    request: Optional[Dict[str, Any]] = None,
    remove_overwrite_key: bool = True
) -> Dict[str, Any]:
    """
    Resolve configuration with template resolution and overwrite application.

    Args:
        sdk: The ConfigSDK instance
        scope: ComputeScope.STARTUP or ComputeScope.REQUEST
        request: Optional request context (required for REQUEST scope)
        remove_overwrite_key: Whether to remove overwrite_from_context after applying

    Returns:
        Resolved configuration dictionary
    """
    raw_config = sdk.get_raw()
    context = build_context(raw_config, request)

    options = AppliedMergerOptions(
        resolver=sdk.get_resolver(),
        remove_overwrite_key=remove_overwrite_key,
        scope=scope
    )

    return await apply_overwrites_from_context(raw_config, context, options)


def print_provider_info(resolved: Dict[str, Any], provider: str, label: str):
    """Print provider info for debugging."""
    provider_config = resolved.get('providers', {}).get(provider, {})
    print(f"\n{label}:")
    print(f"  - app_name: {provider_config.get('app_name')}")
    print(f"  - app_version: {provider_config.get('app_version')}")
    print(f"  - request_id: {provider_config.get('request_id')}")
    print(f"  - headers: {provider_config.get('headers')}")
    print(f"  - endpoint_api_key: {provider_config.get('endpoint_api_key')}")


# =============================================================================
# STARTUP Scope Resolution
# =============================================================================

async def resolve_at_startup() -> ConfigSDK:
    """
    Resolve configuration at STARTUP scope.
    Called once when server starts. Results are cached.
    """
    print("=" * 60)
    print("STARTUP SCOPE RESOLUTION")
    print("=" * 60)

    # Step 1: Initialize SDK
    sdk = await initialize_sdk()
    static_config = AppYamlConfig.get_instance()

    print("\n=== Step 1: Static Config Loaded ===")
    print(f"App Name: {static_config.get('app', {}).get('name')}")

    # Step 2: Show raw config
    raw_config = sdk.get_raw()
    print(f"\n=== Step 2: Raw Config ===")
    print(f"Raw providers count: {len(raw_config.get('providers', {}))}")

    provider_config = sdk.get_provider(PROVIDER)
    if provider_config:
        print(f"\n{PROVIDER} Provider (raw):")
        print(f"  - base_url: {provider_config.get('base_url')}")
        print(f"  - app_name template: {provider_config.get('overwrite_from_context', {}).get('app_name')}")

    # Step 3: Resolve at STARTUP scope
    print("\n=== Step 3: Resolving at STARTUP Scope ===")
    resolved = await resolve_config(sdk, ComputeScope.STARTUP)

    print_provider_info(resolved, PROVIDER, f"{PROVIDER} Provider (STARTUP resolved)")

    # print("\n=== Full Resolved Config (JSON) ===")
    # print(json.dumps(resolved, indent=2))

    return sdk


# =============================================================================
# REQUEST Scope Resolution
# =============================================================================

async def resolve_at_request(
    request_headers: Optional[Dict[str, str]] = None,
    query_params: Optional[Dict[str, str]] = None,
    path_params: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Resolve configuration at REQUEST scope.
    Called per-request with request-specific context.

    Args:
        request_headers: HTTP headers from the request
        query_params: Query parameters from the request
        path_params: Path parameters from the request

    Returns:
        Resolved configuration dictionary
    """
    print("=" * 60)
    print("REQUEST SCOPE RESOLUTION")
    print("=" * 60)

    sdk = get_sdk()

    # Build request context
    request = {
        "headers": request_headers or {},
        "query": query_params or {},
        "params": path_params or {},
    }

    print(f"\n=== Request Context ===")
    print(f"Headers: {request['headers']}")
    print(f"Query: {request['query']}")

    # Resolve at REQUEST scope
    print("\n=== Resolving at REQUEST Scope ===")
    resolved = await resolve_config(sdk, ComputeScope.REQUEST, request)

    print_provider_info(resolved, PROVIDER, f"{PROVIDER} Provider (REQUEST resolved)")

    # print("\n=== Full Resolved Config (JSON) ===")
    # print(json.dumps(resolved, indent=2))

    return resolved


# =============================================================================
# Main Entry Point
# =============================================================================

async def main():
    """Demo both STARTUP and REQUEST scope resolution."""

    # First: Resolve at STARTUP (initialize SDK)
    await resolve_at_startup()

    print("\n" + "=" * 60)
    print("SIMULATING REQUEST...")
    print("=" * 60)

    # Second: Simulate a request with headers
    await resolve_at_request(
        request_headers={
            "x-request-id": "req-12345-abcde",
            "x-tenant-id": "tenant-001",
            "user-agent": "Mozilla/5.0"
        },
        query_params={
            "debug": "true"
        }
    )


if __name__ == "__main__":
    asyncio.run(main())
