/**
 * AsyncClientPool for fetch-undici
 *
 * Extends AsyncClient to support shared connection pools (dispatchers).
 * Supports Pool, BalancedPool, and RoundRobinPool types from Undici.
 *
 * @see https://undici.nodejs.org/#/docs/api/Pool.md
 * @see https://undici.nodejs.org/#/docs/api/BalancedPool.md
 * @see https://undici.nodejs.org/#/docs/api/RoundRobinPool.md
 */

import { Dispatcher, Pool, BalancedPool, RoundRobinPool } from 'undici'
import { AsyncClient } from './client.js'
import type { AsyncClientOptions } from './options.js'

/**
 * Pool type enumeration
 */
export enum PoolType {
  /** Standard connection pool to a single origin */
  POOL = 'pool',
  /** Load-balanced pool across multiple origins (least-busy algorithm) */
  BALANCED = 'balanced',
  /** Round-robin pool for a single origin (cycles through connections) */
  ROUND_ROBIN = 'round-robin'
}

/**
 * Pool-specific options for AsyncClientPool
 */
export interface PoolOptions {
  /** Pool type: 'pool', 'balanced', or 'round-robin' */
  type?: PoolType | 'pool' | 'balanced' | 'round-robin' | 'roundrobin'

  /**
   * Origins for the pool.
   * - For Pool/RoundRobinPool: single origin string/URL
   * - For BalancedPool: array of origin strings/URLs
   */
  origins?: string | string[] | URL | URL[]

  /** Maximum number of connections in the pool. Default: null (unlimited) */
  connections?: number | null

  /** Factory function to create dispatchers for each origin */
  factory?: (origin: URL, opts: object) => Dispatcher

  /** Client TTL in ms before removal (RoundRobinPool only). Default: null (no limit) */
  clientTtl?: number | null
}

/**
 * Options for AsyncClientPool
 */
export interface AsyncClientPoolOptions extends AsyncClientOptions {
  /** Pool configuration */
  pool?: PoolOptions
}

/**
 * A wrapper for Dispatcher that ignores close calls.
 * Used to protect shared dispatchers from being closed by AsyncClient.
 */
class NoCloseDispatcher extends Dispatcher {
  constructor(private readonly _dispatcher: Dispatcher) {
    super()
  }

  dispatch(options: Dispatcher.DispatchOptions, handler: Dispatcher.DispatchHandler): boolean {
    return this._dispatcher.dispatch(options, handler)
  }

  async close(): Promise<void> {
    // Intentional no-op: Do not close the shared dispatcher
    return Promise.resolve()
  }

  async destroy(): Promise<void> {
    // Intentional no-op: Do not destroy the shared dispatcher
    return Promise.resolve()
  }
}

/**
 * Union type for all supported pool types
 */
export type AnyPool = Pool | BalancedPool | RoundRobinPool

/**
 * AsyncClientPool - Shared Pool HTTP Client
 *
 * Extends AsyncClient to support "borrowed" connection pools or agents.
 * Supports Pool, BalancedPool, and RoundRobinPool from Undici.
 *
 * Pool Types:
 * - **Pool**: Standard connection pool to a single origin
 * - **BalancedPool**: Load-balanced pool across multiple origins (least-busy algorithm)
 * - **RoundRobinPool**: Round-robin connection selection for a single origin
 *
 * When using `mounts` with standard `AsyncClient`, the client takes ownership
 * of the dispatchers and closes them when `client.close()` is called.
 *
 * `AsyncClientPool` wraps all mounted dispatchers in a protective shield that
 * intercepts `close()` calls, ensuring the underlying shared pool stays active
 * for other clients or requests.
 *
 * @example
 * ```typescript
 * // Using shared ProxyAgent
 * const proxyAgent = new ProxyAgent({ uri: 'http://proxy' })
 *
 * const client = new AsyncClientPool({
 *   mounts: {
 *     'https://': proxyAgent
 *   }
 * })
 *
 * await client.get('https://example.com')
 * await client.close() // proxyAgent remains open!
 * ```
 *
 * @example
 * ```typescript
 * // Using BalancedPool for load balancing across multiple origins
 * const client = new AsyncClientPool({
 *   pool: {
 *     type: 'balanced',
 *     origins: [
 *       'https://api1.example.com',
 *       'https://api2.example.com',
 *       'https://api3.example.com'
 *     ],
 *     connections: 10
 *   }
 * })
 *
 * // Requests are load-balanced (least-busy algorithm)
 * await client.get('/users')
 * ```
 *
 * @example
 * ```typescript
 * // Using RoundRobinPool for round-robin connection selection
 * const client = new AsyncClientPool({
 *   pool: {
 *     type: 'round-robin',
 *     origins: 'https://api.example.com',
 *     connections: 10,
 *     clientTtl: 60000 // Optional: client TTL in ms
 *   }
 * })
 *
 * // Connections are cycled through in round-robin fashion
 * await client.get('/users')
 * ```
 *
 * @example
 * ```typescript
 * // Using standard Pool for single origin
 * const client = new AsyncClientPool({
 *   pool: {
 *     type: 'pool',
 *     origins: 'https://api.example.com',
 *     connections: 50
 *   }
 * })
 * ```
 */
