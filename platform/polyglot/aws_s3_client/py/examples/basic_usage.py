#!/usr/bin/env python3
"""
AWS S3 Client - Basic Usage Examples (Python)

Demonstrates core SDK features including:
- SDK initialization and configuration
- Save/load operations
- TTL support
- Error handling
- Agent interface
"""

import asyncio
import os
import sys

# Add parent directory to path for local development
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from aws_s3_client import (
    SDKConfig,
    create_agent_interface,
    create_logger,
    create_sdk,
    generate_key,
)

# Create logger for examples
logger = create_logger("examples.basic_usage", __file__)


# =============================================================================
# Example 1: SDK Initialization
# =============================================================================
async def example1_sdk_initialization() -> None:
    """
    Demonstrates SDK initialization with configuration.

    Shows how to create an SDK instance with explicit configuration
    or from environment variables.
    """
    print("\n" + "=" * 60)
    print("Example 1: SDK Initialization")
    print("=" * 60)

    # Method 1: Explicit configuration
    config = SDKConfig(
        bucket_name="my-test-bucket",
        region="us-east-1",
        key_prefix="examples:",
        ttl=3600,  # 1 hour default TTL
        debug=True,
    )
    print(f"Config created: bucket={config.bucket_name}, region={config.region}")

    # Method 2: From environment variables (if set)
    # export AWS_S3_BUCKET_NAME="my-bucket"
    # export AWS_S3_REGION="us-west-2"
    from aws_s3_client import config_from_env
    env_config = config_from_env()
    if env_config:
        print(f"Loaded from env: bucket={env_config.bucket_name}")
    else:
        print("No env config found (AWS_S3_BUCKET_NAME not set)")


# =============================================================================
# Example 2: Basic Save and Load
# =============================================================================
async def example2_save_and_load() -> None:
    """
    Demonstrates basic save and load operations.

    Shows how to store and retrieve JSON data.
    Note: Requires actual AWS credentials or LocalStack.
    """
    print("\n" + "=" * 60)
    print("Example 2: Basic Save and Load")
    print("=" * 60)

    # This example shows the pattern - actual execution requires AWS
    config = SDKConfig(
        bucket_name=os.environ.get("AWS_S3_BUCKET_NAME", "test-bucket"),
        region=os.environ.get("AWS_REGION", "us-east-1"),
        endpoint_url=os.environ.get("AWS_ENDPOINT_URL"),  # For LocalStack
        debug=True,
    )

    print(f"Using bucket: {config.bucket_name}")

    # Skip actual API calls if not configured
    if not os.environ.get("AWS_S3_BUCKET_NAME"):
        print("Skipping actual API calls (AWS_S3_BUCKET_NAME not set)")
        print("Set environment variables to run with real AWS/LocalStack")
        return

    sdk = create_sdk(config)

    try:
        # Save data
        user_data = {
            "user_id": 12345,
            "name": "Alice",
            "email": "alice@example.com",
            "preferences": {"theme": "dark", "notifications": True},
        }

        print(f"Saving user data: {user_data}")
        response = await sdk.save(user_data)

        if response.success:
            print(f"Saved with key: {response.key}")
            print(f"Elapsed: {response.elapsed_ms:.1f}ms")

            # Load data back
            load_response = await sdk.load(response.key)
            if load_response.success:
                print(f"Loaded data: {load_response.data}")
            else:
                print(f"Load failed: {load_response.error}")
        else:
            print(f"Save failed: {response.error}")

    finally:
        await sdk.close()


# =============================================================================
# Example 3: Deterministic Keys
# =============================================================================
async def example3_deterministic_keys() -> None:
    """
    Demonstrates deterministic key generation.

    Shows how the same data produces the same key,
    enabling content-addressable storage patterns.
    """
    print("\n" + "=" * 60)
    print("Example 3: Deterministic Keys")
    print("=" * 60)

    data1 = {"user_id": 123, "action": "login"}
    data2 = {"user_id": 123, "action": "login"}
    data3 = {"user_id": 456, "action": "login"}

    key1 = generate_key(data1)
    key2 = generate_key(data2)
    key3 = generate_key(data3)

    print(f"Data 1 key: {key1}")
    print(f"Data 2 key: {key2}")
    print(f"Data 3 key: {key3}")
    print(f"key1 == key2: {key1 == key2}")  # True
    print(f"key1 == key3: {key1 == key3}")  # False

    # Key order independence
    data_a = {"b": 2, "a": 1}
    data_b = {"a": 1, "b": 2}
    print(f"Order independent: {generate_key(data_a) == generate_key(data_b)}")


