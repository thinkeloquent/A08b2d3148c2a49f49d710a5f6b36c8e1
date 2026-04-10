/**
 * LLM Agent Interface for AWS S3 Client
 *
 * Provides a simplified interface for LLM agents with tool-friendly methods.
 */

import { type SDKConfig } from "./config.js";
import { type Logger, create as createLogger } from "./logger.js";
import { S3StorageSDK, createSDK } from "./sdk.js";

const logger = createLogger("aws_s3_client.agent", import.meta.url);

/**
 * Simplified response for LLM agents.
 */
export interface AgentResponse {
  /** Whether the operation succeeded */
  success: boolean;
  /** Human-readable message */
  message: string;
  /** Result data if any */
  data?: unknown;
  /** Storage key if applicable */
  key?: string | null;
}

/**
 * LLM Agent-friendly interface for S3 storage.
 *
 * Provides simplified methods with descriptive names suitable for
 * LLM function calling and tool use.
 *
 * @example
 * ```typescript
 * const agent = createAgentInterface({ bucketName: "my-bucket" });
 *
 * const result = await agent.store({ user: "alice", score: 100 });
 * console.log(result.message);  // "Stored data with key abc123"
 *
 * await agent.close();
 * ```
 */
export class AgentStorageInterface {
  private readonly sdk: S3StorageSDK;
  private readonly _logger: Logger;

  constructor(config: SDKConfig, options?: { logger?: Logger }) {
    this._logger = options?.logger ?? logger;
    this.sdk = createSDK(config, { logger: this._logger });
  }

  /**
   * Store JSON data in S3.
   *
   * Saves the provided JSON data to S3 storage and returns a unique key
   * that can be used to retrieve the data later.
   *
   * @param data - JSON object to store
   * @param options - Optional settings
   * @returns AgentResponse with storage key
   */
  async store(
    data: Record<string, unknown>,
    options?: { ttlSeconds?: number }
  ): Promise<AgentResponse> {
    this._logger.debug(`store: data with ${Object.keys(data).length} fields`);

    const response = await this.sdk.save(data, { ttl: options?.ttlSeconds });

    if (response.success) {
      return {
        success: true,
        message: `Stored data with key ${response.key}`,
        key: response.key,
      };
    } else {
      return {
        success: false,
        message: `Failed to store data: ${response.error}`,
      };
    }
  }

  /**
   * Retrieve JSON data from S3 by key.
   *
   * Fetches previously stored data using the storage key.
   * Returns null if the data doesn't exist or has expired.
   *
   * @param key - Storage key from a previous store operation
   * @returns AgentResponse with the stored data
   */
  async retrieve(key: string): Promise<AgentResponse> {
    this._logger.debug(`retrieve: key=${key}`);

    const response = await this.sdk.load(key);

    if (response.success) {
      if (response.data !== null) {
        return {
          success: true,
          message: "Retrieved data successfully",
          data: response.data,
          key,
        };
      } else {
        return {
          success: true,
          message: "No data found for this key",
          data: null,
          key,
        };
      }
    } else {
      return {
        success: false,
        message: `Failed to retrieve data: ${response.error}`,
      };
    }
  }

  /**
   * Remove data from S3 by key.
   *
   * Deletes previously stored data. This operation is idempotent -
   * it succeeds even if the key doesn't exist.
   *
   * @param key - Storage key to delete
   * @returns AgentResponse indicating success
   */
  async remove(key: string): Promise<AgentResponse> {
    this._logger.debug(`remove: key=${key}`);

    const response = await this.sdk.delete(key);

    if (response.success) {
      return {
        success: true,
        message: `Removed data with key ${key}`,
        key,
      };
    } else {
      return {
        success: false,
        message: `Failed to remove data: ${response.error}`,
      };
    }
  }

  /**
   * Check if data exists in S3.
   *
   * Verifies whether data with the given key exists in storage.
   * This is more efficient than retrieving the full data.
   *
   * @param key - Storage key to check
   * @returns AgentResponse with existence status in data field
   */
  async check(key: string): Promise<AgentResponse> {
    this._logger.debug(`check: key=${key}`);

    const response = await this.sdk.exists(key);

    if (response.success) {
      const exists = response.data;
      return {
        success: true,
        message: `Key ${exists ? "exists" : "does not exist"}`,
        data: exists,
        key,
      };
    } else {
      return {
        success: false,
        message: `Failed to check key: ${response.error}`,
      };
    }
  }

  /**
   * List all stored keys.
   *
   * Returns a list of all storage keys in the configured bucket/prefix.
   *
   * @returns AgentResponse with list of keys in data field
   */
  async listAll(): Promise<AgentResponse> {
    this._logger.debug("listAll: listing all keys");

    const response = await this.sdk.listKeys();

    if (response.success) {
      const keys = response.data ?? [];
      return {
        success: true,
        message: `Found ${keys.length} stored keys`,
        data: keys,
      };
    } else {
      return {
        success: false,
        message: `Failed to list keys: ${response.error}`,
      };
    }
  }

  /**
   * Close the agent interface and release resources.
   */
  async close(): Promise<void> {
    await this.sdk.close();
  }

  /**
   * Support for async disposal.
   */
  async [Symbol.asyncDispose](): Promise<void> {
    await this.close();
  }
}

/**
 * Factory function to create an agent interface.
 */
export function createAgentInterface(
  config: SDKConfig,
  options?: { logger?: Logger }
): AgentStorageInterface {
  return new AgentStorageInterface(config, options);
}

/**
 * Tool schema for LLM function calling.
 */
export const TOOL_SCHEMA = {
  name: "s3_storage",
  description: "Store and retrieve JSON data in AWS S3",
  functions: [
    {
      name: "store",
      description: "Store JSON data and get a unique key",
      parameters: {
        type: "object",
        properties: {
          data: {
            type: "object",
            description: "JSON data to store",
          },
          ttlSeconds: {
            type: "integer",
            description: "Optional expiration time in seconds",
          },
        },
        required: ["data"],
      },
    },
    {
      name: "retrieve",
      description: "Retrieve stored data by key",
      parameters: {
        type: "object",
        properties: {
          key: {
            type: "string",
            description: "Storage key from store operation",
          },
        },
        required: ["key"],
      },
    },
    {
      name: "remove",
      description: "Delete stored data by key",
      parameters: {
        type: "object",
        properties: {
          key: {
            type: "string",
            description: "Storage key to delete",
          },
        },
        required: ["key"],
      },
    },
    {
      name: "check",
      description: "Check if data exists for a key",
      parameters: {
        type: "object",
        properties: {
          key: {
            type: "string",
            description: "Storage key to check",
          },
        },
        required: ["key"],
      },
    },
  ],
};
