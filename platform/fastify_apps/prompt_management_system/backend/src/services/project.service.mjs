/**
 * Project Service - Business logic for Project CRUD
 */

import { Op } from 'sequelize';

export function createProjectService(db) {
  const { sequelize, Project, Prompt } = db;

  async function list(options = {}) {
    const { page = 1, limit = 50, search, status, sort = 'createdAt', order = 'DESC' } = options;
    const where = {};

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const sortField = sort === 'name' ? 'name' : sort === 'updatedAt' ? 'updatedAt' : 'createdAt';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows } = await Project.findAndCountAll({
      where,
      include: [{ model: Prompt, as: 'prompts', attributes: ['id'] }],
      limit,
      offset: (page - 1) * limit,
      order: [[sortField, sortOrder]],
      distinct: true,
    });

    return {
      data: rows.map(p => ({ ...p.toJSON(), promptCount: p.prompts?.length || 0 })),
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  }

  async function getById(id) {
    return Project.findByPk(id, {
      include: [{ model: Prompt, as: 'prompts' }],
    });
  }

  async function create(data) {
    return Project.create(data);
  }

  async function update(id, data) {
    const project = await Project.findByPk(id);
    if (!project) return null;
    await project.update(data);
    return getById(id);
  }

  async function remove(id, permanent = false) {
    const project = await Project.findByPk(id);
    if (!project) return false;

    if (permanent) {
      await project.destroy();
    } else {
      await project.update({ status: 'archived' });
    }
    return true;
  }

  return { list, getById, create, update, remove };
}
