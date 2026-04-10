/**
 * Unit tests for config.mjs
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadConfigFromEnv, getServerConfig } from '../src/config.mjs';

const ORIGINAL_ENV = { ...process.env };

describe('Config', () => {
  beforeEach(() => {
    delete process.env.JIRA_BASE_URL;
    delete process.env.JIRA_EMAIL;
    delete process.env.JIRA_API_TOKEN;
    process.env.LOG_LEVEL = 'silent';
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  describe('loadConfigFromEnv', () => {
    describe('Statement Coverage', () => {
      it('returns config when all env vars set', () => {
        process.env.JIRA_BASE_URL = 'https://test.atlassian.net';
        process.env.JIRA_EMAIL = 'test@example.com';
        process.env.JIRA_API_TOKEN = 'tok123';
        const config = loadConfigFromEnv();
        expect(config).not.toBeNull();
        expect(config.baseUrl).toBe('https://test.atlassian.net');
        expect(config.email).toBe('test@example.com');
        expect(config.apiToken).toBe('tok123');
      });
    });

    describe('Branch Coverage', () => {
      it('returns null when JIRA_BASE_URL missing', () => {
        process.env.JIRA_EMAIL = 'e';
        process.env.JIRA_API_TOKEN = 't';
        expect(loadConfigFromEnv()).toBeNull();
      });

      it('returns null when JIRA_EMAIL missing', () => {
        process.env.JIRA_BASE_URL = 'u';
        process.env.JIRA_API_TOKEN = 't';
        expect(loadConfigFromEnv()).toBeNull();
      });

      it('returns null when JIRA_API_TOKEN missing', () => {
        process.env.JIRA_BASE_URL = 'u';
        process.env.JIRA_EMAIL = 'e';
        expect(loadConfigFromEnv()).toBeNull();
      });

      it('returns null when all missing', () => {
        expect(loadConfigFromEnv()).toBeNull();
      });
    });
  });

  describe('getServerConfig', () => {
    describe('Statement Coverage', () => {
      it('returns defaults', () => {
        const config = getServerConfig();
        expect(config.host).toBe('0.0.0.0');
        expect(config.port).toBe(8000);
        expect(config.reload).toBe(false);
        expect(config.apiKey).toBeUndefined();
      });
    });

    describe('Branch Coverage', () => {
      it('reads from env vars', () => {
        process.env.SERVER_HOST = '127.0.0.1';
        process.env.SERVER_PORT = '3000';
        process.env.SERVER_RELOAD = 'true';
        process.env.SERVER_API_KEY = 'my_key';
        const config = getServerConfig();
        expect(config.host).toBe('127.0.0.1');
        expect(config.port).toBe(3000);
        expect(config.reload).toBe(true);
        expect(config.apiKey).toBe('my_key');
      });
    });
  });
});
