/**
 * Dropdown Option Service
 * Business logic for dropdown option CRUD operations
 */

import { Op } from 'sequelize';

export function createDropdownOptionService(db) {
  const { DropdownOption } = db;

  return {
    /**
     * List dropdown options with optional filtering
     */
    async list({ search, category, status = 'active' } = {}) {
      const where = {};

      if (status) {
        where.status = status;
      }

      if (category) {
        where.category = category;
      }

      if (search) {
        where[Op.or] = [
          { value: { [Op.iLike]: `%${search}%` } },
          { label: { [Op.iLike]: `%${search}%` } },
        ];
      }

      return DropdownOption.findAll({
        where,
        order: [['sort_order', 'ASC'], ['label', 'ASC']],
      });
    },

    /**
     * Get a single dropdown option by ID
     */
    async getById(id) {
      return DropdownOption.findByPk(id);
    },

    /**
     * Create a new dropdown option
     */
    async create(data) {
      return DropdownOption.create(data);
    },

    /**
     * Update an existing dropdown option
     */
    async update(id, data) {
      const option = await DropdownOption.findByPk(id);
      if (!option) return null;
      await option.update(data);
      return option;
    },

    /**
     * Delete a dropdown option
     */
    async remove(id) {
      const option = await DropdownOption.findByPk(id);
      if (!option) return false;
      await option.destroy();
      return true;
    },
  };
}
