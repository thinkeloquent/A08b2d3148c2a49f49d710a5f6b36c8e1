"""
JsonFileStorage - File-based JSON storage with hash-based filenames.

Provides persistent JSON storage to the local filesystem with configurable
key-based filename hashing.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import time
import traceback
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import aiofiles

# Configure module logger
logger = logging.getLogger("json_file_storage")


@dataclass
class ErrorRecord:
    """Record of an error that occurred in JsonFileStorage."""

    timestamp: str
    operation: str
    error_type: str
    error_message: str
    traceback: str
    key: str | None = None
    filepath: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "timestamp": self.timestamp,
            "operation": self.operation,
            "error_type": self.error_type,
            "error_message": self.error_message,
            "traceback": self.traceback,
            "key": self.key,
            "filepath": self.filepath,
        }


class JsonFileStorageError(Exception):
    """Base exception for JsonFileStorage errors."""

    def __init__(
        self,
        message: str,
        operation: str | None = None,
        key: str | None = None,
        filepath: str | None = None,
        original_error: BaseException | None = None,
    ):
        super().__init__(message)
        self.message = message
        self.operation = operation
        self.key = key
        self.filepath = filepath
        self.original_error = original_error
        self.traceback_str = traceback.format_exc()

    def __str__(self) -> str:
        parts = [self.message]
        if self.operation:
            parts.append(f"operation={self.operation}")
        if self.key:
            parts.append(f"key={self.key[:50]}...")
        if self.filepath:
            parts.append(f"filepath={self.filepath}")
        if self.original_error:
            parts.append(
                f"original_error={type(self.original_error).__name__}: {self.original_error}"
            )
        return " | ".join(parts)


class JsonFileStorageReadError(JsonFileStorageError):
    """Error reading from storage file."""

    pass


class JsonFileStorageWriteError(JsonFileStorageError):
    """Error writing to storage file."""

    pass


class JsonFileStorageSerializationError(JsonFileStorageError):
    """Error serializing/deserializing JSON data."""

    pass


@dataclass
class StorageEntry:
    """A storage entry with metadata."""

    key: str
    data: dict[str, Any]
    created_at: float
    expires_at: float | None = None

    @property
    def is_expired(self) -> bool:
        """Check if entry has expired."""
        if self.expires_at is None:
            return False
        return time.time() > self.expires_at

    @property
    def ttl_remaining(self) -> float | None:
        """Get remaining TTL in seconds."""
        if self.expires_at is None:
            return None
        remaining = self.expires_at - time.time()
        return max(0, remaining)


class JsonFileStorage:
    """
    File-based JSON storage with hash-based filenames.

    Stores JSON data as files on the filesystem, with filenames generated
    by hashing specified keys from the data.

    Args:
        save_to_directory: Directory to store files (default: ".data")
        file_name_hash_keys: List of keys to use for generating filename hash
        ttl: Optional time-to-live in seconds (default: None - no expiry)
        file_extension: Extension for storage files (default: ".json")
        create_dir: Create directory if not exists (default: True)
        debug: Enable debug logging (default: False)
        max_error_history: Maximum number of errors to keep in history (default: 100)

    Example:
        from json_file_storage import JsonFileStorage

        storage = JsonFileStorage(
            save_to_directory=".data/cache",
            file_name_hash_keys=["user_id", "action"],
            ttl=3600.0,
            debug=True,
        )

        # Save data
        await storage.save({"user_id": "123", "action": "login", "timestamp": 1234567890})

        # Load data
        data = await storage.load({"user_id": "123", "action": "login"})

        await storage.close()
    """

    def __init__(
        self,
        save_to_directory: str = ".data",
        file_name_hash_keys: list[str] | None = None,
        ttl: float | None = None,
        file_extension: str = ".json",
        create_dir: bool = True,
        debug: bool = False,
        max_error_history: int = 100,
    ):
        self.save_to_directory = Path(save_to_directory).resolve()
        self.file_name_hash_keys = file_name_hash_keys or []
        self.ttl = ttl
        self.file_extension = file_extension
        self._debug = debug
        self._max_error_history = max_error_history
        self._error_history: list[ErrorRecord] = []
        self._last_error: ErrorRecord | None = None
        self._closed = False

        # Stats
        self._stats = {
            "saves": 0,
            "loads": 0,
            "hits": 0,
            "misses": 0,
            "deletes": 0,
        }

        # Configure logging level
        if debug:
            logger.setLevel(logging.DEBUG)
            if not logger.handlers:
                handler = logging.StreamHandler()
                handler.setFormatter(
                    logging.Formatter("[%(name)s %(levelname)s] %(message)s")
                )
                logger.addHandler(handler)
        else:
            if logger.level == logging.NOTSET:
                logger.setLevel(logging.INFO)

        logger.debug(f"Initializing JsonFileStorage: directory={self.save_to_directory}")
        logger.debug(f"Hash keys: {self.file_name_hash_keys}")

        if create_dir:
            try:
                self.save_to_directory.mkdir(parents=True, exist_ok=True)
                logger.debug(f"Directory created/verified: {self.save_to_directory}")
            except OSError as e:
                error = JsonFileStorageError(
                    f"Failed to create directory: {e}",
                    operation="init",
                    filepath=str(self.save_to_directory),
                    original_error=e,
                )
                self._record_error(error, "init")
                raise error from e

        # Verify directory exists
        if not self.save_to_directory.exists():
            error = JsonFileStorageError(
                f"Directory does not exist: {self.save_to_directory}",
                operation="init",
                filepath=str(self.save_to_directory),
            )
            self._record_error(error, "init")
            raise error

        # Verify directory is writable
        if not os.access(self.save_to_directory, os.W_OK):
            error = JsonFileStorageError(
                f"Directory is not writable: {self.save_to_directory}",
                operation="init",
                filepath=str(self.save_to_directory),
            )
            self._record_error(error, "init")
            raise error

        logger.info(
            f"JsonFileStorage initialized: {self.save_to_directory} "
            f"(hash_keys={self.file_name_hash_keys}, ttl={ttl}s)"
        )

    def _record_error(
        self,
        error: BaseException,
        operation: str,
        key: str | None = None,
        filepath: str | None = None,
    ) -> ErrorRecord:
        """Record an error in the error history."""
        record = ErrorRecord(
            timestamp=datetime.now().isoformat(),
            operation=operation,
            error_type=type(error).__name__,
            error_message=str(error),
            traceback=traceback.format_exc(),
            key=key,
            filepath=filepath,
        )
        self._error_history.append(record)
        self._last_error = record

        if len(self._error_history) > self._max_error_history:
            self._error_history = self._error_history[-self._max_error_history:]

        logger.error(f"Error recorded: {operation} | {type(error).__name__}: {error}")
        return record

    def generate_key(self, data: dict[str, Any]) -> str:
        """Generate a storage key from data using specified hash keys."""
        if not self.file_name_hash_keys:
            # If no hash keys specified, use all keys sorted
            key_parts = [f"{k}:{v}" for k, v in sorted(data.items())]
        else:
            # Use only specified keys in order
            key_parts = []
            for key in self.file_name_hash_keys:
                value = data.get(key, "")
                key_parts.append(f"{key}:{value}")

        key_string = "|".join(key_parts)
        logger.debug(f"Generated key string: {key_string}")
        return key_string

    def _key_to_filename(self, key: str) -> Path:
        """Convert storage key to filesystem-safe filename."""
        hashed = hashlib.sha256(key.encode()).hexdigest()[:16]
        filepath = self.save_to_directory / f"{hashed}{self.file_extension}"
        logger.debug(f"Key '{key[:50]}...' -> {filepath.name}")
        return filepath

    async def save(
        self,
        data: dict[str, Any],
        ttl: float | None = None,
        custom_key: str | None = None,
    ) -> str:
        """
        Save JSON data to a file.

        Args:
            data: Dictionary to save
            ttl: Optional TTL override (None uses default, 0 means no expiry)
            custom_key: Optional custom key (overrides hash key generation)

        Returns:
            The generated filename (without path)

        Raises:
            JsonFileStorageWriteError: If file cannot be written
            JsonFileStorageSerializationError: If data cannot be serialized
        """
        key = custom_key if custom_key else self.generate_key(data)
        filepath = self._key_to_filename(key)
        logger.info(f"SAVE: key={key[:50]}... -> {filepath}")

        now = time.time()
        effective_ttl = ttl if ttl is not None else self.ttl
        expires_at = (now + effective_ttl) if effective_ttl else None

        entry_data = {
            "key": key,
            "data": data,
            "created_at": now,
            "expires_at": expires_at,
        }

        try:
            json_data = json.dumps(entry_data, ensure_ascii=False, indent=2)
            logger.info(f"Serialized {len(json_data)} bytes, writing to {filepath}")
        except (TypeError, ValueError) as e:
            error = JsonFileStorageSerializationError(
                f"Failed to serialize data: {e}",
                operation="save",
                key=key,
                filepath=str(filepath),
                original_error=e,
            )
            self._record_error(error, "save", key, str(filepath))
            raise error from e

        try:
            async with aiofiles.open(filepath, "w", encoding="utf-8") as f:
                await f.write(json_data)
        except OSError as e:
            error = JsonFileStorageWriteError(
                f"Failed to write file: {e}",
                operation="save",
                key=key,
                filepath=str(filepath),
                original_error=e,
            )
            self._record_error(error, "save", key, str(filepath))
            raise error from e

        # Verify file was written
        if filepath.exists():
            file_size = filepath.stat().st_size
            logger.info(f"SUCCESS: File created: {filepath.name} ({file_size} bytes)")
            self._stats["saves"] += 1
        else:
            logger.error(f"FAILED: File not created after write: {filepath}")
            error = JsonFileStorageWriteError(
                "File not created after write",
                operation="save",
                key=key,
                filepath=str(filepath),
            )
            self._record_error(error, "save", key, str(filepath))
            raise error

        return filepath.name

    async def load(
        self,
        data_or_key: dict[str, Any] | str,
        ignore_expiry: bool = False,
    ) -> dict[str, Any] | None:
        """
        Load JSON data from a file.

        Args:
            data_or_key: Either a dict (to generate key from) or a string key
            ignore_expiry: If True, return data even if expired

        Returns:
            The stored data dict, or None if not found/expired

        Raises:
            JsonFileStorageReadError: If file cannot be read
            JsonFileStorageSerializationError: If data cannot be parsed
        """
        if isinstance(data_or_key, dict):
            key = self.generate_key(data_or_key)
        else:
            key = data_or_key

        filepath = self._key_to_filename(key)
        logger.debug(f"LOAD: key={key[:50]}... -> {filepath}")
        self._stats["loads"] += 1

        if not filepath.exists():
            logger.debug(f"MISS (not found): {filepath}")
            self._stats["misses"] += 1
            return None

        try:
            async with aiofiles.open(filepath, encoding="utf-8") as f:
                content = await f.read()
                logger.debug(f"Read {len(content)} bytes from {filepath.name}")
        except OSError as e:
            error = JsonFileStorageReadError(
                f"Failed to read file: {e}",
                operation="load",
                key=key,
                filepath=str(filepath),
                original_error=e,
            )
            self._record_error(error, "load", key, str(filepath))
            self._stats["misses"] += 1
            raise error from e

        try:
            entry_data = json.loads(content)
        except json.JSONDecodeError as e:
            error = JsonFileStorageSerializationError(
                f"JSON decode error: {e}",
                operation="load",
                key=key,
                filepath=str(filepath),
                original_error=e,
            )
            self._record_error(error, "load", key, str(filepath))
            self._stats["misses"] += 1
            raise error from e

        # Check expiry
        expires_at = entry_data.get("expires_at")
        if expires_at and not ignore_expiry:
            if time.time() > expires_at:
                logger.debug(f"MISS (expired): {key[:50]}...")
                await self.delete(key)
                self._stats["misses"] += 1
                return None

        ttl_remaining = None
        if expires_at:
            ttl_remaining = max(0, expires_at - time.time())

        logger.debug(f"HIT: {key[:50]}... (ttl remaining: {ttl_remaining}s)")
        self._stats["hits"] += 1
        return entry_data.get("data")

    async def exists(self, data_or_key: dict[str, Any] | str) -> bool:
        """Check if data exists and is not expired."""
        result = await self.load(data_or_key)
        return result is not None

    async def delete(self, data_or_key: dict[str, Any] | str) -> bool:
        """Delete a stored file."""
        if isinstance(data_or_key, dict):
            key = self.generate_key(data_or_key)
        else:
            key = data_or_key

        filepath = self._key_to_filename(key)
        logger.debug(f"DELETE: key={key[:50]}... -> {filepath}")

        try:
            if filepath.exists():
                filepath.unlink()
                self._stats["deletes"] += 1
                logger.info(f"DELETED: {filepath.name}")
                return True
            logger.debug(f"DELETE skipped (not found): {filepath.name}")
            return False
        except OSError as e:
            error = JsonFileStorageError(
                f"Failed to delete file: {e}",
                operation="delete",
                key=key,
                filepath=str(filepath),
                original_error=e,
            )
            self._record_error(error, "delete", key, str(filepath))
            raise error from e

    async def clear(self) -> int:
        """Remove all storage files. Returns count of deleted files."""
        logger.debug("CLEAR: Removing all storage files")
        count = 0
        errors = []

        for filepath in self.save_to_directory.glob(f"*{self.file_extension}"):
            try:
                filepath.unlink()
                count += 1
            except OSError as e:
                error_record = self._record_error(e, "clear", filepath=str(filepath))
                errors.append(error_record)

        logger.info(f"CLEAR complete: {count} files removed, {len(errors)} errors")

        if errors and count == 0:
            raise JsonFileStorageError(
                f"clear failed with {len(errors)} errors",
                operation="clear",
            )

        return count

    async def list_keys(self) -> list[str]:
        """List all stored keys."""
        logger.debug("LIST_KEYS: Reading all stored keys")
        keys = []
        errors = []

        for filepath in self.save_to_directory.glob(f"*{self.file_extension}"):
            try:
                async with aiofiles.open(filepath, encoding="utf-8") as f:
                    data = json.loads(await f.read())
                    keys.append(data.get("key", filepath.stem))
            except (json.JSONDecodeError, OSError) as e:
                self._record_error(e, "list_keys", filepath=str(filepath))
                errors.append(e)
                continue

        logger.debug(f"LIST_KEYS: found {len(keys)} keys, {len(errors)} errors")
        return keys

    async def cleanup_expired(self) -> int:
        """Remove expired entries. Returns count of deleted files."""
        logger.debug("CLEANUP: Starting expired entry cleanup")
        removed = 0
        now = time.time()
        errors = []

        for filepath in self.save_to_directory.glob(f"*{self.file_extension}"):
            try:
                async with aiofiles.open(filepath, encoding="utf-8") as f:
                    data = json.loads(await f.read())
                    expires_at = data.get("expires_at")
                    if expires_at and expires_at < now:
                        filepath.unlink()
                        removed += 1
                        logger.debug(f"Expired: {filepath.name}")
            except (json.JSONDecodeError, OSError) as e:
                self._record_error(e, "cleanup_expired", filepath=str(filepath))
                errors.append(e)
                continue

        logger.info(f"CLEANUP complete: {removed} expired entries removed, {len(errors)} errors")
        return removed

    async def close(self) -> None:
        """Close the storage."""
        logger.debug("Closing JsonFileStorage")
        self._closed = True
        logger.info("JsonFileStorage closed")

    def get_errors(self) -> list[dict[str, Any]]:
        """Get all recorded errors as a list of dicts."""
        return [e.to_dict() for e in self._error_history]

    def get_last_error(self) -> dict[str, Any] | None:
        """Get the last recorded error."""
        if self._last_error:
            return self._last_error.to_dict()
        return None

    def clear_errors(self) -> None:
        """Clear the error history."""
        self._error_history.clear()
        self._last_error = None

    def debug_info(self) -> dict[str, Any]:
        """Return debug information about the storage."""
        files = list(self.save_to_directory.glob(f"*{self.file_extension}"))
        return {
            "save_to_directory": str(self.save_to_directory),
            "directory_exists": self.save_to_directory.exists(),
            "directory_writable": os.access(self.save_to_directory, os.W_OK),
            "file_name_hash_keys": self.file_name_hash_keys,
            "ttl": self.ttl,
            "file_extension": self.file_extension,
            "file_count": len(files),
            "files": [f.name for f in files[:10]],
            "stats": self._stats.copy(),
            "error_count": len(self._error_history),
            "last_error": self.get_last_error(),
            "errors": self.get_errors()[-10:],
        }

    def __repr__(self) -> str:
        return (
            f"JsonFileStorage(directory={self.save_to_directory!r}, "
            f"hash_keys={self.file_name_hash_keys}, ttl={self.ttl}, "
            f"debug={self._debug}, errors={len(self._error_history)})"
        )
