/**
 * Unit tests for the EndpointConfigSDK class.
 *
 * Coverage:
 * - Factory function
 * - All SDK methods: getByKey, getByName, getByTag, getAll,
 *   resolveIntent, listKeys, properties, loadConfig,
 *   refreshConfig, loadFromFile, getFetchConfig
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { EndpointConfigSDK, createEndpointConfigSDK } from '../src/sdk.mjs';

const SAMPLE_CONFIG = {
    endpoints: {
        llm001: {
            name: 'Primary LLM',
            tags: ['llm', 'gemini', 'primary'],
            baseUrl: 'http://localhost:51000/api/llm',
            description: 'Primary LLM Service',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000,
            bodyType: 'json',
        },
        llm002: {
            name: 'Secondary LLM',
            tags: ['llm', 'gemini', 'secondary'],
            baseUrl: 'http://localhost:52000/api/llm',
            description: 'Secondary LLM Service',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000,
            bodyType: 'json',
        },
        fastify: {
            name: 'Fastify Server',
            tags: ['server', 'nodejs'],
            baseUrl: 'http://localhost:51000',
            description: 'Fastify (Node.js)',
            method: 'GET',
            headers: {},
            timeout: 10000,
            bodyType: 'json',
        },
    },
    intent_mapping: {
        mappings: {
            chat: 'llm001',
            persona: 'llm001',
        },
        default_intent: 'llm001',
    },
};

describe('createEndpointConfigSDK', () => {
    it('should return an EndpointConfigSDK instance', () => {
        const sdk = createEndpointConfigSDK();
        assert.ok(sdk instanceof EndpointConfigSDK);
    });

    it('should accept filePath option', () => {
        const sdk = createEndpointConfigSDK({ filePath: '/tmp/test.yaml' });
        assert.ok(sdk instanceof EndpointConfigSDK);
    });
});

describe('EndpointConfigSDK', () => {
    let sdk;

    beforeEach(() => {
        sdk = new EndpointConfigSDK();
        sdk.loadConfig(SAMPLE_CONFIG);
    });

    describe('loadConfig', () => {
        it('should load config from object', () => {
            const keys = sdk.listKeys();
            assert.deepEqual(keys.sort(), ['fastify', 'llm001', 'llm002']);
        });
    });

    describe('getByKey', () => {
        it('should return endpoint for valid key', () => {
            const ep = sdk.getByKey('llm001');
            assert.ok(ep);
            assert.equal(ep.key, 'llm001');
            assert.equal(ep.name, 'Primary LLM');
            assert.equal(ep.baseUrl, 'http://localhost:51000/api/llm');
        });

        it('should return null for unknown key', () => {
            const ep = sdk.getByKey('unknown');
            assert.equal(ep, null);
        });

        it('should include key, name, and tags on returned endpoint', () => {
            const ep = sdk.getByKey('llm001');
            assert.equal(ep.key, 'llm001');
            assert.equal(ep.name, 'Primary LLM');
            assert.deepEqual(ep.tags, ['llm', 'gemini', 'primary']);
        });
    });

    describe('getByName', () => {
        it('should find endpoint by name', () => {
            const ep = sdk.getByName('Primary LLM');
            assert.ok(ep);
            assert.equal(ep.key, 'llm001');
        });

        it('should return null when name not found', () => {
            const ep = sdk.getByName('Nonexistent');
            assert.equal(ep, null);
        });

        it('should be case-sensitive', () => {
            const ep = sdk.getByName('primary llm');
            assert.equal(ep, null);
        });
    });

    describe('getByTag', () => {
        it('should return endpoints matching tag', () => {
            const results = sdk.getByTag('llm');
            assert.equal(results.length, 2);
            const keys = results.map((r) => r.key).sort();
            assert.deepEqual(keys, ['llm001', 'llm002']);
        });

        it('should return empty array for unknown tag', () => {
            const results = sdk.getByTag('nonexistent');
            assert.deepEqual(results, []);
        });

        it('should filter correctly for specific tag', () => {
            const results = sdk.getByTag('primary');
            assert.equal(results.length, 1);
            assert.equal(results[0].key, 'llm001');
        });
    });

    describe('getAll', () => {
        it('should return all endpoints', () => {
            const all = sdk.getAll();
            assert.equal(all.length, 3);
        });

        it('should return EndpointConfig objects with key field', () => {
            const all = sdk.getAll();
            for (const ep of all) {
                assert.ok(ep.key);
                assert.ok(ep.baseUrl);
            }
        });
    });

    describe('listKeys', () => {
        it('should return all endpoint keys', () => {
            const keys = sdk.listKeys();
            assert.equal(keys.length, 3);
            assert.ok(keys.includes('llm001'));
            assert.ok(keys.includes('llm002'));
            assert.ok(keys.includes('fastify'));
        });
    });

    describe('resolveIntent', () => {
        it('should resolve known intent to key and endpoint', () => {
            const result = sdk.resolveIntent('chat');
            assert.equal(result.key, 'llm001');
            assert.ok(result.endpoint);
            assert.equal(result.endpoint.baseUrl, 'http://localhost:51000/api/llm');
        });

        it('should resolve unknown intent to default', () => {
            const result = sdk.resolveIntent('unknown_intent');
            assert.equal(result.key, 'llm001');
            assert.ok(result.endpoint);
        });
    });

    describe('properties', () => {
        it('should get nested value by dot path', () => {
            const timeout = sdk.properties('endpoints.llm001.timeout');
            assert.equal(timeout, 30000);
        });

        it('should return default for missing path', () => {
            const val = sdk.properties('endpoints.missing.timeout', 5000);
            assert.equal(val, 5000);
        });

        it('should return undefined for missing path with no default', () => {
            const val = sdk.properties('endpoints.missing.timeout');
            assert.equal(val, undefined);
        });

        it('should get top-level value', () => {
            const mapping = sdk.properties('intent_mapping');
            assert.ok(mapping);
            assert.ok(mapping.mappings);
        });
    });

    describe('refreshConfig', () => {
        it('should throw when no filePath configured', () => {
            assert.throws(() => sdk.refreshConfig(), {
                message: /no filePath configured/,
            });
        });
    });

    describe('getFetchConfig', () => {
        it('should return fetch config for valid service ID', () => {
            const fc = sdk.getFetchConfig('llm001', { prompt: 'Hello' });
            assert.equal(fc.url, 'http://localhost:51000/api/llm');
            assert.equal(fc.method, 'POST');
            assert.ok(fc.body);
            assert.ok(fc.headersTimeout);
        });

        it('should throw for unknown service ID', () => {
            assert.throws(() => sdk.getFetchConfig('unknown', {}));
        });
    });
});
