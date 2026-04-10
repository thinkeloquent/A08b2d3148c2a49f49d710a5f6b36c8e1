#!/usr/bin/env python3
"""
Example: Loading YAML configuration with computed functions

This example demonstrates how to:
1. Load static config from app_yaml_static_config
2. Create a compute function registry and auto-load computed functions
3. Use ConfigSDK with computed functions for template resolution
4. Resolve templates like {{fn:startup_tokens.case_001}} at STARTUP scope
5. Resolve templates like {{fn:request_token_001}} at REQUEST scope

Computed functions allow dynamic values that are calculated at runtime,
either once at startup (STARTUP scope) or per-request (REQUEST scope).
"""
import sys
import glob
import asyncio
import importlib.util
from pathlib import Path
from typing import Optional, Dict, Any, List

# Add polyglot packages to path
polyglot_base = Path(__file__).parent.parent.parent / "polyglot"
sys.path.insert(0, str(polyglot_base / "app_yaml_static_config" / "py" / "src"))
sys.path.insert(0, str(polyglot_base / "app_yaml_overwrites" / "py" / "src"))

import os
from app_yaml_static_config import AppYamlConfig, InitOptions
from app_yaml_overwrites import (
    ConfigSDK,
    ComputeScope,
    MissingStrategy,
    apply_overwrites_from_context,
    AppliedMergerOptions,
    create_registry,
    create_sdk,
    create_shared_context,
)

# Configuration file paths
CONFIG_DIR = Path(__file__).parent.parent.parent / "common" / "config"
BASE_CONFIG = CONFIG_DIR / "base.yml"
SERVER_CONFIG = CONFIG_DIR / "server.dev.yaml"

# Computed functions directory (using fastapi_server's computed functions)
COMPUTED_FUNCTIONS_DIR = Path(__file__).parent.parent.parent / "fastapi_server" / "computed_functions"

PROVIDER = 'openai'

# Global instances (initialized once at startup)
_sdk: Optional[ConfigSDK] = None
_registry = None
_shared_context = None


# =============================================================================
# Auto-Load Computed Functions
# =============================================================================

def auto_load_compute_functions(registry, base_dir: Path) -> List[str]:
    """
    Auto-load compute functions from *.compute.py files.

    Each file should expose:
    - register: callable - The compute function to register
    - NAME (optional): str - Name to register under (defaults to filename without .compute.py)
    - SCOPE (optional): ComputeScope - Scope for the function (defaults to STARTUP)

    Args:
        registry: The compute function registry
        base_dir: Directory containing *.compute.py files

    Returns:
        List of loaded function names
    """
    if not base_dir.exists():
        print(f"Warning: Computed functions directory not found: {base_dir}")
        return []

    loaded = []
    pattern = str(base_dir / "*.compute.py")

    for filepath in glob.glob(pattern):
        filepath = Path(filepath)
        module_name = filepath.stem  # e.g., "my_func.compute"
        func_name = module_name.replace(".compute", "")  # e.g., "my_func"

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
            loaded.append(f"{name} ({scope.name})")

        except Exception as e:
            print(f"Error loading compute function from {filepath}: {e}")

    return loaded


def get_header(request, header_name, default=None):
    """Get header from request, handling both object and dict formats."""
    if request is None:
        return default
    if isinstance(request, dict):
        headers = request.get("headers", {})
        if isinstance(headers, dict):
            return headers.get(header_name, default)
        return default
    if hasattr(request, "headers"):
        return request.headers.get(header_name, default)
    return default


def get_query_param(request, param_name, default=None):
    """Get query param from request, handling both object and dict formats."""
    if request is None:
        return default
    if isinstance(request, dict):
        query = request.get("query", {})
        if isinstance(query, dict):
            return query.get(param_name, default)
        return default
    if hasattr(request, "query_params"):
        return request.query_params.get(param_name, default)
    return default


