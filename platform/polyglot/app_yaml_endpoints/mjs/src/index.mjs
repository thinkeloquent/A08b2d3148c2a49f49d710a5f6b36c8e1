/**
 * Smart Fetch Router - Configuration-driven endpoint routing SDK.
 *
 * @module app-yaml-endpoints
 *
 * @example
 * import { loadConfigFromFile, getFetchConfig } from 'app-yaml-endpoints';
 *
 * // Load configuration
 * loadConfigFromFile('./config/endpoint.yaml');
 *
 * // Get fetch config for a service
 * const config = getFetchConfig('llm001', { prompt: 'Hello' });
 * console.log(config.url, config.headers);
 */

// Logger exports
export { Logger, LoggerFactory } from './logger.mjs';

// Config exports
export {
    loadConfig,
    loadConfigFromFile,
    getConfig,
    listEndpoints,
    getEndpoint,
    resolveIntent,
    getFetchConfig,
    ConfigError,
} from './config.mjs';

// Model exports
export {
    createEndpointConfig,
    createFetchConfig,
} from './models.mjs';

// SDK exports
export {
    EndpointConfigSDK,
    createEndpointConfigSDK,
} from './sdk.mjs';

export const VERSION = '1.1.0';
