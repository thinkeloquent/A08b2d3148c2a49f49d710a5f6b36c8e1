/**
 * Bearer Token Authentication for fetch-undici
 */

import { logger } from '../logger.js'
import type { Request } from '../models/request.js'
import { Auth } from './base.js'

const log = logger.create('fetch-undici', import.meta.url)

/**
 * Bearer Token Authentication
 *
 * Adds Authorization header with Bearer token.
 * Commonly used for OAuth2 and JWT authentication.
 *
 * @example
 * ```typescript
 * const auth = new BearerAuth('your-jwt-token')
 *
 * const client = new AsyncClient({
 *   auth: auth
 * })
 *
 * // Or with a token provider
 * const auth = new BearerAuth(() => getToken())
 * ```
 */
export class BearerAuth extends Auth {
  private readonly _token: string | (() => string | Promise<string>)

  /**
   * Create Bearer authentication
   *
   * @param token - Token string or function that returns token
   */
  constructor(token: string | (() => string | Promise<string>)) {
    super()
    this._token = token

    log.debug('BearerAuth created', {
      tokenType: typeof token === 'function' ? 'dynamic' : 'static'
    })
  }

  /**
   * Apply Bearer auth to request
   */
  apply(request: Request): Request {
    const token = this._resolveToken()

    this.logApply('Bearer', { tokenLength: token.length })

    return request.clone({
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  /**
   * Resolve token value
   */
  private _resolveToken(): string {
    if (typeof this._token === 'function') {
      const result = this._token()
      if (result instanceof Promise) {
        throw new Error('Async token providers are not supported in sync apply. Use applyAsync.')
      }
      return result
    }
    return this._token
  }

  /**
   * Apply Bearer auth to request (async version)
   *
   * Use this when the token provider is async.
   */
  async applyAsync(request: Request): Promise<Request> {
    let token: string

    if (typeof this._token === 'function') {
      token = await this._token()
    } else {
      token = this._token
    }

    this.logApply('Bearer', { tokenLength: token.length })

    return request.clone({
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  /**
   * Check if token provider is async
   */
  get isAsync(): boolean {
    return typeof this._token === 'function'
  }
}

/**
 * API Key Authentication
 *
 * Adds API key in a custom header.
 *
 * @example
 * ```typescript
 * const auth = new APIKeyAuth('your-api-key', 'X-API-Key')
 * ```
 */
export class APIKeyAuth extends Auth {
  private readonly _apiKey: string
  private readonly _headerName: string

  constructor(apiKey: string, headerName: string = 'X-API-Key') {
    super()
    this._apiKey = apiKey
    this._headerName = headerName

    log.debug('APIKeyAuth created', { headerName })
  }

  apply(request: Request): Request {
    this.logApply('APIKey', { header: this._headerName })

    return request.clone({
      headers: {
        [this._headerName]: this._apiKey
      }
    })
  }
}
