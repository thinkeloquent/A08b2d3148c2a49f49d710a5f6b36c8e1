/**
 * Unit tests for the confluence_api config module.
 *
 * Tests cover:
 * - Statement coverage for all config resolution paths
 * - Branch coverage for priority chain (server config > env vars)
 * - Boundary value analysis (missing/partial/complete config)
 * - Error handling for invalid server config objects
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getConfig, loadConfigFromEnv, getServerConfig } from '../src/config.mjs';

describe('loadConfigFromEnv', () => {
  const savedEnv = {};

  beforeEach(() => {
    savedEnv.CONFLUENCE_BASE_URL = process.env.CONFLUENCE_BASE_URL;
    savedEnv.CONFLUENCE_USERNAME = process.env.CONFLUENCE_USERNAME;
    savedEnv.CONFLUENCE_API_TOKEN = process.env.CONFLUENCE_API_TOKEN;
    delete process.env.CONFLUENCE_BASE_URL;
    delete process.env.CONFLUENCE_USERNAME;
    delete process.env.CONFLUENCE_API_TOKEN;
  });

  afterEach(() => {
    for (const [key, val] of Object.entries(savedEnv)) {
      if (val !== undefined) process.env[key] = val;
      else delete process.env[key];
    }
  });

  describe('Statement Coverage', () => {
    it('should return object with expected keys', () => {
      const cfg = loadConfigFromEnv();
      expect(cfg).toHaveProperty('baseUrl');
      expect(cfg).toHaveProperty('username');
      expect(cfg).toHaveProperty('apiToken');
    });

    it('should read all env vars when set', () => {
      process.env.CONFLUENCE_BASE_URL = 'https://conf.test';
      process.env.CONFLUENCE_USERNAME = 'admin';
      process.env.CONFLUENCE_API_TOKEN = 'tok-123';

      const cfg = loadConfigFromEnv();
      expect(cfg.baseUrl).toBe('https://conf.test');
      expect(cfg.username).toBe('admin');
      expect(cfg.apiToken).toBe('tok-123');
    });
  });

  describe('Branch Coverage', () => {
    it('should return null for missing base URL', () => {
      process.env.CONFLUENCE_USERNAME = 'u';
      process.env.CONFLUENCE_API_TOKEN = 't';
      const cfg = loadConfigFromEnv();
      expect(cfg.baseUrl).toBeNull();
    });

    it('should return null for missing username', () => {
      process.env.CONFLUENCE_BASE_URL = 'http://x';
      process.env.CONFLUENCE_API_TOKEN = 't';
      const cfg = loadConfigFromEnv();
      expect(cfg.username).toBeNull();
    });

    it('should return null for missing token', () => {
      process.env.CONFLUENCE_BASE_URL = 'http://x';
      process.env.CONFLUENCE_USERNAME = 'u';
      const cfg = loadConfigFromEnv();
      expect(cfg.apiToken).toBeNull();
    });
  });

  describe('Boundary Values', () => {
    it('should return all null when no env vars set', () => {
      const cfg = loadConfigFromEnv();
      expect(cfg).toEqual({ baseUrl: null, username: null, apiToken: null });
    });
  });
});

describe('getServerConfig', () => {
  describe('Statement Coverage', () => {
    it('should extract config using getNested', () => {
      const server = {
        config: {
          getNested: (path) => {
            const map = {
              'providers,confluence,base_url': 'https://srv.test',
              'providers,confluence,username': 'srv-user',
              'providers,confluence,api_token': 'srv-tok',
            };
            return map[path.join(',')];
          },
        },
      };

      const cfg = getServerConfig(server);
      expect(cfg.baseUrl).toBe('https://srv.test');
      expect(cfg.username).toBe('srv-user');
      expect(cfg.apiToken).toBe('srv-tok');
    });
  });

  describe('Branch Coverage', () => {
    it('should return nulls when server is null', () => {
      const cfg = getServerConfig(null);
      expect(cfg).toEqual({ baseUrl: null, username: null, apiToken: null });
    });

    it('should return nulls when server has no config', () => {
      const cfg = getServerConfig({});
      expect(cfg).toEqual({ baseUrl: null, username: null, apiToken: null });
    });

    it('should return nulls when config has no getNested', () => {
      const cfg = getServerConfig({ config: {} });
      expect(cfg).toEqual({ baseUrl: null, username: null, apiToken: null });
    });
  });

  describe('Error Handling', () => {
    it('should handle getNested throwing', () => {
      const server = {
        config: {
          getNested: () => {
            throw new Error('broken');
          },
        },
      };
      const cfg = getServerConfig(server);
      expect(cfg).toEqual({ baseUrl: null, username: null, apiToken: null });
    });
  });
});

describe('getConfig', () => {
  const savedEnv = {};

  beforeEach(() => {
    savedEnv.CONFLUENCE_BASE_URL = process.env.CONFLUENCE_BASE_URL;
    savedEnv.CONFLUENCE_USERNAME = process.env.CONFLUENCE_USERNAME;
    savedEnv.CONFLUENCE_API_TOKEN = process.env.CONFLUENCE_API_TOKEN;
    delete process.env.CONFLUENCE_BASE_URL;
    delete process.env.CONFLUENCE_USERNAME;
    delete process.env.CONFLUENCE_API_TOKEN;
  });

  afterEach(() => {
    for (const [key, val] of Object.entries(savedEnv)) {
      if (val !== undefined) process.env[key] = val;
      else delete process.env[key];
    }
  });

  describe('Statement Coverage', () => {
    it('should prefer complete server config over env', () => {
      process.env.CONFLUENCE_BASE_URL = 'https://env.test';
      process.env.CONFLUENCE_USERNAME = 'env-u';
      process.env.CONFLUENCE_API_TOKEN = 'env-t';

      const server = {
        getNested: (path) => {
          const map = {
            'providers,confluence,base_url': 'https://srv.test',
            'providers,confluence,username': 'srv-u',
            'providers,confluence,api_token': 'srv-t',
          };
          return map[path.join(',')];
        },
      };

      const cfg = getConfig(server);
      expect(cfg.baseUrl).toBe('https://srv.test');
    });

    it('should fall back to env when no server config', () => {
      process.env.CONFLUENCE_BASE_URL = 'https://env.test';
      process.env.CONFLUENCE_USERNAME = 'env-u';
      process.env.CONFLUENCE_API_TOKEN = 'env-t';

      const cfg = getConfig(null);
      expect(cfg.baseUrl).toBe('https://env.test');
    });
  });

  describe('Branch Coverage', () => {
    it('should fall back to env when server config incomplete', () => {
      process.env.CONFLUENCE_BASE_URL = 'https://fallback.test';
      process.env.CONFLUENCE_USERNAME = 'fb-u';
      process.env.CONFLUENCE_API_TOKEN = 'fb-t';

      const server = {
        getNested: () => null,
      };

      const cfg = getConfig(server);
      expect(cfg.baseUrl).toBe('https://fallback.test');
    });

    it('should return all null when nothing configured', () => {
      const cfg = getConfig();
      expect(cfg.baseUrl).toBeNull();
      expect(cfg.username).toBeNull();
      expect(cfg.apiToken).toBeNull();
    });
  });
});
