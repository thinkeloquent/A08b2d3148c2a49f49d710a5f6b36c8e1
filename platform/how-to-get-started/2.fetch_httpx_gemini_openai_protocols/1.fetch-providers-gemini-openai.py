#!/usr/bin/env python3
"""
Example: Fetch health check for Gemini OpenAI provider

This example demonstrates:
1. Loading YAML config using app_yaml_static_config
2. Merging global config into provider config
3. Auto-loading compute functions from fastapi_server/computed_functions
4. Resolving computed overwrites using app_yaml_overwrites
5. Performing a health check using fetch_httpx

Functions are decoupled following fastapi_server/fastify_server patterns.
"""
import os
import sys
import copy
import glob
import asyncio
import importlib.util
from pathlib import Path
from typing import Any, List

# Add packages to path
ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT_DIR / "polyglot" / "app_yaml_static_config" / "py" / "src"))
sys.path.insert(0, str(ROOT_DIR / "polyglot" / "app_yaml_overwrites" / "py" / "src"))
sys.path.insert(0, str(ROOT_DIR / "packages_py"))

from app_yaml_static_config import AppYamlConfig, InitOptions
from app_yaml_overwrites import ConfigSDK, ComputeScope, MissingStrategy, create_registry
from fetch_httpx import AsyncClient, BearerAuth, Timeout

# Configuration file paths
CONFIG_DIR = ROOT_DIR / "common" / "config"
BASE_CONFIG = CONFIG_DIR / "base.yml"
SERVER_CONFIG = CONFIG_DIR / "server.dev.yaml"

# Compute functions directory (uses fastapi_server's computed_functions)
COMPUTE_FUNCTIONS_DIR = ROOT_DIR / "fastapi_server" / "computed_functions"


def deep_merge(base: dict, override: dict) -> dict:
    """
    Recursively merge two dictionaries.
    Override values replace base values. Arrays are replaced, not concatenated.

    Args:
        base: Base dictionary (defaults)
        override: Override dictionary (takes precedence)

    Returns:
        Merged dictionary
    """
    result = copy.deepcopy(base)
    for key, value in override.items():
        if (
            key in result
            and isinstance(result[key], dict)
            and isinstance(value, dict)
        ):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = copy.deepcopy(value)
    return result


def load_config() -> AppYamlConfig:
    """
    Initialize AppYamlConfig with base + env-specific YAML files.

    Returns:
        AppYamlConfig singleton instance
    """
    AppYamlConfig.initialize(
        InitOptions(
            files=[str(BASE_CONFIG), str(SERVER_CONFIG)],
            config_dir=str(CONFIG_DIR)
        )
    )
    return AppYamlConfig.get_instance()


def load_provider_config(config: AppYamlConfig, provider_name: str) -> dict:
    """
    Get provider config with global config merged as defaults.

    Pattern: Object.assign({...global}, provider)
    - Global config is the BASE (defaults)
    - Provider config OVERRIDES global values

    Args:
        config: AppYamlConfig instance
        provider_name: Name of the provider (e.g., 'gemini_openai')

    Returns:
        Provider config with global defaults merged in
    """
    global_config = config.get_global_app_config() or {}
    providers = config.get('providers') or {}
    provider_config = providers.get(provider_name, {})

    if not provider_config:
        raise ValueError(f"Provider '{provider_name}' not found in configuration")

    # Deep merge: global (base) + provider (override)
    merged = deep_merge(global_config, provider_config)
    return merged


def auto_load_compute_functions(registry, base_dir: Path = None) -> List[str]:
    """
    Auto-load compute functions from *.compute.py files in a directory.

    Each file should expose:
    - register: callable - The compute function to register
    - NAME (optional): str - Name to register under (defaults to filename without .compute.py)
    - SCOPE (optional): ComputeScope - Scope for the function (defaults to ComputeScope.STARTUP)

    Args:
        registry: The compute function registry
        base_dir: Directory to scan for *.compute.py files

    Returns:
        List of loaded function names
    """
    if base_dir is None:
        base_dir = COMPUTE_FUNCTIONS_DIR

    if not base_dir.exists():
        print(f"Compute functions directory not found: {base_dir}")
        return []

    loaded = []
    pattern = str(base_dir / "*.compute.py")

    for filepath in glob.glob(pattern):
        filepath = Path(filepath)
        module_name = filepath.stem  # e.g., "startup_tokens.compute"
        func_name = module_name.replace(".compute", "")  # e.g., "startup_tokens"

        try:
            # Dynamic import
            spec = importlib.util.spec_from_file_location(module_name, filepath)
            if spec is None or spec.loader is None:
                print(f"Warning: Could not load spec for {filepath}")
                continue

            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)

            # Get required register function
            if not hasattr(module, "register"):
                print(f"Warning: {filepath} does not export 'register' function, skipping")
                continue

            register_func = module.register

            # Get optional NAME (defaults to filename)
            name = getattr(module, "NAME", func_name)

            # Get optional SCOPE (defaults to STARTUP)
            scope = getattr(module, "SCOPE", ComputeScope.STARTUP)

            # Register the function
            registry.register(name, register_func, scope)
            loaded.append(name)

        except Exception as e:
            print(f"Error loading compute function from {filepath}: {e}")

    return loaded


