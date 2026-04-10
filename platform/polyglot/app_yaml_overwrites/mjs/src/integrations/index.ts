/**
 * Server integration modules for app-yaml-overwrites.
 */

export {
    // Modern API
    configPlugin,
    createConfigPlugin,
    getConfig,
    ConfigPluginOptions,
    // Legacy aliases
    fastifyConfigSdk,
    FastifyConfigSdkOptions
} from './fastify.js';

// Default export
export { default } from './fastify.js';
