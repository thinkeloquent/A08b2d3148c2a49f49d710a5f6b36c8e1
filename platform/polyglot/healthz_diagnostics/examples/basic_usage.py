#!/usr/bin/env python3
"""
Basic usage examples for healthz-diagnostics Python SDK.

This script demonstrates all major SDK features:
1. Creating an SDK instance
2. Formatting timestamps
3. Sanitizing configurations
4. Checking environment variables
5. Executing health checks

Run with: poetry run python examples/basic_usage.py
"""

import asyncio
from typing import Any


# Example 1: Creating an SDK instance with HTTP client factory
def create_sdk_example():
    """Demonstrate SDK creation with HTTP client factory."""
    from healthz_diagnostics import HealthzDiagnosticsSDK

    # Define a factory that creates HTTP clients
    # In real usage, this would return httpx.AsyncClient or similar
    def http_client_factory(config: dict) -> Any:
        class MockClient:
            async def get(self, url: str):
                class Response:
                    status_code = 200
                return Response()
            async def close(self):
                pass
        return MockClient()

    sdk = HealthzDiagnosticsSDK.create(http_client_factory)
    print(f"SDK created: {sdk}")
    return sdk


# Example 2: Formatting timestamps
def timestamp_example():
    """Demonstrate ISO8601 timestamp formatting."""
    from healthz_diagnostics import TimestampFormatter

    formatter = TimestampFormatter()

    # Get current timestamp
    current = formatter.format()
    print(f"Current timestamp: {current}")

    # Format specific epoch
    specific = formatter.format_from_epoch(1705312200)
    print(f"Specific timestamp: {specific}")


# Example 3: Measuring latency
def latency_example():
    """Demonstrate latency measurement."""
    import time
    from healthz_diagnostics import LatencyCalculator

    calc = LatencyCalculator()

    calc.start()
    time.sleep(0.1)  # Simulate work
    calc.stop()

    print(f"Latency: {calc.get_ms()}ms")
    print(f"Latency: {calc.get_seconds()}s")


# Example 4: Sanitizing configurations
def sanitizer_example():
    """Demonstrate configuration sanitization."""
    from healthz_diagnostics import ConfigSanitizer

    sanitizer = ConfigSanitizer()

    config = {
        "name": "openai",
        "base_url": "https://api.openai.com",
        "endpoint_api_key": "sk-secret-key-12345",
        "model": "gpt-4",
        "nested": {
            "token": "bearer-abc-123",
            "timeout": 30,
        }
    }

    safe_config = sanitizer.sanitize(config)
    print(f"Original api_key: {config['endpoint_api_key']}")
    print(f"Sanitized api_key: {safe_config['endpoint_api_key']}")
    print(f"Nested token: {safe_config['nested']['token']}")


# Example 5: Checking environment variables
def env_vars_example():
    """Demonstrate environment variable checking."""
    from healthz_diagnostics import ConfigSanitizer

    sanitizer = ConfigSanitizer()

    vars_to_check = [
        "PATH",
        "HOME",
        "OPENAI_API_KEY",
        "NONEXISTENT_VAR",
    ]

    result = sanitizer.check_env_vars(vars_to_check)
    print("Environment variable presence:")
    for var, present in result.items():
        status = "✓" if present else "✗"
        print(f"  {status} {var}")


# Example 6: Collecting diagnostics
def diagnostics_example():
    """Demonstrate diagnostics collection."""
    from healthz_diagnostics import DiagnosticsCollector
    import time

    collector = DiagnosticsCollector()

    # Simulate a request lifecycle
    collector.push_start("https://api.example.com/health", "GET")
    time.sleep(0.05)  # Simulate request
    collector.push_end(200)

    events = collector.get_events()
    print(f"Collected {len(events)} events:")
    for event in events:
        print(f"  - {event['type']}: {event.get('status', 'N/A')}")

    print(f"Total duration: {collector.get_duration():.3f}s")


# Example 7: Executing a health check
async def health_check_example():
    """Demonstrate health check execution."""
    from healthz_diagnostics import HealthCheckExecutor

    # Mock HTTP client for demo
    class MockClient:
        async def get(self, url: str):
            class Response:
                status_code = 200
            return Response()
        async def close(self):
            pass

    executor = HealthCheckExecutor(
        http_client_factory=lambda c: MockClient()
    )

    config = {
        "base_url": "https://api.example.com",
        "health_endpoint": "/health",
        "model": "gpt-4",
    }

    result = await executor.execute("example_provider", config)
    print(f"Provider: {result['provider']}")
    print(f"Healthy: {result['healthy']}")
    print(f"Status: {result['status_code']}")
    print(f"Latency: {result['latency_ms']:.2f}ms")


# Example 8: Full SDK workflow
async def full_workflow_example():
    """Demonstrate complete SDK workflow."""
    from healthz_diagnostics import HealthzDiagnosticsSDK

    # Mock HTTP client
    class MockClient:
        async def get(self, url: str):
            class Response:
                status_code = 200
            return Response()
        async def close(self):
            pass

    sdk = HealthzDiagnosticsSDK.create(lambda c: MockClient())

    # 1. Get timestamp
    print(f"Timestamp: {sdk.format_timestamp()}")

    # 2. Sanitize config
    config = {
        "base_url": "https://api.openai.com",
        "health_endpoint": "/v1/health",
        "api_key": "sk-secret-123",
    }
    safe = sdk.sanitize_config(config)
    print(f"Sanitized config: {safe}")

    # 3. Check env vars
    env_result = sdk.check_env_vars(["PATH", "OPENAI_API_KEY"])
    print(f"Env vars: {env_result}")

    # 4. Execute health check
    result = await sdk.check_health("openai", config)
    print(f"Health check result: healthy={result['healthy']}")


def main():
    """Run all examples."""
    print("=" * 60)
    print("healthz-diagnostics Python SDK Examples")
    print("=" * 60)

    print("\n--- Example 1: Create SDK ---")
    create_sdk_example()

    print("\n--- Example 2: Timestamps ---")
    timestamp_example()

    print("\n--- Example 3: Latency ---")
    latency_example()

    print("\n--- Example 4: Config Sanitization ---")
    sanitizer_example()

    print("\n--- Example 5: Environment Variables ---")
    env_vars_example()

    print("\n--- Example 6: Diagnostics Collection ---")
    diagnostics_example()

    print("\n--- Example 7: Health Check ---")
    asyncio.run(health_check_example())

    print("\n--- Example 8: Full Workflow ---")
    asyncio.run(full_workflow_example())

    print("\n" + "=" * 60)
    print("All examples completed successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()
