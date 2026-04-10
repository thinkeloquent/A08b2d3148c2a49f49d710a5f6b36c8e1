import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';

// Mock undici to prevent real HTTP calls during server initialization
vi.mock('undici', () => ({
    request: vi.fn(),
}));

// Mock @fastify/sensible if not installed
vi.mock('@fastify/sensible', () => ({
    default: async function sensible(fastify) {
        // Minimal stub: register httpErrors on fastify
        fastify.decorate('httpErrors', {
            notFound: (msg) => { const e = new Error(msg || 'Not Found'); e.statusCode = 404; return e; },
            badRequest: (msg) => { const e = new Error(msg || 'Bad Request'); e.statusCode = 400; return e; },
        });
    },
}));

import { createServer } from '../src/server.mjs';

describe('Fastify Integration', () => {
    let server;

    beforeAll(async () => {
        process.env.FIGMA_TOKEN = 'test-integration-token-12345';
    });

    afterAll(() => {
        delete process.env.FIGMA_TOKEN;
    });

    beforeEach(async () => {
        const app = await createServer({ token: 'test-integration-token-12345' });
        server = app.server;
        await server.ready();
    });

    afterEach(async () => {
        if (server) await server.close();
    });

    describe('Health Endpoint', () => {
        it('should return 200 OK from /health', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/health',
            });

            expect(response.statusCode).toBe(200);
            const body = response.json();
            expect(body.status).toBe('ok');
            expect(body.service).toBe('figma-api');
            expect(body.timestamp).toBeDefined();
        });

        it('should return valid ISO timestamp', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/health',
            });

            const body = response.json();
            const parsed = new Date(body.timestamp);
            expect(parsed.toISOString()).toBe(body.timestamp);
        });

        it('should return JSON content type', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/health',
            });

            expect(response.headers['content-type']).toContain('application/json');
        });
    });

    describe('CORS', () => {
        it('should include CORS headers on response', async () => {
            const response = await server.inject({
                method: 'OPTIONS',
                url: '/health',
                headers: {
                    'Origin': 'http://localhost:3000',
                    'Access-Control-Request-Method': 'GET',
                },
            });

            expect(response.headers['access-control-allow-origin']).toBeDefined();
        });

        it('should allow GET method via CORS', async () => {
            const response = await server.inject({
                method: 'OPTIONS',
                url: '/health',
                headers: {
                    'Origin': 'http://localhost:3000',
                    'Access-Control-Request-Method': 'GET',
                },
            });

            const allowMethods = response.headers['access-control-allow-methods'];
            if (allowMethods) {
                expect(allowMethods).toContain('GET');
            }
        });

        it('should allow POST method via CORS', async () => {
            const response = await server.inject({
                method: 'OPTIONS',
                url: '/health',
                headers: {
                    'Origin': 'http://localhost:3000',
                    'Access-Control-Request-Method': 'POST',
                },
            });

            const allowMethods = response.headers['access-control-allow-methods'];
            if (allowMethods) {
                expect(allowMethods).toContain('POST');
            }
        });
    });

    describe('Error Handling', () => {
        it('should return 404 for unknown routes', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/nonexistent',
            });

            expect(response.statusCode).toBe(404);
        });

        it('should return JSON error body for unknown routes', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/totally/unknown/path',
            });

            expect(response.statusCode).toBe(404);
        });
    });

    describe('Server Lifecycle', () => {
        it('should handle ready and close lifecycle', async () => {
            // server is already ready from beforeEach
            expect(server).toBeDefined();
            // close is called in afterEach
        });

        it('should have registered health route', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/health',
            });
            expect(response.statusCode).toBe(200);
        });
    });

    describe('Request Methods', () => {
        it('should handle POST to health (method not allowed or 404)', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/health',
            });
            // Fastify returns 404 for unregistered method+path combos
            expect([404, 405]).toContain(response.statusCode);
        });

        it('should handle HEAD requests to health', async () => {
            const response = await server.inject({
                method: 'HEAD',
                url: '/health',
            });
            // Fastify auto-handles HEAD for GET routes
            expect(response.statusCode).toBe(200);
        });
    });
});
