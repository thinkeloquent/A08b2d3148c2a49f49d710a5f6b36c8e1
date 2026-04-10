/**
 * Unit tests for healthz-diagnostics sanitizer module.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigSanitizer } from '../src/sanitizer.mjs';
import { EnvHelper } from './helpers/test-utils.mjs';


describe('ConfigSanitizer', () => {
    let envHelper;

    beforeEach(() => {
        envHelper = new EnvHelper();
    });

    afterEach(() => {
        envHelper.restore();
    });

    describe('StatementCoverage', () => {

        it('sanitize() redacts sensitive keys with ***', () => {
            const sanitizer = new ConfigSanitizer();
            const config = {
                name: 'gemini',
                endpoint_api_key: 'sk-secret-123',
            };

            const result = sanitizer.sanitize(config);

            expect(result.name).toBe('gemini');
            expect(result.endpoint_api_key).toBe('***');
        });

        it('checkEnvVars() returns boolean presence map', () => {
            envHelper.set({ TEST_VAR: 'value' });
            const sanitizer = new ConfigSanitizer();

            const result = sanitizer.checkEnvVars(['TEST_VAR', 'MISSING_VAR', 'PATH']);

            expect(result.TEST_VAR).toBe(true);
            expect(result.MISSING_VAR).toBe(false);
            expect(result.PATH).toBe(true); // PATH should exist
        });
    });

    describe('BranchCoverage', () => {

        it('keys matching sensitive patterns are redacted', () => {
            const sanitizer = new ConfigSanitizer();
            const config = {
                api_key: 'secret',
                token: 'bearer-abc',
                password: 'hunter2',
                secret: 'shh',
            };

            const result = sanitizer.sanitize(config);

            expect(result.api_key).toBe('***');
            expect(result.token).toBe('***');
            expect(result.password).toBe('***');
            expect(result.secret).toBe('***');
        });

        it('keys not matching patterns are preserved', () => {
            const sanitizer = new ConfigSanitizer();
            const config = {
                name: 'provider',
                endpoint: 'https://api.example.com',
                timeout: 30,
            };

            const result = sanitizer.sanitize(config);

            expect(result.name).toBe('provider');
            expect(result.endpoint).toBe('https://api.example.com');
            expect(result.timeout).toBe(30);
        });
    });

    describe('BoundaryValues', () => {

        it('empty config returns empty object', () => {
            const sanitizer = new ConfigSanitizer();

            const result = sanitizer.sanitize({});

            expect(result).toEqual({});
        });

        it('nested config is recursively sanitized', () => {
            const sanitizer = new ConfigSanitizer();
            const config = {
                provider: {
                    name: 'openai',
                    endpoint_api_key: 'sk-nested',
                },
            };

            const result = sanitizer.sanitize(config);

            expect(result.provider.name).toBe('openai');
            expect(result.provider.endpoint_api_key).toBe('***');
        });

        it('config with no sensitive keys unchanged', () => {
            const sanitizer = new ConfigSanitizer();
            const config = {
                name: 'test',
                timeout: 30,
                enabled: true,
            };

            const result = sanitizer.sanitize(config);

            expect(result).toEqual(config);
        });

        it('empty env var list returns empty map', () => {
            const sanitizer = new ConfigSanitizer();

            const result = sanitizer.checkEnvVars([]);

            expect(result).toEqual({});
        });

        it('list values are recursively sanitized', () => {
            const sanitizer = new ConfigSanitizer();
            const config = {
                providers: [
                    { name: 'p1', api_key: 'secret1' },
                    { name: 'p2', api_key: 'secret2' },
                ]
            };

            const result = sanitizer.sanitize(config);

            expect(result.providers[0].name).toBe('p1');
            expect(result.providers[0].api_key).toBe('***');
            expect(result.providers[1].name).toBe('p2');
            expect(result.providers[1].api_key).toBe('***');
        });

        it('original config is not mutated', () => {
            const sanitizer = new ConfigSanitizer();
            const config = {
                api_key: 'secret-value'
            };

            sanitizer.sanitize(config);

            expect(config.api_key).toBe('secret-value');
        });
    });

    describe('ParityVectors', () => {

        it.each([
            ['endpoint_api_key', true],
            ['api_key', true],
            ['token', true],
            ['access_token', true],
            ['password', true],
            ['secret', true],
            ['client_secret', true],
            ['name', false],
            ['endpoint', false],
            ['model', false],
            ['timeout', false],
        ])('key "%s" should_redact=%s', (key, shouldRedact) => {
            const sanitizer = new ConfigSanitizer();
            const config = { [key]: 'test_value' };

            const result = sanitizer.sanitize(config);

            if (shouldRedact) {
                expect(result[key]).toBe('***');
            } else {
                expect(result[key]).toBe('test_value');
            }
        });
    });
});
