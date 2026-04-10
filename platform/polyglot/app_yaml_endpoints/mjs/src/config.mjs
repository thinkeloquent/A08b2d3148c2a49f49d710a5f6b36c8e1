/**
 * Configuration loading and fetch config generation.
 *
 * Provides functions to:
 * - Load configuration from YAML file or object
 * - Get fetch configuration for a service ID
 * - Resolve intents to service IDs
 *
 * @module app-yaml-endpoints/config
 */

import * as fs from 'fs';
import yaml from 'js-yaml';
import { LoggerFactory } from './logger.mjs';
import { createEndpointConfig, createFetchConfig } from './models.mjs';

const logger = LoggerFactory.create('app-yaml-endpoints', import.meta.url);

// Module-level config storage
let _config = null;

/**
 * Configuration error.
 */
export class ConfigError extends Error {
    /**
     * @param {string} message - Error message
     * @param {string|null} serviceId - Related service ID
     * @param {string[]} available - Available service IDs
     */
    constructor(message, serviceId = null, available = []) {
        super(message);
        this.name = 'ConfigError';
        this.serviceId = serviceId;
        this.available = available;
    }
}

/**
 * Load configuration from a YAML file.
 *
 * @param {string} filePath - Path to endpoint.yaml
 * @returns {Object} Configuration object
 * @throws {ConfigError} If file cannot be loaded
 */
export function loadConfigFromFile(filePath) {
    logger.debug('Loading config from file', { path: filePath });

    if (!fs.existsSync(filePath)) {
        logger.warn('Config file not found', { path: filePath });
        _config = { endpoints: {}, intent_mapping: {} };
        return _config;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        _config = yaml.load(content) || {};
        logger.info('Config loaded', { endpoints: Object.keys(_config.endpoints || {}).length });
        return _config;
    } catch (e) {
        logger.error('Failed to parse YAML', { error: e.message });
        throw new ConfigError(`Failed to parse YAML: ${e.message}`);
    }
}

/**
 * Load configuration from a dictionary object.
 *
 * @param {Object} config - Configuration object with 'endpoints' key
 * @returns {Object} The same configuration object
 */
export function loadConfig(config) {
    logger.debug('Loading config from object', { endpoints: Object.keys(config.endpoints || {}).length });
    _config = config;
    return _config;
}

/**
 * Get current configuration.
 * @returns {Object}
 * @throws {ConfigError} If not loaded
 */
export function getConfig() {
    if (_config === null) {
        throw new ConfigError('Configuration not loaded. Call loadConfig() or loadConfigFromFile() first.');
    }
    return _config;
}

/**
 * List all available endpoint service IDs.
 * @returns {string[]}
 */
export function listEndpoints() {
    const config = getConfig();
    return Object.keys(config.endpoints || {});
}

/**
 * Get endpoint configuration for a service ID.
 *
 * @param {string} serviceId - Service ID (e.g., 'llm001')
 * @returns {Object|null} EndpointConfig or null
 */
export function getEndpoint(serviceId) {
    const cleanId = serviceId.replace('endpoints.', '');
    logger.debug('getEndpoint', { serviceId: cleanId });

    const config = getConfig();
    const endpoint = config.endpoints?.[cleanId];

    if (!endpoint) {
        logger.debug('Endpoint not found', { serviceId: cleanId });
        return null;
    }

    return createEndpointConfig(endpoint, cleanId);
}

/**
 * Resolve an intent to a service ID.
 *
 * @param {string} intent - Intent string (e.g., 'storybook')
 * @returns {string} Resolved service ID
 */
export function resolveIntent(intent) {
    logger.debug('resolveIntent', { intent });
    const config = getConfig();
    const mapping = config.intent_mapping || {};
    const mappings = mapping.mappings || {};
    const defaultIntent = mapping.default_intent || 'llm001';

    const result = mappings[intent] || defaultIntent;
    logger.debug('Intent resolved', { intent, serviceId: result });
    return result;
}

/**
 * Get complete fetch configuration for a service ID.
 *
 * @param {string} serviceId - Target service ID
 * @param {*} payload - Request payload (will be JSON serialized)
 * @param {Object<string, string>|null} customHeaders - Optional headers to merge
 * @returns {Object} FetchConfig ready for HTTP client
 * @throws {ConfigError} If service ID not found
 */
export function getFetchConfig(serviceId, payload, customHeaders = null) {
    const cleanId = serviceId.replace('endpoints.', '');
    logger.debug('getFetchConfig', { serviceId: cleanId });

    const endpoint = getEndpoint(cleanId);
    if (!endpoint) {
        const available = listEndpoints();
        logger.warn('Service not found', { serviceId: cleanId, available });
        throw new ConfigError(`Service '${cleanId}' not found`, cleanId, available);
    }

    // Merge headers: default -> endpoint -> custom
    const headers = { 'Content-Type': 'application/json' };
    Object.assign(headers, endpoint.headers);
    if (customHeaders) {
        Object.assign(headers, customHeaders);
    }

    // Serialize body
    const body = endpoint.bodyType === 'text' ? String(payload) : JSON.stringify(payload);

    const result = createFetchConfig({
        serviceId: cleanId,
        url: endpoint.baseUrl,
        method: endpoint.method,
        headers,
        body,
        timeout: endpoint.timeout,
    });

    logger.debug('Fetch config created', {
        url: result.url,
        method: result.method,
        headersCount: Object.keys(result.headers).length,
    });

    return result;
}