# =============================================================================
# Example 4: TTL and Expiration
# =============================================================================
async def example4_ttl_expiration() -> None:
    """
    Demonstrates TTL (Time To Live) functionality.

    Shows how to set expiration times for stored data.
    """
    print("\n" + "=" * 60)
    print("Example 4: TTL and Expiration")
    print("=" * 60)

    config = SDKConfig(
        bucket_name=os.environ.get("AWS_S3_BUCKET_NAME", "test-bucket"),
        region=os.environ.get("AWS_REGION", "us-east-1"),
        endpoint_url=os.environ.get("AWS_ENDPOINT_URL"),
        ttl=60,  # Default 60 second TTL
        debug=True,
    )

    print(f"Default TTL: {config.ttl} seconds")

    # Skip actual API calls if not configured
    if not os.environ.get("AWS_S3_BUCKET_NAME"):
        print("Skipping actual API calls (AWS_S3_BUCKET_NAME not set)")
        return

    sdk = create_sdk(config)

    try:
        # Save with default TTL
        response1 = await sdk.save({"session": "abc123"})
        print(f"Saved with default TTL (60s): {response1.key}")

        # Save with custom TTL
        response2 = await sdk.save({"session": "xyz789"}, ttl=300)  # 5 minutes
        print(f"Saved with custom TTL (300s): {response2.key}")

        # Save without TTL (never expires)
        config_no_ttl = SDKConfig(
            bucket_name=config.bucket_name,
            region=config.region,
            endpoint_url=config.endpoint_url,
        )
        sdk_no_ttl = create_sdk(config_no_ttl)
        response3 = await sdk_no_ttl.save({"permanent": True})
        print(f"Saved without TTL: {response3.key}")
        await sdk_no_ttl.close()

    finally:
        await sdk.close()


# =============================================================================
# Example 5: Agent Interface
# =============================================================================
async def example5_agent_interface() -> None:
    """
    Demonstrates the LLM Agent interface.

    Shows simplified methods suitable for tool use / function calling.
    """
    print("\n" + "=" * 60)
    print("Example 5: Agent Interface")
    print("=" * 60)

    config = SDKConfig(
        bucket_name=os.environ.get("AWS_S3_BUCKET_NAME", "test-bucket"),
        region=os.environ.get("AWS_REGION", "us-east-1"),
        endpoint_url=os.environ.get("AWS_ENDPOINT_URL"),
        debug=True,
    )

    # Skip actual API calls if not configured
    if not os.environ.get("AWS_S3_BUCKET_NAME"):
        print("Skipping actual API calls (AWS_S3_BUCKET_NAME not set)")

        # Show the tool schema instead
        import json

        from aws_s3_client import TOOL_SCHEMA
        print("\nAgent Tool Schema:")
        print(json.dumps(TOOL_SCHEMA, indent=2))
        return

    agent = create_agent_interface(config)

    try:
        # Store data
        result = await agent.store({"user": "alice", "score": 100})
        print(f"Store: {result.message}")

        if result.success:
            # Retrieve data
            retrieve = await agent.retrieve(result.key)
            print(f"Retrieve: {retrieve.message}")
            print(f"Data: {retrieve.data}")

            # Check existence
            check = await agent.check(result.key)
            print(f"Check: {check.message}")

            # List all keys
            list_result = await agent.listAll()
            print(f"List: {list_result.message}")

            # Remove data
            remove = await agent.remove(result.key)
            print(f"Remove: {remove.message}")

    finally:
        await agent.close()


# =============================================================================
# Example 6: Error Handling
# =============================================================================
async def example6_error_handling() -> None:
    """
    Demonstrates error handling patterns.

    Shows how to handle common error scenarios gracefully.
    """
    print("\n" + "=" * 60)
    print("Example 6: Error Handling")
    print("=" * 60)

    from aws_s3_client.exceptions import (
        JsonS3StorageAuthError,
        JsonS3StorageConfigError,
        JsonS3StorageError,
    )

    # Example 1: Config validation error
    try:
        bad_config = SDKConfig(bucket_name="")  # Empty bucket name
        print("Bad config created (shouldn't reach here)")
    except JsonS3StorageConfigError as e:
        print(f"Config error (expected): {e}")

    # Example 2: Auth error handling
    print("\nAuth errors return error in response envelope:")

    config = SDKConfig(
        bucket_name="nonexistent-bucket-12345",
        region="us-east-1",
        debug=True,
    )

    # Skip if no AWS credentials
    if not os.environ.get("AWS_ACCESS_KEY_ID"):
        print("Skipping auth test (no AWS credentials)")
        return

    sdk = create_sdk(config)

    try:
        response = await sdk.save({"test": "data"})

        if not response.success:
            print(f"Operation failed: {response.error}")
            # Errors are captured, not thrown
        else:
            print(f"Saved: {response.key}")

    finally:
        await sdk.close()


# =============================================================================
# Main Runner
# =============================================================================
async def main() -> None:
    """Run all examples."""
    print("AWS S3 Client - Python Basic Usage Examples")
    print("=" * 60)

    await example1_sdk_initialization()
    await example2_save_and_load()
    await example3_deterministic_keys()
    await example4_ttl_expiration()
    await example5_agent_interface()
    await example6_error_handling()

    print("\n" + "=" * 60)
    print("All examples completed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
