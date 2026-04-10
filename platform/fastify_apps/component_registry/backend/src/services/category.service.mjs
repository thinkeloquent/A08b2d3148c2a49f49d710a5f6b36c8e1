/**
 * Category Service
 * Business logic for Category CRUD operations
 */

import { Op } from 'sequelize';

export function createCategoryService(db) {
  const { Category, Component } = db;

  async function list() {
    const categories = await Category.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
      include: [{
        model: Component,
        as: 'components',
        attributes: ['id'],
      }],
    });

    return categories.map((cat) => {
      const plain = cat.toJSON();
      plain.count = plain.components?.length || 0;
      delete plain.components;
      return plain;
    });
  }

  async function getBySlug(slug) {
    return Category.findOne({ where: { slug } });
  }

  async function getById(id) {
    return Category.findByPk(id);
  }

  async function create(data) {
    return Category.create(data);
  }

  async function update(id, data) {
    const category = await Category.findByPk(id);
    if (!category) return null;
    await category.update(data);
    return category;
  }

  async function remove(id) {
    const category = await Category.findByPk(id, {
      include: [{
        model: Component,
        as: 'components',
        attributes: ['id'],
      }],
    });

    if (!category) return { found: false };

    if (category.components && category.components.length > 0) {
      return { found: true, inUse: true, usageCount: category.components.length };
    }

    await category.destroy();
    return { found: true, inUse: false };
  }

  return { list, getBySlug, getById, create, update, remove };
}
