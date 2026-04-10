/**
 * Unit tests for config.mjs
 *
 * Tests cover:
 * - Statement coverage for resolveCoreBaseUrl, resolveMobileBaseUrl, resolveConfig
 * - Branch coverage for env vars, overrides, regions, defaults
 * - Boundary value analysis
 * - Error handling verification
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveCoreBaseUrl, resolveMobileBaseUrl, resolveConfig } from '../src/config.mjs';

const ORIGINAL_ENV = { ...process.env };

describe('Config', () => {
  beforeEach(() => {
    process.env.LOG_LEVEL = 'silent';
    delete process.env.SAUCE_USERNAME;
    delete process.env.SAUCE_ACCESS_KEY;
    delete process.env.SAUCELABS_USERNAME;
    delete process.env.SAUCELABS_ACCESS_KEY;
    delete process.env.HTTPS_PROXY;
    delete process.env.HTTP_PROXY;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  // =====================================================================
  // Statement Coverage — resolveCoreBaseUrl
  // =====================================================================
  describe('resolveCoreBaseUrl – Statement Coverage', () => {
    it('returns default us-west-1 URL when no args', () => {
      expect(resolveCoreBaseUrl()).toBe('https://api.us-west-1.saucelabs.com');
    });

    it('returns eu-central-1 URL for that region', () => {
      expect(resolveCoreBaseUrl('eu-central-1')).toBe('https://api.eu-central-1.saucelabs.com');
    });

    it('returns us-east-4 URL for that region', () => {
      expect(resolveCoreBaseUrl('us-east-4')).toBe('https://api.us-east-4.saucelabs.com');
    });

    it('returns override URL when provided', () => {
      expect(resolveCoreBaseUrl('us-west-1', 'https://custom.example.com/')).toBe('https://custom.example.com');
    });
  });

  // =====================================================================
  // Statement Coverage — resolveMobileBaseUrl
  // =====================================================================
  describe('resolveMobileBaseUrl – Statement Coverage', () => {
    it('returns default mobile URL when no args', () => {
      expect(resolveMobileBaseUrl()).toBe('https://mobile.saucelabs.com');
    });

    it('returns eu-central-1 mobile URL', () => {
      expect(resolveMobileBaseUrl('eu-central-1')).toBe('https://mobile.eu-central-1.saucelabs.com');
    });

    it('returns override URL when provided', () => {
      expect(resolveMobileBaseUrl('us-east', 'https://mobile.custom.com/')).toBe('https://mobile.custom.com');
    });
  });

  // =====================================================================
  // Branch Coverage
  // =====================================================================
  describe('Branch Coverage', () => {
    it('falls back to default when region is unknown', () => {
      expect(resolveCoreBaseUrl('ap-southeast-1')).toBe('https://api.us-west-1.saucelabs.com');
    });

    it('falls back to default mobile when region is unknown', () => {
      expect(resolveMobileBaseUrl('ap-southeast-1')).toBe('https://mobile.saucelabs.com');
    });

    it('strips trailing slashes from override URL', () => {
      expect(resolveCoreBaseUrl('us-west-1', 'https://example.com///')).toBe('https://example.com');
    });

    it('strips trailing slashes from mobile override', () => {
      expect(resolveMobileBaseUrl('us-east', 'https://mobile.example.com//')).toBe('https://mobile.example.com');
    });
  });

  // =====================================================================
  // resolveConfig – Statement Coverage
  // =====================================================================
  describe('resolveConfig – Statement Coverage', () => {
    it('resolves defaults when nothing is set', () => {
      const config = resolveConfig();
      expect(config.username).toBe('');
      expect(config.apiKey).toBe('');
      expect(config.baseUrl).toBe('https://api.us-west-1.saucelabs.com');
      expect(config.mobileBaseUrl).toBe('https://mobile.saucelabs.com');
      expect(config.region).toBe('us-west-1');
      expect(config.mobileRegion).toBe('us-east');
      expect(config.rateLimitAutoWait).toBe(true);
      expect(config.timeout).toBe(30000);
      expect(config.verifySsl).toBe(true);
    });

    it('resolves from env vars', () => {
      process.env.SAUCE_USERNAME = 'env_user';
      process.env.SAUCE_ACCESS_KEY = 'env_key';
      const config = resolveConfig();
      expect(config.username).toBe('env_user');
      expect(config.apiKey).toBe('env_key');
    });

    it('resolves from SAUCELABS_ env vars as fallback', () => {
      process.env.SAUCELABS_USERNAME = 'alt_user';
      process.env.SAUCELABS_ACCESS_KEY = 'alt_key';
      const config = resolveConfig();
      expect(config.username).toBe('alt_user');
      expect(config.apiKey).toBe('alt_key');
    });

    it('options override env vars', () => {
      process.env.SAUCE_USERNAME = 'env_user';
      process.env.SAUCE_ACCESS_KEY = 'env_key';
      const config = resolveConfig({ username: 'opt_user', apiKey: 'opt_key' });
      expect(config.username).toBe('opt_user');
      expect(config.apiKey).toBe('opt_key');
    });

    it('region option selects correct base URL', () => {
      const config = resolveConfig({ region: 'eu-central-1' });
      expect(config.baseUrl).toBe('https://api.eu-central-1.saucelabs.com');
      expect(config.region).toBe('eu-central-1');
    });

    it('mobileRegion option selects correct mobile URL', () => {
      const config = resolveConfig({ mobileRegion: 'eu-central-1' });
      expect(config.mobileBaseUrl).toBe('https://mobile.eu-central-1.saucelabs.com');
    });

    it('baseUrl override takes precedence over region', () => {
      const config = resolveConfig({ region: 'eu-central-1', baseUrl: 'https://custom.api.com' });
      expect(config.baseUrl).toBe('https://custom.api.com');
    });

    it('resolves proxy from options', () => {
      const config = resolveConfig({ proxy: 'http://proxy.local:8080' });
      expect(config.proxy).toBe('http://proxy.local:8080');
    });

    it('resolves proxy from HTTPS_PROXY env var', () => {
      process.env.HTTPS_PROXY = 'http://env-proxy.local:3128';
      const config = resolveConfig();
      expect(config.proxy).toBe('http://env-proxy.local:3128');
    });

    it('resolves proxy from HTTP_PROXY fallback', () => {
      process.env.HTTP_PROXY = 'http://http-proxy.local:3128';
      const config = resolveConfig();
      expect(config.proxy).toBe('http://http-proxy.local:3128');
    });
  });

  // =====================================================================
  // resolveConfig – Branch Coverage
  // =====================================================================
  describe('resolveConfig – Branch Coverage', () => {
    it('rateLimitAutoWait can be disabled', () => {
      const config = resolveConfig({ rateLimitAutoWait: false });
      expect(config.rateLimitAutoWait).toBe(false);
    });

    it('timeout can be customized', () => {
      const config = resolveConfig({ timeout: 60000 });
      expect(config.timeout).toBe(60000);
    });

    it('verifySsl can be disabled', () => {
      const config = resolveConfig({ verifySsl: false });
      expect(config.verifySsl).toBe(false);
    });

    it('accepts custom logger', () => {
      const myLogger = { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} };
      const config = resolveConfig({ logger: myLogger });
      expect(config.logger).toBe(myLogger);
    });

    it('accepts onRateLimit callback', () => {
      const cb = () => {};
      const config = resolveConfig({ onRateLimit: cb });
      expect(config.onRateLimit).toBe(cb);
    });
  });

  // =====================================================================
  // Boundary Values
  // =====================================================================
  describe('Boundary Values', () => {
    it('empty options object resolves defaults', () => {
      const config = resolveConfig({});
      expect(config.username).toBe('');
      expect(config.apiKey).toBe('');
    });

    it('timeout of 0 is honored', () => {
      const config = resolveConfig({ timeout: 0 });
      expect(config.timeout).toBe(0);
    });

    it('rateLimitThreshold defaults to 0', () => {
      const config = resolveConfig();
      expect(config.rateLimitThreshold).toBe(0);
    });
  });
});
