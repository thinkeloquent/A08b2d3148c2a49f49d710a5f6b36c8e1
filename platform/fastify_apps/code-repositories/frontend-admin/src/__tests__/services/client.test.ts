import { describe, it, expect } from 'vitest';
import { repositoryApi, tagApi, metadataApi } from '@/services/api';

describe('API Client', () => {
  describe('repositoryApi', () => {
    it('fetches repositories list', async () => {
      const response = await repositoryApi.list();

      expect(response.repositories).toBeDefined();
      expect(response.repositories.length).toBeGreaterThan(0);
      expect(response.pagination).toBeDefined();
    });

    it('fetches a single repository', async () => {
      const response = await repositoryApi.getById('1');

      expect(response.repository).toBeDefined();
      expect(response.repository.id).toBe('1');
      expect(response.repository.name).toBe('react');
    });

    it('creates a repository', async () => {
      const response = await repositoryApi.create({
        name: 'new-package',
        type: 'npm',
        description: 'A new package',
      });

      expect(response.repository).toBeDefined();
      expect(response.repository.name).toBe('new-package');
    });

    it('updates a repository', async () => {
      const response = await repositoryApi.update('1', {
        name: 'updated-name',
      });

      expect(response.repository).toBeDefined();
      expect(response.repository.name).toBe('updated-name');
    });

    it('deletes a repository', async () => {
      const response = await repositoryApi.delete('1');

      expect(response.success).toBe(true);
    });
  });

  describe('tagApi', () => {
    it('fetches tags list', async () => {
      const response = await tagApi.list();

      expect(response.tags).toBeDefined();
      expect(response.tags.length).toBeGreaterThan(0);
    });

    it('fetches a single tag', async () => {
      const response = await tagApi.getById(1);

      expect(response.tag).toBeDefined();
      expect(response.tag.id).toBe(1);
      expect(response.tag.name).toBe('frontend');
    });

    it('creates a tag', async () => {
      const response = await tagApi.create({ name: 'new-tag' });

      expect(response.tag).toBeDefined();
      expect(response.tag.name).toBe('new-tag');
    });

    it('updates a tag', async () => {
      const response = await tagApi.update(1, { name: 'updated-tag' });

      expect(response.tag).toBeDefined();
      expect(response.tag.name).toBe('updated-tag');
    });

    it('deletes a tag', async () => {
      const response = await tagApi.delete(1);

      expect(response.success).toBe(true);
    });
  });

  describe('metadataApi', () => {
    it('fetches metadata by repository', async () => {
      const response = await metadataApi.listByRepo('1');

      expect(response.items).toBeDefined();
    });

    it('fetches a single metadata item', async () => {
      const response = await metadataApi.getById(1);

      expect(response.metadata).toBeDefined();
      expect(response.metadata.id).toBe(1);
    });

    it('updates metadata', async () => {
      const response = await metadataApi.update(1, {
        name: 'Updated README',
      });

      expect(response.metadata).toBeDefined();
      expect(response.metadata.name).toBe('Updated README');
    });

    it('deletes metadata', async () => {
      const response = await metadataApi.delete(1);

      expect(response.success).toBe(true);
    });
  });
});