export class AsyncClientPool extends AsyncClient {
  private readonly _pool: AnyPool | null = null
  private readonly _poolType: PoolType

  constructor(options?: AsyncClientPoolOptions) {
    // If mounts are provided, wrap them in NoCloseDispatcher
    const protectedOptions = { ...options }

    if (options?.mounts) {
      const protectedMounts: Record<string, Dispatcher> = {}

      for (const [pattern, dispatcher] of Object.entries(options.mounts)) {
        // Wrap dispatcher to prevent it being closed by this client
        protectedMounts[pattern] = new NoCloseDispatcher(dispatcher)
      }

      protectedOptions.mounts = protectedMounts
    }

    super(protectedOptions)

    // Determine pool type
    this._poolType = normalizePoolType(options?.pool?.type)

    // Create pool if origins are specified
    if (options?.pool?.origins) {
      this._pool = this._createPool(options.pool)
      this._log.info('AsyncClientPool created with pool', {
        type: this._poolType,
        origins: Array.isArray(options.pool.origins)
          ? options.pool.origins.map((o) => o.toString())
          : options.pool.origins.toString()
      })
    } else {
      this._log.info('AsyncClientPool created with protected mounts')
    }
  }

  /**
   * Get the pool type
   */
  get poolType(): PoolType {
    return this._poolType
  }

  /**
   * Get the underlying pool (if created)
   */
  get pool(): AnyPool | null {
    return this._pool
  }

  /**
   * Get pool stats (available for Pool and RoundRobinPool)
   */
  get stats(): Pool.PoolStats | null {
    if (this._pool instanceof Pool) {
      return this._pool.stats
    }
    if (this._pool instanceof RoundRobinPool) {
      return this._pool.stats
    }
    return null
  }

  /**
   * Get upstreams (only available for BalancedPool)
   */
  get upstreams(): string[] | null {
    if (this._pool instanceof BalancedPool) {
      return this._pool.upstreams
    }
    return null
  }

  /**
   * Add an upstream to the balanced pool
   * @throws Error if pool is not a BalancedPool
   */
  addUpstream(upstream: string | URL): this {
    if (!(this._pool instanceof BalancedPool)) {
      throw new Error('addUpstream is only available for BalancedPool')
    }
    this._pool.addUpstream(upstream)
    this._log.debug('Added upstream to BalancedPool', { upstream: upstream.toString() })
    return this
  }

  /**
   * Remove an upstream from the balanced pool
   * @throws Error if pool is not a BalancedPool
   */
  removeUpstream(upstream: string | URL): this {
    if (!(this._pool instanceof BalancedPool)) {
      throw new Error('removeUpstream is only available for BalancedPool')
    }
    this._pool.removeUpstream(upstream)
    this._log.debug('Removed upstream from BalancedPool', { upstream: upstream.toString() })
    return this
  }

