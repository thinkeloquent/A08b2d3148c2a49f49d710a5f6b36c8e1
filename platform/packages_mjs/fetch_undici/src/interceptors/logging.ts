/**
 * Logging interceptor for fetch-undici
 */

import type { Dispatcher } from 'undici'
import { logger, type Logger } from '../logger.js'

const defaultLog = logger.create('fetch-undici', import.meta.url)

/** Logging interceptor options */
export interface LoggingInterceptorOptions {
  /** Logger instance */
  logger?: Logger
  /** Log request body */
  logBody?: boolean
  /** Log headers */
  logHeaders?: boolean
  /** Headers to redact */
  redactHeaders?: string[]
}

/**
 * Create a logging interceptor
 *
 * Logs request and response information.
 */
export function createLoggingInterceptor(
  options?: LoggingInterceptorOptions
): Dispatcher.DispatcherComposeInterceptor {
  const log = options?.logger ?? defaultLog
  const logHeaders = options?.logHeaders ?? false
  const redactHeaders = options?.redactHeaders ?? ['authorization', 'cookie', 'x-api-key']

  return (dispatch) => {
    return (opts, handler) => {
      const startTime = Date.now()
      const method = opts.method ?? 'GET'
      const path = opts.path ?? '/'

      log.debug('Request starting', {
        method,
        path,
        ...(logHeaders && opts.headers ? { headers: normalizeRequestHeaders(opts.headers, redactHeaders) } : {})
      })

      return dispatch(opts, {
        ...handler,
        onHeaders(statusCode, headers, resume, statusText): boolean {
          const duration = Date.now() - startTime

          log.debug('Response received', {
            method,
            path,
            statusCode,
            duration,
            ...(logHeaders ? { headers: normalizeResponseHeaders(headers, redactHeaders) } : {})
          })

          const result = handler.onHeaders?.(statusCode, headers, resume, statusText)
          return result ?? true
        },
        onError(err): void {
          const duration = Date.now() - startTime

          log.error('Request failed', {
            method,
            path,
            error: err.message,
            duration
          })

          handler.onError?.(err)
        }
      })
    }
  }
}

/**
 * Normalize request headers for logging
 */
function normalizeRequestHeaders(
  headers: Dispatcher.DispatchOptions['headers'],
  redactKeys: string[]
): Record<string, string> {
  const result: Record<string, string> = {}

  if (!headers) return result

  if (Array.isArray(headers)) {
    // Headers as flat array: [name1, value1, name2, value2, ...]
    for (let i = 0; i < headers.length; i += 2) {
      const name = String(headers[i] ?? '')
      const value = String(headers[i + 1] ?? '')
      result[name] = shouldRedact(name, redactKeys) ? '[REDACTED]' : value
    }
  } else if (typeof headers === 'object' && headers !== null) {
    // Handle Iterable or plain object
    if (Symbol.iterator in headers) {
      // Iterable<[string, string | string[] | undefined]>
      for (const entry of headers as Iterable<[string, string | string[] | undefined]>) {
        const [name, value] = entry
        const strValue = Array.isArray(value) ? value.join(', ') : String(value ?? '')
        result[name] = shouldRedact(name, redactKeys) ? '[REDACTED]' : strValue
      }
    } else {
      // IncomingHttpHeaders or Record
      for (const [name, value] of Object.entries(headers)) {
        const strValue = Array.isArray(value) ? value.join(', ') : String(value ?? '')
        result[name] = shouldRedact(name, redactKeys) ? '[REDACTED]' : strValue
      }
    }
  }

  return result
}

/**
 * Normalize response headers (Buffer[]) for logging
 */
function normalizeResponseHeaders(
  headers: Buffer[],
  redactKeys: string[]
): Record<string, string> {
  const result: Record<string, string> = {}

  // Response headers come as alternating Buffer pairs: [name, value, name, value, ...]
  for (let i = 0; i < headers.length; i += 2) {
    const nameBuffer = headers[i]
    const valueBuffer = headers[i + 1]
    if (nameBuffer && valueBuffer) {
      const name = nameBuffer.toString()
      const value = valueBuffer.toString()
      result[name] = shouldRedact(name, redactKeys) ? '[REDACTED]' : value
    }
  }

  return result
}

/**
 * Check if header should be redacted
 */
function shouldRedact(name: string, redactKeys: string[]): boolean {
  const lowerName = name.toLowerCase()
  return redactKeys.some((key) => lowerName.includes(key.toLowerCase()))
}
