"""
Basic usage examples for JsonRedisStorage.

This example demonstrates:
- Basic save/load operations
- TTL (time-to-live) expiration
- Custom keys
- Size limits and eviction
- Rotation mode for logs
- Different eviction policies
"""

import asyncio

# For these examples, we use fakeredis for testing without a real Redis server
# In production, use: import redis.asyncio as redis
try:
    import fakeredis.aioredis as redis
except ImportError:
    print("Install fakeredis for testing: pip install fakeredis")
    print("Or use redis.asyncio with a real Redis server")
    raise

from json_redis_storage import EvictionPolicy, JsonRedisStorage


async def basic_save_load():
    """Basic save and load operations."""
    print("\n=== Basic Save/Load ===")

    client = redis.FakeRedis()
    storage = JsonRedisStorage(
        redis_client=client,
        key_prefix="example:basic:",
    )

    # Save data
    data = {"user_id": "123", "name": "Alice", "email": "alice@example.com"}
    key = await storage.save(data)
    print(f"Saved with key: {key}")

    # Load data back
    loaded = await storage.load(data)
    print(f"Loaded: {loaded}")

    # Load by key string
    loaded_by_key = await storage.load(key)
    print(f"Loaded by key: {loaded_by_key}")

    # Check existence
    exists = await storage.exists(data)
    print(f"Exists: {exists}")

    # Delete
    deleted = await storage.delete(data)
    print(f"Deleted: {deleted}")

    await storage.close()
    await client.aclose()


async def ttl_example():
    """TTL (time-to-live) expiration example."""
    print("\n=== TTL Expiration ===")

    client = redis.FakeRedis()
    storage = JsonRedisStorage(
        redis_client=client,
        key_prefix="example:ttl:",
        ttl=2.0,  # Default 2 second TTL
    )

    # Save with default TTL
    await storage.save({"id": "1", "message": "expires in 2 seconds"})
    print("Saved with default TTL (2s)")

    # Save with custom TTL
    await storage.save(
        {"id": "2", "message": "expires in 5 seconds"},
        ttl=5.0,
    )
    print("Saved with custom TTL (5s)")

    # Verify both exist
    print(f"Entry 1 exists: {await storage.exists({'id': '1'})}")
    print(f"Entry 2 exists: {await storage.exists({'id': '2'})}")

    # Wait for first to expire
    print("Waiting 3 seconds...")
    await asyncio.sleep(3)

    # Check again (entry 1 should be expired)
    print(f"Entry 1 exists after 3s: {await storage.exists({'id': '1'})}")
    print(f"Entry 2 exists after 3s: {await storage.exists({'id': '2'})}")

    await storage.close()
    await client.aclose()


async def custom_keys_example():
    """Using custom keys and hash keys."""
    print("\n=== Custom Keys ===")

    client = redis.FakeRedis()

    # Storage with specific hash keys
    storage = JsonRedisStorage(
        redis_client=client,
        key_prefix="example:custom:",
        hash_keys=["user_id", "action"],  # Only these fields determine the key
    )

    # These two saves will use the same key (same user_id and action)
    data1 = {"user_id": "123", "action": "login", "timestamp": 1000}
    data2 = {"user_id": "123", "action": "login", "timestamp": 2000}

    key1 = await storage.save(data1)
    key2 = await storage.save(data2)

    print(f"Key 1: {key1}")
    print(f"Key 2: {key2}")
    print(f"Keys are same: {key1 == key2}")

    # The second save overwrites the first
    loaded = await storage.load({"user_id": "123", "action": "login"})
    print(f"Loaded timestamp: {loaded['timestamp']}")  # Will be 2000

    # Using a completely custom key
    await storage.save(
        {"any": "data", "here": True},
        custom_key="my-custom-key-123",
    )
    loaded = await storage.load("my-custom-key-123")
    print(f"Loaded by custom key: {loaded}")

    await storage.close()
    await client.aclose()


