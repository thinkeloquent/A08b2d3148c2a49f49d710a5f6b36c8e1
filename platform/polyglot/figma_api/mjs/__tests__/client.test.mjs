import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock undici
vi.mock('undici', () => ({
    request: vi.fn(),
}));

import { request } from 'undici';
import { FigmaClient } from '../src/sdk/client.mjs';

function mockResponse(statusCode, body, headers = {}) {
    return {
        statusCode,
        headers: headers,
        body: { text: () => Promise.resolve(JSON.stringify(body)) },
    };
}

describe('FigmaClient', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        vi.restoreAllMocks();
        request.mockReset();
        process.env.FIGMA_TOKEN = 'test-token-1234567890';
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    describe('Statement Coverage', () => {
        it('should create client with token from env', () => {
            const client = new FigmaClient();
            expect(client).toBeDefined();
            expect(client.stats.requestsMade).toBe(0);
        });

        it('should create client with explicit token', () => {
            const client = new FigmaClient({ token: 'explicit-token-123456' });
            expect(client).toBeDefined();
        });

        it('should make GET request', async () => {
            request.mockResolvedValueOnce(mockResponse(200, { projects: [] }));

            const client = new FigmaClient({ token: 'test-token-1234567890' });
            const result = await client.get('/v1/teams/123/projects');

            expect(result).toEqual({ projects: [] });
            expect(request).toHaveBeenCalledTimes(1);
        });

        it('should make POST request with body', async () => {
            request.mockResolvedValueOnce(mockResponse(200, { id: 'new' }));

            const client = new FigmaClient({ token: 'test-token-1234567890' });
            const result = await client.post('/v1/files/abc/comments', { message: 'hello' });

            expect(result).toEqual({ id: 'new' });
        });

        it('should make PUT request', async () => {
            request.mockResolvedValueOnce(mockResponse(200, { updated: true }));
            const client = new FigmaClient({ token: 'test-token-1234567890' });
            await client.put('/v1/resource', { data: 'test' });
            expect(request).toHaveBeenCalledTimes(1);
        });

        it('should make PATCH request', async () => {
            request.mockResolvedValueOnce(mockResponse(200, { patched: true }));
            const client = new FigmaClient({ token: 'test-token-1234567890' });
            await client.patch('/v1/resource', { data: 'test' });
            expect(request).toHaveBeenCalledTimes(1);
        });

        it('should make DELETE request', async () => {
            request.mockResolvedValueOnce(mockResponse(200, { deleted: true }));
            const client = new FigmaClient({ token: 'test-token-1234567890' });
            await client.delete('/v1/resource');
            expect(request).toHaveBeenCalledTimes(1);
        });

        it('should expose stats object', () => {
            const client = new FigmaClient({ token: 'test-token-1234567890' });
            const stats = client.stats;
            expect(stats.requestsMade).toBe(0);
            expect(stats.requestsFailed).toBe(0);
            expect(stats.cacheHits).toBe(0);
            expect(stats.cacheMisses).toBe(0);
            expect(stats.rateLimitWaits).toBe(0);
            expect(stats.rateLimitTotalWaitSeconds).toBe(0);
            expect(stats.cache).toBeDefined();
        });

        it('should increment requestsMade on request', async () => {
            request.mockResolvedValueOnce(mockResponse(200, {}));
            const client = new FigmaClient({ token: 'test-token-1234567890' });
            await client.get('/v1/test');
            expect(client.stats.requestsMade).toBe(1);
        });
    });

    describe('Branch Coverage', () => {
        it('should cache GET responses', async () => {
            request.mockResolvedValueOnce(mockResponse(200, { data: 'cached' }));

            const client = new FigmaClient({ token: 'test-token-1234567890' });
            const first = await client.get('/v1/test');
            const second = await client.get('/v1/test'); // should be cached

            expect(first).toEqual({ data: 'cached' });
            expect(second).toEqual({ data: 'cached' });
            expect(request).toHaveBeenCalledTimes(1);
            expect(client.stats.cacheHits).toBe(1);
        });

        it('should not cache POST responses', async () => {
            request
                .mockResolvedValueOnce(mockResponse(200, { id: 1 }))
                .mockResolvedValueOnce(mockResponse(200, { id: 2 }));

            const client = new FigmaClient({ token: 'test-token-1234567890' });
            await client.post('/v1/test', { data: 'a' });
            await client.post('/v1/test', { data: 'b' });
            expect(request).toHaveBeenCalledTimes(2);
        });

        it('should build URL with query params', async () => {
            request.mockResolvedValueOnce(mockResponse(200, { data: [] }));

            const client = new FigmaClient({ token: 'test-token-1234567890' });
            await client.get('/v1/files', { params: { depth: 2, geometry: 'paths' } });

            const calledUrl = request.mock.calls[0][0];
            expect(calledUrl).toContain('depth=2');
            expect(calledUrl).toContain('geometry=paths');
        });

        it('should filter null/undefined params', async () => {
            request.mockResolvedValueOnce(mockResponse(200, { data: [] }));

            const client = new FigmaClient({ token: 'test-token-1234567890' });
            await client.get('/v1/files', { params: { depth: 2, version: null, branch: undefined } });

            const calledUrl = request.mock.calls[0][0];
            expect(calledUrl).toContain('depth=2');
            expect(calledUrl).not.toContain('version');
            expect(calledUrl).not.toContain('branch');
        });

        it('should handle full URL paths', async () => {
            request.mockResolvedValueOnce(mockResponse(200, {}));

            const client = new FigmaClient({ token: 'test-token-1234567890' });
            await client.get('https://custom.api.com/path');

            expect(request.mock.calls[0][0]).toBe('https://custom.api.com/path');
        });

        it('should include X-Figma-Token header', async () => {
            request.mockResolvedValueOnce(mockResponse(200, {}));

            const client = new FigmaClient({ token: 'test-token-1234567890' });
            await client.get('/v1/test');

            const headers = request.mock.calls[0][1].headers;
            expect(headers['X-Figma-Token']).toBe('test-token-1234567890');
        });

        it('should include Content-Type and Accept headers', async () => {
            request.mockResolvedValueOnce(mockResponse(200, {}));

            const client = new FigmaClient({ token: 'test-token-1234567890' });
            await client.get('/v1/test');

            const headers = request.mock.calls[0][1].headers;
            expect(headers['Content-Type']).toBe('application/json');
            expect(headers['Accept']).toBe('application/json');
        });

        it('should normalize array headers', () => {
            const client = new FigmaClient({ token: 'test-token-1234567890' });
            const result = client._normalizeHeaders(['Content-Type', 'application/json', 'X-Custom', 'value']);
            expect(result['content-type']).toBe('application/json');
            expect(result['x-custom']).toBe('value');
        });

        it('should normalize object headers', () => {
            const client = new FigmaClient({ token: 'test-token-1234567890' });
            const result = client._normalizeHeaders({ 'Content-Type': 'application/json' });
            expect(result['content-type']).toBe('application/json');
        });

        it('should handle null/undefined headers in normalize', () => {
            const client = new FigmaClient({ token: 'test-token-1234567890' });
            expect(client._normalizeHeaders(null)).toEqual({});
            expect(client._normalizeHeaders(undefined)).toEqual({});
        });

        it('should use custom baseUrl when provided', async () => {
            request.mockResolvedValueOnce(mockResponse(200, {}));

            const client = new FigmaClient({
                token: 'test-token-1234567890',
                baseUrl: 'https://custom-api.example.com',
            });
            await client.get('/v1/test');

            const calledUrl = request.mock.calls[0][0];
            expect(calledUrl).toContain('https://custom-api.example.com/v1/test');
        });

        it('should strip trailing slashes from baseUrl', async () => {
            request.mockResolvedValueOnce(mockResponse(200, {}));

            const client = new FigmaClient({
                token: 'test-token-1234567890',
                baseUrl: 'https://api.figma.com///',
            });
            await client.get('/v1/test');

            const calledUrl = request.mock.calls[0][0];
            expect(calledUrl).toBe('https://api.figma.com/v1/test');
        });

        it('should build URL without params when params is empty', async () => {
            request.mockResolvedValueOnce(mockResponse(200, {}));

            const client = new FigmaClient({ token: 'test-token-1234567890' });
            await client.get('/v1/test', { params: {} });

            const calledUrl = request.mock.calls[0][0];
            expect(calledUrl).not.toContain('?');
        });
    });

    describe('Error Handling', () => {
        it('should throw mapped error for 404 response', async () => {
            request.mockResolvedValueOnce(mockResponse(404, { message: 'File not found' }));

            const client = new FigmaClient({ token: 'test-token-1234567890', maxRetries: 0 });
            await expect(client.get('/v1/files/missing')).rejects.toThrow('File not found');
        });

        it('should throw mapped error for 401 response', async () => {
            request.mockResolvedValueOnce(mockResponse(401, { message: 'Invalid token' }));

            const client = new FigmaClient({ token: 'test-token-1234567890', maxRetries: 0 });
            await expect(client.get('/v1/test')).rejects.toThrow('Invalid token');
        });

        it('should throw mapped error for 403 response', async () => {
            request.mockResolvedValueOnce(mockResponse(403, { message: 'Access denied' }));

            const client = new FigmaClient({ token: 'test-token-1234567890', maxRetries: 0 });
            await expect(client.get('/v1/test')).rejects.toThrow('Access denied');
        });

        it('should throw mapped error for 422 response', async () => {
            request.mockResolvedValueOnce(mockResponse(422, { message: 'Invalid params' }));

            const client = new FigmaClient({ token: 'test-token-1234567890', maxRetries: 0 });
            await expect(client.get('/v1/test')).rejects.toThrow('Invalid params');
        });

        it('should throw NetworkError on connection failure', async () => {
            request.mockRejectedValueOnce(new Error('connection refused'));

            const client = new FigmaClient({ token: 'test-token-1234567890', maxRetries: 0 });
            await expect(client.get('/v1/test')).rejects.toThrow(/Network error/);
        });

        it('should throw TimeoutError on connect timeout', async () => {
            const timeoutErr = new Error('timeout');
            timeoutErr.code = 'UND_ERR_CONNECT_TIMEOUT';
            request.mockRejectedValueOnce(timeoutErr);

            const client = new FigmaClient({ token: 'test-token-1234567890', maxRetries: 0 });
            await expect(client.get('/v1/test')).rejects.toThrow(/Request timed out/);
        });

        it('should throw TimeoutError on body timeout', async () => {
            const timeoutErr = new Error('body timeout');
            timeoutErr.code = 'UND_ERR_BODY_TIMEOUT';
            request.mockRejectedValueOnce(timeoutErr);

            const client = new FigmaClient({ token: 'test-token-1234567890', maxRetries: 0 });
            await expect(client.get('/v1/test')).rejects.toThrow(/Request timed out/);
        });

        it('should increment requestsFailed on error response', async () => {
            request.mockResolvedValueOnce(mockResponse(500, { message: 'error' }));

            const client = new FigmaClient({ token: 'test-token-1234567890', maxRetries: 0 });
            await expect(client.get('/v1/test')).rejects.toThrow();
            expect(client.stats.requestsFailed).toBe(1);
        });

        it('should handle non-JSON error response body', async () => {
            const response = {
                statusCode: 500,
                headers: {},
                body: { text: () => Promise.resolve('plain text error') },
            };
            request.mockResolvedValueOnce(response);

            const client = new FigmaClient({ token: 'test-token-1234567890', maxRetries: 0 });
            await expect(client.get('/v1/test')).rejects.toThrow();
        });

        it('should handle non-JSON success response body', async () => {
            const response = {
                statusCode: 200,
                headers: {},
                body: { text: () => Promise.resolve('not json') },
            };
            request.mockResolvedValueOnce(response);

            const client = new FigmaClient({ token: 'test-token-1234567890' });
            const result = await client.get('/v1/test');
            expect(result).toBe('not json');
        });

        it('should handle empty response body', async () => {
            const response = {
                statusCode: 200,
                headers: {},
                body: { text: () => Promise.resolve('') },
            };
            request.mockResolvedValueOnce(response);

            const client = new FigmaClient({ token: 'test-token-1234567890' });
            const result = await client.get('/v1/test');
            expect(result).toEqual({});
        });
    });

    describe('Integration', () => {
        it('should expose lastRateLimit after 429', async () => {
            request.mockResolvedValueOnce(mockResponse(429, { message: 'limited' }, { 'retry-after': '5' }));

            const client = new FigmaClient({
                token: 'test-token-1234567890',
                rateLimitAutoWait: false,
                maxRetries: 0,
            });

            await expect(client.get('/v1/test')).rejects.toThrow();
            expect(client.lastRateLimit).toBeDefined();
            expect(client.lastRateLimit.retryAfter).toBe(5);
        });

        it('should track rateLimitWaits in stats after 429', async () => {
            request.mockResolvedValueOnce(mockResponse(429, { message: 'limited' }, { 'retry-after': '10' }));

            const client = new FigmaClient({
                token: 'test-token-1234567890',
                rateLimitAutoWait: false,
                maxRetries: 0,
            });

            await expect(client.get('/v1/test')).rejects.toThrow();
            expect(client.stats.rateLimitWaits).toBe(1);
            expect(client.stats.rateLimitTotalWaitSeconds).toBe(10);
        });

        it('should use custom timeout in request options', async () => {
            request.mockResolvedValueOnce(mockResponse(200, {}));

            const client = new FigmaClient({
                token: 'test-token-1234567890',
                timeout: 5000,
            });
            await client.get('/v1/test');

            const opts = request.mock.calls[0][1];
            expect(opts.headersTimeout).toBe(5000);
            expect(opts.bodyTimeout).toBe(5000);
        });

        it('should send JSON body for POST requests', async () => {
            request.mockResolvedValueOnce(mockResponse(200, {}));

            const client = new FigmaClient({ token: 'test-token-1234567890' });
            await client.post('/v1/test', { key: 'value' });

            const opts = request.mock.calls[0][1];
            expect(opts.body).toBe(JSON.stringify({ key: 'value' }));
        });

        it('should track cacheMisses on first GET', async () => {
            request.mockResolvedValueOnce(mockResponse(200, { data: 'fresh' }));

            const client = new FigmaClient({ token: 'test-token-1234567890' });
            await client.get('/v1/test');
            expect(client.stats.cacheMisses).toBe(1);
        });
    });
});
