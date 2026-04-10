"""
SDK Interface for fetch_httpx package.

Provides high-level SDK components:
- core: Core SDK functionality and client factory
- cli: Command-line interface utilities
- agent: AI agent integration utilities

This module enables building higher-level abstractions on top of
the base HTTP client.
"""

from .agent import (
    AgentHTTPClient,
    create_agent_client,
)
from .cli import (
    CLIContext,
    create_cli_client,
)
from .core import (
    IDEMPOTENT_METHODS,
    SAFE_METHODS,
    SDK,
    CircuitBreaker,
    CircuitBreakerConfig,
    CircuitOpenError,
    CircuitState,
    JitterStrategy,
    SDKConfig,
    create_sdk,
)
from .pool import (
    AsyncPoolClient,
    PoolClient,
    close_all_async_pools,
    close_all_pools,
    close_async_pool,
    close_pool,
    get_active_async_pool_origins,
    get_active_pool_origins,
    get_async_pool,
    get_pool,
)

__all__ = [
    # Core
    "SDK",
    "SDKConfig",
    "create_sdk",
    # Retry & Resilience
    "JitterStrategy",
    "CircuitBreaker",
    "CircuitBreakerConfig",
    "CircuitState",
    "CircuitOpenError",
    "SAFE_METHODS",
    "IDEMPOTENT_METHODS",
    # CLI
    "CLIContext",
    "create_cli_client",
    # Agent
    "AgentHTTPClient",
    "create_agent_client",
    # Pool Factory
    "PoolClient",
    "AsyncPoolClient",
    "get_pool",
    "get_async_pool",
    "close_pool",
    "close_async_pool",
    "close_all_pools",
    "close_all_async_pools",
    "get_active_pool_origins",
    "get_active_async_pool_origins",
]
