"""
json_file_storage - File-based JSON storage with hash-based filenames.

Provides persistent JSON storage to the local filesystem with configurable
key-based filename hashing.

Quick Start:
    from json_file_storage import JsonFileStorage

    storage = JsonFileStorage(
        save_to_directory=".data/cache",
        file_name_hash_keys=["user_id", "action"],
        ttl=3600.0,
        debug=True,
    )

    # Save data
    await storage.save({"user_id": "123", "action": "login", "data": {...}})

    # Load data
    data = await storage.load({"user_id": "123", "action": "login"})

    # Or use custom key
    await storage.save(data, custom_key="my-custom-key")
    data = await storage.load("my-custom-key")

    await storage.close()
"""

__version__ = "1.0.0"
__author__ = "json_file_storage contributors"

from .storage import (
    ErrorRecord,
    JsonFileStorage,
    JsonFileStorageError,
    JsonFileStorageReadError,
    JsonFileStorageSerializationError,
    JsonFileStorageWriteError,
    StorageEntry,
)

__all__ = [
    "__version__",
    "ErrorRecord",
    "JsonFileStorage",
    "JsonFileStorageError",
    "JsonFileStorageReadError",
    "JsonFileStorageSerializationError",
    "JsonFileStorageWriteError",
    "StorageEntry",
]
