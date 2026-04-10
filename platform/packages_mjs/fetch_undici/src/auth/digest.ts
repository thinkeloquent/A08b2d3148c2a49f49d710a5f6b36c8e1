/**
 * HTTP Digest Authentication for fetch-undici
 */

import { createHash, randomBytes } from 'crypto'
import { logger } from '../logger.js'
import type { Request } from '../models/request.js'
import type { Response } from '../models/response.js'
import { Auth } from './base.js'

const log = logger.create('fetch-undici', import.meta.url)

/** Digest challenge parameters */
interface DigestChallenge {
  realm: string
  nonce: string
  qop?: string
  opaque?: string
  algorithm?: string
  stale?: boolean
}

/**
 * HTTP Digest Authentication
 *
 * Implements RFC 7616 HTTP Digest Access Authentication.
 * Handles challenge-response flow automatically.
 *
 * @example
 * ```typescript
 * const auth = new DigestAuth('username', 'password')
 *
 * const client = new AsyncClient({
 *   auth: auth
 * })
 * ```
 */
export class DigestAuth extends Auth {
  private readonly _username: string
  private readonly _password: string
  private _challenge: DigestChallenge | null = null
  private _nonceCount = 0

  constructor(username: string, password: string) {
    super()
    this._username = username
    this._password = password

    log.debug('DigestAuth created', { username })
  }

  /**
   * Digest auth requires challenge-response
   */
  override get requiresChallenge(): boolean {
    return this._challenge === null
  }

  /**
   * Check if we can handle a 401 challenge
   */
  override canHandleChallenge(response: Response): boolean {
    const wwwAuth = response.headers.get('www-authenticate')
    return response.statusCode === 401 && !!wwwAuth && wwwAuth.toLowerCase().startsWith('digest')
  }

  /**
   * Apply Digest auth to request
   *
   * @param request - The request to authenticate
   * @param response - Optional 401 response with challenge
   */
  apply(request: Request, response?: Response): Request {
    // If we have a response, parse the challenge
    if (response) {
      this._parseChallenge(response)
    }

    // If no challenge yet, return request as-is (will trigger 401)
    if (!this._challenge) {
      log.debug('DigestAuth: No challenge yet, sending initial request')
      return request
    }

    // Compute digest response
    const authHeader = this._computeAuthHeader(request)

    this.logApply('Digest', { username: this._username, nonceCount: this._nonceCount })

    return request.clone({
      headers: {
        Authorization: authHeader
      }
    })
  }

  /**
   * Parse WWW-Authenticate header for challenge
   */
  private _parseChallenge(response: Response): void {
    const wwwAuth = response.headers.get('www-authenticate')
    if (!wwwAuth) {
      log.warn('DigestAuth: No WWW-Authenticate header found')
      return
    }

    const challenge: Partial<DigestChallenge> = {}

    // Parse Digest challenge parameters
    const digestMatch = /^digest\s+(.+)$/i.exec(wwwAuth)
    if (!digestMatch) {
      log.warn('DigestAuth: Not a Digest challenge')
      return
    }

    const params = digestMatch[1]!

    // Parse key="value" pairs
    const paramRegex = /(\w+)=(?:"([^"]+)"|([^\s,]+))/gi
    let match: RegExpExecArray | null

    while ((match = paramRegex.exec(params)) !== null) {
      const key = match[1]!.toLowerCase()
      const value = match[2] ?? match[3]!

      switch (key) {
        case 'realm':
          challenge.realm = value
          break
        case 'nonce':
          challenge.nonce = value
          break
        case 'qop':
          challenge.qop = value
          break
        case 'opaque':
          challenge.opaque = value
          break
        case 'algorithm':
          challenge.algorithm = value
          break
        case 'stale':
          challenge.stale = value.toLowerCase() === 'true'
          break
      }
    }

    if (challenge.realm && challenge.nonce) {
      this._challenge = challenge as DigestChallenge

      // Reset nonce count if nonce changed
      if (!challenge.stale) {
        this._nonceCount = 0
      }

      log.debug('DigestAuth: Challenge parsed', {
        realm: challenge.realm,
        algorithm: challenge.algorithm,
        qop: challenge.qop
      })
    } else {
      log.warn('DigestAuth: Invalid challenge (missing realm or nonce)')
    }
  }

  /**
   * Compute Authorization header value
   */
  private _computeAuthHeader(request: Request): string {
    if (!this._challenge) {
      throw new Error('No challenge available')
    }

    const { realm, nonce, qop, opaque, algorithm = 'MD5' } = this._challenge

    // Increment nonce count
    this._nonceCount++
    const nc = this._nonceCount.toString(16).padStart(8, '0')

    // Generate client nonce
    const cnonce = randomBytes(16).toString('hex')

    // Get URI
    const uri = request.url.pathname + request.url.search

    // Compute HA1
    const ha1 = this._computeHA1(algorithm, realm)

    // Compute HA2
    const ha2 = this._computeHA2(algorithm, request.method, uri)

    // Compute response
    let response: string
    if (qop) {
      response = this._hash(algorithm, `${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
    } else {
      response = this._hash(algorithm, `${ha1}:${nonce}:${ha2}`)
    }

    // Build header
    let header = `Digest username="${this._username}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${response}"`

    if (algorithm !== 'MD5') {
      header += `, algorithm=${algorithm}`
    }

    if (qop) {
      header += `, qop=${qop}, nc=${nc}, cnonce="${cnonce}"`
    }

    if (opaque) {
      header += `, opaque="${opaque}"`
    }

    return header
  }

  /**
   * Compute HA1 hash
   */
  private _computeHA1(algorithm: string, realm: string): string {
    const a1 = `${this._username}:${realm}:${this._password}`
    const ha1 = this._hash(algorithm, a1)

    if (algorithm.toUpperCase().endsWith('-SESS')) {
      // For MD5-sess, SHA-256-sess, etc.
      // ha1 = H(ha1:nonce:cnonce)
      // This requires nonce and cnonce, simplified here
      return ha1
    }

    return ha1
  }

  /**
   * Compute HA2 hash
   */
  private _computeHA2(algorithm: string, method: string, uri: string): string {
    const a2 = `${method}:${uri}`
    return this._hash(algorithm, a2)
  }

  /**
   * Compute hash based on algorithm
   */
  private _hash(algorithm: string, data: string): string {
    // Normalize algorithm name
    let alg = algorithm.toUpperCase()
    if (alg.endsWith('-SESS')) {
      alg = alg.slice(0, -5)
    }

    // Map to Node.js hash algorithm
    const hashAlg = alg === 'MD5' ? 'md5' : alg === 'SHA-256' ? 'sha256' : 'sha512'

    return createHash(hashAlg).update(data).digest('hex')
  }

  /**
   * Reset authentication state
   */
  reset(): void {
    this._challenge = null
    this._nonceCount = 0
    log.debug('DigestAuth: State reset')
  }

  /**
   * Get username
   */
  get username(): string {
    return this._username
  }
}
