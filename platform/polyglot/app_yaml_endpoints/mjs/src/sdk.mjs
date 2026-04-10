/**
 * EndpointConfigSDK — class-based wrapper around the module-level config functions.
 *
 * Adds query methods (getByName, getByTag, getAll) and refresh capability
 * while delegating to the existing bare functions for core operations.
 *
 * @module app-yaml-endpoints/sdk
 */

import {
    loadConfig,
    loadConfigFromFile,
    getConfig,
    listEndpoints,
    getEndpoint,
    resolveIntent as _resolveIntent,
    getFetchConfig as _getFetchConfig,
} from './config.mjs';

/**
 * Class-based SDK wrapper for endpoint configuration.
 */
export class EndpointConfigSDK {
    /** @type {string|null} */
    #filePath;

    /**
     * @param {Object} [options]
     * @param {string} [options.filePath] - Path to endpoint YAML for refresh support
     */
    constructor(options = {}) {
        this.#filePath = options.filePath || null;
    }

    /**
     * Dot-path property getter on the raw config object.
     * @param {string} path - Dot-separated path (e.g. "endpoints.llm001.timeout")
     * @param {*} [defaultValue] - Value returned when path is not found
     * @returns {*}
     */
    properties(path, defaultValue) {
        const config = getConfig();
        const parts = path.split('.');
        let current = config;

        for (const part of parts) {
            if (current == null || typeof current !== 'object') {
                return defaultValue;
            }
            current = current[part];
        }

        return current !== undefined ? current : defaultValue;
    }

    /**
     * Get an endpoint by its key (service ID).
     * @param {string} key - Service ID (e.g. "llm001")
     * @returns {import('./models.mjs').EndpointConfig|null}
     */
    getByKey(key) {
        return getEndpoint(key);
    }

    /**
     * Resolve an intent to an endpoint.
     * @param {string} intent - Intent string (e.g. "storybook")
     * @returns {{ key: string, endpoint: import('./models.mjs').EndpointConfig|null }}
     */
    resolveIntent(intent) {
        const key = _resolveIntent(intent);
        const endpoint = getEndpoint(key);
        return { key, endpoint };
    }

    /**
     * Load configuration from a dictionary object.
     * @param {Object} configObj - Config object with "endpoints" key
     * @returns {Object}
     */
    loadConfig(configObj) {
        return loadConfig(configObj);
    }

    /**
     * Re-read YAML from stored filePath.
     * @returns {Object} Reloaded config
     * @throws {Error} If no filePath was provided
     */
    refreshConfig() {
        if (!this.#filePath) {
            throw new Error('Cannot refresh: no filePath configured. Use loadFromFile() first.');
        }
        return loadConfigFromFile(this.#filePath);
    }

    /**
     * Find an endpoint by its human-friendly name.
     * @param {string} name - Name to search for (case-sensitive)
     * @returns {import('./models.mjs').EndpointConfig|null}
     */
    getByName(name) {
        const all = this.getAll();
        return all.find((ep) => ep.name === name) || null;
    }

    /**
     * Get all endpoint configs as an array.
     * @returns {import('./models.mjs').EndpointConfig[]}
     */
    getAll() {
        const keys = listEndpoints();
        return keys.map((key) => getEndpoint(key)).filter(Boolean);
    }

    /**
     * Filter endpoints by tag.
     * @param {string} tag - Tag to filter by
     * @returns {import('./models.mjs').EndpointConfig[]}
     */
    getByTag(tag) {
        return this.getAll().filter((ep) => ep.tags.includes(tag));
    }

    /**
     * Load from a YAML file and store the path for future refreshes.
     * @param {string} filePath - Path to endpoint YAML
     * @returns {Object} Loaded config
     */
    loadFromFile(filePath) {
        this.#filePath = filePath;
        return loadConfigFromFile(filePath);
    }

    /**
     * List all endpoint keys (service IDs).
     * @returns {string[]}
     */
    listKeys() {
        return listEndpoints();
    }

    /**
     * Get a complete fetch configuration for a service ID.
     * @param {string} serviceId - Target service ID
     * @param {*} payload - Request payload
     * @param {Object<string, string>|null} [customHeaders] - Optional custom headers
     * @returns {import('./models.mjs').FetchConfig}
     */
    getFetchConfig(serviceId, payload, customHeaders = null) {
        return _getFetchConfig(serviceId, payload, customHeaders);
    }
}

/**
 * Factory function to create an EndpointConfigSDK instance.
 * @param {Object} [options]
 * @param {string} [options.filePath] - Path to endpoint YAML
 * @returns {EndpointConfigSDK}
 */
export function createEndpointConfigSDK(options = {}) {
    return new EndpointConfigSDK(options);
}
