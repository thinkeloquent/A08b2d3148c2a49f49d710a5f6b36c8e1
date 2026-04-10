/**
 * Response model for fetch-undici
 *
 * Represents an HTTP response with status, headers, and body access methods.
 */

import type { Readable } from 'stream'
import { logger } from '../logger.js'
import { Headers, createHeaders, type HeadersInit } from './headers.js'
import type { Request } from './request.js'
import { HTTPStatusError } from '../exceptions/status.js'
import { StreamConsumedError } from '../exceptions/stream.js'

const log = logger.create('fetch-undici', import.meta.url)

/** Response initialization options */
export interface ResponseInit {
  statusCode: number
  headers?: HeadersInit
  body?: Readable | Buffer | string | null
  request?: Request
  history?: Response[]
}

/**
 * HTTP Response class
 *
 * Provides access to response status, headers, and body with lazy content loading.
 *
 * @example
 * ```typescript
 * const response = await client.get('/users')
 *
 * console.log(response.statusCode) // 200
 * console.log(response.ok) // true
 *
 * const data = await response.json()
 * response.raiseForStatus() // throws if 4xx/5xx
 * ```
 */
export class Response {
  /** HTTP status code */
  readonly statusCode: number

  /** Response headers */
  readonly headers: Headers

  /** The request that generated this response */
  readonly request?: Request

  /** Redirect history (previous responses) */
  readonly history: Response[]

  /** Response body stream */
  private readonly _body: Readable | Buffer | string | null

  /** Cached body content */
  private _cachedBuffer: Buffer | null = null
  private _cachedText: string | null = null
  private _cachedJson: unknown = undefined

  /** Whether body has been consumed */
  private _consumed = false

  /** Response creation timestamp */
  readonly timestamp: number

  constructor(init: ResponseInit) {
    this.statusCode = init.statusCode
    this.headers = createHeaders(init.headers)
    this._body = init.body ?? null
    this.request = init.request
    this.history = init.history ?? []
    this.timestamp = Date.now()

    log.trace('Response created', {
      statusCode: this.statusCode,
      headerCount: this.headers.size,
      hasBody: this._body !== null
    })
  }

  // ============================================================================
  // Status Properties
  // ============================================================================

  /** True if status is 2xx (success) */
  get ok(): boolean {
    return this.statusCode >= 200 && this.statusCode < 300
  }

  /** Alias for ok */
  get isSuccess(): boolean {
    return this.ok
  }

  /** True if status is 3xx (redirect) */
  get isRedirect(): boolean {
    return [301, 302, 303, 307, 308].includes(this.statusCode)
  }

