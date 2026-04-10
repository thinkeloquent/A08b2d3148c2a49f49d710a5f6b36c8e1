/**
 * Figma Hooks Middleware — Figma API SDK
 *
 * Response processing hooks for Figma API responses.
 */

/**
 * Handle 204 No Content responses.
 */
export function response204Hook(response) {
  if (response.statusCode === 204) {
    return {};
  }
  return response;
}

/**
 * Safely parse JSON, falling back to text wrapper.
 */
export function jsonFallbackHook(response) {
  if (typeof response === 'string') {
    try {
      return JSON.parse(response);
    } catch {
      return { data: response };
    }
  }
  return response;
}

/**
 * Extract Figma request ID from headers.
 */
export function requestIdHook(headers) {
  return headers['x-request-id'] || headers['x-figma-request-id'] || null;
}

/**
 * Parse rate limit info from response headers (on 429).
 */
export function rateLimitHook(headers) {
  if (!headers['retry-after']) return null;
  return {
    retryAfter: parseFloat(headers['retry-after']) || 60,
    planTier: headers['x-figma-plan-tier'] || null,
    rateLimitType: headers['x-figma-rate-limit-type'] || null,
    upgradeLink: headers['x-figma-upgrade-link'] || null,
  };
}