async def parse_provider_computed_config(
    provider_config: dict,
    scope: ComputeScope = ComputeScope.STARTUP
) -> dict:
    """
    Resolve computed overwrites in provider config.

    Steps:
    1. Auto-load compute functions from fastapi_server/computed_functions
    2. Initialize ConfigSDK with provider config + registry
    3. Resolve templates like {{fn:compute_gemini_api_key}}, {{app.name}}
    4. Apply resolved overwrite_from_context values to top-level keys

    Args:
        provider_config: Provider config with global merged in
        scope: ComputeScope.STARTUP or ComputeScope.REQUEST

    Returns:
        Config with resolved computed values applied to top-level keys
    """
    # Setup compute registry
    registry = create_registry()

    # Auto-load compute functions from fastapi_server/computed_functions
    loaded = auto_load_compute_functions(registry)
    print(f"Auto-loaded compute functions: {', '.join(loaded)}")

    # Initialize ConfigSDK with provider config + registry
    sdk = await ConfigSDK.initialize({
        'missing_strategy': MissingStrategy.IGNORE,
        'registry': registry
    })

    # Get resolved configuration
    resolved = await sdk.get_resolved(scope=scope)

    # Extract resolved overwrite_from_context for our provider
    resolved_providers = resolved.get('providers', {})
    resolved_provider = resolved_providers.get('gemini_openai', {})
    resolved_overwrites = resolved_provider.get('overwrite_from_context', {})

    # Apply resolved overwrites to the merged provider config
    result = copy.deepcopy(provider_config)
    for key, value in resolved_overwrites.items():
        # Only apply if value is resolved (not still a template string)
        if value is not None and not (isinstance(value, str) and value.startswith('{{')):
            result[key] = value

    # Remove overwrite_from_context from output (it's metadata, not needed after resolution)
    result.pop('overwrite_from_context', None)

    return result


async def fetch_healthz(provider_config: dict) -> dict:
    """
    Perform health check using resolved provider config.

    Expects a fully resolved config where:
    - Global defaults are already merged
    - Computed values are already resolved to top-level keys

    Args:
        provider_config: Fully resolved provider configuration

    Returns:
        dict with health check result
    """
    # Extract configuration values directly (no more checking overwrite_from_context)
    base_url = provider_config.get('base_url')
    health_endpoint = provider_config.get('health_endpoint', '/models')
    auth_type = provider_config.get('endpoint_auth_type', 'bearer')
    api_key = provider_config.get('endpoint_api_key')

    # Get timeout from merged config (provider overrides global)
    client_config = provider_config.get('client', {})
    timeout_seconds = client_config.get('timeout_seconds', 30.0)

    print("=== Gemini OpenAI Provider Configuration ===")
    print(f"Base URL: {base_url}")
    print(f"Health Endpoint: {health_endpoint}")
    print(f"Auth Type: {auth_type}")
    print(f"API Key: {'***' + api_key[-4:] if api_key else 'NOT SET'}")
    print(f"Timeout: {timeout_seconds}s")

    # Build health check URL
    health_url = f"{base_url.rstrip('/')}{health_endpoint}"
    print(f"\nHealth Check URL: {health_url}")

    if not api_key:
        print("\nWARNING: GEMINI_API_KEY environment variable not set")
        print("Set it with: export GEMINI_API_KEY=your_api_key")
        return {
            'success': False,
            'error': 'API key not configured',
            'provider': 'gemini_openai'
        }

    # Configure authentication based on auth_type
    auth = None
    if auth_type == 'bearer':
        auth = BearerAuth(api_key)

    # Make health check request
    print("\n=== Performing Health Check ===")

    async with AsyncClient(
        timeout=Timeout(connect=5.0, read=timeout_seconds),
        auth=auth
    ) as client:
        try:
            response = await client.get(health_url)

            print(f"Status Code: {response.status_code}")
            print(f"Response OK: {response.is_success}")

            if response.is_success:
                data = response.json()
                models = data.get('data', []) if isinstance(data, dict) else []
                print(f"Models Available: {len(models)}")

                return {
                    'success': True,
                    'status_code': response.status_code,
                    'provider': 'gemini_openai',
                    'models_count': len(models),
                    'data': data
                }
            else:
                error_text = response.text
                print(f"Error Response: {error_text[:200]}")

                return {
                    'success': False,
                    'status_code': response.status_code,
                    'provider': 'gemini_openai',
                    'error': error_text
                }

        except Exception as e:
            print(f"Request Error: {type(e).__name__}: {e}")
            return {
                'success': False,
                'provider': 'gemini_openai',
                'error': str(e)
            }


async def main():
    print("=" * 60)
    print("Gemini OpenAI Provider Health Check")
    print("=" * 60)

    # 1. Load static config
    config = load_config()
    print("Static config loaded successfully")

    # 2. Merge global into provider
    provider_config = load_provider_config(config, 'gemini_openai')
    print("Provider config merged with global defaults")

    # 3. Resolve computed values ({{fn:compute_gemini_api_key}}, etc.)
    resolved_config = await parse_provider_computed_config(provider_config, ComputeScope.STARTUP)
    print("Computed values resolved")
    print("\n=== Resolved Config (JSON) ===")
    import json
    print(json.dumps(resolved_config, indent=2, default=str))
    print()

    # 4. Fetch healthz
    result = await fetch_healthz(resolved_config)

    print("\n" + "=" * 60)
    print("Health Check Result")
    print("=" * 60)
    print(f"Success: {result.get('success')}")
    print(f"Provider: {result.get('provider')}")

    if result.get('success'):
        print(f"Status Code: {result.get('status_code')}")
        print(f"Models Count: {result.get('models_count')}")
    else:
        print(f"Error: {result.get('error')}")

    return result


if __name__ == "__main__":
    asyncio.run(main())
