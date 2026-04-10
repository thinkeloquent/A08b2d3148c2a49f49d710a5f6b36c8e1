/**
 * json_file_storage - File-based JSON storage with hash-based filenames.
 *
 * @example
 * ```typescript
 * import { JsonFileStorage } from 'json_file_storage';
 *
 * const storage = new JsonFileStorage({
 *   saveToDirectory: '.data/cache',
 *   fileNameHashKeys: ['userId', 'action'],
 *   ttl: 3600,
 *   debug: true,
 * });
 *
 * await storage.init();
 *
 * // Save data - filename is generated from hash of userId + action
 * await storage.save({ userId: '123', action: 'login', data: {...} });
 *
 * // Load data - provide the same keys to find the file
 * const data = await storage.load({ userId: '123', action: 'login' });
 *
 * await storage.close();
 * ```
 */

export {
  JsonFileStorage,
  JsonFileStorageError,
  JsonFileStorageReadError,
  JsonFileStorageWriteError,
  JsonFileStorageSerializationError,
  type ErrorRecord,
  type StorageEntry,
  type StorageStats,
  type JsonFileStorageOptions,
  type JsonFileStorageErrorOptions,
} from "./storage.js";
