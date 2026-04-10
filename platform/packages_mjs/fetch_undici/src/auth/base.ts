/**
 * Base authentication class for fetch-undici
 *
 * Provides the foundation for all authentication handlers.
 */

import { logger } from '../logger.js'
import type { Request } from '../models/request.js'
import type { Response } from '../models/response.js'

const log = logger.create('fetch-undici', import.meta.url)

/**
 * Base class for authentication handlers
 *
 * Subclasses must implement the `apply` method to add authentication
 * to requests.
 *
 * @example
 * ```typescript
 * class CustomAuth extends Auth {
 *   apply(request: Request): Request {
 *     return request.clone({
 *       headers: { 'X-API-Key': this.apiKey }
 *     })
 *   }
 * }
 * ```
 */
export abstract class Auth {
  /**
   * Apply authentication to a request
   *
   * @param request - The request to authenticate
   * @param response - Optional previous response (for digest auth flow)
   * @returns Modified request with authentication applied
   */
  abstract apply(request: Request, response?: Response): Request

  /**
   * Check if this auth requires a challenge-response flow
   * (e.g., Digest authentication)
   */
  get requiresChallenge(): boolean {
    return false
  }

  /**
   * Check if the auth can handle a 401 challenge
   */
  canHandleChallenge(_response: Response): boolean {
    return false
  }

  protected logApply(type: string, details?: Record<string, unknown>): void {
    log.debug('Auth applied', { type, ...details })
  }
}

/**
 * No-op authentication (pass-through)
 */
export class NoAuth extends Auth {
  apply(request: Request): Request {
    return request
  }
}

/**
 * Type guard to check if value is an Auth instance
 */
export function isAuth(value: unknown): value is Auth {
  return value instanceof Auth
}
