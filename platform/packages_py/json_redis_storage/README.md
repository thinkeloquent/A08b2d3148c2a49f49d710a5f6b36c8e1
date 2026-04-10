# json_redis_storage

Redis-based JSON storage with size limits, TTL, and configurable eviction policies.

## Installation

```bash
pip install json_redis_storage
```

## Quick Start

```python
import asyncio
import redis.asyncio as redis
from json_redis_storage import JsonRedisStorage

async def main():
    client = redis.Redis(host='localhost', port=6379)
    storage = JsonRedisStorage(
        redis_client=client,
        key_prefix="myapp:cache:",
        hash_keys=["user_id", "action"],
        ttl=3600.0,  # 1 hour
        debug=True,
    )

    # Save data - key is generated from hash of user_id + action
    await storage.save({
        "user_id": "123",
        "action": "login",
        "timestamp": 1234567890,
        "details": {"ip": "192.168.1.1"}
    })

    # Load data - provide the same keys to find the entry
    data = await storage.load({"user_id": "123", "action": "login"})
    print(data)  # {"user_id": "123", "action": "login", ...}

    await storage.close()

asyncio.run(main())
```

## How Key Hashing Works

The `hash_keys` parameter specifies which keys from your data are used to generate the storage key:

```python
storage = JsonRedisStorage(
    redis_client=client,
    key_prefix="myapp:",
    hash_keys=["user_id", "action"],
)

# These will create the SAME entry (same user_id + action):
await storage.save({"user_id": "123", "action": "login", "time": 1000})
await storage.save({"user_id": "123", "action": "login", "time": 2000})

# This creates a DIFFERENT entry (different action):
await storage.save({"user_id": "123", "action": "logout", "time": 3000})
```

## Custom Keys

You can bypass hash key generation and use custom keys:

```python
# Save with custom key
await storage.save(data, custom_key="my-custom-identifier")

# Load with custom key
data = await storage.load("my-custom-identifier")
```

## TTL (Time-To-Live)

Set expiration for stored data. Redis handles TTL natively for automatic expiration.

**TTL is specified in seconds.** Use the formula: `minutes * 60` or `hours * 3600`

| Duration | TTL Value |
|----------|-----------|
| 10 minutes | `600` |
| 15 minutes | `900` |
| 20 minutes | `1200` |
| 45 minutes | `2700` |
| 1 hour | `3600` |
| 24 hours | `86400` |

```python
# Default TTL for all saves
storage = JsonRedisStorage(
    redis_client=client,
    key_prefix="myapp:",
    ttl=900.0,  # 15 minutes
)

# Common TTL values
await storage.save(data, ttl=600.0)   # 10 minutes
await storage.save(data, ttl=900.0)   # 15 minutes
await storage.save(data, ttl=1200.0)  # 20 minutes
await storage.save(data, ttl=2700.0)  # 45 minutes
await storage.save(data, ttl=3600.0)  # 1 hour

# Using formula for clarity
await storage.save(data, ttl=10 * 60)   # 10 minutes
await storage.save(data, ttl=15 * 60)   # 15 minutes
await storage.save(data, ttl=24 * 3600) # 24 hours

# Override TTL per save
await storage.save(data, ttl=60.0)  # Expires in 1 minute
await storage.save(data, ttl=0)     # Never expires (overrides default)

# Load ignoring expiry (returns data even if expired)
data = await storage.load(key, ignore_expiry=True)

# Clean up expired entries (soft cleanup for entries with expires_at field)
removed = await storage.cleanup_expired()
```

## Eviction Policies

When storage limits are reached, entries are automatically evicted based on the configured policy:

