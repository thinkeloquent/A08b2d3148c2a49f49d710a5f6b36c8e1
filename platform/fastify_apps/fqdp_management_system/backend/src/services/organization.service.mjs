import { Op } from "sequelize";
import { slugify, getDescendantTableNames } from "../utils/fqdp.mjs";
import { isUUID } from "../utils/lookup.mjs";

export function createOrganizationService(db) {
  const { Organization } = db;

  return {
    async findAll({ status, search, page = 1, limit = 50 } = {}) {
      const where = {};
      if (status) where.status = status;
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { slug: { [Op.iLike]: `%${search}%` } },
        ];
      }
      const offset = (page - 1) * limit;
      const { rows, count } = await Organization.findAndCountAll({
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

    async findById(id) {
      return Organization.findByPk(id);
    },

    async findByIdOrSlug(idOrSlug) {
      if (isUUID(idOrSlug)) return Organization.findByPk(idOrSlug);
      return Organization.findOne({ where: { slug: idOrSlug } });
    },

    async create(data) {
      const slug = slugify(data.name);
      return Organization.create({ ...data, slug });
    },

    async update(id, data) {
      const org = await Organization.findByPk(id);
      if (!org) return null;

      if (data.name && data.name !== org.name) {
        const oldSlug = org.slug;
        const newSlug = slugify(data.name);
        data.slug = newSlug;

        return db.sequelize.transaction(async (t) => {
          await org.update(data, { transaction: t });
          const tables = getDescendantTableNames("organization");
          for (const table of tables) {
            await db.sequelize.query(
              `UPDATE "${table}" SET slug = $2 || SUBSTRING(slug FROM LENGTH($1) + 1) WHERE slug LIKE $3`,
              {
                bind: [oldSlug, newSlug, oldSlug + ">>%"],
                transaction: t,
              },
            );
          }
          return org;
        });
      }

      return org.update(data);
    },

    async remove(id) {
      const org = await Organization.findByPk(id);
      if (!org) return null;
      await org.destroy();
      return org;
    },
  };
}
