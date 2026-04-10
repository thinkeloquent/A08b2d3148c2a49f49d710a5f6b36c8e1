/**
 * Filter Tree Service
 * Business logic for filter tree CRUD operations
 */

import { Op } from 'sequelize';

export function createFilterTreeService(db) {
  const { FilterTree, sequelize } = db;

  return {
    /**
     * List filter trees with pagination and filters
     */
    async list({ page = 1, limit = 50, search, status, sort = 'createdAt', order = 'desc' } = {}) {
      const where = {};

      if (status) {
        where.status = status;
      }

      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const offset = (page - 1) * limit;

      const { rows, count } = await FilterTree.findAndCountAll({
        where,
        order: [[sort, order.toUpperCase()]],
        limit,
        offset,
      });

      return {
        data: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      };
    },

    /**
     * Get a single filter tree by ID
     */
    async getById(id) {
      return FilterTree.findByPk(id);
    },

    /**
     * Create a new filter tree
     */
    async create(data) {
      return FilterTree.create(data);
    },

    /**
     * Update an existing filter tree
     */
    async update(id, data) {
      const tree = await FilterTree.findByPk(id);
      if (!tree) return null;

      // Increment version for optimistic locking
      data.version = tree.version + 1;

      await tree.update(data);
      return tree;
    },

    /**
     * Delete a filter tree (soft or hard)
     */
    async remove(id, permanent = false) {
      const tree = await FilterTree.findByPk(id);
      if (!tree) return false;

      if (permanent) {
        await tree.destroy();
      } else {
        await tree.update({
          status: 'archived',
          archived_at: new Date(),
        });
      }

      return true;
    },

    /**
     * Clone a filter tree
     */
    async clone(id, newName) {
      const source = await FilterTree.findByPk(id);
      if (!source) return null;

      const cloneName = newName || `${source.name} (Copy)`;

      return FilterTree.create({
        name: cloneName,
        description: source.description,
        tree_data: source.tree_data,
        metadata: {
          ...source.metadata,
          clonedFrom: source.id,
          clonedAt: new Date().toISOString(),
        },
      });
    },
  };
}
