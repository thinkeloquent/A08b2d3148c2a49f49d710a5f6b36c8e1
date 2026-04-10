"""
Basic Usage Examples — Figma API SDK (Python)

Self-contained demonstration of all core SDK features.
Each exampleX_name() function is independent and shows one concept.

Usage:
    python basic_usage.py

Prerequisites:
    pip install -e ".[dev]"    (from the py/ directory)
"""

import asyncio
import json
import os
import time
from typing import Optional

from figma_api import (
    DEFAULTS,
    ApiError,
    AuthenticationError,
    # Auth
    AuthError,
    AuthorizationError,
    CommentsClient,
    # Config
    Config,
    ConfigurationError,
    # Core
    FigmaClient,
    # Errors
    FigmaError,
    # Domain clients
    FilesClient,
    NetworkError,
    NotFoundError,
    ProjectsClient,
    RateLimitError,
    # Rate limiting
    RateLimitInfo,
    # Cache
    RequestCache,
    ServerError,
    TimeoutError,
    TokenInfo,
    ValidationError,
    # Retry
    calculate_backoff,
    # Logger
    create_logger,
    is_retryable,
    mask_token,
    parse_rate_limit_headers,
    resolve_token,
)

# Demo token used throughout examples to avoid AuthError on client creation.
# This is NOT a real token — HTTP requests will fail, which we catch gracefully.
DEMO_TOKEN = "figd_demo_token_for_examples_only"


def _separator(title: str) -> None:
    """Print a visual separator between examples."""
    print(f"\n{'=' * 72}")
    print(f"  {title}")
    print(f"{'=' * 72}\n")


# =============================================================================
# Example 1: Client Initialization
# =============================================================================
async def example1_client_initialization() -> None:
    """
    Create a FigmaClient with an explicit token and custom options.
    Print the client configuration and internal stats.
    Uses the async context manager pattern for automatic cleanup.
    """
    _separator("Example 1: Client Initialization")

    os.environ["FIGMA_TOKEN"] = DEMO_TOKEN

    async with FigmaClient(
        token=DEMO_TOKEN,
        base_url="https://api.figma.com",
        timeout=60,
        max_retries=5,
        cache_max_size=200,
        cache_ttl=600,
        rate_limit_auto_wait=True,
    ) as client:
        print("Client created successfully with custom options:")
        print(f"  Token (masked): {mask_token(DEMO_TOKEN)}")
        print("  Timeout:        60s")
        print("  Max retries:    5")
        print("  Cache max size: 200")
        print("  Cache TTL:      600s")
        print()

        stats = client.stats
        print("Initial client stats:")
        print(f"  {json.dumps(stats, indent=2, default=str)}")

        print()
        print("Last rate limit info:", client.last_rate_limit)

    del os.environ["FIGMA_TOKEN"]
    print("\n[OK] Client initialization complete.")


# =============================================================================
# Example 2: Configuration Loading
# =============================================================================
def example2_configuration_loading() -> None:
    """
    Demonstrate Config.from_env() and the DEFAULTS dict.
    Shows how the SDK loads configuration from environment variables.
    """
    _separator("Example 2: Configuration Loading")

    # --- Show DEFAULTS dict ---
    print("SDK DEFAULTS:")
    for key, value in DEFAULTS.items():
        print(f"  {key}: {value!r}")
    print()

    # --- Create Config with explicit values ---
    config = Config(
        figma_token="figd_example_token",
        base_url="https://api.figma.com",
        log_level="DEBUG",
        port=8080,
        host="127.0.0.1",
        timeout=45,
        max_retries=5,
    )
    print("Explicit Config:")
    print(f"  figma_token:  {mask_token(config.figma_token)}")
    print(f"  base_url:     {config.base_url}")
    print(f"  log_level:    {config.log_level}")
    print(f"  port:         {config.port}")
    print(f"  host:         {config.host}")
    print(f"  timeout:      {config.timeout}")
    print(f"  max_retries:  {config.max_retries}")
    print()

    # --- Config from environment ---
    os.environ["FIGMA_TOKEN"] = DEMO_TOKEN
    os.environ["LOG_LEVEL"] = "DEBUG"
    os.environ["PORT"] = "9000"

    env_config = Config.from_env()
    print("Config.from_env():")
    print(f"  figma_token:          {mask_token(env_config.figma_token)}")
    print(f"  log_level:            {env_config.log_level}")
    print(f"  port:                 {env_config.port}")
    print(f"  rate_limit_auto_wait: {env_config.rate_limit_auto_wait}")
    print(f"  cache_ttl:            {env_config.cache_ttl}")

    # Cleanup
    del os.environ["FIGMA_TOKEN"]
    del os.environ["LOG_LEVEL"]
    del os.environ["PORT"]

    print("\n[OK] Configuration loading complete.")


