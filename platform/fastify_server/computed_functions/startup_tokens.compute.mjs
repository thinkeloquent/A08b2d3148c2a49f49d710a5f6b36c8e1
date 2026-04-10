/**
 * Option 4: Composite Computed Function for STARTUP Scope
 *
 * This class-based computed function returns an object with multiple properties,
 * allowing access via dot notation in templates:
 *     {{fn:startup_tokens.case_001}}
 *     {{fn:startup_tokens.case_005}}
 *     {{fn:startup_tokens.timestamp}}
 *
 * The timestamp is computed once at startup and shared across all properties,
 * ensuring consistency without explicit state management.
 *
 * Usage in YAML:
 *     headers:
 *       X-Startup-Token: "{{fn:startup_tokens.case_001}}"
 *       X-Startup-Token2: "{{fn:startup_tokens.case_005}}"
 *       X-Server-Start: "{{fn:startup_tokens.timestamp_iso}}"
 */
import crypto from 'crypto';

// Module-level exports for auto-loading
export const NAME = 'startup_tokens';
export const SCOPE = 'STARTUP';

/**
 * Factory class for generating startup tokens.
 *
 * This demonstrates the class-based pattern for computed functions.
 * The factory is instantiated once and called during STARTUP resolution.
 */
class StartupTokensFactory {
    constructor() {
        /** @type {number|null} */
        this._timestamp = null;
    }

    /**
     * Get or create the shared timestamp.
     * @returns {number}
     */
    _getTimestamp() {
        if (this._timestamp === null) {
            this._timestamp = Math.floor(Date.now() / 1000);
        }
        return this._timestamp;
    }

    /**
     * Generate a deterministic token for a specific case.
     * @param {string} base - Base string including timestamp
     * @param {string} caseId - Case identifier
     * @returns {string}
     */
    _generateToken(base, caseId) {
        const content = `${base}:${caseId}`;
        const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
        return `startup_tok_${caseId}_${hash}`;
    }

    /**
     * Create the startup tokens composite object.
     *
     * @param {Object} ctx - Context containing env, config, app, state, shared
     * @returns {Object} Object with all token values
     */
    create(ctx) {
        const timestamp = this._getTimestamp();

        // Get app info from context
        const appName = ctx?.app?.name || 'mta-server';
        const appVersion = ctx?.app?.version || '0.0.0';

        // Generate tokens with shared timestamp
        const base = `${appName}:${appVersion}:${timestamp}`;

        return {
            case_001: this._generateToken(base, '001'),
            case_005: this._generateToken(base, '005'),
            timestamp: timestamp,
            timestamp_iso: new Date(timestamp * 1000).toISOString(),
            app_info: {
                name: appName,
                version: appVersion
            }
        };
    }
}

// Create singleton factory instance
const factory = new StartupTokensFactory();

/**
 * Compute function entry point for auto-loading.
 *
 * The factory pattern ensures consistent timestamp across all properties.
 *
 * @param {Object} ctx - Context dictionary with env, config, app, state, shared
 * @returns {Object} Object containing token values accessible via {{fn:startup_tokens.property}}
 */
export function register(ctx) {
    return factory.create(ctx);
}
