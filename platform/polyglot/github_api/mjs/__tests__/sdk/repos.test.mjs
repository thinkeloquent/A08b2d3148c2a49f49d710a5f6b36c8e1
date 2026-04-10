/**
 * Tests for ReposClient - GitHub Repository API operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReposClient } from '../../src/sdk/repos/client.mjs';
import { ValidationError } from '../../src/sdk/errors.mjs';
import { createMockClient } from '../helpers/index.mjs';

describe('ReposClient', () => {
  let mockClient;
  let repos;

  beforeEach(() => {
    mockClient = createMockClient();
    repos = new ReposClient(mockClient);
    // Silence the console-based logger that createLogger('repos') uses
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Statement Coverage
  // ---------------------------------------------------------------------------
  describe('Statement Coverage', () => {
    it('should call client.get with correct path for get(owner, repo)', async () => {
      mockClient.get.mockResolvedValue({ id: 1, full_name: 'octocat/hello-world' });
      const result = await repos.get('octocat', 'hello-world');
      expect(mockClient.get).toHaveBeenCalledWith('/repos/octocat/hello-world');
      expect(result).toEqual({ id: 1, full_name: 'octocat/hello-world' });
    });

    it('should call client.get with correct path and params for listForUser', async () => {
      mockClient.get.mockResolvedValue([{ id: 1 }]);
      const opts = { sort: 'updated', per_page: 10 };
      const result = await repos.listForUser('octocat', opts);
      expect(mockClient.get).toHaveBeenCalledWith('/users/octocat/repos', { params: opts });
      expect(result).toEqual([{ id: 1 }]);
    });

    it('should call client.get /user/repos for listForAuthenticatedUser', async () => {
      mockClient.get.mockResolvedValue([{ id: 2 }]);
      const opts = { visibility: 'public' };
      const result = await repos.listForAuthenticatedUser(opts);
      expect(mockClient.get).toHaveBeenCalledWith('/user/repos', { params: opts });
      expect(result).toEqual([{ id: 2 }]);
    });

    it('should call client.get with correct path for listForOrg', async () => {
      mockClient.get.mockResolvedValue([{ id: 3 }]);
      const opts = { type: 'public' };
      const result = await repos.listForOrg('github', opts);
      expect(mockClient.get).toHaveBeenCalledWith('/orgs/github/repos', { params: opts });
      expect(result).toEqual([{ id: 3 }]);
    });

    it('should call client.post /user/repos for create', async () => {
      mockClient.post.mockResolvedValue({ id: 4, name: 'new-repo' });
      const data = { name: 'new-repo', private: true };
      const result = await repos.create(data);
      expect(mockClient.post).toHaveBeenCalledWith('/user/repos', data);
      expect(result).toEqual({ id: 4, name: 'new-repo' });
    });

    it('should call client.post with org path for createInOrg', async () => {
      mockClient.post.mockResolvedValue({ id: 5, name: 'org-repo' });
      const data = { name: 'org-repo' };
      const result = await repos.createInOrg('my-org', data);
      expect(mockClient.post).toHaveBeenCalledWith('/orgs/my-org/repos', data);
      expect(result).toEqual({ id: 5, name: 'org-repo' });
    });

    it('should call client.patch for update', async () => {
      mockClient.patch.mockResolvedValue({ id: 1, description: 'updated' });
      const data = { description: 'updated' };
      const result = await repos.update('octocat', 'hello-world', data);
      expect(mockClient.patch).toHaveBeenCalledWith('/repos/octocat/hello-world', data);
      expect(result).toEqual({ id: 1, description: 'updated' });
    });

    it('should call client.delete for delete', async () => {
      mockClient.delete.mockResolvedValue({});
      const result = await repos.delete('octocat', 'hello-world');
      expect(mockClient.delete).toHaveBeenCalledWith('/repos/octocat/hello-world');
      expect(result).toEqual({});
    });

    it('should call client.get for getTopics', async () => {
      mockClient.get.mockResolvedValue({ names: ['javascript', 'api'] });
      const result = await repos.getTopics('octocat', 'hello-world');
      expect(mockClient.get).toHaveBeenCalledWith('/repos/octocat/hello-world/topics');
      expect(result).toEqual({ names: ['javascript', 'api'] });
    });

    it('should call client.put for replaceTopics', async () => {
      mockClient.put.mockResolvedValue({ names: ['go', 'cli'] });
      const result = await repos.replaceTopics('octocat', 'hello-world', ['go', 'cli']);
      expect(mockClient.put).toHaveBeenCalledWith('/repos/octocat/hello-world/topics', {
        names: ['go', 'cli'],
      });
      expect(result).toEqual({ names: ['go', 'cli'] });
    });

    it('should call client.get for getLanguages', async () => {
      mockClient.get.mockResolvedValue({ JavaScript: 1000, Python: 500 });
      const result = await repos.getLanguages('octocat', 'hello-world');
      expect(mockClient.get).toHaveBeenCalledWith('/repos/octocat/hello-world/languages');
      expect(result).toEqual({ JavaScript: 1000, Python: 500 });
    });

    it('should call client.get for listContributors with params', async () => {
      mockClient.get.mockResolvedValue([{ login: 'user1' }]);
      const opts = { anon: true, per_page: 50 };
      const result = await repos.listContributors('octocat', 'hello-world', opts);
      expect(mockClient.get).toHaveBeenCalledWith('/repos/octocat/hello-world/contributors', {
        params: opts,
      });
      expect(result).toEqual([{ login: 'user1' }]);
    });

    it('should call client.post for fork', async () => {
      mockClient.post.mockResolvedValue({ id: 10, fork: true });
      const opts = { organization: 'my-org' };
      const result = await repos.fork('octocat', 'hello-world', opts);
      expect(mockClient.post).toHaveBeenCalledWith('/repos/octocat/hello-world/forks', opts);
      expect(result).toEqual({ id: 10, fork: true });
    });

    it('should call client.get for listForks with params', async () => {
      mockClient.get.mockResolvedValue([{ id: 11 }]);
      const opts = { sort: 'newest' };
      const result = await repos.listForks('octocat', 'hello-world', opts);
      expect(mockClient.get).toHaveBeenCalledWith('/repos/octocat/hello-world/forks', {
        params: opts,
      });
      expect(result).toEqual([{ id: 11 }]);
    });

    it('should call client.post for transfer', async () => {
      mockClient.post.mockResolvedValue({ id: 1, owner: { login: 'new-owner' } });
      const result = await repos.transfer('octocat', 'hello-world', 'new-owner', {
        team_ids: [1, 2],
      });
      expect(mockClient.post).toHaveBeenCalledWith('/repos/octocat/hello-world/transfer', {
        new_owner: 'new-owner',
        team_ids: [1, 2],
      });
      expect(result).toEqual({ id: 1, owner: { login: 'new-owner' } });
    });

    it('should call client.put for star', async () => {
      mockClient.put.mockResolvedValue({});
      const result = await repos.star('octocat', 'hello-world');
      expect(mockClient.put).toHaveBeenCalledWith('/user/starred/octocat/hello-world');
      expect(result).toEqual({});
    });

    it('should call client.delete for unstar', async () => {
      mockClient.delete.mockResolvedValue({});
      const result = await repos.unstar('octocat', 'hello-world');
      expect(mockClient.delete).toHaveBeenCalledWith('/user/starred/octocat/hello-world');
      expect(result).toEqual({});
    });

    it('should return true from isStarred when client.get succeeds', async () => {
      mockClient.get.mockResolvedValue({});
      const result = await repos.isStarred('octocat', 'hello-world');
      expect(result).toBe(true);
      expect(mockClient.get).toHaveBeenCalledWith('/user/starred/octocat/hello-world');
    });

    it('should call client.put for watch with subscribed=true', async () => {
      mockClient.put.mockResolvedValue({ subscribed: true });
      const result = await repos.watch('octocat', 'hello-world');
      expect(mockClient.put).toHaveBeenCalledWith('/repos/octocat/hello-world/subscription', {
        subscribed: true,
      });
      expect(result).toEqual({ subscribed: true });
    });

    it('should call client.delete for unwatch', async () => {
      mockClient.delete.mockResolvedValue({});
      const result = await repos.unwatch('octocat', 'hello-world');
      expect(mockClient.delete).toHaveBeenCalledWith('/repos/octocat/hello-world/subscription');
      expect(result).toEqual({});
    });

    it('should call client.get for getSubscription', async () => {
      mockClient.get.mockResolvedValue({ subscribed: true, ignored: false });
      const result = await repos.getSubscription('octocat', 'hello-world');
      expect(mockClient.get).toHaveBeenCalledWith('/repos/octocat/hello-world/subscription');
      expect(result).toEqual({ subscribed: true, ignored: false });
    });
  });

  // ---------------------------------------------------------------------------
  // Branch Coverage
  // ---------------------------------------------------------------------------
  describe('Branch Coverage', () => {
    describe('isStarred', () => {
      it('should return true when client.get succeeds (204/200)', async () => {
        mockClient.get.mockResolvedValue({});
        const result = await repos.isStarred('octocat', 'hello-world');
        expect(result).toBe(true);
      });

      it('should return false when client.get throws a 404 error', async () => {
        const err = new Error('Not Found');
        err.status = 404;
        mockClient.get.mockRejectedValue(err);
        const result = await repos.isStarred('octocat', 'hello-world');
        expect(result).toBe(false);
      });

      it('should re-throw when client.get throws a non-404 error', async () => {
        const err = new Error('Server Error');
        err.status = 500;
        mockClient.get.mockRejectedValue(err);
        await expect(repos.isStarred('octocat', 'hello-world')).rejects.toThrow('Server Error');
      });
    });

    describe('update with data.name', () => {
      it('should validate data.name when it is provided', async () => {
        // Reserved name should throw
        await expect(
          repos.update('octocat', 'hello-world', { name: 'settings' }),
        ).rejects.toThrow(ValidationError);
      });

      it('should skip name validation when data.name is not provided', async () => {
        mockClient.patch.mockResolvedValue({ description: 'updated' });
        const result = await repos.update('octocat', 'hello-world', {
          description: 'updated',
        });
        expect(result).toEqual({ description: 'updated' });
        expect(mockClient.patch).toHaveBeenCalled();
      });

      it('should validate the new name when data.name is a valid name', async () => {
        mockClient.patch.mockResolvedValue({ name: 'new-name' });
        const result = await repos.update('octocat', 'hello-world', { name: 'new-name' });
        expect(result).toEqual({ name: 'new-name' });
      });
    });

    describe('listForUser with default options', () => {
      it('should pass empty object as params when no options given', async () => {
        mockClient.get.mockResolvedValue([]);
        await repos.listForUser('octocat');
        expect(mockClient.get).toHaveBeenCalledWith('/users/octocat/repos', { params: {} });
      });
    });

    describe('listContributors with default options', () => {
      it('should pass empty object as params when no options given', async () => {
        mockClient.get.mockResolvedValue([]);
        await repos.listContributors('octocat', 'hello-world');
        expect(mockClient.get).toHaveBeenCalledWith('/repos/octocat/hello-world/contributors', {
          params: {},
        });
      });
    });

    describe('fork with default options', () => {
      it('should pass empty object when no options given', async () => {
        mockClient.post.mockResolvedValue({});
        await repos.fork('octocat', 'hello-world');
        expect(mockClient.post).toHaveBeenCalledWith('/repos/octocat/hello-world/forks', {});
      });
    });

    describe('transfer with default options', () => {
      it('should pass only new_owner when no extra options given', async () => {
        mockClient.post.mockResolvedValue({});
        await repos.transfer('octocat', 'hello-world', 'new-owner');
        expect(mockClient.post).toHaveBeenCalledWith('/repos/octocat/hello-world/transfer', {
          new_owner: 'new-owner',
        });
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Boundary Values
  // ---------------------------------------------------------------------------
  describe('Boundary Values', () => {
    describe('owner validation', () => {
      it('should throw ValidationError for empty owner', async () => {
        await expect(repos.get('', 'hello-world')).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for null owner', async () => {
        await expect(repos.get(null, 'hello-world')).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for undefined owner', async () => {
        await expect(repos.get(undefined, 'hello-world')).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for owner with special chars', async () => {
        await expect(repos.get('user@name', 'hello-world')).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for owner starting with hyphen', async () => {
        await expect(repos.get('-user', 'hello-world')).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for owner ending with hyphen', async () => {
        await expect(repos.get('user-', 'hello-world')).rejects.toThrow(ValidationError);
      });
    });

    describe('repo name validation', () => {
      it('should throw ValidationError for empty repo name', async () => {
        await expect(repos.get('octocat', '')).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for null repo name', async () => {
        await expect(repos.get('octocat', null)).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for reserved repo name', async () => {
        await expect(repos.get('octocat', 'settings')).rejects.toThrow(ValidationError);
        await expect(repos.get('octocat', 'issues')).rejects.toThrow(ValidationError);
        await expect(repos.get('octocat', 'pulls')).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for repo name starting with dot', async () => {
        await expect(repos.get('octocat', '.hidden')).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for repo name with special characters', async () => {
        await expect(repos.get('octocat', 'repo/name')).rejects.toThrow(ValidationError);
      });
    });

    describe('validation on all methods with owner/repo', () => {
      const methodCalls = [
        ['get', ['', 'repo']],
        ['listForUser', ['']],
        ['listForOrg', ['valid-org']],  // This should not throw
        ['delete', ['', 'repo']],
        ['getTopics', ['', 'repo']],
        ['replaceTopics', ['', 'repo', []]],
        ['getLanguages', ['', 'repo']],
        ['listContributors', ['', 'repo']],
        ['fork', ['', 'repo']],
        ['listForks', ['', 'repo']],
        ['transfer', ['', 'repo', 'new-owner']],
        ['star', ['', 'repo']],
        ['unstar', ['', 'repo']],
        ['isStarred', ['', 'repo']],
        ['watch', ['', 'repo']],
        ['unwatch', ['', 'repo']],
        ['getSubscription', ['', 'repo']],
      ];

      for (const [method, args] of methodCalls) {
        if (args[0] === '') {
          it(`should throw ValidationError for ${method} with empty owner`, async () => {
            await expect(repos[method](...args)).rejects.toThrow(ValidationError);
          });
        }
      }
    });

    describe('create validation', () => {
      it('should throw ValidationError when creating repo with reserved name', async () => {
        await expect(repos.create({ name: 'settings' })).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError when creating repo with empty name', async () => {
        await expect(repos.create({ name: '' })).rejects.toThrow(ValidationError);
      });
    });

    describe('createInOrg validation', () => {
      it('should throw ValidationError when creating org repo with reserved name', async () => {
        await expect(repos.createInOrg('my-org', { name: 'issues' })).rejects.toThrow(
          ValidationError,
        );
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Error Handling
  // ---------------------------------------------------------------------------
  describe('Error Handling', () => {
    it('should propagate client.get errors through domain methods', async () => {
      const err = new Error('Network failure');
      mockClient.get.mockRejectedValue(err);
      await expect(repos.get('octocat', 'hello-world')).rejects.toThrow('Network failure');
    });

    it('should propagate client.post errors through create', async () => {
      const err = new Error('Unauthorized');
      mockClient.post.mockRejectedValue(err);
      await expect(repos.create({ name: 'my-repo' })).rejects.toThrow('Unauthorized');
    });

    it('should propagate client.patch errors through update', async () => {
      const err = new Error('Forbidden');
      mockClient.patch.mockRejectedValue(err);
      await expect(
        repos.update('octocat', 'hello-world', { description: 'test' }),
      ).rejects.toThrow('Forbidden');
    });

    it('should propagate client.delete errors through delete', async () => {
      const err = new Error('Server Error');
      mockClient.delete.mockRejectedValue(err);
      await expect(repos.delete('octocat', 'hello-world')).rejects.toThrow('Server Error');
    });

    it('should propagate client.put errors through star', async () => {
      const err = new Error('Rate limited');
      mockClient.put.mockRejectedValue(err);
      await expect(repos.star('octocat', 'hello-world')).rejects.toThrow('Rate limited');
    });

    it('should throw ValidationError with descriptive message for invalid owner', async () => {
      try {
        await repos.get('', 'hello-world');
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationError);
        expect(e.message).toContain('non-empty string');
      }
    });

    it('should throw ValidationError with descriptive message for reserved repo', async () => {
      try {
        await repos.get('octocat', 'settings');
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationError);
        expect(e.message).toContain('reserved');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Log Verification
  // ---------------------------------------------------------------------------
  describe('Log Verification', () => {
    it('should log info for get operation', async () => {
      mockClient.get.mockResolvedValue({});
      await repos.get('octocat', 'hello-world');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Getting repository'),
        expect.objectContaining({ owner: 'octocat', repo: 'hello-world' }),
      );
    });

    it('should log info for listForUser operation', async () => {
      mockClient.get.mockResolvedValue([]);
      await repos.listForUser('octocat');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Listing repositories for user'),
        expect.objectContaining({ username: 'octocat' }),
      );
    });

    it('should log info for listForAuthenticatedUser operation', async () => {
      mockClient.get.mockResolvedValue([]);
      await repos.listForAuthenticatedUser();
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Listing repositories for authenticated user'),
        expect.anything(),
      );
    });

    it('should log info for listForOrg operation', async () => {
      mockClient.get.mockResolvedValue([]);
      await repos.listForOrg('my-org');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Listing repositories for org'),
        expect.objectContaining({ org: 'my-org' }),
      );
    });

    it('should log info for create operation', async () => {
      mockClient.post.mockResolvedValue({});
      await repos.create({ name: 'new-repo' });
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Creating repository'),
        expect.objectContaining({ name: 'new-repo' }),
      );
    });

    it('should log info for createInOrg operation', async () => {
      mockClient.post.mockResolvedValue({});
      await repos.createInOrg('my-org', { name: 'org-repo' });
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Creating repository in org'),
        expect.objectContaining({ org: 'my-org', name: 'org-repo' }),
      );
    });

    it('should log info for update operation', async () => {
      mockClient.patch.mockResolvedValue({});
      await repos.update('octocat', 'hello-world', { description: 'test' });
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Updating repository'),
        expect.objectContaining({ owner: 'octocat', repo: 'hello-world' }),
      );
    });

    it('should log warn for delete operation', async () => {
      mockClient.delete.mockResolvedValue({});
      await repos.delete('octocat', 'hello-world');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Deleting repository'),
        expect.objectContaining({ owner: 'octocat', repo: 'hello-world' }),
      );
    });

    it('should log info for getTopics operation', async () => {
      mockClient.get.mockResolvedValue({ names: [] });
      await repos.getTopics('octocat', 'hello-world');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Getting topics'),
        expect.objectContaining({ owner: 'octocat', repo: 'hello-world' }),
      );
    });

    it('should log info for replaceTopics operation', async () => {
      mockClient.put.mockResolvedValue({});
      await repos.replaceTopics('octocat', 'hello-world', ['topic1']);
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Replacing topics'),
        expect.objectContaining({ owner: 'octocat', repo: 'hello-world', count: 1 }),
      );
    });

    it('should log info for getLanguages operation', async () => {
      mockClient.get.mockResolvedValue({});
      await repos.getLanguages('octocat', 'hello-world');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Getting languages'),
        expect.objectContaining({ owner: 'octocat', repo: 'hello-world' }),
      );
    });

    it('should log info for listContributors operation', async () => {
      mockClient.get.mockResolvedValue([]);
      await repos.listContributors('octocat', 'hello-world');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Listing contributors'),
        expect.objectContaining({ owner: 'octocat', repo: 'hello-world' }),
      );
    });

    it('should log info for fork operation', async () => {
      mockClient.post.mockResolvedValue({});
      await repos.fork('octocat', 'hello-world');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Forking repository'),
        expect.objectContaining({ owner: 'octocat', repo: 'hello-world' }),
      );
    });

    it('should log info for listForks operation', async () => {
      mockClient.get.mockResolvedValue([]);
      await repos.listForks('octocat', 'hello-world');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Listing forks'),
        expect.objectContaining({ owner: 'octocat', repo: 'hello-world' }),
      );
    });

    it('should log warn for transfer operation', async () => {
      mockClient.post.mockResolvedValue({});
      await repos.transfer('octocat', 'hello-world', 'new-owner');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Transferring repository'),
        expect.objectContaining({ owner: 'octocat', repo: 'hello-world', newOwner: 'new-owner' }),
      );
    });

    it('should log info for star operation', async () => {
      mockClient.put.mockResolvedValue({});
      await repos.star('octocat', 'hello-world');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Starring repository'),
        expect.objectContaining({ owner: 'octocat', repo: 'hello-world' }),
      );
    });

    it('should log info for unstar operation', async () => {
      mockClient.delete.mockResolvedValue({});
      await repos.unstar('octocat', 'hello-world');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Unstarring repository'),
        expect.objectContaining({ owner: 'octocat', repo: 'hello-world' }),
      );
    });

    it('should log debug for isStarred operation', async () => {
      mockClient.get.mockResolvedValue({});
      await repos.isStarred('octocat', 'hello-world');
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('Checking star status'),
        expect.objectContaining({ owner: 'octocat', repo: 'hello-world' }),
      );
    });

    it('should log info for watch operation', async () => {
      mockClient.put.mockResolvedValue({});
      await repos.watch('octocat', 'hello-world');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Watching repository'),
        expect.objectContaining({ owner: 'octocat', repo: 'hello-world' }),
      );
    });

    it('should log info for unwatch operation', async () => {
      mockClient.delete.mockResolvedValue({});
      await repos.unwatch('octocat', 'hello-world');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Unwatching repository'),
        expect.objectContaining({ owner: 'octocat', repo: 'hello-world' }),
      );
    });

    it('should log debug for getSubscription operation', async () => {
      mockClient.get.mockResolvedValue({});
      await repos.getSubscription('octocat', 'hello-world');
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('Getting subscription'),
        expect.objectContaining({ owner: 'octocat', repo: 'hello-world' }),
      );
    });
  });
});