# =============================================================================
# Example 3: Authentication
# =============================================================================
def example3_authentication() -> None:
    """
    Demonstrate token resolution from explicit values and environment,
    token masking for safe logging, and AuthError handling.
    """
    _separator("Example 3: Authentication")

    # --- Resolve from explicit token ---
    info = resolve_token("figd_my_super_secret_token_12345")
    print("Explicit token resolution:")
    print(f"  token:  {mask_token(info.token)}")
    print(f"  source: {info.source}")
    print()

    # --- Resolve from environment ---
    os.environ["FIGMA_TOKEN"] = DEMO_TOKEN
    info_env = resolve_token()
    print("Environment token resolution:")
    print(f"  token:  {mask_token(info_env.token)}")
    print(f"  source: {info_env.source}")
    del os.environ["FIGMA_TOKEN"]
    print()

    # --- Token masking examples ---
    print("Token masking:")
    print("  Full token:  'figd_abcdefghij12345'")
    print(f"  Masked:      '{mask_token('figd_abcdefghij12345')}'")
    print("  Short token: 'abc'")
    print(f"  Masked:      '{mask_token('abc')}'")
    print("  Empty token: ''")
    print(f"  Masked:      '{mask_token('')}'")
    print()

    # --- AuthError when no token is available ---
    print("AuthError when no token is available:")
    try:
        resolve_token()  # No explicit token, no env var
    except AuthError as err:
        print(f"  Caught AuthError: {err}")
        print(f"  Error name:   {err.name}")
        print(f"  Error status: {err.status}")

    print("\n[OK] Authentication examples complete.")


# =============================================================================
# Example 4: Error Handling
# =============================================================================
async def example4_error_handling() -> None:
    """
    Demonstrate try/except around client operations with each error type.
    Shows the error hierarchy and .to_dict() format for structured logging.
    """
    _separator("Example 4: Error Handling")

    # --- Demonstrate each error type ---
    errors = [
        NotFoundError("File 'abc123' not found", meta={"file_key": "abc123"}),
        AuthenticationError("Invalid API token", meta={"hint": "Check FIGMA_TOKEN"}),
        AuthorizationError("No access to team resources"),
        ValidationError("Invalid file key format", meta={"field": "file_key"}),
        RateLimitError("Rate limit exceeded", rate_limit_info={"retry_after": 30.0}),
        ApiError("Bad request", meta={"status": 400, "detail": "Missing parameter"}),
        ServerError("Internal server error", meta={"status": 502}),
        NetworkError("Could not reach api.figma.com"),
        TimeoutError("Request timed out after 30s"),
        ConfigurationError("Invalid base_url format"),
    ]

    for err in errors:
        print(f"  {err.name} (status={err.status}, code={err.code}):")
        print(f"    message: {err}")
        print(f"    to_dict: {json.dumps(err.to_dict(), indent=6, default=str)}")
        print()

    # --- Show hierarchy: all are FigmaError ---
    print("All errors inherit from FigmaError:")
    for err in errors:
        print(f"  isinstance({err.name}, FigmaError) = {isinstance(err, FigmaError)}")

    # --- Demonstrate try/except pattern with a live client ---
    os.environ["FIGMA_TOKEN"] = DEMO_TOKEN

    async with FigmaClient(token=DEMO_TOKEN) as client:
        try:
            # This will fail because the token is fake
            await client.get("/v1/files/nonexistent_file_key")
        except NotFoundError as err:
            print(f"\n  Caught NotFoundError: {err}")
        except AuthenticationError as err:
            print(f"\n  Caught AuthenticationError: {err}")
        except RateLimitError as err:
            print(f"\n  Caught RateLimitError: retry_after={err.rate_limit_info}")
        except FigmaError as err:
            print(f"\n  Caught FigmaError ({err.name}): {err}")
            print(f"  Status: {err.status}, Code: {err.code}")
        except Exception as err:
            print(f"\n  Caught unexpected error: {type(err).__name__}: {err}")

    del os.environ["FIGMA_TOKEN"]
    print("\n[OK] Error handling examples complete.")


