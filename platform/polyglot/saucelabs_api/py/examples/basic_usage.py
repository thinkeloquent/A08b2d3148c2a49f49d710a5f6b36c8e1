"""
Basic Usage Examples — Sauce Labs API SDK (Python)

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

from saucelabs_api import (
    # Core
    SaucelabsClient,
    create_saucelabs_client,
    # Config
    resolve_config,
    resolve_core_base_url,
    resolve_mobile_base_url,
    # Errors
    SaucelabsError,
    SaucelabsAuthError,
    SaucelabsNotFoundError,
    SaucelabsRateLimitError,
    SaucelabsValidationError,
    SaucelabsServerError,
    SaucelabsConfigError,
    create_error_from_response,
    # Rate limiter
    RateLimiter,
    # Logger
    create_logger,
    # Types & constants
    DEFAULT_BASE_URL,
    DEFAULT_MOBILE_BASE_URL,
    DEFAULT_TIMEOUT,
    CORE_REGIONS,
    MOBILE_REGIONS,
    AUTOMATION_API_VALUES,
    # Domain modules
    JobsModule,
    PlatformModule,
    UsersModule,
    UploadModule,
)

# Fake credentials used throughout examples so client construction succeeds.
# This is NOT a real account — HTTP requests will fail, which we catch gracefully.
DEMO_USERNAME = "demo_user"
DEMO_API_KEY = "demo_access_key_00000000"


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
    Create a SaucelabsClient with explicit credentials and custom options.
    Uses the async context manager pattern for automatic cleanup.
    """
    _separator("Example 1: Client Initialization")

    os.environ["SAUCE_USERNAME"] = DEMO_USERNAME
    os.environ["SAUCE_ACCESS_KEY"] = DEMO_API_KEY
    os.environ["LOG_LEVEL"] = "SILENT"

    async with SaucelabsClient(
        username=DEMO_USERNAME,
        api_key=DEMO_API_KEY,
        region="us-west-1",
        timeout=15.0,
        rate_limit_auto_wait=True,
    ) as client:
        print("Client created successfully with custom options:")
        print(f"  username:       {client.username}")
        print(f"  lastRateLimit:  {client.last_rate_limit}")

    del os.environ["SAUCE_USERNAME"]
    del os.environ["SAUCE_ACCESS_KEY"]
    print("\n[OK] Client initialization complete.")


# =============================================================================
# Example 2: Configuration Resolution
# =============================================================================
def example2_configuration_resolution() -> None:
    """
    Demonstrate resolve_config(), resolve_core_base_url(), and
    resolve_mobile_base_url(). Shows how different regions map to
    different API base URLs and how environment variables are resolved.
    """
    _separator("Example 2: Configuration Resolution")

    os.environ["SAUCE_USERNAME"] = DEMO_USERNAME
    os.environ["SAUCE_ACCESS_KEY"] = DEMO_API_KEY
    os.environ["LOG_LEVEL"] = "SILENT"

    # 2a — Default configuration from environment.
    config = resolve_config()
    print("Default config from env:")
    print(f"  username:       {config['username']}")
    print(f"  base_url:       {config['base_url']}")
    print(f"  mobile_base_url:{config['mobile_base_url']}")
    print(f"  timeout:        {config['timeout']}s")
    print(f"  auto_wait:      {config['rate_limit_auto_wait']}")
    print()

    # 2b — EU region override.
    eu_config = resolve_config(region="eu-central-1")
    print("EU region config:")
    print(f"  base_url:       {eu_config['base_url']}")
    print(f"  mobile_base_url:{eu_config['mobile_base_url']}")
    print()

    # 2c — Direct URL resolution.
    print("Core region URLs:")
    for name, url in CORE_REGIONS.items():
        print(f"  {name}: {url}")
    print()

    print("Mobile region URLs:")
    for name, url in MOBILE_REGIONS.items():
        print(f"  {name}: {url}")
    print()

    # 2d — Custom base URL override.
    custom_url = resolve_core_base_url("us-west-1", "https://custom-proxy.example.com/")
    print(f"Custom base URL override: {custom_url}")

    # 2e — SDK defaults.
    print("\nSDK defaults:")
    print(f"  DEFAULT_BASE_URL:        {DEFAULT_BASE_URL}")
    print(f"  DEFAULT_MOBILE_BASE_URL: {DEFAULT_MOBILE_BASE_URL}")
    print(f"  DEFAULT_TIMEOUT:         {DEFAULT_TIMEOUT}s")

    del os.environ["SAUCE_USERNAME"]
    del os.environ["SAUCE_ACCESS_KEY"]