async def size_limits_example():
    """Size limits with eviction."""
    print("\n=== Size Limits (Max Entries) ===")

    client = redis.FakeRedis()
    storage = JsonRedisStorage(
        redis_client=client,
        key_prefix="example:limits:",
        max_entries=3,  # Only keep 3 entries
        eviction_policy=EvictionPolicy.FIFO,
    )

    # Save 5 entries (first 2 will be evicted)
    for i in range(5):
        await storage.save({"id": str(i), "value": f"entry-{i}"})
        print(f"Saved entry {i}")

    # List remaining keys
    keys = await storage.list_keys()
    print(f"Remaining keys ({len(keys)}): {keys}")

    # Check stats
    info = await storage.debug_info()
    print(f"Evictions: {info['stats']['evictions']}")

    await storage.close()
    await client.aclose()


async def rotation_mode_example():
    """Rotation mode for log-style storage."""
    print("\n=== Rotation Mode (Logs) ===")

    client = redis.FakeRedis()
    storage = JsonRedisStorage(
        redis_client=client,
        key_prefix="example:logs:",
        rotation_size=5,  # Keep only last 5 log entries
    )

    # Simulate logging 10 events
    for i in range(10):
        await storage.save(
            {"event": f"log-{i}", "level": "info"},
            custom_key=f"log-{i}",
        )

    keys = await storage.list_keys()
    print(f"Stored logs ({len(keys)}): {sorted(keys)}")

    info = await storage.debug_info()
    print(f"Rotations: {info['stats']['rotations']}")

    await storage.close()
    await client.aclose()


async def eviction_policies_example():
    """Different eviction policies."""
    print("\n=== Eviction Policies ===")

    client = redis.FakeRedis()

    # LRU - Least Recently Used
    print("\nLRU Policy:")
    storage_lru = JsonRedisStorage(
        redis_client=client,
        key_prefix="example:lru:",
        max_entries=3,
        eviction_policy=EvictionPolicy.LRU,
    )

    # Save 3 entries
    for i in range(3):
        await storage_lru.save({"id": str(i)}, custom_key=f"item-{i}")

    # Access item-0 to make it recently used
    await storage_lru.load("item-0")
    print("Accessed item-0")

    # Save a 4th entry - item-1 should be evicted (least recently used)
    await storage_lru.save({"id": "3"}, custom_key="item-3")

    keys = await storage_lru.list_keys()
    print(f"Remaining after LRU eviction: {sorted(keys)}")

    await storage_lru.close()

    # LFU - Least Frequently Used
    print("\nLFU Policy:")
    storage_lfu = JsonRedisStorage(
        redis_client=client,
        key_prefix="example:lfu:",
        max_entries=3,
        eviction_policy=EvictionPolicy.LFU,
    )

    # Save 3 entries
    for i in range(3):
        await storage_lfu.save({"id": str(i)}, custom_key=f"item-{i}")

    # Access item-0 multiple times to increase frequency
    await storage_lfu.load("item-0")
    await storage_lfu.load("item-0")
    await storage_lfu.load("item-0")
    print("Accessed item-0 three times")

    # Save a 4th entry - item-1 or item-2 should be evicted (least frequently used)
    await storage_lfu.save({"id": "3"}, custom_key="item-3")

    keys = await storage_lfu.list_keys()
    print(f"Remaining after LFU eviction: {sorted(keys)}")

    await storage_lfu.close()
    await client.aclose()


async def error_handling_example():
    """Error handling and diagnostics."""
    print("\n=== Error Handling ===")

    client = redis.FakeRedis()
    storage = JsonRedisStorage(
        redis_client=client,
        key_prefix="example:errors:",
        debug=True,
    )

    # Normal operation
    await storage.save({"id": "1", "data": "test"})

    # Try to load non-existent key
    result = await storage.load("non-existent-key")
    print(f"Non-existent key returns: {result}")

    # Get debug info
    info = await storage.debug_info()
    print(f"Stats: {info['stats']}")
    print(f"Error count: {info['error_count']}")

    # Clear all entries
    count = await storage.clear()
    print(f"Cleared {count} entries")

    await storage.close()
    await client.aclose()


async def main():
    """Run all examples."""
    print("=" * 60)
    print("JsonRedisStorage Examples")
    print("=" * 60)

    await basic_save_load()
    await ttl_example()
    await custom_keys_example()
    await size_limits_example()
    await rotation_mode_example()
    await eviction_policies_example()
    await error_handling_example()

    print("\n" + "=" * 60)
    print("All examples completed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
