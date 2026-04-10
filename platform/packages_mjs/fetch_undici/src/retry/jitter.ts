/**
 * Jitter Strategies for Retry Backoff
 *
 * Implements industry-standard jitter patterns to prevent
 * synchronized retry storms ("thundering herd").
 */

/**
 * Jitter strategy for retry backoff
 */
export enum JitterStrategy {
  /** No jitter: delay = base * (backoff ^ attempt) */
  NONE = 'none',
  /** Full jitter: delay = random(0, calculated_delay) */
  FULL = 'full',
  /** Equal jitter: delay = calculated_delay/2 + random(0, calculated_delay/2) */
  EQUAL = 'equal',
  /** Decorrelated jitter: delay = random(base, previous_delay * 3) */
  DECORRELATED = 'decorrelated'
}

/**
 * Calculate retry delay with jitter
 *
 * @param attempt - Current attempt number (0-indexed)
 * @param baseDelay - Base delay in milliseconds
 * @param backoff - Backoff multiplier
 * @param maxDelay - Maximum delay cap in milliseconds
 * @param jitter - Jitter strategy to apply
 * @param lastDelay - Last delay used (for decorrelated jitter)
 * @returns Delay in milliseconds with jitter applied
 */
export function calculateDelay(
  attempt: number,
  baseDelay: number,
  backoff: number,
  maxDelay: number,
  jitter: JitterStrategy,
  lastDelay?: number
): number {
  // Calculate exponential delay
  const calculated = baseDelay * Math.pow(backoff, attempt)

  // Apply cap
  const capped = Math.min(calculated, maxDelay)

  // Apply jitter strategy
  switch (jitter) {
    case JitterStrategy.NONE:
      return capped

    case JitterStrategy.FULL:
      // Full jitter: random between 0 and calculated delay
      return Math.random() * capped

    case JitterStrategy.EQUAL:
      // Equal jitter: half fixed + half random
      return capped / 2 + Math.random() * (capped / 2)

    case JitterStrategy.DECORRELATED:
      // Decorrelated jitter: based on previous delay
      const prevDelay = lastDelay ?? baseDelay
      const decorrelated = baseDelay + Math.random() * (prevDelay * 3 - baseDelay)
      return Math.min(decorrelated, maxDelay)

    default:
      return capped
  }
}

/**
 * Parse Retry-After header value
 *
 * Supports both formats:
 * - Seconds: "Retry-After: 120"
 * - HTTP-date: "Retry-After: Wed, 21 Oct 2024 07:28:00 GMT"
 *
 * @param value - Retry-After header value
 * @returns Delay in milliseconds, or null if not parseable
 */
export function parseRetryAfter(value: string | null | undefined): number | null {
  if (!value) return null

  // Try parsing as seconds
  const seconds = parseFloat(value)
  if (!isNaN(seconds) && isFinite(seconds)) {
    return Math.max(0, seconds * 1000) // Convert to ms
  }

  // Try parsing as HTTP-date
  try {
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      const delay = date.getTime() - Date.now()
      return Math.max(0, delay)
    }
  } catch {
    // Not a valid date
  }

  return null
}

// HTTP methods considered safe/idempotent for retry
export const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE'])
export const IDEMPOTENT_METHODS = new Set([
  'GET',
  'HEAD',
  'OPTIONS',
  'TRACE',
  'PUT',
  'DELETE'
])

/**
 * Check if a method should be retried based on idempotency
 *
 * @param method - HTTP method
 * @param headers - Request headers (check for Idempotency-Key)
 * @param allowedMethods - Explicit list of methods to retry (overrides default)
 * @returns true if method is safe to retry
 */
export function shouldRetryMethod(
  method: string,
  headers?: Record<string, string> | Headers | Map<string, string>,
  allowedMethods?: string[]
): boolean {
  const methodUpper = method.toUpperCase()

  // If explicit methods configured, use that
  if (allowedMethods) {
    return allowedMethods.map((m) => m.toUpperCase()).includes(methodUpper)
  }

  // Default: retry idempotent methods
  if (IDEMPOTENT_METHODS.has(methodUpper)) {
    return true
  }

  // POST/PATCH with Idempotency-Key header is safe to retry
  if (headers) {
    let idempotencyKey: string | undefined

    if (headers instanceof Map) {
      idempotencyKey =
        headers.get('Idempotency-Key') || headers.get('X-Idempotency-Key')
    } else if (typeof headers.get === 'function') {
      idempotencyKey =
        (headers as Headers).get('Idempotency-Key') ??
        (headers as Headers).get('X-Idempotency-Key') ??
        undefined
    } else {
      const h = headers as Record<string, string>
      idempotencyKey =
        h['Idempotency-Key'] ||
        h['idempotency-key'] ||
        h['X-Idempotency-Key'] ||
        h['x-idempotency-key']
    }

    if (idempotencyKey) {
      return true
    }
  }

  return false
}
