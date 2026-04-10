/**
 * Utility functions for app-yaml-static-config package.
 * Provides helper functions for retrieving configuration from framework server/app state.
 */

import { create as createLogger, type ILogger } from './logger.js';

const logger = createLogger('app-yaml-static-config', 'utils.ts');

export interface GetConfigOptions {
    /** Attribute name for pre-resolved config (default: "configResolved") */
    resolvedAttr?: string;
    /** Attribute name for raw config (default: "config") */
    rawAttr?: string;
    /** Attribute name for SDK with getResolved method (default: "configSdk") */
    sdkAttr?: string;
    /** Custom logger instance */
    logger?: ILogger;
}

/**
 * Get configuration from server/app object.
 *
 * Tries to get pre-resolved config first (values resolved by context resolver),
 * then tries SDK getResolved if available, finally falls back to raw config.
 *
 * @param server - The server/app object (e.g., Fastify instance)
 * @param options - Configuration options
 * @returns Configuration object, or empty object if not found
 *
 * @example
 * // Fastify usage
 * const config = await getConfigFromServer(server);
 *
 * // With custom attribute names
 * const config = await getConfigFromServer(server, {
 *   resolvedAttr: 'myResolved',
 *   rawAttr: 'myConfig'
 * });
 */
export async function getConfigFromServer(
    server: any,
    options: GetConfigOptions = {}
): Promise<Record<string, any>> {
    const {
        resolvedAttr = 'configResolved',
        rawAttr = 'config',
        sdkAttr = 'configSdk',
        logger: customLogger = logger
    } = options;

    // 1. Try pre-resolved config (STARTUP scope with overwrites applied, cached at server startup)
    if (server[resolvedAttr]) {
        return server[resolvedAttr];
    }

    // 2. Try SDK getResolved with exception handling
    try {
        const sdk = server[sdkAttr];
        if (sdk?.getResolved) {
            // Call getResolved with STARTUP scope (value 'startup')
            // This avoids importing app-yaml-overwrites which would create a circular dependency
            const resolved = await sdk.getResolved('startup');
            if (resolved) return resolved;
        }
    } catch (err: any) {
        customLogger.warn(`Failed to resolve config from SDK: ${err.message}`);
    }

    // 3. Fallback to raw config
    const appConfig = server[rawAttr];
    if (!appConfig) {
        customLogger.warn(`${rawAttr} not found on server`);
        return {};
    }

    // If appConfig has toObject method (AppYamlConfig instance), use it
    if (typeof appConfig.toObject === 'function') {
        return appConfig.toObject();
    }

    // If appConfig has getAll method, use it
    if (typeof appConfig.getAll === 'function') {
        return appConfig.getAll();
    }

    // If it's already a plain object, return it
    if (typeof appConfig === 'object' && appConfig !== null) {
        return appConfig;
    }

    customLogger.warn(`Unable to convert ${rawAttr} to object`);
    return {};
}

/**
 * Synchronous version - get configuration from app state without SDK resolution.
 *
 * Use this when you don't need SDK-based resolution or are in a sync context.
 *
 * @param appState - The app state object
 * @param options - Configuration options (subset without SDK)
 * @returns Configuration object, or empty object if not found
 */
export function getConfigFromAppState(
    appState: any,
    options: Omit<GetConfigOptions, 'sdkAttr'> = {}
): Record<string, any> {
    const {
        resolvedAttr = 'resolvedConfig',
        rawAttr = 'config',
        logger: customLogger = logger
    } = options;

    // Try resolved config first
    if (appState[resolvedAttr]) {
        return appState[resolvedAttr];
    }

    // Fallback to raw config
    const appConfig = appState[rawAttr];
    if (!appConfig) {
        customLogger.warn(`${rawAttr} not found on app state`);
        return {};
    }

    // If appConfig has toObject method, use it
    if (typeof appConfig.toObject === 'function') {
        return appConfig.toObject();
    }

    // If appConfig has getAll method, use it
    if (typeof appConfig.getAll === 'function') {
        return appConfig.getAll();
    }

    // If it's already a plain object, return it
    if (typeof appConfig === 'object' && appConfig !== null) {
        return appConfig;
    }

    customLogger.warn(`Unable to convert ${rawAttr} to object`);
    return {};
}
