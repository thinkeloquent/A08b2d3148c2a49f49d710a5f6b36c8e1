/**
 * Fastify Plugin for app-yaml-overwrites package.
 * Provides lifecycle hooks for configuration resolution in Fastify servers.
 *
 * Usage:
 *   import Fastify from 'fastify';
 *   import { configPlugin } from 'app-yaml-overwrites/integrations';
 *
 *   const app = Fastify();
 *   await app.register(configPlugin, { ...options });
 */

import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginOptions } from 'fastify';
import { create as createLogger, ILogger } from '../logger.js';
import { ConfigSDK, ConfigSDKOptions } from '../sdk.js';
import { ComputeScope } from '../options.js';
import { ComputeRegistry } from '../compute-registry.js';
import { RequestLike } from '../context-builder.js';

// Create module-level logger
const logger = createLogger('app-yaml-overwrites', 'integrations/fastify.ts');

/**
 * Options for the Fastify config plugin.
 */
export interface ConfigPluginOptions extends FastifyPluginOptions {
    /** SDK options to pass through */
    sdkOptions?: ConfigSDKOptions;
    /** Pre-initialized SDK instance (optional) */
    sdk?: ConfigSDK;
    /** Pre-initialized registry (optional) */
    registry?: ComputeRegistry;
    /** Whether to resolve STARTUP templates on registration */
    resolveOnStartup?: boolean;
    /** Whether to add per-request resolution hook */
    perRequestResolution?: boolean;
    /** Custom logger instance */
    logger?: ILogger;
    /** Config directory (for fromDirectory factory) */
    configDir?: string;
    /** Environment name */
    env?: string;
    /**
     * Name of the decorator to attach the SDK to (default: 'config')
     */
    decoratorName?: string;
}

/**
 * Declaration merging to add config accessor to Fastify.
 * Note: When using custom decoratorName, you'll need to augment FastifyInstance manually
 */
declare module 'fastify' {
    interface FastifyInstance {
        config: ConfigSDK;
        configSdk: ConfigSDK;  // Legacy alias
        configResolved: any;
    }
    interface FastifyRequest {
        resolvedConfig?: any;
        config?: any;  // Legacy alias
    }
}

/**
 * Fastify plugin for configuration resolution.
 *
 * Features:
 * - Decorates fastify with `config` (ConfigSDK instance)
 * - Decorates fastify with `configResolved` (STARTUP-resolved config)
 * - Optional per-request resolution via preHandler hook
 * - Lifecycle: onReady for STARTUP, preHandler for REQUEST
 */
