import { create as createLogger } from './logger.mjs';

const logger = createLogger("healthz-diagnostics", import.meta.url);

/**
 * Sanitizes configuration by redacting secrets and checking environment variables.
 */
export class ConfigSanitizer {

    static SENSITIVE_KEYS = new Set([
        "endpoint_api_key",
        "api_key",
        "token",
        "password",
        "secret",
        "client_secret",
        "access_token"
    ]);

    /**
     * Deep copy config and redact sensitive fields with '***'.
     * @param {object} config 
     * @returns {object}
     */
    sanitize(config) {
        try {
            // structuredClone is standard in Node 17+
            const safeConfig = structuredClone(config);
            return this.#recursiveRedact(safeConfig);
        } catch (e) {
            logger.error(`Failed to deep copy config: ${e}`);
            // Fallback to simpler copy if structuredClone fails (e.g. non-cloneable objects, though config usually JSON-serializable)
            return this.#recursiveRedact({ ...config });
        }
    }

    #recursiveRedact(obj) {
        if (obj && typeof obj === 'object') {
            if (Array.isArray(obj)) {
                return obj.map(item => this.#recursiveRedact(item));
            }
            for (const key of Object.keys(obj)) {
                if (this.#isSensitive(key)) {
                    obj[key] = "***";
                } else {
                    obj[key] = this.#recursiveRedact(obj[key]);
                }
            }
        }
        return obj;
    }

    #isSensitive(key) {
        const lowerKey = key.toLowerCase();
        for (const sensitive of ConfigSanitizer.SENSITIVE_KEYS) {
            if (lowerKey.includes(sensitive)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check presence of environment variables.
     * Returns map of {VAR_NAME: boolean}
     * @param {string[]} varNames 
     * @returns {Record<string, boolean>}
     */
    checkEnvVars(varNames) {
        const result = {};
        for (const name of varNames) {
            result[name] = process.env[name] !== undefined;
        }
        return result;
    }
}
