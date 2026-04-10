/**
 * Role Service
 * Business logic for Role CRUD operations
 */

import { Op } from 'sequelize';

export function createRoleService(db) {
  const { sequelize, Role, Group, Label, Action, Restriction } = db;

  const INCLUDE_ALL = [
    { model: Group, as: 'groups', through: { attributes: [] } },
    { model: Label, as: 'labels', through: { attributes: [] } },
    { model: Action, as: 'actions', through: { attributes: [] } },
    { model: Restriction, as: 'restrictions', through: { attributes: [] } },
  ];

  /**
   * List roles with pagination and filters
   */
  async function list(options = {}) {
    const {
      page = 1,
      limit = 50,
      search,
      status,
      label,
      groups,
      sort = 'createdAt',
      order = 'DESC',
    } = options;

    const where = {};
    const include = [...INCLUDE_ALL];

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filter by label name — use a subquery approach
    if (label) {
      include[1] = {
        model: Label,
        as: 'labels',
        through: { attributes: [] },
        where: { name: label },
        required: true,
      };
    }

    // Filter by group IDs
    if (groups) {
      const groupIds = groups.split(',').map(g => g.trim());
      include[0] = {
        model: Group,
        as: 'groups',
        through: { attributes: [] },
        where: { id: { [Op.in]: groupIds } },
        required: true,
      };
    }

    // Map sort field
    const sortField = sort === 'name' ? 'name' : sort === 'updatedAt' ? 'updatedAt' : 'createdAt';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows } = await Role.findAndCountAll({
      where,
      include,
      limit,
      offset: (page - 1) * limit,
      order: [[sortField, sortOrder]],
      distinct: true,
    });

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get role by ID with associations
   */
  async function getById(id) {
    return Role.findByPk(id, { include: INCLUDE_ALL });
  }

  /**
   * Create a new role
   */
  async function create(data, groupIds = [], labelNames = [], actionIds = [], restrictionIds = []) {
    const transaction = await sequelize.transaction();

    try {
      const role = await Role.create(data, { transaction });

      if (groupIds.length > 0) {
        const groups = await Group.findAll({
          where: { id: { [Op.in]: groupIds } },
          transaction,
        });
        await role.setGroups(groups, { transaction });
      }

      if (labelNames.length > 0) {
        const labels = await Label.findAll({
          where: { name: { [Op.in]: labelNames } },
          transaction,
        });
        await role.setLabels(labels, { transaction });
      }

      if (actionIds.length > 0) {
        const actions = await Action.findAll({
          where: { id: { [Op.in]: actionIds } },
          transaction,
        });
        await role.setActions(actions, { transaction });
      }

      if (restrictionIds.length > 0) {
        const restrictions = await Restriction.findAll({
          where: { id: { [Op.in]: restrictionIds } },
          transaction,
        });
        await role.setRestrictions(restrictions, { transaction });
      }

      await transaction.commit();
      return getById(role.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update an existing role
   */
  async function update(id, data, groupIds = null, labelNames = null, actionIds = null, restrictionIds = null) {
    const transaction = await sequelize.transaction();

    try {
      const role = await Role.findByPk(id, { transaction });
      if (!role) {
        await transaction.rollback();
        return null;
      }

      // Increment version for optimistic locking
      const updateData = {
        ...data,
        version: role.version + 1,
        updated_by: data.updated_by || null,
      };

      await role.update(updateData, { transaction });

      if (groupIds !== null) {
        const groups = await Group.findAll({
          where: { id: { [Op.in]: groupIds } },
          transaction,
        });
        await role.setGroups(groups, { transaction });
      }

      if (labelNames !== null) {
        const labels = await Label.findAll({
          where: { name: { [Op.in]: labelNames } },
          transaction,
        });
        await role.setLabels(labels, { transaction });
      }

      if (actionIds !== null) {
        const actions = await Action.findAll({
          where: { id: { [Op.in]: actionIds } },
          transaction,
        });
        await role.setActions(actions, { transaction });
      }

      if (restrictionIds !== null) {
        const restrictions = await Restriction.findAll({
          where: { id: { [Op.in]: restrictionIds } },
          transaction,
        });
        await role.setRestrictions(restrictions, { transaction });
      }

      await transaction.commit();
      return getById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete (soft or hard) a role
   */
  async function remove(id, permanent = false) {
    const transaction = await sequelize.transaction();

    try {
      const role = await Role.findByPk(id, { transaction });
      if (!role) {
        await transaction.rollback();
        return false;
      }

      if (permanent) {
        await role.setGroups([], { transaction });
        await role.setLabels([], { transaction });
        await role.setActions([], { transaction });
        await role.setRestrictions([], { transaction });
        await role.destroy({ transaction });
      } else {
        await role.update({
          status: 'archived',
          archived_at: new Date(),
        }, { transaction });
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Clone a role
   */
  async function clone(id, newName = null) {
    const original = await getById(id);
    if (!original) return null;

    const cloneName = newName || `${original.name} (Copy)`;
    const groupIds = original.groups.map(g => g.id);
    const labelNames = original.labels.map(l => l.name);
    const actionIds = original.actions.map(a => a.id);
    const restrictionIds = original.restrictions.map(r => r.id);

    return create(
      {
        name: cloneName,
        description: original.description,
        icon: original.icon,
        metadata: {
          ...(original.metadata || {}),
          clonedFrom: id,
        },
      },
      groupIds,
      labelNames,
      actionIds,
      restrictionIds
    );
  }

  return { list, getById, create, update, remove, clone };
}