async function configPluginImpl(
    fastify: FastifyInstance,
    options: ConfigPluginOptions
): Promise<void> {
    const pluginLogger = options.logger || logger;
    const decoratorName = options.decoratorName || 'config';

    pluginLogger.info(`Registering config plugin (decorator: ${decoratorName})`);

    // Use provided SDK or initialize new one
    let sdk: ConfigSDK;
    if (options.sdk) {
        sdk = options.sdk;
        pluginLogger.debug('Using provided SDK instance');
    } else if (options.configDir) {
        sdk = await ConfigSDK.fromDirectory(options.configDir, { env: options.env });
        pluginLogger.debug('SDK initialized from directory');
    } else {
        const sdkOptions: ConfigSDKOptions = {
            ...options.sdkOptions,
            registry: options.registry
        };
        sdk = await ConfigSDK.initialize(sdkOptions);
        pluginLogger.debug('SDK initialized');
    }

    // Decorate fastify with SDK
    if (!fastify.hasDecorator(decoratorName)) {
        fastify.decorate(decoratorName, sdk);
    } else {
        pluginLogger.warn(`Decorator '${decoratorName}' already exists, skipping decoration`);
    }

    // Legacy alias 'configSdk'
    if (decoratorName === 'config' && !fastify.hasDecorator('configSdk')) {
        fastify.decorate('configSdk', sdk);
    }

    pluginLogger.debug(`Fastify decorated with ${decoratorName}`);

    // Resolve STARTUP templates
    if (options.resolveOnStartup !== false) {
        pluginLogger.debug('Resolving STARTUP templates');
        const startupResolved = await sdk.getResolved(ComputeScope.STARTUP);
        if (!fastify.hasDecorator('configResolved')) {
            fastify.decorate('configResolved', startupResolved);
        }
        pluginLogger.info('STARTUP config resolved and decorated');
    } else {
        if (!fastify.hasDecorator('configResolved')) {
            fastify.decorate('configResolved', sdk.getRaw());
        }
        pluginLogger.debug('Using raw config (STARTUP resolution disabled)');
    }

    // Optional per-request resolution
    if (options.perRequestResolution) {
        pluginLogger.debug('Enabling per-request resolution');

        // Decorate request with resolved config placeholder
        if (!fastify.hasRequestDecorator('resolvedConfig')) {
            fastify.decorateRequest('resolvedConfig', null);
        }
        // Legacy alias
        if (decoratorName === 'config' && !fastify.hasRequestDecorator('config')) {
            fastify.decorateRequest('config', null);
        }

        // Add preHandler hook for REQUEST-scoped resolution
        fastify.addHook('preHandler', async (request: FastifyRequest, _reply: FastifyReply) => {
            pluginLogger.debug('preHandler: Resolving REQUEST config', {
                method: request.method,
                url: request.url
            });

            // Build request-like object for context
            const requestLike: RequestLike = {
                headers: request.headers as Record<string, string>,
                query: request.query as Record<string, any>,
                params: request.params as Record<string, any>,
                body: request.body
            };

            try {
                // Resolve with REQUEST scope
                const resolved = await sdk.getResolved(
                    ComputeScope.REQUEST,
                    requestLike
                );
                request.resolvedConfig = resolved;

                // Legacy alias if using default name
                if (decoratorName === 'config') {
                    request.config = resolved;
                }

                pluginLogger.debug('REQUEST config resolved for request');
            } catch (err) {
                pluginLogger.error(`Failed to resolve config for request: ${err}`);
                // Fallback to raw config
                request.resolvedConfig = sdk.getRaw();
                if (decoratorName === 'config') {
                    request.config = sdk.getRaw();
                }
            }
        });

        pluginLogger.info('Per-request resolution hook registered');
    } else {
        // Add onRequest hook for simple config attachment (legacy compatibility)
        fastify.addHook('onRequest', async (req: FastifyRequest, _reply: FastifyReply) => {
            // If legacy name is used, attach resolved config to req.config
            if (decoratorName === 'config') {
                req.config = fastify.configResolved;
            }
        });
    }

    // Lifecycle hook for cleanup
    fastify.addHook('onClose', async () => {
        pluginLogger.debug('onClose: Cleaning up config plugin');
        // Clear registry cache on close
        sdk.getRegistry().clearCache();
        pluginLogger.info('Config plugin cleanup complete');
    });

    pluginLogger.info('Config plugin registered successfully');
}

/**
 * Fastify plugin wrapped with fastify-plugin for encapsulation.
 */
export const configPlugin = fp(configPluginImpl as any, {
    fastify: '>=4.0.0',
    name: 'app-yaml-overwrites-config'
});

/**
 * Legacy alias for backwards compatibility.
 */
export const fastifyConfigSdk = configPlugin;

/**
 * Factory function to create a configured plugin.
 *
 * @param options - Plugin options
 * @returns Configured plugin function
 */
export function createConfigPlugin(options: ConfigPluginOptions = {}) {
    return async (fastify: FastifyInstance) => {
        await configPluginImpl(fastify, options);
    };
}

/**
 * Helper to get config from request or fastify instance.
 *
 * @param requestOrFastify - Request or Fastify instance
 * @returns Resolved config object
 */
export function getConfig(requestOrFastify: FastifyRequest | FastifyInstance): any {
    if ('resolvedConfig' in requestOrFastify && requestOrFastify.resolvedConfig) {
        return requestOrFastify.resolvedConfig;
    }
    if ('config' in requestOrFastify && requestOrFastify.config && typeof requestOrFastify.config !== 'function') {
        // Check if it's request.config (resolved) vs fastify.config (SDK)
        if (!('getResolved' in requestOrFastify.config)) {
            return requestOrFastify.config;
        }
    }
    if ('configResolved' in requestOrFastify) {
        return requestOrFastify.configResolved;
    }
    throw new Error('Config not available. Ensure configPlugin is registered.');
}

/**
 * Legacy interface for backwards compatibility.
 */
export interface FastifyConfigSdkOptions extends ConfigPluginOptions { }

export default configPlugin;
