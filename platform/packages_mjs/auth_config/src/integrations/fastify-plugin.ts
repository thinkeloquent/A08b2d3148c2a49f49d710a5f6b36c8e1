import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { AuthConfigInput, AuthConfigWithHeaders } from '../types/auth-config.js';
import { createAuthConfig } from '../create-auth-config.js';
import { createLogger } from '../logger.js';

const logger = createLogger('fetch_auth_config.integrations.fastify', import.meta.url);

declare module 'fastify' {
    interface FastifyInstance {
        authConfig: AuthConfigWithHeaders;
    }
}

export interface AuthConfigPluginOptions {
    config: AuthConfigInput;
}

const plugin: FastifyPluginAsync<AuthConfigPluginOptions> = async (fastify, options) => {
    logger.info('Initializing AuthConfig plugin');

    // Ensure encoding is on
    const configInput = { ...options.config, encode: true };

    try {
        const config = createAuthConfig(configInput);
        if (!('headers' in config)) {
            throw new Error('Expected AuthConfigWithHeaders but got AuthConfig');
        }

        fastify.decorate('authConfig', config);
        logger.info('Fastify instance decorated with authConfig');
    } catch (err) {
        logger.error(`Failed to initialize AuthConfig plugin: ${err}`);
        throw err;
    }
};

export const authConfigPlugin = fp(plugin as unknown as Parameters<typeof fp>[0], {
    name: '@internal/auth-config',
    fastify: '4.x'
});
