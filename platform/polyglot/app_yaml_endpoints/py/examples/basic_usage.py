#!/usr/bin/env python3
"""
Basic usage example for Smart Fetch Router.

This example demonstrates:
- Loading configuration from YAML file or dict
- Getting fetch configuration for a service
- Resolving intents to service IDs
- Using custom headers
"""

import os
from pathlib import Path
from app_yaml_endpoints import (
    load_config,
    load_config_from_file,
    get_fetch_config,
    list_endpoints,
    resolve_intent,
    LoggerFactory,
)

# Create logger for this example
logger = LoggerFactory.create("example", __file__)


def example_load_from_file():
    """Load configuration from YAML file."""
    print("\n=== Load from YAML file ===")

    app_env = os.environ.get("APP_ENV", "dev")
    config_path = Path(__file__).parent.parent.parent.parent / "common" / "config" / f"endpoint.{app_env}.yaml"
    load_config_from_file(config_path)

    endpoints = list_endpoints()
    print(f"Available endpoints: {endpoints}")


def example_load_from_dict():
    """Load configuration from dictionary."""
    print("\n=== Load from dict ===")

    config = {
        "endpoints": {
            "my-api": {
                "baseUrl": "http://localhost:8000/api",
                "method": "POST",
                "headers": {"Authorization": "Bearer token"},
                "timeout": 5000,
                "bodyType": "json",
            }
        },
        "intent_mapping": {
            "mappings": {"default": "my-api"},
            "default_intent": "my-api",
        },
    }

    load_config(config)
    endpoints = list_endpoints()
    print(f"Available endpoints: {endpoints}")


def example_get_fetch_config():
    """Get fetch configuration for a service."""
    print("\n=== Get Fetch Config ===")

    # Load sample config
    load_config({
        "endpoints": {
            "llm001": {
                "baseUrl": "http://localhost:51000/api/llm/gemini-openai-v1",
                "method": "POST",
                "headers": {"X-Service-ID": "llm-primary"},
                "timeout": 30000,
                "bodyType": "json",
            }
        },
        "intent_mapping": {"mappings": {}, "default_intent": "llm001"},
    })

    # Get fetch config
    payload = {"messages": [{"role": "user", "content": "Hello, world!"}]}
    config = get_fetch_config("llm001", payload)

    print(f"Service ID: {config.service_id}")
    print(f"URL: {config.url}")
    print(f"Method: {config.method}")
    print(f"Headers: {config.headers}")
    print(f"Body: {config.body[:50]}...")
    print(f"Timeout: {config.timeout}ms")


def example_custom_headers():
    """Merge custom headers with endpoint config."""
    print("\n=== Custom Headers ===")

    load_config({
        "endpoints": {
            "api001": {
                "baseUrl": "http://localhost:8000/api",
                "method": "POST",
                "headers": {"X-Default": "value"},
                "timeout": 30000,
                "bodyType": "json",
            }
        },
        "intent_mapping": {"mappings": {}, "default_intent": "api001"},
    })

    # Add custom headers
    config = get_fetch_config(
        "api001",
        {"data": "test"},
        custom_headers={
            "X-Request-ID": "req-123",
            "X-Correlation-ID": "corr-456",
        },
    )

    print("Merged headers:")
    for key, value in config.headers.items():
        print(f"  {key}: {value}")


def example_resolve_intent():
    """Resolve intents to service IDs."""
    print("\n=== Resolve Intent ===")

    load_config({
        "endpoints": {
            "llm001": {"baseUrl": "http://localhost:51000", "method": "POST"},
            "agent001": {"baseUrl": "http://localhost:52000", "method": "POST"},
        },
        "intent_mapping": {
            "mappings": {
                "chat": "llm001",
                "persona": "llm001",
                "agent": "agent001",
            },
            "default_intent": "llm001",
        },
    })

    intents = ["chat", "persona", "agent", "unknown"]
    for intent in intents:
        service_id = resolve_intent(intent)
        print(f"Intent '{intent}' -> Service '{service_id}'")


if __name__ == "__main__":
    print("Smart Fetch Router - Basic Usage Examples")
    print("=" * 50)

    example_load_from_dict()
    example_get_fetch_config()
    example_custom_headers()
    example_resolve_intent()

    # Optionally load from file if config exists
    app_env = os.environ.get("APP_ENV", "dev")
    config_path = Path(__file__).parent.parent.parent.parent / "common" / "config" / f"endpoint.{app_env}.yaml"
    if config_path.exists():
        example_load_from_file()

    print("\n" + "=" * 50)
    print("Examples completed successfully!")
