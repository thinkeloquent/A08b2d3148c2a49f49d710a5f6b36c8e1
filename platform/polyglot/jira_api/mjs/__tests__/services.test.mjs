/**
 * Unit tests for services (UserService, IssueService, ProjectService)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/logger.mjs', () => ({
  createLogger: () => ({
    debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(),
  }),
}));

import { UserService } from '../src/services/user-service.mjs';
import { IssueService } from '../src/services/issue-service.mjs';
import { ProjectService } from '../src/services/project-service.mjs';

function createMockClient() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  };
}

describe('UserService', () => {
  let client;
  let svc;

  beforeEach(() => {
    client = createMockClient();
    svc = new UserService(client);
  });

  describe('Statement Coverage', () => {
    it('getUserById calls correct endpoint', async () => {
      client.get.mockResolvedValue({ accountId: 'acc1', displayName: 'User' });
      const result = await svc.getUserById('acc1');
      expect(client.get).toHaveBeenCalledWith('/rest/api/3/user', {
        queryParams: { accountId: 'acc1' },
      });
      expect(result.accountId).toBe('acc1');
    });

    it('searchUsers calls correct endpoint', async () => {
      client.get.mockResolvedValue([]);
      await svc.searchUsers('test', 10);
      expect(client.get).toHaveBeenCalledWith('/rest/api/3/user/search', {
        queryParams: { query: 'test', maxResults: 10 },
      });
    });

    it('searchUsers defaults maxResults to 50', async () => {
      client.get.mockResolvedValue([]);
      await svc.searchUsers('test');
      expect(client.get).toHaveBeenCalledWith('/rest/api/3/user/search', {
        queryParams: { query: 'test', maxResults: 50 },
      });
    });

    it('findAssignableUsers builds query with project keys', async () => {
      client.get.mockResolvedValue([]);
      await svc.findAssignableUsers(['PROJ', 'OTH'], 'test');
      expect(client.get).toHaveBeenCalledWith(
        '/rest/api/3/user/assignable/multiProjectSearch',
        { queryParams: { projectKeys: 'PROJ,OTH', maxResults: 50, query: 'test' } },
      );
    });
  });

  describe('Branch Coverage', () => {
    it('getUserByEmail returns matching user', async () => {
      client.get.mockResolvedValue([
        { accountId: 'acc1', emailAddress: 'user@test.com' },
      ]);
      const result = await svc.getUserByEmail('user@test.com');
      expect(result.accountId).toBe('acc1');
    });

    it('getUserByEmail returns null when no match', async () => {
      client.get.mockResolvedValue([
        { accountId: 'acc1', emailAddress: 'other@test.com' },
      ]);
      const result = await svc.getUserByEmail('user@test.com');
      expect(result).toBeNull();
    });

    it('getUserByEmail is case-insensitive', async () => {
      client.get.mockResolvedValue([
        { accountId: 'acc1', emailAddress: 'USER@TEST.COM' },
      ]);
      const result = await svc.getUserByEmail('user@test.com');
      expect(result.accountId).toBe('acc1');
    });

    it('getUserByIdentifier falls back to email on error', async () => {
      client.get.mockRejectedValueOnce(new Error('not found'));
      client.get.mockResolvedValueOnce([
        { accountId: 'acc1', emailAddress: 'user@test.com' },
      ]);
      const result = await svc.getUserByIdentifier('user@test.com');
      expect(result.accountId).toBe('acc1');
    });

    it('getUserByIdentifier returns by ID when found', async () => {
      client.get.mockResolvedValue({ accountId: 'acc1', displayName: 'User' });
      const result = await svc.getUserByIdentifier('acc1');
      expect(result.accountId).toBe('acc1');
    });

    it('findAssignableUsers omits query when not provided', async () => {
      client.get.mockResolvedValue([]);
      await svc.findAssignableUsers(['PROJ']);
      const call = client.get.mock.calls[0][1];
      expect(call.queryParams.query).toBeUndefined();
    });
  });
});

describe('IssueService', () => {
  let client;
  let svc;

  beforeEach(() => {
    client = createMockClient();
    svc = new IssueService(client);
  });

  describe('Statement Coverage', () => {
    it('getIssue calls correct endpoint', async () => {
      client.get.mockResolvedValue({ key: 'PROJ-1' });
      const result = await svc.getIssue('PROJ-1');
      expect(client.get).toHaveBeenCalledWith('/rest/api/3/issue/PROJ-1');
      expect(result.key).toBe('PROJ-1');
    });

    it('updateIssueSummary calls PUT with formatted body', async () => {
      client.put.mockResolvedValue(undefined);
      await svc.updateIssueSummary('PROJ-1', 'New Title');
      expect(client.put).toHaveBeenCalledWith(
        '/rest/api/3/issue/PROJ-1',
        expect.objectContaining({ update: expect.objectContaining({ summary: [{ set: 'New Title' }] }) }),
      );
    });

    it('updateIssueDescription calls PUT with ADF body', async () => {
      client.put.mockResolvedValue(undefined);
      await svc.updateIssueDescription('PROJ-1', 'New desc');
      expect(client.put).toHaveBeenCalledWith(
        '/rest/api/3/issue/PROJ-1',
        expect.objectContaining({
          update: expect.objectContaining({
            description: expect.arrayContaining([
              expect.objectContaining({ set: expect.objectContaining({ type: 'doc' }) }),
            ]),
          }),
        }),
      );
    });

    it('addLabels calls PUT with label add operations', async () => {
      client.put.mockResolvedValue(undefined);
      await svc.addLabels('PROJ-1', ['bug', 'urgent']);
      const body = client.put.mock.calls[0][1];
      expect(body.update.labels).toContainEqual({ add: 'bug' });
      expect(body.update.labels).toContainEqual({ add: 'urgent' });
    });

    it('removeLabels calls PUT with label remove operations', async () => {
      client.put.mockResolvedValue(undefined);
      await svc.removeLabels('PROJ-1', ['old']);
      const body = client.put.mock.calls[0][1];
      expect(body.update.labels).toContainEqual({ remove: 'old' });
    });

    it('unassignIssue calls PUT with null accountId', async () => {
      client.put.mockResolvedValue(undefined);
      await svc.unassignIssue('PROJ-1');
      expect(client.put).toHaveBeenCalledWith(
        '/rest/api/3/issue/PROJ-1/assignee',
        { accountId: null },
      );
    });

    it('getAvailableTransitions returns transitions array', async () => {
      client.get.mockResolvedValue({ transitions: [{ id: '1', name: 'Done' }] });
      const result = await svc.getAvailableTransitions('PROJ-1');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Done');
    });

    it('transitionIssueById posts transition body', async () => {
      client.post.mockResolvedValue(undefined);
      await svc.transitionIssueById('PROJ-1', '5', 'Done', 'Fixed');
      expect(client.post).toHaveBeenCalledWith(
        '/rest/api/3/issue/PROJ-1/transitions',
        expect.objectContaining({ transition: { id: '5' } }),
      );
    });
  });

  describe('Branch Coverage', () => {
    it('createIssue resolves assignee by email', async () => {
      // getUserByEmail via searchUsers
      client.get.mockResolvedValueOnce([{ accountId: 'acc1', emailAddress: 'u@t.com' }]);
      // createIssue POST
      client.post.mockResolvedValueOnce({ key: 'PROJ-1' });
      // getIssue GET
      client.get.mockResolvedValueOnce({ key: 'PROJ-1', fields: {} });

      const result = await svc.createIssue({
        projectId: '1', summary: 'Test', issueTypeId: '10001',
        assigneeEmail: 'u@t.com',
      });
      expect(result.key).toBe('PROJ-1');
    });

    it('createIssue works without assignee email', async () => {
      client.post.mockResolvedValueOnce({ key: 'PROJ-2' });
      client.get.mockResolvedValueOnce({ key: 'PROJ-2', fields: {} });

      const result = await svc.createIssue({
        projectId: '1', summary: 'Test', issueTypeId: '10001',
      });
      expect(result.key).toBe('PROJ-2');
    });

    it('createIssue throws when key not returned', async () => {
      client.post.mockResolvedValueOnce({});
      await expect(svc.createIssue({
        projectId: '1', summary: 'Test', issueTypeId: '10001',
      })).rejects.toThrow('key not returned');
    });

    it('createIssueByTypeName finds matching type', async () => {
      client.get.mockResolvedValueOnce({
        id: '1', issueTypes: [{ id: '10001', name: 'Bug' }, { id: '10002', name: 'Task' }],
      });
      client.post.mockResolvedValueOnce({ key: 'PROJ-3' });
      client.get.mockResolvedValueOnce({ key: 'PROJ-3' });

      const result = await svc.createIssueByTypeName({
        projectKey: 'PROJ', summary: 'Test', issueTypeName: 'Bug',
      });
      expect(result.key).toBe('PROJ-3');
    });

    it('createIssueByTypeName throws for unknown type', async () => {
      client.get.mockResolvedValueOnce({
        id: '1', issueTypes: [{ id: '10001', name: 'Bug' }],
      });
      await expect(svc.createIssueByTypeName({
        projectKey: 'PROJ', summary: 'Test', issueTypeName: 'Epic',
      })).rejects.toThrow("Issue type 'Epic' not found");
    });

    it('assignIssueByEmail resolves user then assigns', async () => {
      client.get.mockResolvedValueOnce([{ accountId: 'acc1', emailAddress: 'u@t.com' }]);
      client.put.mockResolvedValueOnce(undefined);
      await svc.assignIssueByEmail('PROJ-1', 'u@t.com');
      expect(client.put).toHaveBeenCalledWith(
        '/rest/api/3/issue/PROJ-1/assignee',
        { accountId: 'acc1' },
      );
    });

    it('assignIssueByEmail throws when user not found', async () => {
      client.get.mockResolvedValueOnce([]);
      await expect(svc.assignIssueByEmail('PROJ-1', 'unknown@t.com'))
        .rejects.toThrow("User with email 'unknown@t.com' not found");
    });

    it('transitionIssueByName finds matching transition', async () => {
      client.get.mockResolvedValueOnce({
        transitions: [{ id: '5', name: 'Done' }, { id: '6', name: 'In Progress' }],
      });
      client.post.mockResolvedValueOnce(undefined);
      await svc.transitionIssueByName('PROJ-1', 'Done');
      expect(client.post).toHaveBeenCalledWith(
        '/rest/api/3/issue/PROJ-1/transitions',
        expect.objectContaining({ transition: { id: '5' } }),
      );
    });

    it('transitionIssueByName throws when not found', async () => {
      client.get.mockResolvedValueOnce({
        transitions: [{ id: '5', name: 'Done' }],
      });
      await expect(svc.transitionIssueByName('PROJ-1', 'Reopen'))
        .rejects.toThrow("Transition 'Reopen' not found");
    });

    it('getAvailableTransitions returns empty array when no transitions', async () => {
      client.get.mockResolvedValueOnce({});
      const result = await svc.getAvailableTransitions('PROJ-1');
      expect(result).toEqual([]);
    });
  });
});

describe('ProjectService', () => {
  let client;
  let svc;

  beforeEach(() => {
    client = createMockClient();
    svc = new ProjectService(client);
  });

  describe('Statement Coverage', () => {
    it('getProject calls correct endpoint', async () => {
      client.get.mockResolvedValue({ id: '1', key: 'PROJ', name: 'Project' });
      const result = await svc.getProject('PROJ');
      expect(client.get).toHaveBeenCalledWith('/rest/api/3/project/PROJ');
      expect(result.key).toBe('PROJ');
    });

    it('getProjectVersions returns all versions', async () => {
      client.get.mockResolvedValue([
        { id: '1', name: 'v1', released: true },
        { id: '2', name: 'v2', released: false },
      ]);
      const result = await svc.getProjectVersions('PROJ');
      expect(result).toHaveLength(2);
    });

    it('getIssueTypes calls correct endpoint', async () => {
      client.get.mockResolvedValue([{ id: '1', name: 'Bug' }]);
      const result = await svc.getIssueTypes();
      expect(client.get).toHaveBeenCalledWith('/rest/api/3/issuetype');
      expect(result).toHaveLength(1);
    });
  });

  describe('Branch Coverage', () => {
    it('getProjectVersions filters released when true', async () => {
      client.get.mockResolvedValue([
        { id: '1', name: 'v1', released: true },
        { id: '2', name: 'v2', released: false },
      ]);
      const result = await svc.getProjectVersions('PROJ', true);
      expect(result).toHaveLength(1);
      expect(result[0].released).toBe(true);
    });

    it('getProjectVersions filters unreleased when false', async () => {
      client.get.mockResolvedValue([
        { id: '1', name: 'v1', released: true },
        { id: '2', name: 'v2', released: false },
      ]);
      const result = await svc.getProjectVersions('PROJ', false);
      expect(result).toHaveLength(1);
      expect(result[0].released).toBe(false);
    });

    it('getReleasedVersions delegates with releasedOnly=true', async () => {
      client.get.mockResolvedValue([{ id: '1', released: true }]);
      const spy = vi.spyOn(svc, 'getProjectVersions');
      await svc.getReleasedVersions('PROJ');
      expect(spy).toHaveBeenCalledWith('PROJ', true);
    });

    it('getUnreleasedVersions delegates with releasedOnly=false', async () => {
      client.get.mockResolvedValue([{ id: '1', released: false }]);
      const spy = vi.spyOn(svc, 'getProjectVersions');
      await svc.getUnreleasedVersions('PROJ');
      expect(spy).toHaveBeenCalledWith('PROJ', false);
    });

    it('getVersionByName returns matching version', async () => {
      client.get.mockResolvedValue([
        { id: '1', name: 'v1.0' },
        { id: '2', name: 'v2.0' },
      ]);
      const result = await svc.getVersionByName('PROJ', 'v2.0');
      expect(result.id).toBe('2');
    });

    it('getVersionByName returns null when not found', async () => {
      client.get.mockResolvedValue([{ id: '1', name: 'v1.0' }]);
      const result = await svc.getVersionByName('PROJ', 'v3.0');
      expect(result).toBeNull();
    });

    it('createVersion builds body with optional fields', async () => {
      client.get.mockResolvedValue({ id: '10' });
      client.post.mockResolvedValue({ id: '100', name: 'v1.0' });
      await svc.createVersion({
        projectKey: 'PROJ', versionName: 'v1.0',
        description: 'First', startDate: '2025-01-01', releaseDate: '2025-06-01',
      });
      expect(client.post).toHaveBeenCalledWith('/rest/api/3/version', {
        name: 'v1.0', projectId: 10, archived: false, released: false,
        description: 'First', startDate: '2025-01-01', releaseDate: '2025-06-01',
      });
    });

    it('createVersion omits optional fields when absent', async () => {
      client.get.mockResolvedValue({ id: '10' });
      client.post.mockResolvedValue({ id: '100', name: 'v1.0' });
      await svc.createVersion({ projectKey: 'PROJ', versionName: 'v1.0' });
      const body = client.post.mock.calls[0][1];
      expect(body.description).toBeUndefined();
      expect(body.startDate).toBeUndefined();
      expect(body.releaseDate).toBeUndefined();
    });
  });
});
