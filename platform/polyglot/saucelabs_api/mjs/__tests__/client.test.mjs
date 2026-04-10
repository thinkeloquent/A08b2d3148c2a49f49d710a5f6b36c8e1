/**
 * Unit tests for client.mjs
 *
 * Tests cover:
 * - Statement coverage for SaucelabsClient constructor, URL/header building
 * - Branch coverage for mobile vs core, params, auth
 * - Boundary value analysis
 * - Error handling verification
 * - Log verification
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SaucelabsClient } from '../src/client.mjs';

const ORIGINAL_ENV = { ...process.env };

describe('SaucelabsClient', () => {
  beforeEach(() => {
    process.env.SAUCE_USERNAME = 'test_user';
    process.env.SAUCE_ACCESS_KEY = 'test_key_12345678';
    process.env.LOG_LEVEL = 'silent';
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  // =====================================================================
  // Statement Coverage
  // =====================================================================
  describe('Statement Coverage', () => {
    it('creates a client with default config', () => {
      const client = new SaucelabsClient();
      expect(client.username).toBe('test_user');
      expect(client.lastRateLimit).toBeNull();
      expect(client._baseUrl).toBe('https://api.us-west-1.saucelabs.com');
      expect(client._mobileBaseUrl).toBe('https://mobile.saucelabs.com');
      client.close();
    });

    it('creates a client with explicit options', () => {
      const client = new SaucelabsClient({
        username: 'explicit_user',
        apiKey: 'explicit_key',
        region: 'eu-central-1',
      });
      expect(client.username).toBe('explicit_user');
      expect(client._baseUrl).toBe('https://api.eu-central-1.saucelabs.com');
      client.close();
    });

    it('builds correct Basic Auth header', () => {
      const client = new SaucelabsClient({
        username: 'user',
        apiKey: 'key123',
      });
      const headers = client._buildHeaders();
      expect(headers['Authorization']).toMatch(/^Basic /);
      const decoded = Buffer.from(headers['Authorization'].replace('Basic ', ''), 'base64').toString();
      expect(decoded).toBe('user:key123');
      client.close();
    });

    it('includes Accept and Content-Type headers', () => {
      const client = new SaucelabsClient();
      const headers = client._buildHeaders();
      expect(headers['Accept']).toBe('application/json');
      expect(headers['Content-Type']).toBe('application/json');
      client.close();
    });

    it('close() is callable', () => {
      const client = new SaucelabsClient();
      expect(() => client.close()).not.toThrow();
    });
  });

  // =====================================================================
  // Branch Coverage
  // =====================================================================
  describe('Branch Coverage', () => {
    it('builds core URL for regular path', () => {
      const client = new SaucelabsClient({
        username: 'u', apiKey: 'k',
        baseUrl: 'https://api.us-west-1.saucelabs.com',
      });
      expect(client._buildUrl('/rest/v1/u/jobs')).toBe('https://api.us-west-1.saucelabs.com/rest/v1/u/jobs');
      client.close();
    });

    it('builds mobile URL when mobile=true', () => {
      const client = new SaucelabsClient({
        username: 'u', apiKey: 'k',
        mobileBaseUrl: 'https://mobile.saucelabs.com',
      });
      expect(client._buildUrl('/api/upload/', { mobile: true })).toBe('https://mobile.saucelabs.com/api/upload/');
      client.close();
    });

    it('returns absolute URL unchanged', () => {
      const client = new SaucelabsClient();
      const url = 'https://external.api.com/path';
      expect(client._buildUrl(url)).toBe(url);
      client.close();
    });

    it('prepends slash to relative path', () => {
      const client = new SaucelabsClient({
        username: 'u', apiKey: 'k',
        baseUrl: 'https://api.example.com',
      });
      expect(client._buildUrl('rest/v1/jobs')).toBe('https://api.example.com/rest/v1/jobs');
      client.close();
    });

    it('omits Content-Type when contentType is null', () => {
      const client = new SaucelabsClient();
      const headers = client._buildHeaders({ contentType: null });
      expect(headers['Content-Type']).toBeUndefined();
      client.close();
    });

    it('omits Auth header when username or apiKey is empty', () => {
      delete process.env.SAUCE_USERNAME;
      delete process.env.SAUCE_ACCESS_KEY;
      delete process.env.SAUCELABS_USERNAME;
      delete process.env.SAUCELABS_ACCESS_KEY;
      const client = new SaucelabsClient({ username: '', apiKey: '' });
      const headers = client._buildHeaders();
      expect(headers['Authorization']).toBeUndefined();
      client.close();
    });

    it('close() is safe to call multiple times', () => {
      const client = new SaucelabsClient();
      expect(() => {
        client.close();
        client.close();
      }).not.toThrow();
    });
  });

  // =====================================================================
  // Boundary Values
  // =====================================================================
  describe('Boundary Values', () => {
    it('handles empty username and apiKey', () => {
      delete process.env.SAUCE_USERNAME;
      delete process.env.SAUCE_ACCESS_KEY;
      delete process.env.SAUCELABS_USERNAME;
      delete process.env.SAUCELABS_ACCESS_KEY;
      const client = new SaucelabsClient();
      expect(client.username).toBe('');
      client.close();
    });

    it('handles custom timeout of 0', () => {
      const client = new SaucelabsClient({ timeout: 0 });
      expect(client._timeout).toBe(0);
      client.close();
    });

    it('handles path without leading slash', () => {
      const client = new SaucelabsClient({ baseUrl: 'https://api.example.com' });
      const url = client._buildUrl('path/to/resource');
      expect(url).toBe('https://api.example.com/path/to/resource');
      client.close();
    });
  });

  // =====================================================================
  // Log Verification
  // =====================================================================
  describe('Log Verification', () => {
    it('logs initialization info', () => {
      const logs = [];
      const mockLogger = {
        debug: (msg) => logs.push({ level: 'debug', msg }),
        info: (msg) => logs.push({ level: 'info', msg }),
        warn: (msg) => logs.push({ level: 'warn', msg }),
        error: (msg) => logs.push({ level: 'error', msg }),
      };
      const client = new SaucelabsClient({ logger: mockLogger });
      expect(logs.some((l) => l.msg.includes('client initialized'))).toBe(true);
      client.close();
    });

    it('logs close event', () => {
      const logs = [];
      const mockLogger = {
        debug: (msg) => logs.push({ level: 'debug', msg }),
        info: (msg) => logs.push({ level: 'info', msg }),
        warn: () => {},
        error: () => {},
      };
      const client = new SaucelabsClient({ logger: mockLogger });
      client.close();
      expect(logs.some((l) => l.msg.includes('client closed'))).toBe(true);
    });
  });
});
