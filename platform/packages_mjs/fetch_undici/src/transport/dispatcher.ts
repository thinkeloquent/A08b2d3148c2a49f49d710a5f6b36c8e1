/**
 * Dispatcher factory for fetch-undici
 *
 * Creates and manages Undici dispatchers (Pool, Agent, etc).
 */

import { Pool, Agent, interceptors, type Dispatcher, type buildConnector } from 'undici'
import { logger } from '../logger.js'
import type { Timeout } from '../config/timeout.js'
import type { Limits } from '../config/limits.js'
import type { TLSConfig } from '../config/tls.js'
import { getOrigin } from '../models/url.js'

const log = logger.create('fetch-undici', import.meta.url)

/** Connect options type */
export type ConnectOptions = buildConnector.BuildOptions

/** Dispatcher factory options */
export interface DispatcherOptions {
  timeout?: Timeout
  limits?: Limits
  tls?: TLSConfig
  http2?: boolean
  /** Allow HTTP/2 connections. Default: true */
  allowH2?: boolean
  /** Maximum response body size in bytes. -1 to disable */
  maxResponseSize?: number
  /** Custom connect options for socket creation */
  connect?: ConnectOptions
  /** Pipelining factor (1 = no pipelining) */
  pipelining?: number
  /** Undici interceptors */
  interceptors?: Dispatcher.DispatchInterceptor[]
  /** Follow redirects. Default: true */
  followRedirects?: boolean
  /** Maximum number of redirects. Default: 10 */
  maxRedirects?: number
}

/** Cached dispatcher entry */
interface CachedDispatcher {
  dispatcher: Dispatcher
  origin: string
  createdAt: number
}

/**
 * Dispatcher factory for creating and caching Undici dispatchers
 *
 * Manages connection pools per origin for optimal performance.
 */
export class DispatcherFactory {
  private readonly _cache = new Map<string, CachedDispatcher>()
  private readonly _defaultOptions: DispatcherOptions
  private _defaultAgent: Agent | null = null

  constructor(options?: DispatcherOptions) {
    this._defaultOptions = options ?? {}

    log.debug('DispatcherFactory created', {
      hasTimeout: !!options?.timeout,
      hasLimits: !!options?.limits,
      hasTls: !!options?.tls,
      http2: options?.http2
    })
  }

  /**
   * Get or create a dispatcher for the given URL
   */
  getDispatcher(url: string | URL): Dispatcher {
    const origin = getOrigin(url)
    const cached = this._cache.get(origin)

    if (cached) {
      log.trace('Using cached dispatcher', { origin })
      return cached.dispatcher
    }

    const dispatcher = this._createPool(origin)
    this._cache.set(origin, {
      dispatcher,
      origin,
      createdAt: Date.now()
    })

    log.debug('Created new dispatcher', { origin })
    return dispatcher
  }

  /**
   * Get default agent (for use with all origins)
   */
  getDefaultAgent(): Agent {
    if (!this._defaultAgent) {
      this._defaultAgent = this._createAgent()
      log.debug('Created default agent')
    }
    return this._defaultAgent
  }

  /**
   * Create a Pool for a specific origin
   */
  private _createPool(origin: string): Pool {
    const options = this._buildPoolOptions()

    log.trace('Creating pool', { origin, options: { ...options, connect: '[TLS options]' } })

    return new Pool(origin, options)
  }

  /**
   * Create an Agent for all origins
   */
  private _createAgent(): Agent {
    const options = this._buildAgentOptions()

    log.trace('Creating agent', { options })

    return new Agent(options)
  }

