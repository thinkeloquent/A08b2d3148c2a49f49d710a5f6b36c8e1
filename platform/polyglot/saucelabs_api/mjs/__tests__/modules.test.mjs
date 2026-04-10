/**
 * Unit tests for domain modules (jobs, platform, users)
 *
 * Tests cover:
 * - Statement coverage for all module methods
 * - Branch coverage for validation and optional params
 * - Boundary value analysis
 * - Error handling verification
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobsModule } from '../src/modules/jobs.mjs';
import { PlatformModule } from '../src/modules/platform.mjs';
import { UsersModule } from '../src/modules/users.mjs';
import { SaucelabsValidationError } from '../src/errors.mjs';

function createMockClient(overrides = {}) {
  return {
    username: 'test_user',
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn().mockResolvedValue({}),
    _request: vi.fn().mockResolvedValue({}),
    ...overrides,
  };
}

describe('JobsModule', () => {
  let client;
  let jobs;

  beforeEach(() => {
    process.env.LOG_LEVEL = 'silent';
    client = createMockClient();
    jobs = new JobsModule(client);
  });

  // =====================================================================
  // Statement Coverage
  // =====================================================================
  describe('Statement Coverage', () => {
    it('lists jobs with default limit', async () => {
      await jobs.list();
      expect(client.get).toHaveBeenCalledWith(
        '/rest/v1/test_user/jobs',
        { params: { limit: 25, format: 'json' } },
      );
    });

    it('gets a specific job', async () => {
      await jobs.get('abc123');
      expect(client.get).toHaveBeenCalledWith('/rest/v1.1/test_user/jobs/abc123');
    });
  });

  // =====================================================================
  // Branch Coverage
  // =====================================================================
  describe('Branch Coverage', () => {
    it('lists jobs with custom limit and skip', async () => {
      await jobs.list({ limit: 5, skip: 10 });
      expect(client.get).toHaveBeenCalledWith(
        '/rest/v1/test_user/jobs',
        { params: { limit: 5, skip: 10, format: 'json' } },
      );
    });

    it('lists jobs with from and to params', async () => {
      await jobs.list({ from: 1000000, to: 2000000 });
      expect(client.get).toHaveBeenCalledWith(
        '/rest/v1/test_user/jobs',
        { params: { limit: 25, format: 'json', from: 1000000, to: 2000000 } },
      );
    });

    it('validates from as positive integer', async () => {
      await expect(jobs.list({ from: -1 })).rejects.toThrow(SaucelabsValidationError);
    });

    it('validates from as integer (rejects float)', async () => {
      await expect(jobs.list({ from: 1.5 })).rejects.toThrow(SaucelabsValidationError);
    });

    it('validates to as positive integer', async () => {
      await expect(jobs.list({ to: -1 })).rejects.toThrow(SaucelabsValidationError);
    });

    it('validates to as integer (rejects float)', async () => {
      await expect(jobs.list({ to: 1.5 })).rejects.toThrow(SaucelabsValidationError);
    });

    it('defaults params to empty object when not provided', async () => {
      await jobs.list();
      expect(client.get).toHaveBeenCalled();
    });
  });

  // =====================================================================
  // Error Handling
  // =====================================================================
  describe('Error Handling', () => {
    it('throws when username is missing for list', async () => {
      client.username = '';
      await expect(jobs.list()).rejects.toThrow(SaucelabsValidationError);
      await expect(jobs.list()).rejects.toThrow('username is required');
    });

    it('throws when username is missing for get', async () => {
      client.username = '';
      await expect(jobs.get('abc')).rejects.toThrow(SaucelabsValidationError);
    });

    it('throws when jobId is empty', async () => {
      await expect(jobs.get('')).rejects.toThrow(SaucelabsValidationError);
      await expect(jobs.get('')).rejects.toThrow('jobId is required');
    });
  });

  // =====================================================================
  // Boundary Values
  // =====================================================================
  describe('Boundary Values', () => {
    it('from=0 is accepted', async () => {
      await jobs.list({ from: 0 });
      expect(client.get).toHaveBeenCalled();
    });

    it('to=0 is accepted', async () => {
      await jobs.list({ to: 0 });
      expect(client.get).toHaveBeenCalled();
    });

    it('limit=0 is accepted', async () => {
      await jobs.list({ limit: 0 });
      const callArgs = client.get.mock.calls[0];
      expect(callArgs[1].params.limit).toBe(0);
    });
  });
});

describe('PlatformModule', () => {
  let client;
  let platform;

  beforeEach(() => {
    process.env.LOG_LEVEL = 'silent';
    client = createMockClient();
    platform = new PlatformModule(client);
  });

  // =====================================================================
  // Statement Coverage
  // =====================================================================
  describe('Statement Coverage', () => {
    it('gets service status', async () => {
      await platform.getStatus();
      expect(client.get).toHaveBeenCalledWith('/rest/v1/info/status');
    });

    it('gets platforms with valid filter', async () => {
      await platform.getPlatforms('appium');
      expect(client.get).toHaveBeenCalledWith('/rest/v1/info/platforms/appium');
    });
  });

  // =====================================================================
  // Branch Coverage
  // =====================================================================
  describe('Branch Coverage', () => {
    it('accepts "all" as automation_api', async () => {
      await platform.getPlatforms('all');
      expect(client.get).toHaveBeenCalledWith('/rest/v1/info/platforms/all');
    });

    it('accepts "webdriver" as automation_api', async () => {
      await platform.getPlatforms('webdriver');
      expect(client.get).toHaveBeenCalledWith('/rest/v1/info/platforms/webdriver');
    });
  });

  // =====================================================================
  // Error Handling
  // =====================================================================
  describe('Error Handling', () => {
    it('throws on invalid automation_api', async () => {
      await expect(platform.getPlatforms('invalid')).rejects.toThrow(SaucelabsValidationError);
    });

    it('throws on empty automation_api', async () => {
      await expect(platform.getPlatforms('')).rejects.toThrow(SaucelabsValidationError);
    });
  });
});

describe('UsersModule', () => {
  let client;
  let users;

  beforeEach(() => {
    process.env.LOG_LEVEL = 'silent';
    client = createMockClient();
    users = new UsersModule(client);
  });

  // =====================================================================
  // Statement Coverage
  // =====================================================================
  describe('Statement Coverage', () => {
    it('gets current user info', async () => {
      await users.getUser();
      expect(client.get).toHaveBeenCalledWith('/rest/v1.2/users/test_user');
    });

    it('gets specific user info', async () => {
      await users.getUser('other_user');
      expect(client.get).toHaveBeenCalledWith('/rest/v1.2/users/other_user');
    });

    it('gets concurrency for current user', async () => {
      await users.getConcurrency();
      expect(client.get).toHaveBeenCalledWith('/rest/v1.2/users/test_user/concurrency');
    });
  });

  // =====================================================================
  // Branch Coverage
  // =====================================================================
  describe('Branch Coverage', () => {
    it('gets concurrency for specific user', async () => {
      await users.getConcurrency('other');
      expect(client.get).toHaveBeenCalledWith('/rest/v1.2/users/other/concurrency');
    });
  });
});
