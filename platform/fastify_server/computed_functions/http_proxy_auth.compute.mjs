/**
 * Compute function for HTTP proxy authentication.
 *
 * Resolves proxy auth credentials for providers that route through a proxy.
 * Uses GLOBAL scope: resolved at STARTUP (from env) and re-resolved per
 * REQUEST (from headers, falling back to env).
 *
 * Usage in YAML:
 *     overwrite_from_context:
 *       proxy_url: "{{fn:http_proxy_auth}}"
 */

// Module-level exports for auto-loading
export const NAME = 'http_proxy_auth';
export const SCOPE = 'GLOBAL';

/**
 * Compute function entry point for auto-loading.
 *
 * At STARTUP: ctx.request is null, resolves from env var.
 * At REQUEST: checks x-proxy-auth header first, falls back to env var.
 *
 * @param {Object} ctx - Context with env, config, request, state, shared
 * @returns {string} Proxy auth token string
 */
export function register(ctx) {
    // Try request header first (only available during REQUEST scope)
    const token = ctx?.request?.headers?.['x-proxy-auth'];
    if (token) {
        return token;
    }

    // Fall back to env var (always available)
    return ctx?.env?.HTTP_PROXY_AUTH || process.env.HTTP_PROXY_AUTH || '';
}