# =============================================================================
# Example 3: Error Handling
# =============================================================================
async def example3_error_handling() -> None:
    """
    Demonstrate the typed error hierarchy and create_error_from_response
    factory. Shows the try/except pattern for client operations.
    """
    _separator("Example 3: Error Handling")

    # 3a — Demonstrate each error type.
    errors = [
        SaucelabsAuthError("Invalid credentials", status_code=401),
        SaucelabsNotFoundError("Job abc123 not found", status_code=404),
        SaucelabsRateLimitError("Rate limit exceeded", retry_after=30.0),
        SaucelabsValidationError("Invalid parameter", status_code=400),
        SaucelabsServerError("Internal server error", status_code=500),
        SaucelabsConfigError("Missing SAUCE_USERNAME"),
    ]

    for err in errors:
        print(f"{type(err).__name__}:")
        print(f"  message:     {err}")
        print(f"  status_code: {err.status_code}")
        print(f"  isinstance(SaucelabsError): {isinstance(err, SaucelabsError)}")
        print()

    # 3b — create_error_from_response factory.
    print("-- create_error_from_response factory --\n")

    err_401 = create_error_from_response(401, {"message": "Unauthorized"}, {})
    print(f"401 -> {type(err_401).__name__}: {err_401}")

    err_429 = create_error_from_response(429, {"message": "Too many requests"}, {"retry-after": "60"})
    print(f"429 -> {type(err_429).__name__}: retry_after = {err_429.retry_after}s")

    err_500 = create_error_from_response(500, {"message": "Server error"}, {})
    print(f"500 -> {type(err_500).__name__}: {err_500}")
    print()

    # 3c — Try/except pattern with a real client.
    os.environ["SAUCE_USERNAME"] = DEMO_USERNAME
    os.environ["SAUCE_ACCESS_KEY"] = DEMO_API_KEY
    os.environ["LOG_LEVEL"] = "SILENT"

    print("-- Simulated client.get() error catch pattern --\n")
    async with SaucelabsClient(
        username=DEMO_USERNAME,
        api_key=DEMO_API_KEY,
        timeout=3.0,
    ) as client:
        try:
            await client.get("/rest/v1/demo_user/jobs")
        except SaucelabsAuthError as err:
            print(f"  Caught SaucelabsAuthError: {err}")
        except SaucelabsNotFoundError as err:
            print(f"  Caught SaucelabsNotFoundError: {err}")
        except SaucelabsRateLimitError as err:
            print(f"  Caught SaucelabsRateLimitError: retry_after={err.retry_after}s")
        except SaucelabsError as err:
            print(f"  Caught SaucelabsError ({type(err).__name__}): {err}")
        except Exception as err:
            print(f"  Caught unexpected error (network expected in demo): {type(err).__name__}: {err}")

    del os.environ["SAUCE_USERNAME"]
    del os.environ["SAUCE_ACCESS_KEY"]
    print("\n[OK] Error handling examples complete.")


# =============================================================================
# Example 4: Convenience Factory
# =============================================================================
def example4_convenience_factory() -> None:
    """
    Demonstrate create_saucelabs_client() which creates a SaucelabsClient
    with all domain modules (jobs, platform, users, upload) pre-attached.
    """
    _separator("Example 4: Convenience Factory")

    os.environ["SAUCE_USERNAME"] = DEMO_USERNAME
    os.environ["SAUCE_ACCESS_KEY"] = DEMO_API_KEY
    os.environ["LOG_LEVEL"] = "SILENT"

    client = create_saucelabs_client(
        username=DEMO_USERNAME,
        api_key=DEMO_API_KEY,
        region="us-west-1",
    )

    print("Client created via create_saucelabs_client():")
    print(f"  username:         {client.username}")
    print(f"  client.jobs:      {isinstance(client.jobs, JobsModule)}")
    print(f"  client.platform:  {isinstance(client.platform, PlatformModule)}")
    print(f"  client.users:     {isinstance(client.users, UsersModule)}")
    print(f"  client.upload:    {isinstance(client.upload, UploadModule)}")

    del os.environ["SAUCE_USERNAME"]
    del os.environ["SAUCE_ACCESS_KEY"]