  /** True if status is 4xx (client error) */
  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500
  }

  /** True if status is 5xx (server error) */
  get isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600
  }

  /** True if status is 4xx or 5xx */
  get isError(): boolean {
    return this.statusCode >= 400
  }

  /** True if status is 1xx (informational) */
  get isInformational(): boolean {
    return this.statusCode >= 100 && this.statusCode < 200
  }

  // ============================================================================
  // Body Methods
  // ============================================================================

  /**
   * Read body as Buffer
   */
  async arrayBuffer(): Promise<ArrayBuffer> {
    const buffer = await this._readBuffer()
    // Create a new ArrayBuffer copy to ensure we return a proper ArrayBuffer
    const arrayBuffer = new ArrayBuffer(buffer.byteLength)
    new Uint8Array(arrayBuffer).set(buffer)
    return arrayBuffer
  }

  /**
   * Read body as Uint8Array
   */
  async bytes(): Promise<Uint8Array> {
    const buffer = await this._readBuffer()
    return new Uint8Array(buffer)
  }

  /**
   * Read body as text
   */
  async text(): Promise<string> {
    if (this._cachedText !== null) {
      return this._cachedText
    }

    const buffer = await this._readBuffer()
    const encoding = this._getEncoding()
    this._cachedText = buffer.toString(encoding as BufferEncoding)

    log.trace('Body read as text', { length: this._cachedText.length, encoding })

    return this._cachedText
  }

  /**
   * Read body as JSON
   */
  async json<T = unknown>(): Promise<T> {
    if (this._cachedJson !== undefined) {
      return this._cachedJson as T
    }

    const text = await this.text()
    try {
      this._cachedJson = JSON.parse(text)
      log.trace('Body parsed as JSON')
      return this._cachedJson as T
    } catch (err) {
      log.error('Failed to parse JSON', { error: (err as Error).message })
      throw err
    }
  }

  /**
   * Read body as Blob (Node.js 18+)
   */
  async blob(): Promise<Blob> {
    const buffer = await this._readBuffer()
    const contentType = this.headers.get('content-type') || 'application/octet-stream'
    return new Blob([buffer], { type: contentType })
  }

  /**
   * Get raw body stream
   */
  get body(): Readable | null {
    if (this._consumed) {
      return null
    }
    if (this._body instanceof Buffer || typeof this._body === 'string') {
      return null
    }
    return this._body as Readable | null
  }

  /**
   * Check if body has been consumed
   */
  get bodyUsed(): boolean {
    return this._consumed
  }

  // ============================================================================
  // Streaming Methods
  // ============================================================================

  /**
   * Iterate over body as byte chunks
   */
  async *aiterBytes(chunkSize?: number): AsyncGenerator<Buffer> {
    this._ensureNotConsumed()
    this._consumed = true

    if (this._body === null) {
      return
    }

    if (this._body instanceof Buffer) {
      if (chunkSize) {
        for (let i = 0; i < this._body.length; i += chunkSize) {
          yield this._body.subarray(i, i + chunkSize)
        }
      } else {
        yield this._body
      }
      return
    }

    if (typeof this._body === 'string') {
      const buffer = Buffer.from(this._body)
      if (chunkSize) {
        for (let i = 0; i < buffer.length; i += chunkSize) {
          yield buffer.subarray(i, i + chunkSize)
        }
      } else {
        yield buffer
      }
      return
    }

    // Stream
    for await (const chunk of this._body) {
      yield Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    }
  }

  /**
   * Iterate over body as text chunks
   */
  async *aiterText(encoding?: BufferEncoding): AsyncGenerator<string> {
    const enc = encoding ?? (this._getEncoding() as BufferEncoding)
    const decoder = new TextDecoder(enc)

    for await (const chunk of this.aiterBytes()) {
      yield decoder.decode(chunk, { stream: true })
    }

    // Flush remaining
    const final = decoder.decode()
    if (final) {
      yield final
    }
  }

  /**
   * Iterate over body as lines
   */
  async *aiterLines(): AsyncGenerator<string> {
    let buffer = ''

    for await (const chunk of this.aiterText()) {
      buffer += chunk
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        yield line
      }
    }

    // Yield remaining content
    if (buffer) {
      yield buffer
    }
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  /**
   * Raise HTTPStatusError if response is 4xx or 5xx
   *
   * @throws HTTPStatusError if status >= 400
   */
  raiseForStatus(): void {
    if (this.isError) {
      log.debug('Raising for status', { statusCode: this.statusCode })
      throw new HTTPStatusError(this, this.request)
    }
  }

  /**
   * Alias for raiseForStatus (snake_case)
   */
  raise_for_status(): void {
    this.raiseForStatus()
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Read body into buffer
   */
  private async _readBuffer(): Promise<Buffer> {
    if (this._cachedBuffer !== null) {
      return this._cachedBuffer
    }

    this._ensureNotConsumed()
    this._consumed = true

    if (this._body === null) {
      this._cachedBuffer = Buffer.alloc(0)
      return this._cachedBuffer
    }

    if (this._body instanceof Buffer) {
      this._cachedBuffer = this._body
      return this._cachedBuffer
    }

    if (typeof this._body === 'string') {
      this._cachedBuffer = Buffer.from(this._body)
      return this._cachedBuffer
    }

    // Read stream
    const chunks: Buffer[] = []
    for await (const chunk of this._body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    this._cachedBuffer = Buffer.concat(chunks)

    log.trace('Body read into buffer', { size: this._cachedBuffer.length })

    return this._cachedBuffer
  }

  /**
   * Ensure body hasn't been consumed
   */
  private _ensureNotConsumed(): void {
    if (this._consumed && this._cachedBuffer === null) {
      throw new StreamConsumedError(this.request)
    }
  }

  /**
   * Get encoding from content-type header
   */
  private _getEncoding(): string {
    const contentType = this.headers.get('content-type')
    if (contentType) {
      const match = /charset=([^;]+)/i.exec(contentType)
      if (match?.[1]) {
        return match[1].trim().replace(/["']/g, '')
      }
    }
    return 'utf-8'
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get content type from headers
   */
  get contentType(): string | null {
    return this.headers.get('content-type')
  }

  /**
   * Get content length from headers
   */
  get contentLength(): number | null {
    const length = this.headers.get('content-length')
    return length ? parseInt(length, 10) : null
  }

  /**
   * Get URL from request
   */
  get url(): string | undefined {
    return this.request?.urlString
  }

  /**
   * String representation
   */
  toString(): string {
    return `Response(${this.statusCode})`
  }
}
