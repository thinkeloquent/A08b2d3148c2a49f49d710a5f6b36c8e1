/**
 * JSON Redis Storage - Redis-based JSON storage with size limits and eviction policies.
 *
 * This package provides a high-level interface for storing JSON data in Redis with:
 * - Size limits (by entry count or memory usage)
 * - TTL (time-to-live) for automatic expiration
 * - Multiple eviction policies (FIFO, LRU, LFU)
 * - Rotation mode for log/token storage
 * - Key prefix namespacing
 */

export {
  // Main class
  JsonRedisStorage,
  // Enums
  EvictionPolicy,
  // Interfaces
  type RedisClientInterface,
  type ErrorRecord,
  type StorageEntry,
  type StorageStats,
  type StorageLimits,
  type JsonRedisStorageOptions,
  // Exceptions
  JsonRedisStorageError,
  JsonRedisStorageReadError,
  JsonRedisStorageWriteError,
  JsonRedisStorageSerializationError,
  JsonRedisStorageConnectionError,
} from "./storage.js";