# =============================================================================
# Example 5: Domain Modules
# =============================================================================
async def example5_domain_modules() -> None:
    """
    Demonstrate domain modules (JobsModule, PlatformModule, UsersModule)
    and their method signatures. Since there is no real API, each call is
    wrapped in try/except.
    """
    _separator("Example 5: Domain Modules")

    os.environ["SAUCE_USERNAME"] = DEMO_USERNAME
    os.environ["SAUCE_ACCESS_KEY"] = DEMO_API_KEY
    os.environ["LOG_LEVEL"] = "SILENT"

    client = create_saucelabs_client(
        username=DEMO_USERNAME,
        api_key=DEMO_API_KEY,
        timeout=3.0,
    )

    async with client:
        # 5a — JobsModule: list jobs
        try:
            print("Calling client.jobs.list({'limit': 5}) ...")
            await client.jobs.list(params={"limit": 5})
        except Exception as err:
            print(f"  Expected error (no real API): {type(err).__name__}: {err}\n")

        # 5b — JobsModule: get a specific job
        try:
            print('Calling client.jobs.get("abc123def456") ...')
            await client.jobs.get("abc123def456")
        except Exception as err:
            print(f"  Expected error: {type(err).__name__}: {err}\n")

        # 5c — PlatformModule: get service status (public, no auth needed)
        try:
            print("Calling client.platform.get_status() ...")
            await client.platform.get_status()
        except Exception as err:
            print(f"  Expected error: {type(err).__name__}: {err}\n")

        # 5d — PlatformModule: get supported platforms
        try:
            print('Calling client.platform.get_platforms("appium") ...')
            await client.platform.get_platforms("appium")
        except Exception as err:
            print(f"  Expected error: {type(err).__name__}: {err}\n")

        # 5e — UsersModule: get user info
        try:
            print("Calling client.users.get_user() ...")
            await client.users.get_user()
        except Exception as err:
            print(f"  Expected error: {type(err).__name__}: {err}\n")

        # 5f — UsersModule: get concurrency
        try:
            print("Calling client.users.get_concurrency() ...")
            await client.users.get_concurrency()
        except Exception as err:
            print(f"  Expected error: {type(err).__name__}: {err}\n")

        # 5g — Validation: invalid automation API
        try:
            print('Calling client.platform.get_platforms("invalid") ...')
            await client.platform.get_platforms("invalid")
        except SaucelabsValidationError as err:
            print(f"  Validation error (expected): {err}\n")
        except Exception as err:
            print(f"  Expected error: {type(err).__name__}: {err}\n")

    print(f"Valid automation API values: {', '.join(AUTOMATION_API_VALUES)}")

    del os.environ["SAUCE_USERNAME"]
    del os.environ["SAUCE_ACCESS_KEY"]


# =============================================================================
# Example 6: Rate Limit Handling
# =============================================================================
def example6_rate_limit_handling() -> None:
    """
    Demonstrate rate limit utilities and callback configuration.
    Shows how exponential backoff works and how to handle 429 responses.
    """
    _separator("Example 6: Rate Limit Handling")

    from saucelabs_api.errors import _parse_retry_after

    # 6a — Parse retry-after headers.
    print("-- _parse_retry_after --\n")
    print(f"  _parse_retry_after({{'retry-after': '30'}}):  {_parse_retry_after({'retry-after': '30'})}")
    print(f"  _parse_retry_after({{'retry-after': '1.5'}}): {_parse_retry_after({'retry-after': '1.5'})}")
    print(f"  _parse_retry_after({{}}):                     {_parse_retry_after({})}")
    print()

    # 6b — Exponential backoff.
    print("-- RateLimiter._calculate_backoff (base=1.0, max=60.0) --\n")
    for attempt in range(6):
        delay = RateLimiter._calculate_backoff(attempt, base_delay=1.0, max_delay=60.0)
        print(f"  Attempt {attempt}: ~{delay:.1f}s")
    print()

    # 6c — RateLimiter with callback.
    os.environ["LOG_LEVEL"] = "SILENT"
    logger = create_logger("example", "rate-limit")

    rl = RateLimiter(
        auto_wait=True,
        max_retries=5,
        on_rate_limit=lambda info: print(f"  [callback] Rate limited! retryAfter={info.retry_after}"),
        logger=logger,
    )
    print("RateLimiter created:")
    print(f"  last_rate_limit: {rl.last_rate_limit}")
    print("  auto_wait: True, max_retries: 5")


# =============================================================================
# Example 7: Logging
# =============================================================================
def example7_logging() -> None:
    """
    Demonstrate the SDK logger with different levels and sensitive data
    redaction.
    """
    _separator("Example 7: Logging")

    # 7a — Create a logger with debug level.
    os.environ["LOG_LEVEL"] = "DEBUG"
    logger = create_logger("saucelabs-example", "basic-usage")
    logger.info("this is an info message")
    logger.debug("this is a debug message")
    logger.warning("this is a warning")
    logger.error("this is an error message")
    print()

    # 7b — Redaction of sensitive data.
    from saucelabs_api.logger import _redact_context

    context = {
        "username": "demo_user",
        "access_key": "super_secret_key_12345",
        "api_key": "another_secret",
        "region": "us-west-1",
        "token": "tok_abc123",
    }
    redacted = _redact_context(context)
    print("Sensitive data redaction:")
    print(f"  Original: {json.dumps(context, indent=4)}")
    print(f"  Redacted: {json.dumps(redacted, indent=4)}")

    os.environ["LOG_LEVEL"] = "SILENT"


# =============================================================================
# Main — Run all examples sequentially
# =============================================================================
async def main() -> None:
    """Run all example functions in order."""
    print("=" * 72)
    print("  Sauce Labs API SDK — Python Examples")
    print("=" * 72)
    print()
    print("This script demonstrates all core features of the saucelabs_api SDK.")
    print("Fake demo credentials are used — HTTP requests will fail gracefully.")
    print()

    await example1_client_initialization()
    example2_configuration_resolution()
    await example3_error_handling()
    example4_convenience_factory()
    await example5_domain_modules()
    example6_rate_limit_handling()
    example7_logging()

    print()
    print("=" * 72)
    print("  All examples completed successfully.")
    print("=" * 72)


if __name__ == "__main__":
    asyncio.run(main())
