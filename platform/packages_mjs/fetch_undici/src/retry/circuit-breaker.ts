/**
 * Circuit Breaker Pattern
 *
 * Prevents cascading failures by stopping requests to failing services.
 * Implements the standard circuit breaker state machine:
 *
 * CLOSED → (failures exceed threshold) → OPEN
 * OPEN → (timeout elapsed) → HALF_OPEN
 * HALF_OPEN → (success) → CLOSED
 * HALF_OPEN → (failure) → OPEN
 */

import { logger } from '../logger.js'

const log = logger.create('fetch-undici', import.meta.url)

/**
 * Circuit breaker states
 */
export enum CircuitState {
  /** Normal operation, requests allowed, failures tracked */
  CLOSED = 'closed',
  /** Circuit tripped, requests blocked immediately */
  OPEN = 'open',
  /** Testing recovery, limited requests allowed */
  HALF_OPEN = 'half_open'
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  /** Failures before opening circuit (default: 5) */
  failureThreshold?: number
  /** Successes in half-open before closing (default: 2) */
  successThreshold?: number
  /** Milliseconds before half-open attempt (default: 30000) */
  timeout?: number
  /** Whether circuit breaker is active (default: true) */
  enabled?: boolean
}

/**
 * Error thrown when circuit breaker is open
 */
export class CircuitOpenError extends Error {
  readonly name = 'CircuitOpenError'

  constructor(message = 'Circuit breaker is open') {
    super(message)
    Object.setPrototypeOf(this, CircuitOpenError.prototype)
  }
}

/**
 * Circuit Breaker
 *
 * Tracks failures and prevents requests to unhealthy services.
 *
 * @example
 * ```typescript
 * const breaker = new CircuitBreaker({
 *   failureThreshold: 5,
 *   timeout: 30000
 * })
 *
 * if (breaker.allowRequest()) {
 *   try {
 *     await makeRequest()
 *     breaker.recordSuccess()
 *   } catch (err) {
 *     breaker.recordFailure()
 *     throw err
 *   }
 * } else {
 *   throw new CircuitOpenError()
 * }
 * ```
 */
export class CircuitBreaker {
  private readonly _failureThreshold: number
  private readonly _successThreshold: number
  private readonly _timeout: number
  private readonly _enabled: boolean

  private _state: CircuitState = CircuitState.CLOSED
  private _failureCount = 0
  private _successCount = 0
  private _lastFailureTime = 0

  constructor(config?: CircuitBreakerConfig) {
    this._failureThreshold = config?.failureThreshold ?? 5
    this._successThreshold = config?.successThreshold ?? 2
    this._timeout = config?.timeout ?? 30000
    this._enabled = config?.enabled ?? true

    log.debug('CircuitBreaker initialized', {
      failureThreshold: this._failureThreshold,
      timeout: this._timeout
    })
  }

  /**
   * Current circuit state
   */
  get state(): CircuitState {
    return this._state
  }

  /**
   * Check if circuit is open (blocking requests)
   */
  get isOpen(): boolean {
    return this._state === CircuitState.OPEN
  }

  /**
   * Current failure count
   */
  get failureCount(): number {
    return this._failureCount
  }

  /**
   * Check if a request should be allowed
   *
   * @returns true if request is allowed, false if circuit is open
   */
  allowRequest(): boolean {
    if (!this._enabled) {
      return true
    }

    if (this._state === CircuitState.CLOSED) {
      return true
    }

    if (this._state === CircuitState.OPEN) {
      // Check if timeout has elapsed for half-open attempt
      const elapsed = Date.now() - this._lastFailureTime
      if (elapsed >= this._timeout) {
        this._transitionTo(CircuitState.HALF_OPEN)
        log.info('Circuit transitioning to half-open', { elapsed })
        return true
      }
      return false
    }

    // HALF_OPEN: allow limited requests
    return true
  }

  /**
   * Record a successful request
   */
  recordSuccess(): void {
    if (!this._enabled) {
      return
    }

    if (this._state === CircuitState.HALF_OPEN) {
      this._successCount++
      if (this._successCount >= this._successThreshold) {
        this._transitionTo(CircuitState.CLOSED)
        log.info('Circuit closed after recovery', {
          successes: this._successCount
        })
      }
    } else if (this._state === CircuitState.CLOSED) {
      // Reset failure count on success
      this._failureCount = 0
    }
  }

  /**
   * Record a failed request
   */
  recordFailure(): void {
    if (!this._enabled) {
      return
    }

    this._lastFailureTime = Date.now()

    if (this._state === CircuitState.HALF_OPEN) {
      // Immediate trip back to open on failure during half-open
      this._transitionTo(CircuitState.OPEN)
      log.warn('Circuit re-opened after half-open failure')
    } else if (this._state === CircuitState.CLOSED) {
      this._failureCount++
      if (this._failureCount >= this._failureThreshold) {
        this._transitionTo(CircuitState.OPEN)
        log.warn('Circuit opened due to failures', {
          failures: this._failureCount
        })
      }
    }
  }

  /**
   * Reset circuit breaker to initial state
   */
  reset(): void {
    this._state = CircuitState.CLOSED
    this._failureCount = 0
    this._successCount = 0
    this._lastFailureTime = 0
    log.debug('Circuit breaker reset')
  }

  /**
   * Transition to a new state
   */
  private _transitionTo(state: CircuitState): void {
    const oldState = this._state
    this._state = state

    if (state === CircuitState.CLOSED) {
      this._failureCount = 0
      this._successCount = 0
    } else if (state === CircuitState.HALF_OPEN) {
      this._successCount = 0
    }

    log.debug('Circuit state changed', {
      from: oldState,
      to: state
    })
  }
}
