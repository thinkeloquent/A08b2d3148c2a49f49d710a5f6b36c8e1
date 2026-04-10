/**
 * Data models for Smart Fetch Router configuration.
 *
 * @module app-yaml-endpoints/models
 */

/**
 * @typedef {Object} EndpointConfig
 * @property {string} key - Endpoint identifier key
 * @property {string} name - Human-friendly name
 * @property {string[]} tags - Categorization tags
 * @property {string} baseUrl - Base URL for the endpoint
 * @property {string} description - Human-readable description
 * @property {string} method - HTTP method
 * @property {Object<string, string>} headers - Default headers
 * @property {number} timeout - Timeout in milliseconds
 * @property {'json'|'text'} bodyType - Body serialization type
 */

/**
 * Create EndpointConfig from raw object.
 * @param {Object} data - Raw config data
 * @param {string} [key=''] - Endpoint identifier key
 * @returns {EndpointConfig}
 */
export function createEndpointConfig(data, key = '') {
    return {
        key,
        name: data.name || key,
        tags: [...(data.tags || [])],
        baseUrl: data.baseUrl || data.baseurl || '',
        description: data.description || '',
        method: data.method || 'POST',
        headers: data.headers || {},
        timeout: data.timeout !== undefined ? data.timeout : 30000,
        bodyType: data.bodyType || 'json',
    };
}

/**
 * @typedef {Object} FetchConfig
 * @property {string} serviceId - Service identifier
 * @property {string} url - Full URL
 * @property {string} method - HTTP method
 * @property {Object<string, string>} headers - Merged headers
 * @property {string} body - Serialized body
 * @property {number} headersTimeout - Timeout in ms
 */

/**
 * Create FetchConfig object.
 * @param {Object} opts - Configuration options
 * @returns {FetchConfig}
 */
export function createFetchConfig({ serviceId, url, method, headers, body, timeout }) {
    return {
        serviceId,
        url,
        method,
        headers,
        body,
        headersTimeout: timeout,
    };
}
