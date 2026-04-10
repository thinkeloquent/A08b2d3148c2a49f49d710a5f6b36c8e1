/**
 * Prompt Service - Business logic for Prompt CRUD
 */

import { Op } from 'sequelize';
import slugify from 'slugify';

function toSlug(name) {
  return slugify(name, { lower: true, replacement: '_', strict: true });
}

export function createPromptService(db) {
  const { sequelize, Prompt, PromptVersion, Deployment, Variable, Project } = db;

  const INCLUDE_ALL = [
    { model: Project, as: 'project', attributes: ['id', 'name'] },
    { model: PromptVersion, as: 'versions', include: [{ model: Variable, as: 'variables' }] },
    { model: Deployment, as: 'deployments', include: [{ model: PromptVersion, as: 'version', attributes: ['id', 'version_number', 'status'] }] },
  ];

  async function list(options = {}) {
    const { page = 1, limit = 50, search, status, project_id, sort = 'createdAt', order = 'DESC' } = options;
    const where = {};

    if (status) where.status = status;
    if (project_id) where.project_id = project_id;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { slug: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const sortField = sort === 'name' ? 'name' : sort === 'updatedAt' ? 'updatedAt' : 'createdAt';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows } = await Prompt.findAndCountAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: Deployment, as: 'deployments', include: [{ model: PromptVersion, as: 'version', attributes: ['id', 'version_number'] }] },
      ],
      limit,
      offset: (page - 1) * limit,
      order: [[sortField, sortOrder]],
      distinct: true,
    });

    return {
      data: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  }

  async function getById(id) {
    return Prompt.findByPk(id, { include: INCLUDE_ALL });
  }

  async function getBySlug(slug) {
    return Prompt.findOne({ where: { slug }, include: INCLUDE_ALL });
  }

  async function create(data) {
    const transaction = await sequelize.transaction();
    try {
      const prompt = await Prompt.create({
        ...data,
        slug: toSlug(data.name),
      }, { transaction });
      await transaction.commit();
      return getById(prompt.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async function update(id, data) {
    const prompt = await Prompt.findByPk(id);
    if (!prompt) return null;
    const updates = { ...data };
    if (updates.name) {
      updates.slug = toSlug(updates.name);
    }
    await prompt.update(updates);
    return getById(id);
  }

  async function remove(id, permanent = false) {
    const prompt = await Prompt.findByPk(id);
    if (!prompt) return false;

    if (permanent) {
      await prompt.destroy();
    } else {
      await prompt.update({ status: 'archived' });
    }
    return true;
  }

  return { list, getById, getBySlug, create, update, remove };
}
