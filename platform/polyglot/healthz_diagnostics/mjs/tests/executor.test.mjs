/**
 * Unit tests for healthz-diagnostics executor module.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HealthCheckExecutor } from '../src/executor.mjs';
import { createMockHttpClient, createMockTime } from './helpers/test-utils.mjs';


describe('HealthCheckExecutor', () => {
    let mockTime;

    beforeEach(() => {
        mockTime = createMockTime(0);
    });

    afterEach(() => {
        mockTime.restore();
    });

    describe('StatementCoverage', () => {

        it('constructor accepts factory', () => {
            const factory = (config) => createMockHttpClient();

            const executor = new HealthCheckExecutor(factory);

            expect(executor).toBeDefined();
        });

        it('execute() returns HealthCheckResult', async () => {
            const mockClient = createMockHttpClient({ statusCode: 200 });
            const executor = new HealthCheckExecutor(() => mockClient);
            const config = {
                base_url: 'https://api.example.com',
                health_endpoint: '/health',
            };

            const result = await executor.execute('test_provider', config);

            expect(result).toHaveProperty('provider');
            expect(result).toHaveProperty('healthy');
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('diagnostics');
        });
    });

    describe('BranchCoverage', () => {

        it('HTTP 2xx returns healthy=true', async () => {
            const mockClient = createMockHttpClient({ statusCode: 200 });
            const executor = new HealthCheckExecutor(() => mockClient);
            const config = {
                base_url: 'https://api.example.com',
                health_endpoint: '/health',
            };

            const result = await executor.execute('provider', config);

            expect(result.healthy).toBe(true);
            expect(result.status_code).toBe(200);
        });

        it('HTTP 5xx returns healthy=false', async () => {
            const mockClient = createMockHttpClient({ statusCode: 503 });
            const executor = new HealthCheckExecutor(() => mockClient);
            const config = {
                base_url: 'https://api.example.com',
                health_endpoint: '/health',
            };

            const result = await executor.execute('provider', config);

            expect(result.healthy).toBe(false);
            expect(result.status_code).toBe(503);
        });

        it('connection error returns healthy=false with error message', async () => {
            const mockClient = createMockHttpClient({
                error: new Error('Connection refused')
            });
            const executor = new HealthCheckExecutor(() => mockClient);
            const config = {
                base_url: 'https://api.example.com',
                health_endpoint: '/health',
            };

            const result = await executor.execute('provider', config);

            expect(result.healthy).toBe(false);
            expect(result.error).toContain('Connection refused');
        });

        it('missing base_url returns error', async () => {
            const mockClient = createMockHttpClient();
            const executor = new HealthCheckExecutor(() => mockClient);
            const config = {
                health_endpoint: '/health',
            };

            const result = await executor.execute('provider', config);

            expect(result.healthy).toBe(false);
            expect(result.error).toContain('not configured');
        });
    });

    describe('BoundaryValues', () => {

        it('empty provider name handled', async () => {
            const mockClient = createMockHttpClient({ statusCode: 200 });
            const executor = new HealthCheckExecutor(() => mockClient);
            const config = {
                base_url: 'https://api.example.com',
                health_endpoint: '/health',
            };

            const result = await executor.execute('', config);

            expect(result.provider).toBe('');
        });

        it('missing health_endpoint uses default', async () => {
            const mockClient = createMockHttpClient({ statusCode: 200 });
            const executor = new HealthCheckExecutor(() => mockClient);
            const config = {
                base_url: 'https://api.example.com',
            };

            const result = await executor.execute('provider', config);

            expect(result.healthy).toBe(true);
        });

        it('trailing slash in base_url handled', async () => {
            const mockClient = createMockHttpClient({ statusCode: 200 });
            const executor = new HealthCheckExecutor(() => mockClient);
            const config = {
                base_url: 'https://api.example.com/',
                health_endpoint: '/health',
            };

            const result = await executor.execute('provider', config);

            expect(result.healthy).toBe(true);
            expect(result.endpoint).toBe('https://api.example.com/health');
        });
    });

    describe('ResultStructure', () => {

        it('result has all required fields', async () => {
            const mockClient = createMockHttpClient({ statusCode: 200 });
            const executor = new HealthCheckExecutor(() => mockClient);
            const config = {
                base_url: 'https://api.example.com',
                health_endpoint: '/health',
                model: 'gpt-4',
            };

            const result = await executor.execute('openai', config);

            expect(result).toHaveProperty('provider');
            expect(result).toHaveProperty('healthy');
            expect(result).toHaveProperty('status_code');
            expect(result).toHaveProperty('latency_ms');
            expect(result).toHaveProperty('error');
            expect(result).toHaveProperty('endpoint');
            expect(result).toHaveProperty('model');
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('diagnostics');
        });

        it('diagnostics field is an array', async () => {
            const mockClient = createMockHttpClient({ statusCode: 200 });
            const executor = new HealthCheckExecutor(() => mockClient);
            const config = {
                base_url: 'https://api.example.com',
                health_endpoint: '/health',
            };

            const result = await executor.execute('provider', config);

            expect(Array.isArray(result.diagnostics)).toBe(true);
            expect(result.diagnostics.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('ClientLifecycle', () => {

        it('client.close() is called after success', async () => {
            let closeCalled = false;
            const mockClient = {
                request: async () => ({ status: 200 }),
                close: async () => { closeCalled = true; }
            };
            const executor = new HealthCheckExecutor(() => mockClient);
            const config = {
                base_url: 'https://api.example.com',
                health_endpoint: '/health',
            };

            await executor.execute('provider', config);

            expect(closeCalled).toBe(true);
        });

        it('client.close() is called after error', async () => {
            let closeCalled = false;
            const mockClient = {
                request: async () => { throw new Error('Connection failed'); },
                close: async () => { closeCalled = true; }
            };
            const executor = new HealthCheckExecutor(() => mockClient);
            const config = {
                base_url: 'https://api.example.com',
                health_endpoint: '/health',
            };

            await executor.execute('provider', config);

            expect(closeCalled).toBe(true);
        });
    });
});