# =============================================================================
# Example 5: Caching
# =============================================================================
def example5_caching() -> None:
    """
    Create a RequestCache and demonstrate set/get/has/clear/stats.
    Shows LRU eviction behavior and TTL expiration.
    """
    _separator("Example 5: Caching")

    cache = RequestCache(max_size=3, ttl=2)
    print("Cache created: max_size=3, ttl=2s")
    print()

    # --- Set and get ---
    cache.set("/v1/files/abc123", {"name": "My Design File", "version": "123"})
    cache.set("/v1/files/def456", {"name": "Component Library", "version": "456"})
    print("After inserting 2 entries:")
    print(f"  has('/v1/files/abc123'): {cache.has('/v1/files/abc123')}")
    print(f"  get('/v1/files/abc123'): {cache.get('/v1/files/abc123')}")
    print(f"  stats: hits={cache.stats.hits}, misses={cache.stats.misses}, size={cache.stats.size}")
    print()

    # --- Cache miss ---
    result = cache.get("/v1/files/nonexistent")
    print(f"Cache miss for '/v1/files/nonexistent': {result}")
    print(f"  stats: hits={cache.stats.hits}, misses={cache.stats.misses}, size={cache.stats.size}")
    print()

    # --- LRU eviction (max_size=3) ---
    cache.set("/v1/files/ghi789", {"name": "Third File"})
    cache.set("/v1/files/jkl012", {"name": "Fourth File — should evict oldest"})
    print("After inserting 4 entries into a max_size=3 cache:")
    print(f"  has('/v1/files/abc123'): {cache.has('/v1/files/abc123')}  (evicted)")
    print(f"  has('/v1/files/jkl012'): {cache.has('/v1/files/jkl012')}  (newest)")
    print(f"  stats: size={cache.stats.size}")
    print()

    # --- TTL expiration ---
    print("Waiting 3 seconds for TTL expiration (ttl=2s)...")
    time.sleep(3)
    expired_result = cache.get("/v1/files/def456")
    print(f"  get('/v1/files/def456') after TTL: {expired_result}  (expired)")
    print(f"  stats: hits={cache.stats.hits}, misses={cache.stats.misses}")
    print()

    # --- Clear ---
    cache.clear()
    print("After cache.clear():")
    print(f"  stats: size={cache.stats.size}")

    print("\n[OK] Caching examples complete.")


# =============================================================================
# Example 6: Domain Clients
# =============================================================================
async def example6_domain_clients() -> None:
    """
    Show creating FilesClient, ProjectsClient, and CommentsClient.
    Demonstrate the async method call pattern (wrapped in try/except since
    the demo token will cause HTTP errors).
    """
    _separator("Example 6: Domain Clients")

    os.environ["FIGMA_TOKEN"] = DEMO_TOKEN

    async with FigmaClient(token=DEMO_TOKEN, max_retries=0) as client:
        # Create domain clients
        files = FilesClient(client)
        projects = ProjectsClient(client)
        comments = CommentsClient(client)

        print("Domain clients created:")
        print(f"  FilesClient:    {files}")
        print(f"  ProjectsClient: {projects}")
        print(f"  CommentsClient: {comments}")
        print()

        # --- FilesClient: get_file ---
        print("FilesClient.get_file('abc123'):")
        try:
            result = await files.get_file("abc123")
            print(f"  File name: {result.get('name')}")
        except FigmaError as err:
            print(f"  Expected error (demo token): {err.name}: {err}")
        except Exception as err:
            print(f"  Connection error (expected): {type(err).__name__}: {err}")
        print()

        # --- ProjectsClient: get_team_projects ---
        print("ProjectsClient.get_team_projects('team_xyz'):")
        try:
            result = await projects.get_team_projects("team_xyz")
            print(f"  Projects: {result.get('projects')}")
        except FigmaError as err:
            print(f"  Expected error (demo token): {err.name}: {err}")
        except Exception as err:
            print(f"  Connection error (expected): {type(err).__name__}: {err}")
        print()

        # --- CommentsClient: list_comments ---
        print("CommentsClient.list_comments('abc123'):")
        try:
            result = await comments.list_comments("abc123", as_md=True)
            print(f"  Comments: {result.get('comments')}")
        except FigmaError as err:
            print(f"  Expected error (demo token): {err.name}: {err}")
        except Exception as err:
            print(f"  Connection error (expected): {type(err).__name__}: {err}")
        print()

        # --- Show the API call pattern ---
        print("API call pattern for domain clients:")
        print("  1. Create a FigmaClient with your token")
        print("  2. Instantiate domain client: files = FilesClient(client)")
        print("  3. Call async methods:        result = await files.get_file('key')")
        print("  4. Handle errors:             except NotFoundError, AuthenticationError, ...")

        # Show final stats
        print()
        print("Client stats after API calls:")
        print(f"  {json.dumps(client.stats, indent=2, default=str)}")

    del os.environ["FIGMA_TOKEN"]
    print("\n[OK] Domain client examples complete.")


