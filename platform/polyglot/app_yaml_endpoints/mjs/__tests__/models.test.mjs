/**
 * Unit tests for the Models module.
 *
 * Coverage:
 * - createEndpointConfig parsing and defaults
 * - createFetchConfig creation
 * - Field mapping
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createEndpointConfig, createFetchConfig } from '../src/models.mjs';

describe('createEndpointConfig', () => {
    it('should parse all fields from object', () => {
        const data = {
            baseUrl: 'http://localhost:8000/api',
            description: 'Test endpoint',
            method: 'POST',
            headers: { 'X-Custom': 'value' },
            timeout: 60000,
            bodyType: 'json',
        };

        const config = createEndpointConfig(data);

        assert.equal(config.baseUrl, 'http://localhost:8000/api');
        assert.equal(config.description, 'Test endpoint');
        assert.equal(config.method, 'POST');
        assert.deepEqual(config.headers, { 'X-Custom': 'value' });
        assert.equal(config.timeout, 60000);
        assert.equal(config.bodyType, 'json');
    });

    it('should use defaults for missing fields', () => {
        const data = { baseUrl: 'http://localhost:8000' };
        const config = createEndpointConfig(data);

        assert.equal(config.baseUrl, 'http://localhost:8000');
        assert.equal(config.description, '');
        assert.equal(config.method, 'POST');
        assert.deepEqual(config.headers, {});
        assert.equal(config.timeout, 30000);
        assert.equal(config.bodyType, 'json');
    });

    it('should accept lowercase baseurl key', () => {
        const data = { baseurl: 'http://example.com' };
        const config = createEndpointConfig(data);

        assert.equal(config.baseUrl, 'http://example.com');
    });

    it('should handle empty object', () => {
        const config = createEndpointConfig({});

        assert.equal(config.baseUrl, '');
        assert.equal(config.method, 'POST');
        assert.equal(config.timeout, 30000);
    });

    it('should accept text body type', () => {
        const data = { baseUrl: 'http://localhost', bodyType: 'text' };
        const config = createEndpointConfig(data);

        assert.equal(config.bodyType, 'text');
    });
});

describe('createFetchConfig', () => {
    it('should create config with all fields', () => {
        const config = createFetchConfig({
            serviceId: 'llm001',
            url: 'http://localhost:8000/api',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{"prompt": "test"}',
            timeout: 30000,
        });

        assert.equal(config.serviceId, 'llm001');
        assert.equal(config.url, 'http://localhost:8000/api');
        assert.equal(config.method, 'POST');
        assert.deepEqual(config.headers, { 'Content-Type': 'application/json' });
        assert.equal(config.body, '{"prompt": "test"}');
        assert.equal(config.headersTimeout, 30000);
    });

    it('should map timeout to headersTimeout', () => {
        const config = createFetchConfig({
            serviceId: 'test',
            url: 'http://example.com',
            method: 'GET',
            headers: {},
            body: '',
            timeout: 10000,
        });

        assert.equal(config.headersTimeout, 10000);
        assert.equal(config.timeout, undefined);
    });
});

describe('boundary values', () => {
    it('should handle empty headers dict', () => {
        const config = createEndpointConfig({ baseUrl: 'http://test' });
        assert.deepEqual(config.headers, {});
    });

    it('should accept zero timeout', () => {
        const config = createEndpointConfig({ baseUrl: 'http://test', timeout: 0 });
        assert.equal(config.timeout, 0);
    });

    it('should accept large timeout values', () => {
        const config = createEndpointConfig({ baseUrl: 'http://test', timeout: 600000 });
        assert.equal(config.timeout, 600000);
    });

    it('should handle JSON body string', () => {
        const payload = { messages: [{ role: 'user', content: 'Hello' }] };
        const body = JSON.stringify(payload);

        const config = createFetchConfig({
            serviceId: 'llm001',
            url: 'http://localhost',
            method: 'POST',
            headers: {},
            body,
            timeout: 30000,
        });

        assert.deepEqual(JSON.parse(config.body), payload);
    });
});
