/**
 * Unit tests for gates domain module.
 *
 * Tests cover:
 * - Statement coverage for all GatesModule CRUD and control methods
 * - Error handling for client error propagation
 * - Log verification for info log emission
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GatesModule } from '../src/modules/gates/index.mjs';

function createMockClient() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
  };
}

function createMockLogger() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

describe('GatesModule', () => {
  let client;
  let logger;

  beforeEach(() => {
    client = createMockClient();
    logger = createMockLogger();
  });

  describe('Statement Coverage', () => {
    it('should list gates', async () => {
      client.list.mockResolvedValue([{ id: 'g1' }, { id: 'g2' }]);
      const mod = new GatesModule(client, { logger });
      const result = await mod.list();
      expect(result).toHaveLength(2);
      expect(client.list).toHaveBeenCalledWith('/gates', { params: {} });
    });

    it('should list gates with params', async () => {
      client.list.mockResolvedValue([]);
      const mod = new GatesModule(client, { logger });
      await mod.list({ limit: 10 });
      expect(client.list).toHaveBeenCalledWith('/gates', { params: { limit: 10 } });
    });

    it('should get a gate by ID', async () => {
      client.get.mockResolvedValue({ id: 'g1', name: 'feature_x' });
      const mod = new GatesModule(client, { logger });
      const result = await mod.get('g1');
      expect(result.name).toBe('feature_x');
      expect(client.get).toHaveBeenCalledWith('/gates/g1');
    });

    it('should URL-encode gate ID', async () => {
      client.get.mockResolvedValue({ id: 'special/gate' });
      const mod = new GatesModule(client, { logger });
      await mod.get('special/gate');
      expect(client.get).toHaveBeenCalledWith('/gates/special%2Fgate');
    });

    it('should create a gate', async () => {
      client.post.mockResolvedValue({ id: 'new', name: 'new_gate' });
      const mod = new GatesModule(client, { logger });
      const result = await mod.create({ name: 'new_gate' });
      expect(result.id).toBe('new');
      expect(client.post).toHaveBeenCalledWith('/gates', { name: 'new_gate' });
    });

    it('should update a gate', async () => {
      client.put.mockResolvedValue({ id: 'g1', enabled: true });
      const mod = new GatesModule(client, { logger });
      const result = await mod.update('g1', { enabled: true });
      expect(result.enabled).toBe(true);
    });

    it('should patch a gate', async () => {
      client.patch.mockResolvedValue({ id: 'g1', name: 'renamed' });
      const mod = new GatesModule(client, { logger });
      const result = await mod.patch('g1', { name: 'renamed' });
      expect(result.name).toBe('renamed');
    });

    it('should delete a gate', async () => {
      client.delete.mockResolvedValue({ deleted: true });
      const mod = new GatesModule(client, { logger });
      const result = await mod.delete('g1');
      expect(result.deleted).toBe(true);
    });

    it('should get gate overrides', async () => {
      client.get.mockResolvedValue({ overrides: [] });
      const mod = new GatesModule(client, { logger });
      const result = await mod.getOverrides('g1');
      expect(result).toHaveProperty('overrides');
    });

    it('should update gate overrides', async () => {
      client.put.mockResolvedValue({ updated: true });
      const mod = new GatesModule(client, { logger });
      const result = await mod.updateOverrides('g1', { users: ['u1'] });
      expect(result.updated).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should propagate client get error', async () => {
      const error = new Error('not found');
      client.get.mockRejectedValue(error);
      const mod = new GatesModule(client, { logger });
      await expect(mod.get('nope')).rejects.toThrow('not found');
    });

    it('should propagate client list error', async () => {
      const error = new Error('server error');
      client.list.mockRejectedValue(error);
      const mod = new GatesModule(client, { logger });
      await expect(mod.list()).rejects.toThrow('server error');
    });

    it('should propagate client post error', async () => {
      const error = new Error('validation');
      client.post.mockRejectedValue(error);
      const mod = new GatesModule(client, { logger });
      await expect(mod.create({ name: 'bad' })).rejects.toThrow('validation');
    });

    it('should propagate client delete error', async () => {
      const error = new Error('forbidden');
      client.delete.mockRejectedValue(error);
      const mod = new GatesModule(client, { logger });
      await expect(mod.delete('g1')).rejects.toThrow('forbidden');
    });
  });

  describe('Log Verification', () => {
    it('should log on list', async () => {
      client.list.mockResolvedValue([]);
      const mod = new GatesModule(client, { logger });
      await mod.list();
      expect(logger.info).toHaveBeenCalled();
    });

    it('should log on get', async () => {
      client.get.mockResolvedValue({});
      const mod = new GatesModule(client, { logger });
      await mod.get('g1');
      expect(logger.info).toHaveBeenCalled();
    });

    it('should log on create', async () => {
      client.post.mockResolvedValue({});
      const mod = new GatesModule(client, { logger });
      await mod.create({ name: 'test' });
      expect(logger.info).toHaveBeenCalled();
    });
  });
});
