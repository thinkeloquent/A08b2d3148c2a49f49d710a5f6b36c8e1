/**
 * Option 5: Shared Context Computed Function (REQUEST Scope) - Token 001
 *
 * This class-based computed function uses the shared context (ctx.shared)
 * to coordinate with other REQUEST-scoped functions during the same resolution pass.
 *
 * The shared context ensures that multiple functions use the same timestamp,
 * even though they are defined in separate files.
 *
 * Usage in YAML:
 *     headers:
 *       X-Request-Token: "{{fn:request_token_001}}"
 *       X-Request-Token2: "{{fn:request_token_005}}"
 *
 * Both tokens will have the same timestamp because they use:
 *     ctx.shared.getOrSet('request_timestamp', factory)
 */
import crypto from 'crypto';

// Module-level exports for auto-loading
export const NAME = 'request_token_001';
export const SCOPE = 'REQUEST';

/**
 * Class-based token generator using shared context.
 *
 * This pattern allows multiple computed functions to share state
 * during a single request resolution pass.
 */
class RequestTokenGenerator {
    // Shared context key for the request timestamp
    static TIMESTAMP_KEY = 'request_tokens_timestamp';

    /**
     * Initialize the generator for a specific case.
     * @param {string} caseId - Identifier for this token case (e.g., "001", "005")
     */
    constructor(caseId) {
        this.caseId = caseId;
    }

    /**
     * Get or create the shared timestamp from context.
     *
     * Uses the unified .get(key, factory) API - if key doesn't exist,
     * the factory is called and result is cached.
     *
     * @param {Object} ctx - Context dictionary containing 'shared' SharedContext
     * @returns {number} Shared timestamp (same across all functions in this request)
     */
    _getSharedTimestamp(ctx) {
        const shared = ctx?.shared;
        if (!shared) {
            // Fallback if shared context not available
            return Math.floor(Date.now() / 1000);
        }

        // Simplified API: .get(key, factory) - callable default is invoked and cached
        return shared.get(
            RequestTokenGenerator.TIMESTAMP_KEY,
            () => Math.floor(Date.now() / 1000)
        );
    }

    /**
     * Generate a deterministic token.
     * @param {string} base - Base string for hashing
     * @returns {string}
     */
    _generateToken(base) {
        const content = `${base}:${this.caseId}`;
        const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
        return `req_tok_${this.caseId}_${hash}`;
    }

    /**
     * Generate the token using shared timestamp.
     *
     * @param {Object} ctx - Context with env, config, app, state, shared, request
     * @returns {string} Generated token string
     */
    generate(ctx) {
        const timestamp = this._getSharedTimestamp(ctx);

        // Get app and request info
        const appName = ctx?.app?.name || 'mta-server';
        const appVersion = ctx?.app?.version || '0.0.0';

        // Include request ID if available for uniqueness
        const request = ctx?.request || {};
        const headers = request?.headers || {};
        const requestId = headers['x-request-id'] || 'no-req-id';

        // Generate token with shared timestamp
        const base = `${appName}:${appVersion}:${timestamp}:${requestId}`;
        return this._generateToken(base);
    }
}

// Create instance for case 001
const generator = new RequestTokenGenerator('001');

/**
 * Compute function entry point for auto-loading.
 *
 * Uses shared context to coordinate with request_token_005
 * for consistent timestamps.
 *
 * @param {Object} ctx - Context dictionary with env, config, app, state, shared, request
 * @returns {string} Generated token string for case 001
 */
export function register(ctx) {
    return generator.generate(ctx);
}
