#!/usr/bin/env python3
"""
Basic Usage Examples for cache_json_awss3_storage (Python)

This script demonstrates the core features of the cache_json_awss3_storage
package including:
- Creating storage instances
- Saving and loading JSON data
- TTL-based expiration
- Key generation and lookups
- Error handling
- Statistics and debugging

Run with: python basic_usage.py
"""

from __future__ import annotations

import asyncio
import os
from typing import Any

# For demonstration, we use moto to mock S3
# In production, use aiobotocore with real AWS credentials
try:
    from moto import mock_aws
except ImportError:
    print("Install moto for local testing: pip install moto[s3]")
    mock_aws = None

from cache_json_awss3_storage import (
    JsonS3Storage,
    JsonS3StorageClosedError,
    create_logger,
    create_storage,
    generate_key,
    generate_key_from_fields,
    generate_key_from_value,
)


# =============================================================================
# Example 1: Basic Save and Load
# =============================================================================
async def example1_basic_save_load(storage: JsonS3Storage) -> None:
    """
    Demonstrates basic save and load operations.

    Key is passed as the first parameter to save().
    Use generate_key() to create keys from objects, or use custom keys.
    """
    print("\n" + "=" * 60)
    print("Example 1: Basic Save and Load")
    print("=" * 60)

    # Save with custom key
    user_data = {"user_id": 123, "name": "Alice", "email": "alice@example.com"}

    await storage.save("user-alice", user_data)
    print("Saved data with custom key: user-alice")

    # Load the data back
    loaded = await storage.load("user-alice")
    print(f"Loaded data: {loaded}")

    # Verify it matches
    assert loaded == user_data
    print("✓ Data matches!")

    # Save with generated key from object
    key = generate_key({"user_id": 123, "action": "login"})
    await storage.save(key, user_data)
    print(f"Saved data with generated key: {key}")


# =============================================================================
# Example 2: Key Generation
# =============================================================================
async def example2_key_generation(storage: JsonS3Storage) -> None:
    """
    Demonstrates deterministic key generation.

    Keys are generated using SHA256 hash of the data, ensuring:
    - Same data always produces the same key
    - Different data produces different keys
    - Keys are 16-character hexadecimal strings
    """
    print("\n" + "=" * 60)
    print("Example 2: Key Generation")
    print("=" * 60)

    # Same data produces same key
    data = {"user_id": 123, "name": "Alice"}

    key1 = generate_key(data)
    key2 = generate_key(data)

    print(f"Key 1: {key1}")
    print(f"Key 2: {key2}")
    print(f"Keys match: {key1 == key2}")

    # Key order doesn't matter (when no hash_keys specified)
    data_reordered = {"name": "Alice", "user_id": 123}
    key3 = generate_key(data_reordered)
    print(f"Reordered key: {key3}")
    print(f"Matches original: {key1 == key3}")

    # Generate key from entire value (content-addressable)
    key_from_value = generate_key_from_value(data)
    print(f"Key from value: {key_from_value}")

    # Generate key from specific fields only
    key_from_fields = generate_key_from_fields(
        {"user_id": 123, "name": "Alice", "timestamp": 1234567890},
        ["user_id", "name"]
    )
    print(f"Key from fields (ignores timestamp): {key_from_fields}")

    # Save and load using generated key
    await storage.save(key1, data)
    loaded = await storage.load(key1)
    print(f"Loaded with generated key: {loaded}")


# =============================================================================
# Example 3: TTL (Time-To-Live)
# =============================================================================
async def example3_ttl_expiration(storage: JsonS3Storage) -> None:
    """
    Demonstrates TTL-based expiration.

    Data can be saved with a TTL (in seconds). After expiration:
    - load() returns None
    - The expired entry is automatically deleted (lazy cleanup)
    """
    print("\n" + "=" * 60)
    print("Example 3: TTL Expiration")
    print("=" * 60)

    # Save with very short TTL (1 second)
    data = {"message": "This will expire soon", "timestamp": "now"}
    key = "expiring-data"

    await storage.save(key, data, ttl=1)
    print(f"Saved with 1-second TTL, key: {key}")

    # Load immediately (should succeed)
    loaded = await storage.load(key)
    print(f"Immediate load: {loaded}")

    # Wait for expiration
    print("Waiting 1.5 seconds for expiration...")
    await asyncio.sleep(1.5)

    # Load after expiration (should return None)
    loaded_after = await storage.load(key)
    print(f"Load after expiration: {loaded_after}")

    # Load with ignore_expiry to get expired data
    loaded_forced = await storage.load(key, ignore_expiry=True)
    print(f"Load with ignore_expiry: {loaded_forced}")


