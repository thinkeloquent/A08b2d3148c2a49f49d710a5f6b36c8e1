#!/usr/bin/env node
/**
 * Fastify integration example for Smart Fetch Router.
 *
 * This example demonstrates:
 * - Loading config as a Fastify plugin
 * - Decorating request with fetch config helper
 * - Route handlers using the SDK
 *
 * Run with: node server.mjs
 */

import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import {
    loadConfig,
    loadConfigFromFile,
    getFetchConfig,
    listEndpoints,
    resolveIntent,
    ConfigError,
    LoggerFactory,
} from '../../src/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = LoggerFactory.create('fastify-example', import.meta.url);

// --- Fastify Plugin for Smart Fetch Router ---

async function smartFetchRouterPlugin(fastify, options) {
    const appEnv = process.env.APP_ENV || 'dev';
    const configPath = options.configPath || path.join(__dirname, '..', '..', '..', '..', 'common', 'config', `endpoint.${appEnv}.yaml`);

    // Load configuration
    if (fs.existsSync(configPath)) {
        loadConfigFromFile(configPath);
        logger.info('Config loaded from file', { path: configPath });
    } else {
        // Embedded fallback config
        loadConfig({
            endpoints: {
                llm001: {
                    baseUrl: 'http://localhost:51000/api/llm/gemini-openai-v1',
                    description: 'Primary LLM Service',
                    method: 'POST',
                    headers: { 'X-Service-ID': 'llm-primary' },
                    timeout: 30000,
                    bodyType: 'json',
                },
                llm002: {
                    baseUrl: 'http://localhost:52000/api/llm/gemini-openai-v1',
                    description: 'Secondary LLM Service',
                    method: 'POST',
                    headers: { 'X-Service-ID': 'llm-secondary' },
                    timeout: 30000,
                    bodyType: 'json',
                },
            },
            intent_mapping: {
                mappings: { chat: 'llm001', agent: 'llm002' },
                default_intent: 'llm001',
            },
        });
        logger.info('Config loaded from embedded defaults');
    }

    // Decorate fastify with helper methods
    fastify.decorate('listEndpoints', listEndpoints);
    fastify.decorate('resolveIntent', resolveIntent);
    fastify.decorate('getFetchConfig', getFetchConfig);

    // Decorate request with service resolver
    fastify.decorateRequest('getServiceConfig', function (serviceId, payload, customHeaders) {
        return getFetchConfig(serviceId, payload, customHeaders);
    });
}

// --- Create Fastify App ---

const fastify = Fastify({
    logger: {
        level: 'info',
        transport: {
            target: 'pino-pretty',
            options: { colorize: true },
        },
    },
});

// Register the plugin
await fastify.register(smartFetchRouterPlugin);

// --- Routes ---

fastify.get('/', async (request, reply) => {
    return {
        message: 'Smart Fetch Router Fastify Example',
        docs: '/endpoints',
    };
});

fastify.get('/endpoints', async (request, reply) => {
    return { endpoints: fastify.listEndpoints() };
});

fastify.post('/chat', {
    schema: {
        body: {
            type: 'object',
            required: ['messages'],
            properties: {
                messages: { type: 'array' },
                service_id: { type: 'string' },
                intent: { type: 'string' },
            },
        },
    },
}, async (request, reply) => {
    try {
        const { messages, service_id, intent } = request.body;

        // Resolve service ID
        const serviceId = service_id || fastify.resolveIntent(intent || 'chat');

        // Get fetch config
        const config = request.getServiceConfig(serviceId, { messages });

        logger.info('Fetch config created', {
            serviceId: config.serviceId,
            url: config.url,
        });

        return {
            serviceId: config.serviceId,
            url: config.url,
            method: config.method,
            headers: config.headers,
            bodyPreview: config.body.length > 100
                ? config.body.substring(0, 100) + '...'
                : config.body,
        };

    } catch (err) {
        if (err instanceof ConfigError) {
            logger.warn('Config error', { error: err.message, available: err.available });
            reply.code(404);
            return {
                error: err.message,
                serviceId: err.serviceId,
                available: err.available,
            };
        }
        throw err;
    }
});

fastify.post('/proxy/:serviceId', async (request, reply) => {
    try {
        const { serviceId } = request.params;
        const payload = request.body;

        const config = fastify.getFetchConfig(serviceId, payload);

        logger.info('Proxying request', { serviceId, url: config.url });

        // In production, use undici or node-fetch
        // const response = await fetch(config.url, {
        //     method: config.method,
        //     headers: config.headers,
        //     body: config.body,
        // });
        // return response.json();

        return {
            message: 'Would proxy to service',
            config: {
                serviceId: config.serviceId,
                url: config.url,
                method: config.method,
                headers: config.headers,
                headersTimeout: config.headersTimeout,
            },
        };

    } catch (err) {
        if (err instanceof ConfigError) {
            reply.code(404);
            return { error: err.message };
        }
        throw err;
    }
});

// --- Start Server ---

const start = async () => {
    try {
        const port = process.env.PORT || 3000;
        await fastify.listen({ port, host: '0.0.0.0' });
        logger.info(`Server listening on port ${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
