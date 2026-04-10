import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadConfig, DEFAULTS } from '../src/config.mjs';

describe('Config', () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    describe('Statement Coverage', () => {
        it('loadConfig should return object with expected keys', () => {
            const config = loadConfig();
            expect(config).toHaveProperty('figmaToken');
            expect(config).toHaveProperty('figmaApiBaseUrl');
            expect(config).toHaveProperty('logLevel');
            expect(config).toHaveProperty('port');
            expect(config).toHaveProperty('host');
            expect(config).toHaveProperty('rateLimitAutoWait');
            expect(config).toHaveProperty('rateLimitThreshold');
            expect(config).toHaveProperty('timeout');
            expect(config).toHaveProperty('cacheMaxSize');
            expect(config).toHaveProperty('cacheTtl');
            expect(config).toHaveProperty('maxRetries');
        });

        it('DEFAULTS should have correct values', () => {
            expect(DEFAULTS.baseUrl).toBe('https://api.figma.com');
            expect(DEFAULTS.timeout).toBe(30000);
            expect(DEFAULTS.maxRetries).toBe(3);
            expect(DEFAULTS.retryInitialWait).toBe(1000);
            expect(DEFAULTS.retryMaxWait).toBe(30000);
            expect(DEFAULTS.cacheMaxSize).toBe(100);
            expect(DEFAULTS.cacheTtl).toBe(300);
            expect(DEFAULTS.rateLimitAutoWait).toBe(true);
            expect(DEFAULTS.rateLimitThreshold).toBe(0);
        });

        it('loadConfig should return defaults when no env vars set', () => {
            delete process.env.FIGMA_TOKEN;
            delete process.env.FIGMA_ACCESS_TOKEN;
            delete process.env.FIGMA_API_BASE_URL;
            delete process.env.LOG_LEVEL;
            delete process.env.PORT;
            delete process.env.HOST;
            delete process.env.RATE_LIMIT_AUTO_WAIT;
            delete process.env.RATE_LIMIT_THRESHOLD;
            delete process.env.FIGMA_TIMEOUT;
            delete process.env.CACHE_MAX_SIZE;
            delete process.env.CACHE_TTL;
            delete process.env.MAX_RETRIES;

            const config = loadConfig();
            expect(config.figmaToken).toBeUndefined();
            expect(config.figmaApiBaseUrl).toBe('https://api.figma.com');
            expect(config.logLevel).toBe('info');
            expect(config.port).toBe(3108);
            expect(config.host).toBe('0.0.0.0');
            expect(config.rateLimitAutoWait).toBe(true);
            expect(config.rateLimitThreshold).toBe(0);
            expect(config.timeout).toBe(30000);
            expect(config.cacheMaxSize).toBe(100);
            expect(config.cacheTtl).toBe(300);
            expect(config.maxRetries).toBe(3);
        });
    });

    describe('Branch Coverage', () => {
        it('should use FIGMA_TOKEN when set', () => {
            process.env.FIGMA_TOKEN = 'my-token-123';
            delete process.env.FIGMA_ACCESS_TOKEN;
            const config = loadConfig();
            expect(config.figmaToken).toBe('my-token-123');
        });

        it('should fall back to FIGMA_ACCESS_TOKEN when FIGMA_TOKEN not set', () => {
            delete process.env.FIGMA_TOKEN;
            process.env.FIGMA_ACCESS_TOKEN = 'access-token-456';
            const config = loadConfig();
            expect(config.figmaToken).toBe('access-token-456');
        });

        it('should prefer FIGMA_TOKEN over FIGMA_ACCESS_TOKEN', () => {
            process.env.FIGMA_TOKEN = 'primary-token';
            process.env.FIGMA_ACCESS_TOKEN = 'secondary-token';
            const config = loadConfig();
            expect(config.figmaToken).toBe('primary-token');
        });

        it('should return undefined figmaToken when neither token env var set', () => {
            delete process.env.FIGMA_TOKEN;
            delete process.env.FIGMA_ACCESS_TOKEN;
            const config = loadConfig();
            expect(config.figmaToken).toBeUndefined();
        });

        it('RATE_LIMIT_AUTO_WAIT = "false" should be false', () => {
            process.env.RATE_LIMIT_AUTO_WAIT = 'false';
            const config = loadConfig();
            expect(config.rateLimitAutoWait).toBe(false);
        });

        it('RATE_LIMIT_AUTO_WAIT = "true" should be true', () => {
            process.env.RATE_LIMIT_AUTO_WAIT = 'true';
            const config = loadConfig();
            expect(config.rateLimitAutoWait).toBe(true);
        });

        it('RATE_LIMIT_AUTO_WAIT not set should default to true', () => {
            delete process.env.RATE_LIMIT_AUTO_WAIT;
            const config = loadConfig();
            expect(config.rateLimitAutoWait).toBe(true);
        });

        it('should read all custom env var values', () => {
            process.env.FIGMA_TOKEN = 'custom-token';
            process.env.FIGMA_API_BASE_URL = 'https://custom.api.com';
            process.env.LOG_LEVEL = 'debug';
            process.env.PORT = '4000';
            process.env.HOST = '127.0.0.1';
            process.env.RATE_LIMIT_AUTO_WAIT = 'false';
            process.env.RATE_LIMIT_THRESHOLD = '10';
            process.env.FIGMA_TIMEOUT = '60000';
            process.env.CACHE_MAX_SIZE = '200';
            process.env.CACHE_TTL = '600';
            process.env.MAX_RETRIES = '5';

            const config = loadConfig();
            expect(config.figmaToken).toBe('custom-token');
            expect(config.figmaApiBaseUrl).toBe('https://custom.api.com');
            expect(config.logLevel).toBe('debug');
            expect(config.port).toBe(4000);
            expect(config.host).toBe('127.0.0.1');
            expect(config.rateLimitAutoWait).toBe(false);
            expect(config.rateLimitThreshold).toBe(10);
            expect(config.timeout).toBe(60000);
            expect(config.cacheMaxSize).toBe(200);
            expect(config.cacheTtl).toBe(600);
            expect(config.maxRetries).toBe(5);
        });
    });

    describe('Boundary Values', () => {
        it('PORT with non-numeric string should result in NaN', () => {
            process.env.PORT = 'not-a-number';
            const config = loadConfig();
            expect(config.port).toBeNaN();
        });

        it('PORT with "0" should be 0', () => {
            process.env.PORT = '0';
            const config = loadConfig();
            expect(config.port).toBe(0);
        });

        it('FIGMA_TIMEOUT with "0" should be 0', () => {
            process.env.FIGMA_TIMEOUT = '0';
            const config = loadConfig();
            expect(config.timeout).toBe(0);
        });

        it('MAX_RETRIES with "0" should be 0', () => {
            process.env.MAX_RETRIES = '0';
            const config = loadConfig();
            expect(config.maxRetries).toBe(0);
        });

        it('CACHE_MAX_SIZE with "1" should be 1', () => {
            process.env.CACHE_MAX_SIZE = '1';
            const config = loadConfig();
            expect(config.cacheMaxSize).toBe(1);
        });
    });
});