  /**
   * Create the appropriate pool type
   */
  private _createPool(poolOptions: PoolOptions): AnyPool {
    const poolType = normalizePoolType(poolOptions.type)

    if (poolType === PoolType.BALANCED) {
      // BalancedPool for multiple origins (least-busy)
      const origins = poolOptions.origins
      if (!origins) {
        throw new Error('BalancedPool requires origins to be specified')
      }

      const poolOpts: Pool.Options = {}
      if (poolOptions.connections !== undefined) {
        poolOpts.connections = poolOptions.connections
      }
      if (poolOptions.factory) {
        poolOpts.factory = poolOptions.factory
      }

      this._log.debug('Creating BalancedPool', {
        origins: Array.isArray(origins) ? origins.length : 1
      })
      return new BalancedPool(origins as string | string[], poolOpts)
    } else if (poolType === PoolType.ROUND_ROBIN) {
      // RoundRobinPool for single origin (round-robin connection selection)
      const origin = Array.isArray(poolOptions.origins)
        ? poolOptions.origins[0]
        : poolOptions.origins
      if (!origin) {
        throw new Error('RoundRobinPool requires an origin to be specified')
      }

      const poolOpts: RoundRobinPool.Options = {}
      if (poolOptions.connections !== undefined) {
        poolOpts.connections = poolOptions.connections
      }
      if (poolOptions.factory) {
        poolOpts.factory = poolOptions.factory
      }
      if (poolOptions.clientTtl !== undefined) {
        poolOpts.clientTtl = poolOptions.clientTtl
      }

      this._log.debug('Creating RoundRobinPool', { origin: origin.toString() })
      return new RoundRobinPool(origin as string, poolOpts)
    } else {
      // Standard Pool for single origin
      const origin = Array.isArray(poolOptions.origins)
        ? poolOptions.origins[0]
        : poolOptions.origins
      if (!origin) {
        throw new Error('Pool requires an origin to be specified')
      }

      const poolOpts: Pool.Options = {}
      if (poolOptions.connections !== undefined) {
        poolOpts.connections = poolOptions.connections
      }
      if (poolOptions.factory) {
        poolOpts.factory = poolOptions.factory
      }

      this._log.debug('Creating Pool', { origin: origin.toString() })
      return new Pool(origin as string, poolOpts)
    }
  }

  /**
   * Close client and release resources
   * Note: Shared dispatchers (via mounts) are NOT closed
   */
  override async close(): Promise<void> {
    // Close the internal pool if we created one
    if (this._pool && !this._pool.closed) {
      await this._pool.close()
      this._log.debug('Pool closed')
    }

    // Call parent close (which won't close wrapped mounts)
    await super.close()
  }
}

/**
 * Normalize pool type string to enum
 */
function normalizePoolType(type?: PoolType | string): PoolType {
  if (!type) {
    return PoolType.POOL
  }

  const normalized = type.toString().toLowerCase().replace(/[_-]/g, '')
  switch (normalized) {
    case 'balanced':
    case 'balancedpool':
    case 'loadbalanced':
    case 'leastbusy':
      return PoolType.BALANCED
    case 'roundrobin':
    case 'roundrobinpool':
    case 'rr':
      return PoolType.ROUND_ROBIN
    case 'pool':
    case 'standard':
    default:
      return PoolType.POOL
  }
}

/**
 * Create a Pool for a single origin
 *
 * @example
 * ```typescript
 * const pool = createPool('https://api.example.com', { connections: 10 })
 * const client = new AsyncClientPool({
 *   mounts: { 'https://api.example.com/': pool }
 * })
 * ```
 */
export function createPool(origin: string | URL, options?: Pool.Options): Pool {
  return new Pool(origin as string, options)
}

/**
 * Create a BalancedPool for multiple origins (least-busy algorithm)
 *
 * @example
 * ```typescript
 * const pool = createBalancedPool([
 *   'https://api1.example.com',
 *   'https://api2.example.com'
 * ], { connections: 10 })
 *
 * const client = new AsyncClientPool({
 *   mounts: { 'https://': pool }
 * })
 * ```
 */
export function createBalancedPool(
  origins: string | string[] | URL | URL[],
  options?: Pool.Options
): BalancedPool {
  return new BalancedPool(origins as string | string[], options)
}

/**
 * Create a RoundRobinPool for a single origin (round-robin connection selection)
 *
 * @example
 * ```typescript
 * const pool = createRoundRobinPool('https://api.example.com', {
 *   connections: 10,
 *   clientTtl: 60000 // Optional: client TTL in ms
 * })
 *
 * const client = new AsyncClientPool({
 *   mounts: { 'https://api.example.com/': pool }
 * })
 * ```
 */
export function createRoundRobinPool(
  origin: string | URL,
  options?: RoundRobinPool.Options
): RoundRobinPool {
  return new RoundRobinPool(origin as string, options)
}

// Re-export RoundRobinPool for convenience
export { RoundRobinPool }
