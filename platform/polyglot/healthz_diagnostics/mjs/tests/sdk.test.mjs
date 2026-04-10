/**
 * Unit tests for healthz-diagnostics SDK module.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HealthzDiagnosticsSDK } from '../src/sdk.mjs';
import { createMockHttpClient, EnvHelper } from './helpers/test-utils.mjs';


describe('HealthzDiagnosticsSDK', () => {
    let envHelper;

    beforeEach(() => {
        envHelper = new EnvHelper();
    });

    afterEach(() => {
        envHelper.restore();
    });

    describe('StatementCoverage', () => {

        it('create() returns SDK instance', () => {
            const factory = (config) => createMockHttpClient();

            const sdk = HealthzDiagnosticsSDK.create(factory);

            expect(sdk).toBeDefined();
            expect(sdk).toBeInstanceOf(HealthzDiagnosticsSDK);
        });

        it('checkHealth() delegates to HealthCheckExecutor', async () => {
            const mockClient = createMockHttpClient({ statusCode: 200 });
            const sdk = HealthzDiagnosticsSDK.create(() => mockClient);
            const config = {
                base_url: 'https://api.example.com',
                health_endpoint: '/health',
            };

            const result = await sdk.checkHealth('provider', config);

            expect(result).toHaveProperty('healthy');
        });

        it('sanitizeConfig() delegates to ConfigSanitizer', () => {
            const factory = (config) => createMockHttpClient();
            const sdk = HealthzDiagnosticsSDK.create(factory);
            const config = { api_key: 'secret', name: 'test' };

            const result = sdk.sanitizeConfig(config);

            expect(result.api_key).toBe('***');
            expect(result.name).toBe('test');
        });

        it('checkEnvVars() delegates to ConfigSanitizer', () => {
            envHelper.set({ TEST_VAR: 'value' });
            const factory = (config) => createMockHttpClient();
            const sdk = HealthzDiagnosticsSDK.create(factory);

            const result = sdk.checkEnvVars(['TEST_VAR', 'NONEXISTENT']);

            expect(result.TEST_VAR).toBe(true);
            expect(result.NONEXISTENT).toBe(false);
        });

        it('formatTimestamp() delegates to TimestampFormatter', () => {
            const factory = (config) => createMockHttpClient();
            const sdk = HealthzDiagnosticsSDK.create(factory);

            const result = sdk.formatTimestamp();

            expect(typeof result).toBe('string');
            expect(result).toMatch(/Z$/);
        });
    });

    describe('Integration', () => {

        it('full health check workflow', async () => {
            const mockClient = createMockHttpClient({ statusCode: 200 });
            const sdk = HealthzDiagnosticsSDK.create(() => mockClient);

            // Format timestamp
            const ts = sdk.formatTimestamp();
            expect(ts.endsWith('Z')).toBe(true);

            // Sanitize config
            const config = {
                base_url: 'https://api.example.com',
                health_endpoint: '/health',
                endpoint_api_key: 'sk-secret',
            };
            const safeConfig = sdk.sanitizeConfig(config);
            expect(safeConfig.endpoint_api_key).toBe('***');

            // Check health
            const result = await sdk.checkHealth('test_provider', config);
            expect(result.healthy).toBe(true);

            // Check env vars
            const envResult = sdk.checkEnvVars(['PATH']);
            expect(envResult.PATH).toBe(true);
        });

        it('unhealthy provider returns healthy=false', async () => {
            const mockClient = createMockHttpClient({ statusCode: 503 });
            const sdk = HealthzDiagnosticsSDK.create(() => mockClient);
            const config = {
                base_url: 'https://api.example.com',
                health_endpoint: '/health',
            };

            const result = await sdk.checkHealth('failing_provider', config);

            expect(result.healthy).toBe(false);
        });

        it('connection error handled gracefully', async () => {
            const mockClient = createMockHttpClient({
                error: new Error('Connection refused')
            });
            const sdk = HealthzDiagnosticsSDK.create(() => mockClient);
            const config = {
                base_url: 'https://api.example.com',
                health_endpoint: '/health',
            };

            const result = await sdk.checkHealth('error_provider', config);

            expect(result.healthy).toBe(false);
            expect(result.error).toContain('Connection refused');
        });
    });

    describe('BoundaryValues', () => {

        it('empty config sanitization', () => {
            const factory = (config) => createMockHttpClient();
            const sdk = HealthzDiagnosticsSDK.create(factory);

            const result = sdk.sanitizeConfig({});

            expect(result).toEqual({});
        });

        it('empty env var list', () => {
            const factory = (config) => createMockHttpClient();
            const sdk = HealthzDiagnosticsSDK.create(factory);

            const result = sdk.checkEnvVars([]);

            expect(result).toEqual({});
        });

        it('nested config sanitization', () => {
            const factory = (config) => createMockHttpClient();
            const sdk = HealthzDiagnosticsSDK.create(factory);
            const config = {
                providers: [
                    { name: 'p1', api_key: 'secret1' },
                    { name: 'p2', api_key: 'secret2' },
                ]
            };

            const result = sdk.sanitizeConfig(config);

            expect(result.providers[0].api_key).toBe('***');
            expect(result.providers[1].api_key).toBe('***');
        });
    });
});