```python
from json_redis_storage import JsonRedisStorage, EvictionPolicy

# FIFO (First In First Out) - default
storage = JsonRedisStorage(
    redis_client=client,
    key_prefix="myapp:",
    eviction_policy=EvictionPolicy.FIFO,
    max_entries=1000,
)

# LRU (Least Recently Used)
storage = JsonRedisStorage(
    redis_client=client,
    key_prefix="myapp:",
    eviction_policy=EvictionPolicy.LRU,
    max_entries=1000,
)

# LFU (Least Frequently Used)
storage = JsonRedisStorage(
    redis_client=client,
    key_prefix="myapp:",
    eviction_policy=EvictionPolicy.LFU,
    max_entries=1000,
)
```

## Size Limits

Control storage size by entry count or memory usage:

```python
# Limit by entry count
storage = JsonRedisStorage(
    redis_client=client,
    key_prefix="myapp:",
    max_entries=1000,  # Maximum 1000 entries
)

# Limit by memory usage
storage = JsonRedisStorage(
    redis_client=client,
    key_prefix="myapp:",
    max_memory_bytes=100_000_000,  # 100 MB limit
)

# Combine limits
storage = JsonRedisStorage(
    redis_client=client,
    key_prefix="myapp:",
    max_entries=1000,
    max_memory_bytes=100_000_000,
)
```

## Rotation Mode

Keep only the last N entries (useful for logs or token storage):

```python
storage = JsonRedisStorage(
    redis_client=client,
    key_prefix="myapp:logs:",
    rotation_size=100,  # Keep only last 100 entries
)
```

## Operations

```python
# Check if data exists
exists = await storage.exists({"user_id": "123", "action": "login"})

# Delete data
deleted = await storage.delete({"user_id": "123", "action": "login"})

# List all stored keys
keys = await storage.list_keys()

# Clear all data
count = await storage.clear()

# Get debug info
print(await storage.debug_info())
```

## Configuration

```python
storage = JsonRedisStorage(
    redis_client=client,              # Async Redis client instance (required)
    key_prefix="jrs:",                # Prefix for all Redis keys
    hash_keys=["id"],                 # Keys to hash for storage key
    ttl=3600.0,                       # TTL in seconds (None = no expiry)
    eviction_policy=EvictionPolicy.FIFO,  # FIFO, LRU, or LFU
    max_entries=None,                 # Maximum entry count
    max_memory_bytes=None,            # Maximum memory usage
    rotation_size=None,               # Rotation mode: keep last N entries
    debug=False,                      # Enable debug logging
    max_error_history=100,            # Max errors to keep in history
)
```

## Error Handling

```python
from json_redis_storage import (
    JsonRedisStorage,
    JsonRedisStorageError,
    JsonRedisStorageReadError,
    JsonRedisStorageWriteError,
    JsonRedisStorageSerializationError,
    JsonRedisStorageConnectionError,
)

try:
    await storage.save(data)
except JsonRedisStorageWriteError as e:
    print(f"Write failed: {e}")
    print(f"  Operation: {e.operation}")
    print(f"  Key: {e.key}")
    print(f"  Original error: {e.original_error}")
except JsonRedisStorageError as e:
    print(f"Storage error: {e}")

# Check error history
errors = storage.get_errors()
last_error = storage.get_last_error()
storage.clear_errors()
```

## Debug Mode

```python
storage = JsonRedisStorage(
    redis_client=client,
    key_prefix="myapp:",
    hash_keys=["id"],
    debug=True,
)

# Output:
# [json_redis_storage INFO] JsonRedisStorage initialized
# [json_redis_storage DEBUG] Generated key: id:123
# [json_redis_storage DEBUG] Saved key: id:123 -> myapp:a1b2c3d4

# Get debug info programmatically
print(await storage.debug_info())
# {
#     "key_prefix": "myapp:",
#     "hash_keys": ["id"],
#     "ttl": 3600.0,
#     "eviction_policy": "fifo",
#     "limits": {"max_entries": 1000, "max_memory_bytes": None, "rotation_size": None},
#     "entry_count": 5,
#     "memory_usage_bytes": 0,
#     "stats": {"saves": 10, "loads": 20, "hits": 18, "misses": 2, "deletes": 0, "evictions": 3, "rotations": 0},
#     "error_count": 0
# }
```

## License

MIT