def register_inline_compute_functions(registry):
    """
    Register inline compute functions (same as fastapi_server lifecycle).
    These are the functions that are not in *.compute.py files.
    """
    import uuid

    # ==========================================================================
    # STARTUP Scope - Run once at startup, cached
    # ==========================================================================

    # Echo for testing
    registry.register("echo", lambda ctx: "echo", ComputeScope.STARTUP)

    # Error function for testing error handling
    registry.register("error", lambda ctx: "error-value", ComputeScope.STARTUP)

    # Build info from environment
    registry.register("get_build_id", lambda ctx: ctx.get("env", {}).get("BUILD_ID", "dev-local"), ComputeScope.STARTUP)
    registry.register("get_build_version", lambda ctx: ctx.get("env", {}).get("BUILD_VERSION", "0.0.0"), ComputeScope.STARTUP)
    registry.register("get_git_commit", lambda ctx: ctx.get("env", {}).get("GIT_COMMIT", "unknown"), ComputeScope.STARTUP)

    # Service info
    registry.register("get_service_name", lambda ctx: ctx.get("config", {}).get("app", {}).get("name", "mta-server"), ComputeScope.STARTUP)
    registry.register("get_service_version", lambda ctx: ctx.get("config", {}).get("app", {}).get("version", "0.0.0"), ComputeScope.STARTUP)

    # Demo functions
    registry.register(
        "demo_startup_value",
        lambda ctx: f"startup-{ctx.get('app', {}).get('name', 'unknown')}",
        ComputeScope.STARTUP
    )

    # ==========================================================================
    # REQUEST Scope - Run per request with request context
    # ==========================================================================

    # Request ID - from header or generate
    def compute_request_id(ctx):
        request = ctx.get("request")
        request_id = get_header(request, "x-request-id")
        if request_id:
            return request_id
        return str(uuid.uuid4())
    registry.register("compute_request_id", compute_request_id, ComputeScope.REQUEST)

    # Gemini token - from header or env (test case 001)
    def compute_localhost_test_case_001_token(ctx):
        request = ctx.get("request")
        token = get_header(request, "x-gemini-token")
        if token:
            return token
        return ctx.get("env", {}).get("GEMINI_API_KEY", "")
    registry.register("compute_localhost_test_case_001_token", compute_localhost_test_case_001_token, ComputeScope.REQUEST)

    # Test case 002 - Authorization from jira provider
    def compute_test_case_002(ctx):
        request = ctx.get("request")
        token = get_header(request, "x-jira-token")
        if token:
            return f"Bearer {token}"
        api_token = ctx.get("env", {}).get("JIRA_API_TOKEN", "")
        if api_token:
            return f"Bearer {api_token}"
        return ""
    registry.register("test_case_002", compute_test_case_002, ComputeScope.REQUEST)

    # Test case 002_1 - X-Auth header
    def compute_test_case_002_1(ctx):
        request = ctx.get("request")
        token = get_header(request, "x-auth")
        if token:
            return token
        return ctx.get("env", {}).get("JIRA_API_TOKEN", "")
    registry.register("test_case_002_1", compute_test_case_002_1, ComputeScope.REQUEST)

    # Tenant ID - from header or query param
    def compute_tenant_id(ctx):
        request = ctx.get("request")
        tenant_id = get_header(request, "x-tenant-id")
        if tenant_id:
            return tenant_id
        tenant_id = get_query_param(request, "tenant_id")
        if tenant_id:
            return tenant_id
        return "default"
    registry.register("compute_tenant_id", compute_tenant_id, ComputeScope.REQUEST)

    # User agent with app info
    def compute_user_agent(ctx):
        app_name = ctx.get("config", {}).get("app", {}).get("name", "MTA-Server")
        app_version = ctx.get("config", {}).get("app", {}).get("version", "0.0.0")
        base_ua = f"{app_name}/{app_version}"
        request = ctx.get("request")
        client_ua = get_header(request, "user-agent")
        if client_ua:
            return f"{base_ua} (via {client_ua})"
        return base_ua
    registry.register("compute_user_agent", compute_user_agent, ComputeScope.REQUEST)

    # Demo request value
    def demo_request_value(ctx):
        request = ctx.get("request", {}) or {}
        headers = request.get("headers", {}) or {}
        request_id = headers.get("x-request-id", "no-request-id")
        return f"request-{request_id}"
    registry.register("demo_request_value", demo_request_value, ComputeScope.REQUEST)


# =============================================================================
# Initialization
# =============================================================================