  /**
   * Build pool options from configuration
   */
  private _buildPoolOptions(): Pool.Options {
    const options: Pool.Options = {}

    // Timeout options
    if (this._defaultOptions.timeout) {
      const timeoutOpts = this._defaultOptions.timeout.toUndiciOptions()
      Object.assign(options, timeoutOpts)
    }

    // Limits options
    if (this._defaultOptions.limits) {
      const limitsOpts = this._defaultOptions.limits.toUndiciOptions()
      Object.assign(options, limitsOpts)
    }

    // TLS options - merge with custom connect options
    if (this._defaultOptions.tls || this._defaultOptions.connect) {
      const tlsOpts = this._defaultOptions.tls?.toUndiciOptions() ?? {}
      const connectOpts = this._defaultOptions.connect ?? {}
      options.connect = { ...connectOpts, ...tlsOpts }
    }

    // HTTP/2 - allowH2 defaults to true, but http2 option can override
    if (this._defaultOptions.allowH2 !== undefined) {
      options.allowH2 = this._defaultOptions.allowH2
    } else if (this._defaultOptions.http2) {
      options.allowH2 = true
    } else {
      options.allowH2 = true // Default to true as per user request
    }

    // Maximum response size (-1 = disabled)
    if (
      this._defaultOptions.maxResponseSize !== undefined &&
      this._defaultOptions.maxResponseSize !== -1
    ) {
      options.maxResponseSize = this._defaultOptions.maxResponseSize
    }

    // Pipelining
    if (this._defaultOptions.pipelining !== undefined) {
      options.pipelining = this._defaultOptions.pipelining
    }

    // Build interceptor list: redirect interceptor + user-provided interceptors
    const allInterceptors: Dispatcher.DispatchInterceptor[] = []

    // Add redirect interceptor (uses undici's built-in interceptors.redirect)
    const followRedirects = this._defaultOptions.followRedirects ?? true
    if (followRedirects) {
      const maxRedirections = this._defaultOptions.maxRedirects ?? 10
      allInterceptors.push(interceptors.redirect({ maxRedirections }))
    }

    // Add user-provided interceptors
    if (
      this._defaultOptions.interceptors !== undefined &&
      this._defaultOptions.interceptors.length > 0
    ) {
      allInterceptors.push(...this._defaultOptions.interceptors)
    }

    if (allInterceptors.length > 0) {
      options.interceptors = {
        Pool: allInterceptors,
        Client: allInterceptors
      }
    }

    return options
  }

  /**
   * Build agent options from configuration
   */
  private _buildAgentOptions(): Agent.Options {
    const options: Agent.Options = {}

    // Use pool factory for per-origin customization
    options.factory = (origin, opts) => {
      const poolOpts = { ...this._buildPoolOptions(), ...opts }
      return new Pool(origin, poolOpts)
    }

    // Limits for agent
    if (this._defaultOptions.limits) {
      options.connections = this._defaultOptions.limits.maxConnectionsPerHost ?? 10
    }

    return options
  }

  /**
   * Close all cached dispatchers
   */
  async closeAll(): Promise<void> {
    log.info('Closing all dispatchers', { count: this._cache.size })

    const closePromises: Promise<void>[] = []

    for (const { dispatcher, origin } of this._cache.values()) {
      log.trace('Closing dispatcher', { origin })
      closePromises.push(dispatcher.close())
    }

    if (this._defaultAgent) {
      closePromises.push(this._defaultAgent.close())
      this._defaultAgent = null
    }

    await Promise.all(closePromises)
    this._cache.clear()

    log.debug('All dispatchers closed')
  }

  /**
   * Get cached dispatcher count
   */
  get cacheSize(): number {
    return this._cache.size
  }

  /**
   * Get all cached origins
   */
  get cachedOrigins(): string[] {
    return Array.from(this._cache.keys())
  }
}

/**
 * Create a simple pool for a single origin
 */
export function createPool(origin: string, options?: DispatcherOptions): Pool {
  const factory = new DispatcherFactory(options)
  return factory.getDispatcher(origin) as Pool
}

/**
 * Create an agent for multiple origins
 */
export function createAgent(options?: DispatcherOptions): Agent {
  const factory = new DispatcherFactory(options)
  return factory.getDefaultAgent()
}