# =============================================================================
# Example 7: Rate Limit Handling
# =============================================================================
async def example7_rate_limit_handling() -> None:
    """
    Show creating a client with an on_rate_limit callback.
    Demonstrate parse_rate_limit_headers with simulated 429 response headers.
    """
    _separator("Example 7: Rate Limit Handling")

    os.environ["FIGMA_TOKEN"] = DEMO_TOKEN

    # --- Custom callback ---
    def my_rate_limit_callback(info: RateLimitInfo) -> Optional[bool]:
        """Custom callback invoked when a rate limit is hit."""
        print("  [callback] Rate limited!")
        print(f"    retry_after:     {info.retry_after}s")
        print(f"    plan_tier:       {info.plan_tier}")
        print(f"    rate_limit_type: {info.rate_limit_type}")
        print(f"    timestamp:       {info.timestamp}")
        # Return None or True to allow auto-wait; return False to skip
        return True

    # Create client with rate limit callback
    async with FigmaClient(
        token=DEMO_TOKEN,
        rate_limit_auto_wait=True,
        rate_limit_threshold=0,
        on_rate_limit=my_rate_limit_callback,
    ) as client:
        print("Client created with on_rate_limit callback.")
        print()

    # --- Parse mock rate limit headers ---
    print("Parsing simulated 429 response headers:")
    mock_headers = {
        "retry-after": "45",
        "x-figma-plan-tier": "professional",
        "x-figma-rate-limit-type": "file_request",
        "x-figma-upgrade-link": "https://www.figma.com/pricing",
    }
    info = parse_rate_limit_headers(mock_headers)
    print(f"  retry_after:     {info.retry_after}")
    print(f"  plan_tier:       {info.plan_tier}")
    print(f"  rate_limit_type: {info.rate_limit_type}")
    print(f"  upgrade_link:    {info.upgrade_link}")
    print(f"  timestamp:       {info.timestamp}")
    print()

    # --- Parse minimal headers (defaults) ---
    print("Parsing minimal headers (no rate limit info):")
    minimal_info = parse_rate_limit_headers({})
    print(f"  retry_after: {minimal_info.retry_after}  (default)")
    print(f"  plan_tier:   {minimal_info.plan_tier}")

    del os.environ["FIGMA_TOKEN"]
    print("\n[OK] Rate limit handling examples complete.")


# =============================================================================
# Example 8: Retry Logic
# =============================================================================
def example8_retry_logic() -> None:
    """
    Show calculate_backoff for different attempt numbers.
    Show is_retryable for various HTTP status codes.
    """
    _separator("Example 8: Retry Logic")

    # --- Backoff calculation ---
    print("Exponential backoff with jitter (initial_wait=1.0, max_wait=30.0):")
    print(f"  {'Attempt':<10} {'Backoff (seconds)':<20}")
    print(f"  {'-' * 10} {'-' * 20}")
    for attempt in range(6):
        delay = calculate_backoff(attempt, initial_wait=1.0, max_wait=30.0)
        print(f"  {attempt:<10} {delay:<20.3f}")
    print()

    print("Backoff with custom parameters (initial_wait=0.5, max_wait=10.0):")
    for attempt in range(4):
        delay = calculate_backoff(attempt, initial_wait=0.5, max_wait=10.0)
        print(f"  Attempt {attempt}: {delay:.3f}s")
    print()

    # --- Retryable status codes ---
    print("is_retryable() for various HTTP status codes:")
    test_codes = [200, 400, 401, 403, 404, 422, 429, 500, 502, 503, 504]
    for code in test_codes:
        retryable = is_retryable(code)
        label = "RETRYABLE" if retryable else "not retryable"
        print(f"  HTTP {code}: {label}")

    print()
    print("Note: 429 (rate limit) is handled separately by the rate limit")
    print("module, not the retry module. The retry module only retries 5xx errors.")

    print("\n[OK] Retry logic examples complete.")


# =============================================================================
# Main — Run all examples sequentially
# =============================================================================
async def main() -> None:
    """Run all example functions in order."""
    print("=" * 72)
    print("  Figma API SDK — Python Examples")
    print("=" * 72)
    print()
    print("This script demonstrates all core features of the figma_api SDK.")
    print("A fake demo token is used — HTTP requests will fail gracefully.")
    print()

    await example1_client_initialization()
    example2_configuration_loading()
    example3_authentication()
    await example4_error_handling()
    example5_caching()
    await example6_domain_clients()
    await example7_rate_limit_handling()
    example8_retry_logic()

    print()
    print("=" * 72)
    print("  All examples completed successfully.")
    print("=" * 72)


if __name__ == "__main__":
    asyncio.run(main())
