import type { PathRewriteOptions } from './types.js';

interface CacheEntry {
  html: string;
  timestamp: number;
}

const htmlCache = new Map<string, CacheEntry>();

/**
 * Patterns for matching asset paths in HTML.
 * Handles: /assets/, ./assets/, assets/
 */
const ASSET_PATTERNS = [
  // src="/assets/..." or href="/assets/..."
  /(<(?:script|link|img|source|video|audio)[^>]*(?:src|href)=["'])\/assets\//gi,
  // src="./assets/..." or href="./assets/..."
  /(<(?:script|link|img|source|video|audio)[^>]*(?:src|href)=["'])\.\/assets\//gi,
  // src="assets/..." or href="assets/..."
  /(<(?:script|link|img|source|video|audio)[^>]*(?:src|href)=["'])assets\//gi,
];

/**
 * CSS url() patterns
 */
const CSS_URL_PATTERNS = [
  /url\(["']?\/assets\//gi,
  /url\(["']?\.\/assets\//gi,
  /url\(["']?assets\//gi,
];

/**
 * Rewrite asset paths in HTML content to include the app-specific route prefix.
 *
 * @param html - The HTML content to rewrite
 * @param options - Rewrite configuration options
 * @returns Rewritten HTML content
 *
 * @example
 * ```typescript
 * const rewritten = rewriteHtmlPaths(html, {
 *   appName: 'dashboard',
 *   urlPrefix: '/assets'
 * });
 * // src="/assets/main.js" → src="/dashboard/assets/main.js"
 * ```
 */
export function rewriteHtmlPaths(html: string, options: PathRewriteOptions): string {
  const { appName, urlPrefix, basePath = '/apps/' } = options;
  const base = basePath.startsWith('/') ? basePath : `/${basePath}`;
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const prefix = `${normalizedBase}${appName}${urlPrefix.startsWith('/') ? urlPrefix : `/${urlPrefix}`}`;

  let result = html;

  // Rewrite HTML attributes (src, href)
  for (const pattern of ASSET_PATTERNS) {
    result = result.replace(pattern, `$1${prefix}/`);
  }

  // Rewrite CSS url() references
  for (const pattern of CSS_URL_PATTERNS) {
    result = result.replace(pattern, `url("${prefix}/`);
  }

  return result;
}

/**
 * Rewrite HTML paths with caching support.
 *
 * @param html - The HTML content to rewrite
 * @param cacheKey - Unique key for caching (typically file path)
 * @param options - Rewrite configuration options
 * @returns Rewritten HTML content
 */
export function rewriteHtmlPathsCached(
  html: string,
  cacheKey: string,
  options: PathRewriteOptions
): string {
  const { enableCache = true, cacheTtl = 60000 } = options;

  if (!enableCache) {
    return rewriteHtmlPaths(html, options);
  }

  const fullKey = `${cacheKey}:${options.basePath ?? '/apps/'}:${options.appName}:${options.urlPrefix}`;
  const cached = htmlCache.get(fullKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < cacheTtl) {
    return cached.html;
  }

  const rewritten = rewriteHtmlPaths(html, options);
  htmlCache.set(fullKey, { html: rewritten, timestamp: now });

  return rewritten;
}

/**
 * Clear the HTML cache for a specific key or all entries.
 *
 * @param cacheKey - Optional specific key to clear; clears all if not provided
 */
export function clearCache(cacheKey?: string): void {
  if (cacheKey) {
    // Clear all entries that start with the cache key
    for (const key of htmlCache.keys()) {
      if (key.startsWith(cacheKey)) {
        htmlCache.delete(key);
      }
    }
  } else {
    htmlCache.clear();
  }
}

/**
 * Get the current cache size.
 */
export function getCacheSize(): number {
  return htmlCache.size;
}
