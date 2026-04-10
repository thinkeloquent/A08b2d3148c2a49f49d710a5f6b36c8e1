/**
 * Timeout configuration for fetch-undici
 *
 * Provides httpx-compatible timeout configuration with Undici mapping.
 */

import { logger } from '../logger.js'

const log = logger.create('fetch-undici', import.meta.url)

/** Timeout options interface */
export interface TimeoutOptions {
  /** Connection timeout in milliseconds */
  connect?: number | null
  /** Read timeout in milliseconds (headers + body). Alias for setting both headersTimeout and bodyTimeout */
  read?: number | null
  /** Write timeout in milliseconds */
  write?: number | null
  /** Pool acquire timeout in milliseconds */
  pool?: number | null
  /** Time to receive complete HTTP headers in milliseconds. Default: 300000 (300s). Use 0 to disable. */
  headersTimeout?: number | null
  /** Time between receiving body data in milliseconds. Default: 300000 (300s). Use 0 to disable. */
  bodyTimeout?: number | null
}

/** Undici timeout options */
export interface UndiciTimeoutOptions {
  headersTimeout?: number
  bodyTimeout?: number
  keepAliveTimeout?: number
  connectTimeout?: number
}

/** Default timeout values in milliseconds */
const DEFAULT_CONNECT_TIMEOUT = 5000
const DEFAULT_READ_TIMEOUT = 30000
const DEFAULT_WRITE_TIMEOUT = 30000
const DEFAULT_POOL_TIMEOUT = 5000

/**
 * Timeout configuration class
 *
 * Provides httpx-compatible timeout configuration.
 *
 * @example
 * ```typescript
 * // Simple timeout (all values)
 * const timeout1 = new Timeout(30000)
 *
 * // Granular timeout
 * const timeout2 = new Timeout({
 *   connect: 5000,
 *   read: 30000,
 *   write: 30000,
 *   pool: 5000
 * })
 *
 * // Disable timeout
 * const timeout3 = new Timeout({ read: null })
 * ```
 */
export class Timeout {
  /** Connection timeout in milliseconds (null = no timeout) */
  readonly connect: number | null

  /** Read timeout in milliseconds (null = no timeout) */
  readonly read: number | null

  /** Write timeout in milliseconds (null = no timeout) */
  readonly write: number | null

  /** Pool acquire timeout in milliseconds (null = no timeout) */
  readonly pool: number | null

  /** Headers timeout in milliseconds (null = use read, 0 = disabled) */
  readonly headersTimeout: number | null

  /** Body timeout in milliseconds (null = use read, 0 = disabled) */
  readonly bodyTimeout: number | null

  /**
   * Create a Timeout instance
   *
   * @param options - Number (all timeouts) or TimeoutOptions object
   */
  constructor(options?: number | TimeoutOptions | null) {
    if (options === null || options === undefined) {
      // Use defaults
      this.connect = DEFAULT_CONNECT_TIMEOUT
      this.read = DEFAULT_READ_TIMEOUT
      this.write = DEFAULT_WRITE_TIMEOUT
      this.pool = DEFAULT_POOL_TIMEOUT
      this.headersTimeout = null
      this.bodyTimeout = null
    } else if (typeof options === 'number') {
      // Single value for all
      this.connect = options
      this.read = options
      this.write = options
      this.pool = options
      this.headersTimeout = null
      this.bodyTimeout = null
    } else {
      // Object with specific values
      this.connect = options.connect ?? DEFAULT_CONNECT_TIMEOUT
      this.read = options.read ?? DEFAULT_READ_TIMEOUT
      this.write = options.write ?? DEFAULT_WRITE_TIMEOUT
      this.pool = options.pool ?? DEFAULT_POOL_TIMEOUT
      // headersTimeout/bodyTimeout allow explicit control (null = inherit from read)
      this.headersTimeout = options.headersTimeout !== undefined ? options.headersTimeout : null
      this.bodyTimeout = options.bodyTimeout !== undefined ? options.bodyTimeout : null
    }

    log.debug('Timeout created', {
      connect: this.connect,
      read: this.read,
      write: this.write,
      pool: this.pool,
      headersTimeout: this.headersTimeout,
      bodyTimeout: this.bodyTimeout
    })
  }

  /**
   * Convert to Undici timeout options
   */
  toUndiciOptions(): UndiciTimeoutOptions {
    const result: UndiciTimeoutOptions = {}

    // Use explicit headersTimeout if set, otherwise fall back to read
    if (this.headersTimeout !== null) {
      result.headersTimeout = this.headersTimeout
    } else if (this.read !== null) {
      result.headersTimeout = this.read
    } else {
      // Undici requires 0 for no timeout
      result.headersTimeout = 0
    }

    // Use explicit bodyTimeout if set, otherwise fall back to read
    if (this.bodyTimeout !== null) {
      result.bodyTimeout = this.bodyTimeout
    } else if (this.read !== null) {
      result.bodyTimeout = this.read
    } else {
      // Undici requires 0 for no timeout
      result.bodyTimeout = 0
    }

    // Map connect timeout
    if (this.connect !== null) {
      result.connectTimeout = this.connect
    }

    log.trace('Converted to Undici options', { ...result })
    return result
  }

  /**
   * Create a new Timeout with merged options
   */
  merge(options?: number | TimeoutOptions | null): Timeout {
    if (options === null || options === undefined) {
      return this
    }

    if (typeof options === 'number') {
      return new Timeout(options)
    }

    return new Timeout({
      connect: options.connect !== undefined ? options.connect : this.connect,
      read: options.read !== undefined ? options.read : this.read,
      write: options.write !== undefined ? options.write : this.write,
      pool: options.pool !== undefined ? options.pool : this.pool,
      headersTimeout:
        options.headersTimeout !== undefined ? options.headersTimeout : this.headersTimeout,
      bodyTimeout: options.bodyTimeout !== undefined ? options.bodyTimeout : this.bodyTimeout
    })
  }

  /**
   * Check if all timeouts are disabled
   */
  get isDisabled(): boolean {
    return (
      this.connect === null && this.read === null && this.write === null && this.pool === null
    )
  }
}

/**
 * Create a Timeout instance from various input types
 */
export function createTimeout(input?: number | TimeoutOptions | Timeout | null): Timeout {
  if (input instanceof Timeout) {
    return input
  }
  return new Timeout(input)
}
