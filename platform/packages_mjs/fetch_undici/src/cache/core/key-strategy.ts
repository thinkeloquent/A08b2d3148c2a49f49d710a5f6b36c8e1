/**
 * Cache Key Strategies
 *
 * Functions for generating cache keys from request data.
 */

import type { CacheKeyStrategy } from '../types.js'

/**
 * Default cache key strategy: METHOD:URL
 *
 * @example
 * ```typescript
 * defaultKeyStrategy('GET', 'https://api.example.com/users')
 * // Returns: 'GET:https://api.example.com/users'
 *
 * defaultKeyStrategy('GET', 'https://api.example.com/users?page=1')
 * // Returns: 'GET:https://api.example.com/users?page=1'
 * ```
 */
export const defaultKeyStrategy: CacheKeyStrategy = (method: string, url: string): string => {
  return `${method.toUpperCase()}:${url}`
}

/**
 * Get a value from an object using dot notation path
 *
 * @example
 * ```typescript
 * const obj = { headers: { Authorization: 'Bearer ****' } }
 * getByPath(obj, 'headers.Authorization') // 'Bearer ****'
 * ```
 */
function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

/**
 * Create a cache key strategy using dot notation to access request properties
 *
 * @example
 * ```typescript
 * const keyStrategy = createDotNotationKeyStrategy([
 *   'headers.Authorization',
 *   'headers.Accept-Language',
 *   'body.userId',
 *   'params.page'
 * ])
 *
 * // With request:
 * // { method: 'GET', url: '...', headers: { Authorization: 'Bearer xyz' }, params: { page: 1 } }
 * //
 * // Returns: 'GET:https://api.example.com/users:headers.Authorization=Bearer xyz:params.page=1'
 * ```
 */
export function createDotNotationKeyStrategy(paths: string[]): CacheKeyStrategy {
  return (
    method: string,
    url: string,
    headers?: Record<string, string>,
    body?: unknown,
    params?: Record<string, unknown>
  ): string => {
    const request: Record<string, unknown> = {
      method,
      url,
      headers: headers ?? {},
      body: body ?? {},
      params: params ?? {}
    }

    const parts = [method.toUpperCase(), url]

    for (const path of paths) {
      const value = getByPath(request, path)
      if (value !== undefined && value !== null) {
        parts.push(`${path}=${String(value)}`)
      }
    }

    return parts.join(':')
  }
}

/**
 * Create a cache key strategy that hashes all request data
 *
 * Useful when cache keys would be very long.
 *
 * @example
 * ```typescript
 * import { createHash } from 'crypto'
 *
 * const keyStrategy = createHashedKeyStrategy((data) =>
 *   createHash('sha256').update(data).digest('hex').slice(0, 16)
 * )
 * ```
 */
export function createHashedKeyStrategy(hashFn: (input: string) => string): CacheKeyStrategy {
  return (
    method: string,
    url: string,
    headers?: Record<string, string>,
    body?: unknown,
    params?: Record<string, unknown>
  ): string => {
    const data = JSON.stringify({ method, url, headers, body, params })
    return hashFn(data)
  }
}

/**
 * Combine multiple key strategies
 *
 * @example
 * ```typescript
 * const keyStrategy = combineKeyStrategies(
 *   defaultKeyStrategy,
 *   createDotNotationKeyStrategy(['headers.Authorization'])
 * )
 * ```
 */
export function combineKeyStrategies(...strategies: CacheKeyStrategy[]): CacheKeyStrategy {
  return (
    method: string,
    url: string,
    headers?: Record<string, string>,
    body?: unknown,
    params?: Record<string, unknown>
  ): string => {
    const parts: string[] = []

    for (const strategy of strategies) {
      const key = strategy(method, url, headers, body, params)
      if (key && !parts.includes(key)) {
        parts.push(key)
      }
    }

    return parts.join(':')
  }
}
