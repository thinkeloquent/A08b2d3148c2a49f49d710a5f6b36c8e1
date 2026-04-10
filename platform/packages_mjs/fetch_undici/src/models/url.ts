/**
 * URL utilities for fetch-undici
 *
 * Provides httpx-compatible URL handling with base URL joining.
 */

import { logger } from '../logger.js'

const log = logger.create('fetch-undici', import.meta.url)

/** Query parameter types */
export type QueryParamValue = string | number | boolean
export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>

/**
 * Join base URL with path
 *
 * @example
 * ```typescript
 * joinURL('https://api.example.com', '/users') // https://api.example.com/users
 * joinURL('https://api.example.com/v1/', '/users') // https://api.example.com/v1/users
 * joinURL('https://api.example.com/v1', '/users') // https://api.example.com/v1/users
 * ```
 */
export function joinURL(base: string | URL, path: string): URL {
  const baseStr = base instanceof URL ? base.toString() : base

  // If path is absolute URL, use it directly
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return new URL(path)
  }

  // Handle relative paths
  const baseURL = new URL(baseStr)

  // Normalize base path: ensure it ends with /
  let basePath = baseURL.pathname
  if (!basePath.endsWith('/')) {
    basePath += '/'
  }

  // Strip leading / from path to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  return new URL(basePath + cleanPath, baseURL.origin)
}

/**
 * Add query parameters to URL
 *
 * @example
 * ```typescript
 * addParams('https://api.example.com/users', { page: 1, limit: 10 })
 * // https://api.example.com/users?page=1&limit=10
 *
 * addParams('https://api.example.com/users?existing=value', { page: 1 })
 * // https://api.example.com/users?existing=value&page=1
 * ```
 */
export function addParams(url: string | URL, params?: QueryParams | null): URL {
  const result = new URL(url instanceof URL ? url.toString() : url)

  if (!params) {
    return result
  }

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      // Multiple values for same key
      for (const v of value) {
        result.searchParams.append(key, String(v))
      }
    } else if (value !== undefined && value !== null) {
      result.searchParams.append(key, String(value))
    }
  }

  log.trace('Added params to URL', {
    url: result.toString(),
    paramCount: Object.keys(params).length
  })

  return result
}

/**
 * Build full URL from base, path, and params
 */
export function buildURL(base?: string | URL | null, path?: string, params?: QueryParams): URL {
  let url: URL

  if (!base && !path) {
    throw new Error('Either base or path must be provided')
  }

  if (base && path) {
    url = joinURL(base, path)
  } else if (base) {
    url = new URL(base instanceof URL ? base.toString() : base)
  } else {
    url = new URL(path!)
  }

  if (params) {
    url = addParams(url, params)
  }

  log.trace('Built URL', { url: url.toString() })

  return url
}

/**
 * Parse URL into components
 */
export interface URLComponents {
  scheme: string
  host: string
  port: number | null
  path: string
  query: string
  fragment: string
  origin: string
}

/**
 * Parse URL into components
 */
export function parseURL(url: string | URL): URLComponents {
  const parsed = url instanceof URL ? url : new URL(url)

  return {
    scheme: parsed.protocol.replace(':', ''),
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port, 10) : null,
    path: parsed.pathname,
    query: parsed.search.replace('?', ''),
    fragment: parsed.hash.replace('#', ''),
    origin: parsed.origin
  }
}

/**
 * Check if URL matches a pattern
 *
 * @example
 * ```typescript
 * matchURLPattern('https://api.example.com/v1/users', 'https://api.example.com/v1/')
 * // true
 *
 * matchURLPattern('https://api.example.com/users', 'https://')
 * // true
 * ```
 */
export function matchURLPattern(url: string | URL, pattern: string): boolean {
  const urlStr = url instanceof URL ? url.toString() : url

  // Handle all:// pattern
  if (pattern === 'all://') {
    return true
  }

  // Normalize pattern
  const normalizedPattern = pattern.endsWith('/') ? pattern : pattern + '/'
  const normalizedUrl = urlStr.endsWith('/') ? urlStr : urlStr + '/'

  // Check if URL starts with pattern
  return normalizedUrl.startsWith(normalizedPattern) || urlStr.startsWith(pattern)
}

/**
 * Get origin from URL
 */
export function getOrigin(url: string | URL): string {
  const parsed = url instanceof URL ? url : new URL(url)
  return parsed.origin
}

/**
 * Check if URL is valid
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
