import { Op } from "sequelize";

export function createReferenceService(db) {
  const { Reference } = db;

  return {
    async findByEntity(entityType, entityId, { type, search, page = 1, limit = 50 } = {}) {
      const where = { entityType, entityId };
      if (type) where.type = type;
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { externalUid: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }
      const offset = (page - 1) * limit;
      const { rows, count } = await Reference.findAndCountAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });
      return {
        data: rows,
        meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
      };
    },

    async findAll({ entityType, entityId, type, search, page = 1, limit = 50 } = {}) {
      const where = {};
      if (entityType) where.entityType = entityType;
      if (entityId) where.entityId = entityId;
      if (type) where.type = type;
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { externalUid: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }
      const offset = (page - 1) * limit;
      const { rows, count } = await Reference.findAndCountAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });
      return {
        data: rows,
        meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
      };
    },

    async findByExternalUid(externalUid) {
      return Reference.findAll({ where: { externalUid } });
    },

    async findById(id) {
      return Reference.findByPk(id);
    },

    async create(data) {
      return Reference.create(data);
    },

    async update(id, data) {
      const ref = await Reference.findByPk(id);
      if (!ref) return null;
      return ref.update(data);
    },

    async remove(id) {
      const ref = await Reference.findByPk(id);
      if (!ref) return null;
      await ref.destroy();
      return ref;
    },
  };
}
