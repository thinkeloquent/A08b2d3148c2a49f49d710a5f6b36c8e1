/**
 * HTTP Basic Authentication for fetch-undici
 */

import { logger } from '../logger.js'
import type { Request } from '../models/request.js'
import { Auth } from './base.js'

const log = logger.create('fetch-undici', import.meta.url)

/**
 * HTTP Basic Authentication
 *
 * Adds Authorization header with Base64-encoded credentials.
 *
 * @example
 * ```typescript
 * const auth = new BasicAuth('username', 'password')
 *
 * const client = new AsyncClient({
 *   auth: auth
 * })
 * ```
 */
export class BasicAuth extends Auth {
  private readonly _username: string
  private readonly _password: string
  private readonly _token: string

  /**
   * Create Basic authentication
   *
   * @param username - Username or user identifier
   * @param password - Password or secret
   */
  constructor(username: string, password: string) {
    super()
    this._username = username
    this._password = password
    this._token = Buffer.from(`${username}:${password}`).toString('base64')

    log.debug('BasicAuth created', { username })
  }

  /**
   * Apply Basic auth to request
   */
  apply(request: Request): Request {
    this.logApply('Basic', { username: this._username })

    return request.clone({
      headers: {
        Authorization: `Basic ${this._token}`
      }
    })
  }

  /**
   * Get username
   */
  get username(): string {
    return this._username
  }

  /**
   * Check if this matches another BasicAuth
   */
  equals(other: BasicAuth): boolean {
    return this._username === other._username && this._password === other._password
  }
}

/**
 * Create BasicAuth from URL credentials
 *
 * @example
 * ```typescript
 * const auth = BasicAuth.fromURL('https://user:pass@example.com')
 * ```
 */
export function basicAuthFromURL(url: string | URL): BasicAuth | null {
  try {
    const parsed = url instanceof URL ? url : new URL(url)
    if (parsed.username || parsed.password) {
      return new BasicAuth(
        decodeURIComponent(parsed.username),
        decodeURIComponent(parsed.password)
      )
    }
  } catch {
    // Invalid URL
  }
  return null
}
