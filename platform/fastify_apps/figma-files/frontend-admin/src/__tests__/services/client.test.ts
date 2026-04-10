import { describe, it, expect } from 'vitest';
import { figmaFileApi, tagApi, metadataApi } from '@/services/api';

describe('API Client', () => {
  describe('figmaFileApi', () => {
    it('fetches figma files list', async () => {
      const response = await figmaFileApi.list();

      expect(response.figmaFiles).toBeDefined();
      expect(response.figmaFiles.length).toBeGreaterThan(0);
      expect(response.pagination).toBeDefined();
    });

    it('fetches a single figma file', async () => {
      const response = await figmaFileApi.getById('1');

      expect(response.figmaFile).toBeDefined();
      expect(response.figmaFile.id).toBe('1');
      expect(response.figmaFile.name).toBe('Design System v2');
    });

    it('creates a figma file', async () => {
      const response = await figmaFileApi.create({
        name: 'New Design System',
        type: 'design_system',
        description: 'A new design system',
      });

      expect(response.figmaFile).toBeDefined();
      expect(response.figmaFile.name).toBe('New Design System');
    });

    it('updates a figma file', async () => {
      const response = await figmaFileApi.update('1', {
        name: 'updated-name',
      });

      expect(response.figmaFile).toBeDefined();
      expect(response.figmaFile.name).toBe('updated-name');
    });

    it('deletes a figma file', async () => {
      const response = await figmaFileApi.delete('1');

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
      expect(response.tag.name).toBe('design-system');
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
    it('fetches metadata by figma file', async () => {
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
