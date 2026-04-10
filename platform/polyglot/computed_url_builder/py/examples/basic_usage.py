#!/usr/bin/env python3
"""
Basic usage example for computed-url-builder.

This example demonstrates:
- Creating a URL builder with static configuration
- Building URLs for different environments
- Using array-based URLs for full control
- Using computed (function-based) URLs with context
- Serializing builder state
"""

from computed_url_builder import UrlBuilder, create_url_builder

# Create a URL builder with static environment configuration
builder = create_url_builder(
    url_keys={
        "dev": "https://dev.api.example.com",
        "staging": "https://staging.api.example.com",
        "prod": "https://api.example.com",
    },
    base_path="/api/v1",
)

# Build URLs for different environments
print("=== Static URL Building ===")
print(f"Dev URL:     {builder.build('dev')}")
print(f"Staging URL: {builder.build('staging')}")
print(f"Prod URL:    {builder.build('prod')}")

# Array-based URLs (for when you need full control)
array_builder = create_url_builder(
    url_keys={
        "custom": ["https://custom.api.example.com", "/special/v2/", "endpoint"],
    },
)
print(f"\nCustom URL:  {array_builder.build('custom')}")

# Computed URLs with context (functions)
print("\n=== Computed URL Building ===")
dynamic_builder = create_url_builder(
    url_keys={
        "tenant": lambda ctx: f"https://{ctx['tenant']}.api.example.com",
        "region": lambda ctx: f"https://{ctx['region']}.api.example.com",
    },
    base_path="/api/v1",
)
print(f"Tenant URL:  {dynamic_builder.build('tenant', {'tenant': 'acme'})}")
print(f"Region URL:  {dynamic_builder.build('region', {'region': 'us-west'})}")

# Using fromContext factory method
print("\n=== From Context ===")
context_builder = UrlBuilder.from_context(
    url_keys={
        "dynamic": lambda ctx: f"https://{ctx['env']}.api.example.com",
        "static": "https://api.example.com",
    },
    base_path="/v2",
)
print(f"Dynamic:  {context_builder.build('dynamic', {'env': 'staging'})}")
print(f"Static:   {context_builder.build('static')}")

# Serialize builder state
print("\n=== Serialization ===")
print(f"State: {builder.to_dict()}")

# Complete example: building a full URL with endpoint
print("\n=== Complete Example ===")
base_url = builder.build("dev")
full_url = f"{base_url}/users/123"
print(f"Base URL:  {base_url}")
print(f"Full URL:  {full_url}")

# Example output:
# === Static URL Building ===
# Dev URL:     https://dev.api.example.com/api/v1
# Staging URL: https://staging.api.example.com/api/v1
# Prod URL:    https://api.example.com/api/v1
#
# Custom URL:  https://custom.api.example.com/special/v2/endpoint
#
# === Computed URL Building ===
# Tenant URL:  https://acme.api.example.com/api/v1
# Region URL:  https://us-west.api.example.com/api/v1
#
# === From Context ===
# Dynamic:  https://staging.api.example.com/v2
# Static:   https://api.example.com/v2
#
# === Serialization ===
# State: {'env': {...}, 'base_path': '/api/v1'}
#
# === Complete Example ===
# Base URL:  https://dev.api.example.com/api/v1
# Full URL:  https://dev.api.example.com/api/v1/users/123