async def initialize_sdk_with_computed() -> ConfigSDK:
    """
    Initialize static config, registry with computed functions, and ConfigSDK.
    Returns the SDK instance for later use.
    """
    global _sdk, _registry, _shared_context

    # Step 1: Initialize static config
    print("=== Step 1: Loading Static Config ===")
    AppYamlConfig.initialize(
        InitOptions(
            files=[str(BASE_CONFIG), str(SERVER_CONFIG)],
            config_dir=str(CONFIG_DIR)
        )
    )
    static_config = AppYamlConfig.get_instance()
    print(f"App Name: {static_config.get('app', {}).get('name')}")

    # Step 2: Create registry and load computed functions
    print("\n=== Step 2: Loading Computed Functions ===")
    _registry = create_registry()

    # Register inline functions (same as fastapi_server lifecycle)
    register_inline_compute_functions(_registry)
    print("Registered inline functions from lifecycle:")
    print("  STARTUP: echo, error, get_build_id, get_build_version, get_git_commit, get_service_name, get_service_version, demo_startup_value")
    print("  REQUEST: compute_request_id, compute_localhost_test_case_001_token, test_case_002, test_case_002_1, compute_tenant_id, compute_user_agent, demo_request_value")

    # Auto-load from computed_functions directory
    auto_loaded = auto_load_compute_functions(_registry, COMPUTED_FUNCTIONS_DIR)
    if auto_loaded:
        print(f"Auto-loaded functions from {COMPUTED_FUNCTIONS_DIR.name}/:")
        for name in auto_loaded:
            print(f"  - {name}")

    # Step 3: Create shared context for REQUEST scope coordination
    _shared_context = create_shared_context()
    print("\n=== Step 3: Created Shared Context ===")

    # Step 4: Initialize ConfigSDK with registry
    print("\n=== Step 4: Initializing ConfigSDK ===")
    raw_config = static_config.get_all() if hasattr(static_config, 'get_all') else dict(static_config)

    _sdk = create_sdk({
        "config": raw_config,
        "registry": _registry
    })

    # List all registered functions
    all_functions = _registry.list()
    print(f"Total registered compute functions: {len(all_functions)}")

    return _sdk


def get_sdk() -> ConfigSDK:
    """Get the initialized SDK instance."""
    if _sdk is None:
        raise RuntimeError("SDK not initialized. Call initialize_sdk_with_computed() first.")
    return _sdk


# =============================================================================
# Context Building
# =============================================================================

def build_context(
    raw_config: Dict[str, Any],
    request: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Build context for template resolution with computed functions.

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
        "shared": _shared_context,  # Include shared context for REQUEST scope coordination
    }

    if request:
        context["request"] = request

    return context


def apply_overwrites_from_env(config: Dict[str, Any], remove_key: bool = True) -> Dict[str, Any]:
    """
    Apply overwrite_from_env to resolve environment variables.

    This processes the 'overwrite_from_env' key in provider configs,
    resolving {{env.VAR_NAME}} templates to actual environment values.

    Args:
        config: Configuration dictionary (may be mutated)
        remove_key: Whether to remove overwrite_from_env key after processing

    Returns:
        Updated configuration dictionary
    """
    import re
    env_template_pattern = re.compile(r'\{\{env\.([^}]+)\}\}')

    def resolve_env_template(value: str) -> str:
        """Resolve {{env.VAR}} templates in a string."""
        def replacer(match):
            var_name = match.group(1)
            return os.environ.get(var_name, "")
        return env_template_pattern.sub(replacer, value)

    def process_node(node: Any) -> Any:
        if isinstance(node, dict):
            # Check for overwrite_from_env
            env_overwrites = node.get("overwrite_from_env")
            if env_overwrites and isinstance(env_overwrites, dict):
                for key, value in env_overwrites.items():
                    if isinstance(value, str):
                        resolved = resolve_env_template(value)
                        if resolved:  # Only overwrite if resolved value is non-empty
                            node[key] = resolved
                if remove_key:
                    del node["overwrite_from_env"]

            # Recurse into nested dicts
            for key, value in list(node.items()):
                if key != "overwrite_from_env":
                    node[key] = process_node(value)

            return node
        elif isinstance(node, list):
            return [process_node(item) for item in node]
        else:
            return node

    return process_node(config)


