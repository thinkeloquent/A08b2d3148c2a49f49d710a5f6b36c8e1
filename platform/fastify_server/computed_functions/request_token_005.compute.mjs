/**
 * Option 5: Shared Context Computed Function (REQUEST Scope) - Token 005
 *
 * This class-based computed function uses the shared context (ctx.shared)
 * to coordinate with request_token_001 during the same resolution pass.
 *
 * The shared context ensures that both functions use the same timestamp,
 * regardless of which function is called first.
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
export const NAME = 'request_token_005';
export const SCOPE = 'REQUEST';

/**
 * Class-based token generator using shared context.
 *
 * This is the same class pattern as request_token_001.compute.mjs,
 * demonstrating that separate functions can coordinate via shared context.
 */
class RequestTokenGenerator {
    // Must use the SAME key as request_token_001 to share state
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
     * Uses the SAME key as request_token_001, so whichever function
     * runs first creates the timestamp, and the other reuses it.
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

// Create instance for case 005
const generator = new RequestTokenGenerator('005');

/**
 * Compute function entry point for auto-loading.
 *
 * Uses shared context to coordinate with request_token_001
 * for consistent timestamps.
 *
 * @param {Object} ctx - Context dictionary with env, config, app, state, shared, request
 * @returns {string} Generated token string for case 005
 */
export function register(ctx) {
    return generator.generate(ctx);
}
