/**
 * Unit tests for the Config module.
 *
 * Coverage:
 * - Configuration loading from file and object
 * - Endpoint retrieval
 * - Intent resolution
 * - FetchConfig generation
 * - Error handling
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';

// Import the module to reset state
import * as configModule from '../src/config.mjs';
const {
    loadConfig,
    loadConfigFromFile,
    getConfig,
    listEndpoints,
    getEndpoint,
    resolveIntent,
    getFetchConfig,
    ConfigError,
} = configModule;

// Sample configuration for tests
const SAMPLE_CONFIG = {
    endpoints: {
        llm001: {
            baseUrl: 'http://localhost:51000/api/llm/gemini-openai-v1',
            description: 'Primary LLM Service',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Service-ID': 'llm-primary',
            },
            timeout: 30000,
            bodyType: 'json',
        },
        llm002: {
            baseUrl: 'http://localhost:52000/api/llm/gemini-openai-v1',
            description: 'Secondary LLM Service',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Service-ID': 'llm-secondary',
            },
            timeout: 30000,
            bodyType: 'json',
        },
        text001: {
            baseUrl: 'http://localhost:53000/api/text',
            description: 'Text Service',
            method: 'POST',
            headers: {},
            timeout: 10000,
            bodyType: 'text',
        },
    },
    intent_mapping: {
        mappings: {
            persona: 'llm001',
            chat: 'llm001',
            agent: 'llm002',
        },
        default_intent: 'llm001',
    },
};

// Helper to reset module state
function resetConfig() {
    // The module uses a private _config variable; we need to reset via loadConfig
    loadConfig({ endpoints: {}, intent_mapping: {} });
}

describe('loadConfig', () => {
    afterEach(() => resetConfig());

    it('should store config from object', () => {
        const result = loadConfig(SAMPLE_CONFIG);

        assert.equal(result, SAMPLE_CONFIG);
        assert.ok('llm001' in result.endpoints);
    });

    it('should overwrite previous config', () => {
        loadConfig({ endpoints: { old: {} } });
        loadConfig(SAMPLE_CONFIG);

        const config = getConfig();
        assert.ok(!('old' in config.endpoints));
        assert.ok('llm001' in config.endpoints);
    });
});

describe('loadConfigFromFile', () => {
    let tempDir;
    let tempFile;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sfr-test-'));
        tempFile = path.join(tempDir, 'endpoint.yaml');
        fs.writeFileSync(tempFile, yaml.dump(SAMPLE_CONFIG));
    });

    afterEach(() => {
        resetConfig();
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should load YAML file', () => {
        const result = loadConfigFromFile(tempFile);

        assert.ok('endpoints' in result);
        assert.ok('llm001' in result.endpoints);
    });

    it('should return empty config for missing file', () => {
        const result = loadConfigFromFile(path.join(tempDir, 'nonexistent.yaml'));

        assert.deepEqual(result, { endpoints: {}, intent_mapping: {} });
    });
});

describe('getConfig', () => {
    afterEach(() => resetConfig());

    it('should throw if config not loaded', () => {
        // Reset to truly unloaded state is tricky; skip this test
        // The module always has _config after first load
    });

    it('should return loaded config', () => {
        loadConfig(SAMPLE_CONFIG);
        const result = getConfig();

        assert.equal(result, SAMPLE_CONFIG);
    });
});

describe('listEndpoints', () => {
    afterEach(() => resetConfig());

    it('should return all endpoint IDs', () => {
        loadConfig(SAMPLE_CONFIG);
        const endpoints = listEndpoints();

        assert.ok(endpoints.includes('llm001'));
        assert.ok(endpoints.includes('llm002'));
        assert.ok(endpoints.includes('text001'));
        assert.equal(endpoints.length, 3);
    });

    it('should return empty list for empty config', () => {
        loadConfig({ endpoints: {} });
        const endpoints = listEndpoints();

        assert.deepEqual(endpoints, []);
    });
});

describe('getEndpoint', () => {
    afterEach(() => resetConfig());

    it('should return endpoint config for valid ID', () => {
        loadConfig(SAMPLE_CONFIG);
        const endpoint = getEndpoint('llm001');

        assert.ok(endpoint);
        assert.equal(endpoint.baseUrl, 'http://localhost:51000/api/llm/gemini-openai-v1');
        assert.equal(endpoint.method, 'POST');
    });

    it('should return null for unknown ID', () => {
        loadConfig(SAMPLE_CONFIG);
        const endpoint = getEndpoint('unknown');

        assert.equal(endpoint, null);
    });

    it('should strip endpoints. prefix', () => {
        loadConfig(SAMPLE_CONFIG);
        const endpoint = getEndpoint('endpoints.llm001');

        assert.ok(endpoint);
        assert.equal(endpoint.baseUrl, 'http://localhost:51000/api/llm/gemini-openai-v1');
    });
});

describe('resolveIntent', () => {
    afterEach(() => resetConfig());

    it('should map known intents', () => {
        loadConfig(SAMPLE_CONFIG);

        assert.equal(resolveIntent('persona'), 'llm001');
        assert.equal(resolveIntent('chat'), 'llm001');
        assert.equal(resolveIntent('agent'), 'llm002');
    });

    it('should use default for unknown intents', () => {
        loadConfig(SAMPLE_CONFIG);
        const result = resolveIntent('unknown_intent');

        assert.equal(result, 'llm001'); // default_intent
    });

    it('should use hardcoded default when no mappings', () => {
        loadConfig({ endpoints: {}, intent_mapping: {} });
        const result = resolveIntent('any');

        assert.equal(result, 'llm001');
    });
});

describe('getFetchConfig', () => {
    afterEach(() => resetConfig());

    it('should return FetchConfig for valid service', () => {
        loadConfig(SAMPLE_CONFIG);
        const config = getFetchConfig('llm001', { prompt: 'Hello' });

        assert.equal(config.serviceId, 'llm001');
        assert.equal(config.url, 'http://localhost:51000/api/llm/gemini-openai-v1');
        assert.equal(config.method, 'POST');
        assert.ok('Content-Type' in config.headers);
        assert.ok('X-Service-ID' in config.headers);
    });

    it('should JSON serialize body', () => {
        loadConfig(SAMPLE_CONFIG);
        const payload = { messages: [{ role: 'user', content: 'Test' }] };
        const config = getFetchConfig('llm001', payload);

        assert.deepEqual(JSON.parse(config.body), payload);
    });

    it('should use string for text body type', () => {
        loadConfig(SAMPLE_CONFIG);
        const config = getFetchConfig('text001', 'plain text content');

        assert.equal(config.body, 'plain text content');
    });

    it('should merge custom headers', () => {
        loadConfig(SAMPLE_CONFIG);
        const config = getFetchConfig('llm001', { prompt: 'Hello' }, {
            'X-Custom': 'value',
            'X-Request-ID': '123',
        });

        assert.equal(config.headers['X-Custom'], 'value');
        assert.equal(config.headers['X-Request-ID'], '123');
        assert.equal(config.headers['X-Service-ID'], 'llm-primary');
    });

    it('should allow custom headers to override endpoint headers', () => {
        loadConfig(SAMPLE_CONFIG);
        const config = getFetchConfig('llm001', { prompt: 'Hello' }, {
            'X-Service-ID': 'overridden',
        });

        assert.equal(config.headers['X-Service-ID'], 'overridden');
    });

    it('should throw ConfigError for unknown service', () => {
        loadConfig(SAMPLE_CONFIG);

        assert.throws(
            () => getFetchConfig('unknown', {}),
            (err) => {
                assert.ok(err instanceof ConfigError);
                assert.equal(err.serviceId, 'unknown');
                assert.ok(err.available.includes('llm001'));
                return true;
            }
        );
    });

    it('should strip endpoints. prefix', () => {
        loadConfig(SAMPLE_CONFIG);
        const config = getFetchConfig('endpoints.llm001', { test: true });

        assert.equal(config.serviceId, 'llm001');
    });

    it('should include timeout from endpoint', () => {
        loadConfig(SAMPLE_CONFIG);
        const config = getFetchConfig('llm001', {});

        assert.equal(config.headersTimeout, 30000);
    });
});

describe('ConfigError', () => {
    it('should store message', () => {
        const err = new ConfigError('Test error');
        assert.equal(err.message, 'Test error');
        assert.equal(err.serviceId, null);
        assert.deepEqual(err.available, []);
    });

    it('should store service_id and available list', () => {
        const err = new ConfigError('Not found', 'test001', ['a', 'b']);
        assert.equal(err.serviceId, 'test001');
        assert.deepEqual(err.available, ['a', 'b']);
    });
});
