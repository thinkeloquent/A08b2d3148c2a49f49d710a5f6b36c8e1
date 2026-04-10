# json_file_storage

File-based JSON storage with hash-based filenames.

## Installation

```bash
pip install json_file_storage
```

## Quick Start

```python
import asyncio
from json_file_storage import JsonFileStorage

async def main():
    storage = JsonFileStorage(
        save_to_directory=".data/cache",
        file_name_hash_keys=["user_id", "action"],
        ttl=3600.0,  # 1 hour
        debug=True,
    )

    # Save data - filename is generated from hash of user_id + action
    await storage.save({
        "user_id": "123",
        "action": "login",
        "timestamp": 1234567890,
        "details": {"ip": "192.168.1.1"}
    })

    # Load data - provide the same keys to find the file
    data = await storage.load({"user_id": "123", "action": "login"})
    print(data)  # {"user_id": "123", "action": "login", ...}

    await storage.close()

asyncio.run(main())
```

## How Filename Hashing Works

The `file_name_hash_keys` parameter specifies which keys from your data are used to generate the filename:

```python
storage = JsonFileStorage(
    save_to_directory=".data",
    file_name_hash_keys=["user_id", "action"],
)

# These will create the SAME file (same user_id + action):
await storage.save({"user_id": "123", "action": "login", "time": 1000})
await storage.save({"user_id": "123", "action": "login", "time": 2000})

# This creates a DIFFERENT file (different action):
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

Set expiration for stored data.

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
storage = JsonFileStorage(
    save_to_directory=".data",
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

# Load ignoring expiry
data = await storage.load(key, ignore_expiry=True)

# Clean up expired entries
removed = await storage.cleanup_expired()
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
print(storage.debug_info())
```

## Configuration

```python
storage = JsonFileStorage(
    save_to_directory=".data",       # Directory to store files
    file_name_hash_keys=["id"],      # Keys to hash for filename
    ttl=3600.0,                      # TTL in seconds (None = no expiry)
    file_extension=".json",          # File extension
    create_dir=True,                 # Create directory if not exists
    debug=False,                     # Enable debug logging
    max_error_history=100,           # Max errors to keep in history
)
```

## Error Handling

```python
from json_file_storage import (
    JsonFileStorage,
    JsonFileStorageError,
    JsonFileStorageReadError,
    JsonFileStorageWriteError,
    JsonFileStorageSerializationError,
)

try:
    await storage.save(data)
except JsonFileStorageWriteError as e:
    print(f"Write failed: {e}")
    print(f"  Operation: {e.operation}")
    print(f"  Key: {e.key}")
    print(f"  Filepath: {e.filepath}")
    print(f"  Original error: {e.original_error}")
except JsonFileStorageError as e:
    print(f"Storage error: {e}")

# Check error history
errors = storage.get_errors()
last_error = storage.get_last_error()
storage.clear_errors()
```

## Debug Mode

```python
storage = JsonFileStorage(
    save_to_directory=".data",
    file_name_hash_keys=["id"],
    debug=True,
)

# Output:
# [json_file_storage DEBUG] Initializing JsonFileStorage: directory=/path/.data
# [json_file_storage INFO] SAVE: key=id:123... -> a1b2c3d4.json
# [json_file_storage INFO] SUCCESS: File created: a1b2c3d4.json (256 bytes)

# Get debug info programmatically
print(storage.debug_info())
# {
#     "save_to_directory": "/path/.data",
#     "directory_exists": True,
#     "file_name_hash_keys": ["id"],
#     "ttl": 3600.0,
#     "file_count": 5,
#     "stats": {"saves": 10, "loads": 20, "hits": 18, "misses": 2},
#     "error_count": 0
# }
```

## License

MIT
