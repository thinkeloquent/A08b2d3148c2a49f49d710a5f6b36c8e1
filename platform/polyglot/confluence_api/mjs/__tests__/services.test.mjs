/**
 * Unit tests for confluence_api service classes.
 *
 * Tests cover:
 * - Statement coverage for constructors and key methods
 * - Branch coverage for optional parameters
 * - Error handling with mocked client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentService } from '../src/services/content-service.mjs';
import { SearchService } from '../src/services/search-service.mjs';
import { SpaceService } from '../src/services/space-service.mjs';
import { UserService } from '../src/services/user-service.mjs';
import { GroupService } from '../src/services/group-service.mjs';
import { AdminService } from '../src/services/admin-service.mjs';
import { SystemService } from '../src/services/system-service.mjs';
import { LabelService } from '../src/services/label-service.mjs';
import { ColorSchemeService } from '../src/services/color-scheme-service.mjs';
import { WebhookService } from '../src/services/webhook-service.mjs';
import { BackupService } from '../src/services/backup-service.mjs';
import { SpacePermissionService } from '../src/services/space-permission-service.mjs';
import { AttachmentService } from '../src/services/attachment-service.mjs';

function createMockClient() {
  return {
    get: vi.fn().mockResolvedValue({ results: [], size: 0, start: 0, limit: 25 }),
    post: vi.fn().mockResolvedValue({ id: '123', title: 'Test' }),
    put: vi.fn().mockResolvedValue({ id: '123', title: 'Updated' }),
    delete: vi.fn().mockResolvedValue(null),
    patch: vi.fn().mockResolvedValue({ id: '123' }),
    getRaw: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  };
}

describe('ContentService', () => {
  let client;
  let svc;

  beforeEach(() => {
    client = createMockClient();
    svc = new ContentService(client);
  });

  describe('Statement Coverage', () => {
    it('should store client reference', () => {
      expect(svc._client).toBe(client);
    });

    it('should get content by ID', async () => {
      client.get.mockResolvedValue({ id: '123', title: 'Test Page', type: 'page' });
      const result = await svc.getContent('123');
      expect(result.id).toBe('123');
      expect(client.get).toHaveBeenCalledOnce();
    });

    it('should get contents list', async () => {
      client.get.mockResolvedValue({ results: [{ id: '1' }, { id: '2' }], size: 2 });
      const result = await svc.getContents();
      expect(result.results).toHaveLength(2);
    });

    it('should create content', async () => {
      client.post.mockResolvedValue({ id: '456', title: 'New Page' });
      const result = await svc.createContent({
        type: 'page',
        title: 'New Page',
        spaceKey: 'DEV',
        body: '<p>Content</p>',
      });
      expect(result.id).toBe('456');
      expect(client.post).toHaveBeenCalledOnce();
    });

    it('should update content', async () => {
      client.put.mockResolvedValue({ id: '123', title: 'Updated' });
      const result = await svc.updateContent('123', {
        title: 'Updated',
        versionNumber: 2,
      });
      expect(result.title).toBe('Updated');
    });

    it('should delete content', async () => {
      await svc.deleteContent('123');
      expect(client.delete).toHaveBeenCalledOnce();
    });
  });

  describe('Branch Coverage', () => {
    it('should pass expand parameter when provided', async () => {
      client.get.mockResolvedValue({ id: '123' });
      await svc.getContent('123', { expand: 'body.storage' });
      const callArgs = JSON.stringify(client.get.mock.calls[0]);
      expect(callArgs).toContain('expand');
    });

    it('should pass type filter in getContents', async () => {
      await svc.getContents({ type: 'page' });
      const callArgs = JSON.stringify(client.get.mock.calls[0]);
      expect(callArgs).toContain('page');
    });
  });

  describe('Error Handling', () => {
    it('should propagate client errors', async () => {
      client.get.mockRejectedValue(new Error('Not found'));
      await expect(svc.getContent('999')).rejects.toThrow('Not found');
    });
  });
});

describe('SearchService', () => {
  let client;
  let svc;

  beforeEach(() => {
    client = createMockClient();
    svc = new SearchService(client);
  });

  it('should search content with CQL', async () => {
    client.get.mockResolvedValue({ results: [{ title: 'Found' }], totalSize: 1 });
    const result = await svc.searchContent('type = "page"');
    expect(result.results).toHaveLength(1);
    expect(client.get).toHaveBeenCalledOnce();
  });

  it('should pass limit and start params', async () => {
    client.get.mockResolvedValue({ results: [], totalSize: 0 });
    await svc.searchContent('space = "DEV"', { limit: 10, start: 5 });
    expect(client.get).toHaveBeenCalledOnce();
  });
});

describe('SpaceService', () => {
  let client;
  let svc;

  beforeEach(() => {
    client = createMockClient();
    svc = new SpaceService(client);
  });

  it('should get spaces', async () => {
    client.get.mockResolvedValue({ results: [{ key: 'DEV' }], size: 1 });
    const result = await svc.getSpaces();
    expect(result.results).toHaveLength(1);
  });

  it('should get a single space', async () => {
    client.get.mockResolvedValue({ key: 'DEV', name: 'Development' });
    const result = await svc.getSpace('DEV');
    expect(result.key).toBe('DEV');
  });

  it('should create a space', async () => {
    client.post.mockResolvedValue({ key: 'NEW', name: 'New Space' });
    const result = await svc.createSpace({ key: 'NEW', name: 'New Space' });
    expect(result.key).toBe('NEW');
  });

  it('should delete a space', async () => {
    await svc.deleteSpace('DEV');
    expect(client.delete).toHaveBeenCalledOnce();
  });
});

describe('UserService', () => {
  let client;

  beforeEach(() => {
    client = createMockClient();
  });

  it('should get user by key', async () => {
    client.get.mockResolvedValue({ type: 'known', displayName: 'Admin' });
    const svc = new UserService(client);
    const result = await svc.getUser('admin-key');
    expect(result.displayName).toBe('Admin');
  });

  it('should get current user', async () => {
    client.get.mockResolvedValue({ type: 'known', displayName: 'Current' });
    const svc = new UserService(client);
    const result = await svc.getCurrentUser();
    expect(result.displayName).toBe('Current');
  });
});

describe('GroupService', () => {
  it('should get groups', async () => {
    const client = createMockClient();
    client.get.mockResolvedValue({ results: [{ name: 'dev' }], size: 1 });
    const svc = new GroupService(client);
    const result = await svc.getGroups();
    expect(result.results).toHaveLength(1);
  });

  it('should get single group', async () => {
    const client = createMockClient();
    client.get.mockResolvedValue({ name: 'developers' });
    const svc = new GroupService(client);
    const result = await svc.getGroup('developers');
    expect(result.name).toBe('developers');
  });
});

describe('AdminService', () => {
  it('should create user', async () => {
    const client = createMockClient();
    client.post.mockResolvedValue({ type: 'known' });
    const svc = new AdminService(client);
    const result = await svc.createUser({
      username: 'newuser',
      email: 'new@test.com',
      displayName: 'New User',
    });
    expect(client.post).toHaveBeenCalledOnce();
  });

  it('should delete user', async () => {
    const client = createMockClient();
    const svc = new AdminService(client);
    await svc.deleteUser('user-key');
    expect(client.delete).toHaveBeenCalledOnce();
  });
});

describe('SystemService', () => {
  it('should get server info', async () => {
    const client = createMockClient();
    client.get.mockResolvedValue({ baseUrl: 'https://conf.test', version: '9.2.3' });
    const svc = new SystemService(client);
    const result = await svc.getServerInfo();
    expect(result.version).toBe('9.2.3');
  });

  it('should get instance metrics', async () => {
    const client = createMockClient();
    client.get.mockResolvedValue({ currentUsers: 42 });
    const svc = new SystemService(client);
    const result = await svc.getInstanceMetrics();
    expect(result.currentUsers).toBe(42);
  });
});

describe('LabelService', () => {
  it('should get related labels', async () => {
    const client = createMockClient();
    client.get.mockResolvedValue({ results: [{ name: 'arch' }] });
    const svc = new LabelService(client);
    const result = await svc.getRelatedLabels('architecture');
    expect(result.results).toHaveLength(1);
  });
});

describe('ColorSchemeService', () => {
  it('should get default color scheme', async () => {
    const client = createMockClient();
    client.get.mockResolvedValue({ topColor: '#205081' });
    const svc = new ColorSchemeService(client);
    const result = await svc.getDefaultColorScheme();
    expect(result.topColor).toBe('#205081');
  });
});

describe('WebhookService', () => {
  it('should get webhooks', async () => {
    const client = createMockClient();
    client.get.mockResolvedValue({ results: [{ id: 1 }], size: 1 });
    const svc = new WebhookService(client);
    const result = await svc.getWebhooks();
    expect(result.results).toHaveLength(1);
  });
});

describe('BackupService', () => {
  it('should get jobs', async () => {
    const client = createMockClient();
    const svc = new BackupService(client);
    const result = await svc.getJobs();
    expect(result.size).toBe(0);
  });
});

describe('SpacePermissionService', () => {
  it('should get permissions', async () => {
    const client = createMockClient();
    client.get.mockResolvedValue({ results: [{ operation: 'read' }] });
    const svc = new SpacePermissionService(client);
    const result = await svc.getPermissions('DEV');
    expect(result.results).toHaveLength(1);
  });
});

describe('AttachmentService', () => {
  it('should store client reference', () => {
    const client = createMockClient();
    const svc = new AttachmentService(client);
    expect(svc._client).toBe(client);
  });
});