# =============================================================================
# Example 4: Statistics and Debugging
# =============================================================================
async def example4_statistics(storage: JsonS3Storage) -> None:
    """
    Demonstrates statistics tracking and debug info.

    The storage tracks:
    - Number of saves, loads, hits, misses, deletes, errors
    - Error history with timestamps and stack traces
    """
    print("\n" + "=" * 60)
    print("Example 4: Statistics and Debugging")
    print("=" * 60)

    # Perform some operations
    data1 = {"id": 1, "value": "first"}
    data2 = {"id": 2, "value": "second"}

    await storage.save("stats-key1", data1)
    await storage.save("stats-key2", data2)

    await storage.load("stats-key1")  # Hit
    await storage.load("stats-key2")  # Hit
    await storage.load("nonexistent")  # Miss

    # Get statistics
    stats = storage.get_stats()
    print(f"Statistics: {stats}")
    print(f"  Saves: {stats.saves}")
    print(f"  Loads: {stats.loads}")
    print(f"  Hits: {stats.hits}")
    print(f"  Misses: {stats.misses}")

    # Get debug info
    debug = await storage.debug_info()
    print("\nDebug Info:")
    print(f"  Bucket: {debug.bucket_name}")
    print(f"  Prefix: {debug.key_prefix}")
    print(f"  Object count: {debug.object_count}")
    print(f"  Error count: {debug.error_count}")


# =============================================================================
# Example 5: Bulk Operations
# =============================================================================
async def example5_bulk_operations(storage: JsonS3Storage) -> None:
    """
    Demonstrates bulk operations: list, clear, cleanup.
    """
    print("\n" + "=" * 60)
    print("Example 5: Bulk Operations")
    print("=" * 60)

    # Save multiple items
    items = [
        {"item": 1, "name": "First"},
        {"item": 2, "name": "Second"},
        {"item": 3, "name": "Third"},
    ]

    for i, item in enumerate(items, 1):
        await storage.save(f"bulk-item-{i}", item)

    # List all keys
    keys = await storage.list_keys()
    print(f"Keys in storage: {keys}")
    print(f"Total: {len(keys)}")

    # Clear all
    deleted = await storage.clear()
    print(f"Cleared {deleted} items")

    # Verify empty
    keys_after = await storage.list_keys()
    print(f"Keys after clear: {keys_after}")


# =============================================================================
# Example 6: Context Manager
# =============================================================================
async def example6_context_manager() -> None:
    """
    Demonstrates using storage as an async context manager.

    This ensures proper cleanup even if errors occur.
    """
    print("\n" + "=" * 60)
    print("Example 6: Context Manager")
    print("=" * 60)

    # Create mock S3 client for demo
    import boto3
    from moto import mock_aws

    with mock_aws():
        # Create S3 bucket
        s3 = boto3.client("s3", region_name="us-east-1")
        s3.create_bucket(Bucket="context-test-bucket")

        # Create aiobotocore session
        from aiobotocore.session import get_session

        session = get_session()

        async with session.create_client(
            "s3", region_name="us-east-1"
        ) as s3_client:
            # Use storage as context manager
            async with create_storage(
                s3_client, bucket_name="context-test-bucket", ttl=3600
            ) as storage:
                await storage.save("context-key", {"context": "manager", "demo": True})
                print("Saved in context with key: context-key")

                data = await storage.load("context-key")
                print(f"Loaded in context: {data}")

            # Storage is now closed
            try:
                await storage.save("fail-key", {"should": "fail"})
            except JsonS3StorageClosedError as e:
                print(f"✓ Storage correctly closed: {e}")


# =============================================================================
# Example 7: Custom Logger
# =============================================================================
async def example7_custom_logger(storage: JsonS3Storage) -> None:
    """
    Demonstrates using a custom logger for observability.
    """
    print("\n" + "=" * 60)
    print("Example 7: Custom Logger")
    print("=" * 60)

    # Create custom logger
    logger = create_logger("example_app", __file__)

    print("Logger created with pattern: logger.create(packageName, __file__)")
    print("Log output goes to stderr by default")

    # In production, you'd pass this to create_storage:
    # storage = create_storage(s3_client, "bucket", logger=logger)

    logger.info("This is an info message from the example")
    logger.debug("This is a debug message")


# =============================================================================
# Main Runner
# =============================================================================
async def main() -> None:
    """Run all examples."""
    print("=" * 60)
    print("cache_json_awss3_storage - Basic Usage Examples")
    print("=" * 60)

    if mock_aws is None:
        print("Error: moto is required for these examples")
        print("Install with: pip install moto[s3]")
        return

    # Set up mock AWS environment
    with mock_aws():
        import boto3

        # Create S3 bucket
        s3 = boto3.client("s3", region_name="us-east-1")
        s3.create_bucket(Bucket="example-bucket")

        # Create aiobotocore session
        from aiobotocore.session import get_session

        session = get_session()

        async with session.create_client(
            "s3", region_name="us-east-1"
        ) as s3_client:
            # Create storage instance
            storage = create_storage(
                s3_client,
                bucket_name="example-bucket",
                key_prefix="examples:",
                debug=True,
            )

            try:
                await example1_basic_save_load(storage)
                await example2_key_generation(storage)
                await example3_ttl_expiration(storage)
                await example4_statistics(storage)
                await example5_bulk_operations(storage)
                await example7_custom_logger(storage)
            finally:
                await storage.close()

        # Context manager example (separate environment)
        await example6_context_manager()

    print("\n" + "=" * 60)
    print("All examples completed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