async def resolve_config_with_computed(
    sdk: ConfigSDK,
    scope: ComputeScope,
    request: Optional[Dict[str, Any]] = None,
    remove_overwrite_key: bool = True
) -> Dict[str, Any]:
    """
    Resolve configuration with computed functions.

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

    # First apply overwrite_from_context (template resolution)
    resolved = await apply_overwrites_from_context(raw_config, context, options)

    # Then apply overwrite_from_env (environment variable resolution)
    resolved = apply_overwrites_from_env(resolved, remove_key=remove_overwrite_key)

    return resolved


# =============================================================================
# STARTUP Scope Resolution
# =============================================================================

async def resolve_at_startup() -> Dict[str, Any]:
    """
    Resolve configuration at STARTUP scope with computed functions.
    Called once when server starts. Results are cached.
    """
    print("\n" + "=" * 60)
    print("STARTUP SCOPE RESOLUTION (with Computed Functions)")
    print("=" * 60)

    sdk = get_sdk()

    # Show raw config before resolution
    raw_config = sdk.get_raw()
    print(f"\n=== Raw Config ===")
    print(f"Providers: {list(raw_config.get('providers', {}).keys())}")

    # Resolve at STARTUP scope
    print("\n=== Resolving at STARTUP Scope ===")
    resolved = await resolve_config_with_computed(sdk, ComputeScope.STARTUP)

    # Show provider info after resolution
    print_provider_info(resolved, PROVIDER, f"{PROVIDER} Provider (STARTUP resolved)")

    # Show computed function results if present in config
    print("\n=== Computed Function Results (STARTUP) ===")
    print_computed_values(resolved)

    return resolved


# =============================================================================
# REQUEST Scope Resolution
# =============================================================================

async def resolve_at_request(
    request_headers: Optional[Dict[str, str]] = None,
    query_params: Optional[Dict[str, str]] = None,
    path_params: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Resolve configuration at REQUEST scope with computed functions.
    Called per-request with request-specific context.

    Args:
        request_headers: HTTP headers from the request
        query_params: Query parameters from the request
        path_params: Path parameters from the request

    Returns:
        Resolved configuration dictionary
    """
    print("\n" + "=" * 60)
    print("REQUEST SCOPE RESOLUTION (with Computed Functions)")
    print("=" * 60)

    sdk = get_sdk()

    # Reset shared context for new request
    if _shared_context:
        _shared_context.clear()

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
    resolved = await resolve_config_with_computed(sdk, ComputeScope.REQUEST, request)

    print_provider_info(resolved, PROVIDER, f"{PROVIDER} Provider (REQUEST resolved)")

    # Show computed function results
    print("\n=== Computed Function Results (REQUEST) ===")
    print_computed_values(resolved)

    return resolved


# =============================================================================
# Helper Functions
# =============================================================================

def print_provider_info(resolved: Dict[str, Any], provider: str, label: str):
    """Print provider info for debugging."""
    provider_config = resolved.get('providers', {}).get(provider, {})
    print(f"\n{label}:")
    print(f"  - app_name: {provider_config.get('app_name')}")
    print(f"  - app_version: {provider_config.get('app_version')}")
    print(f"  - request_id: {provider_config.get('request_id')}")
    print(f"  - headers: {provider_config.get('headers')}")
    print(f"  - endpoint_api_key: {provider_config.get('endpoint_api_key')}")


def print_computed_values(resolved: Dict[str, Any]):
    """Print computed function values found in the resolved config."""
    # Check for startup_tokens in config
    startup_tokens = resolved.get('startup_tokens')
    if startup_tokens:
        print(f"  startup_tokens.case_001: {startup_tokens.get('case_001')}")
        print(f"  startup_tokens.case_005: {startup_tokens.get('case_005')}")
        print(f"  startup_tokens.timestamp_iso: {startup_tokens.get('timestamp_iso')}")

    # Check providers for computed values
    for provider_name, provider_config in resolved.get('providers', {}).items():
        headers = provider_config.get('headers', {})
        if headers:
            for key, value in headers.items():
                if 'token' in key.lower() or 'request' in key.lower():
                    print(f"  {provider_name}.headers.{key}: {value}")


# =============================================================================
# Main Entry Point
# =============================================================================

async def main():
    """Demo both STARTUP and REQUEST scope resolution with computed functions."""

    # Initialize SDK with computed functions
    await initialize_sdk_with_computed()

    # First: Resolve at STARTUP
    await resolve_at_startup()

    print("\n" + "=" * 60)
    print("SIMULATING REQUEST...")
    print("=" * 60)

    # Second: Simulate a request with headers
    await resolve_at_request(
        request_headers={
            "x-request-id": "req-computed-12345",
            "x-tenant-id": "tenant-computed-001",
            "user-agent": "Mozilla/5.0 (Computed Test)"
        },
        query_params={
            "debug": "true",
            "test": "computed"
        }
    )

    # Third: Simulate another request to show different computed values
    print("\n" + "=" * 60)
    print("SIMULATING SECOND REQUEST...")
    print("=" * 60)

    await resolve_at_request(
        request_headers={
            "x-request-id": "req-computed-67890",
            "x-tenant-id": "tenant-computed-002",
            "x-gemini-token": "custom-gemini-token-from-header"
        },
        query_params={
            "tenant_id": "query-tenant-override"
        }
    )


if __name__ == "__main__":
    asyncio.run(main())
