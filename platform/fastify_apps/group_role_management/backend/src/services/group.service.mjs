/**
 * Group Service
 * Business logic for Group CRUD operations
 */

import { Op } from 'sequelize';

export function createGroupService(db) {
  const { sequelize, Role, Group, Label, Action, Restriction } = db;

  /**
   * List groups with pagination and filters
   */
  async function list(options = {}) {
    const {
      page = 1,
      limit = 50,
      search,
      status,
      sort = 'createdAt',
      order = 'DESC',
    } = options;

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

    const sortField = sort === 'name' ? 'name' : sort === 'updatedAt' ? 'updatedAt' : 'createdAt';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows } = await Group.findAndCountAll({
      where,
      include: [{ model: Role, as: 'roles', through: { attributes: [] }, attributes: ['id'] }],
      limit,
      offset: (page - 1) * limit,
      order: [[sortField, sortOrder]],
      distinct: true,
    });

    // Add roleCount to each group
    const data = rows.map(g => {
      const plain = g.toJSON();
      plain.roleCount = plain.roles?.length || 0;
      delete plain.roles;
      return plain;
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get group by ID with assigned roles
   */
  async function getById(id) {
    const group = await Group.findByPk(id, {
      include: [
        { model: Action, as: 'actions', through: { attributes: [] } },
        { model: Restriction, as: 'restrictions', through: { attributes: [] } },
      ],
    });
    if (!group) return null;

    const roles = await Role.findAll({
      include: [
        {
          model: Group,
          as: 'groups',
          through: { attributes: [] },
          where: { id },
          required: true,
        },
        { model: Label, as: 'labels', through: { attributes: [] } },
      ],
    });

    return { group, roles };
  }

  /**
   * Create a new group
   */
  async function create(data, actionIds = [], restrictionIds = []) {
    if (actionIds.length === 0 && restrictionIds.length === 0) {
      return Group.create(data);
    }

    const transaction = await sequelize.transaction();

    try {
      const group = await Group.create(data, { transaction });

      if (actionIds.length > 0) {
        const actions = await Action.findAll({
          where: { id: { [Op.in]: actionIds } },
          transaction,
        });
        await group.setActions(actions, { transaction });
      }

      if (restrictionIds.length > 0) {
        const restrictions = await Restriction.findAll({
          where: { id: { [Op.in]: restrictionIds } },
          transaction,
        });
        await group.setRestrictions(restrictions, { transaction });
      }

      await transaction.commit();

      // Reload with associations
      return Group.findByPk(group.id, {
        include: [
          { model: Action, as: 'actions', through: { attributes: [] } },
          { model: Restriction, as: 'restrictions', through: { attributes: [] } },
        ],
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update an existing group
   */
  async function update(id, data, actionIds = null, restrictionIds = null) {
    if (actionIds === null && restrictionIds === null) {
      const group = await Group.findByPk(id);
      if (!group) return null;
      await group.update(data);
      return group;
    }

    const transaction = await sequelize.transaction();

    try {
      const group = await Group.findByPk(id, { transaction });
      if (!group) {
        await transaction.rollback();
        return null;
      }

      await group.update(data, { transaction });

      if (actionIds !== null) {
        const actions = await Action.findAll({
          where: { id: { [Op.in]: actionIds } },
          transaction,
        });
        await group.setActions(actions, { transaction });
      }

      if (restrictionIds !== null) {
        const restrictions = await Restriction.findAll({
          where: { id: { [Op.in]: restrictionIds } },
          transaction,
        });
        await group.setRestrictions(restrictions, { transaction });
      }

      await transaction.commit();

      // Reload with associations
      return Group.findByPk(id, {
        include: [
          { model: Action, as: 'actions', through: { attributes: [] } },
          { model: Restriction, as: 'restrictions', through: { attributes: [] } },
        ],
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete a group (soft or hard)
   */
  async function remove(id, { permanent = false, reassignTo = null } = {}) {
    const transaction = await sequelize.transaction();

    try {
      const group = await Group.findByPk(id, { transaction });
      if (!group) {
        await transaction.rollback();
        return false;
      }

      // Reassign roles to another group if specified
      if (reassignTo) {
        const targetGroup = await Group.findByPk(reassignTo, { transaction });
        if (targetGroup) {
          const roles = await group.getRoles({ transaction });
          for (const role of roles) {
            await role.addGroup(targetGroup, { transaction });
          }
        }
      }

      if (permanent) {
        // Remove all role associations first
        const roles = await group.getRoles({ transaction });
        for (const role of roles) {
          await role.removeGroup(group, { transaction });
        }
        await group.setActions([], { transaction });
        await group.setRestrictions([], { transaction });
        await group.destroy({ transaction });
      } else {
        await group.update({
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
   * Search groups (for autocomplete)
   */
  async function search(query, limit = 10, excludeIds = []) {
    const where = {
      status: 'active',
      name: { [Op.iLike]: `%${query}%` },
    };

    if (excludeIds.length > 0) {
      where.id = { [Op.notIn]: excludeIds };
    }

    return Group.findAll({ where, limit, order: [['name', 'ASC']] });
  }

  return { list, getById, create, update, remove, search };
}
