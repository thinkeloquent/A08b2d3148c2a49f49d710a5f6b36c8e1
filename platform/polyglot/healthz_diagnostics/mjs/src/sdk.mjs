import { HealthCheckExecutor } from './executor.mjs';
import { ConfigSanitizer } from './sanitizer.mjs';
import { TimestampFormatter } from './timestamp.mjs';

/**
 * Public SDK for healthz diagnostics.
 * Provides programmatic access for CLI tools, Agents, and Dev tools.
 */
export class HealthzDiagnosticsSDK {
    #executor;
    #sanitizer;
    #timestamp;

    constructor(executor) {
        this.#executor = executor;
        this.#sanitizer = new ConfigSanitizer();
        this.#timestamp = new TimestampFormatter();
    }

    /**
     * Factory method to create SDK instance.
     * @param {Function} httpClientFactory 
     * @returns {HealthzDiagnosticsSDK}
     */
    static create(httpClientFactory) {
        const executor = new HealthCheckExecutor(httpClientFactory);
        return new HealthzDiagnosticsSDK(executor);
    }

    /**
     * Execute health check for a provider.
     * @param {string} providerName 
     * @param {object} providerConfig 
     * @returns {Promise<import('../types.d.ts').HealthCheckResult>}
     */
    async checkHealth(providerName, providerConfig) {
        return await this.#executor.execute(providerName, providerConfig);
    }

    /**
     * Sanitize configuration object.
     * @param {object} config 
     * @returns {object}
     */
    sanitizeConfig(config) {
        return this.#sanitizer.sanitize(config);
    }

    /**
     * Check environment variable presence.
     * @param {string[]} varNames 
     * @returns {Record<string, boolean>}
     */
    checkEnvVars(varNames) {
        return this.#sanitizer.checkEnvVars(varNames);
    }

    /**
     * Get current ISO8601 timestamp.
     * @returns {string}
     */
    formatTimestamp() {
        return this.#timestamp.format();
    }
}
