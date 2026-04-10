import { Op } from "sequelize";
import { buildCompoundSlug, slugify, getDescendantTableNames } from "../utils/fqdp.mjs";
import { isUUID } from "../utils/lookup.mjs";

export function createWorkspaceService(db) {
  const { Workspace, Organization } = db;

  return {
    async findAll({ organizationId, status, search, page = 1, limit = 50 } = {}) {
      const where = {};
      if (organizationId) where.organizationId = organizationId;
      if (status) where.status = status;
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { slug: { [Op.iLike]: `%${search}%` } },
        ];
      }
      const offset = (page - 1) * limit;
      const { rows, count } = await Workspace.findAndCountAll({
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
      return Workspace.findByPk(id);
    },

    async findByIdOrSlug(idOrSlug) {
      if (isUUID(idOrSlug)) return Workspace.findByPk(idOrSlug);
      return Workspace.findOne({ where: { slug: idOrSlug } });
    },

    async create(data) {
      const org = await Organization.findByPk(data.organizationId);
      if (!org) throw new Error("Organization not found");

      const slug = buildCompoundSlug(org.slug, data.name);

      const workspace = await db.sequelize.transaction(async (t) => {
        const ws = await Workspace.create(
          { ...data, slug, organizationName: org.name },
          { transaction: t },
        );
        await org.increment("workspaceCount", { transaction: t });
        return ws;
      });
      return workspace;
    },

    async update(id, data) {
      const ws = await Workspace.findByPk(id);
      if (!ws) return null;

      if (data.name && data.name !== ws.name) {
        const oldSlug = ws.slug;
        const parts = oldSlug.split(">>");
        parts[parts.length - 1] = slugify(data.name);
        const newSlug = parts.join(">>");
        data.slug = newSlug;

        return db.sequelize.transaction(async (t) => {
          await ws.update(data, { transaction: t });
          const tables = getDescendantTableNames("workspace");
          for (const table of tables) {
            await db.sequelize.query(
              `UPDATE "${table}" SET slug = $2 || SUBSTRING(slug FROM LENGTH($1) + 1) WHERE slug LIKE $3`,
              {
                bind: [oldSlug, newSlug, oldSlug + ">>%"],
                transaction: t,
              },
            );
          }
          return ws;
        });
      }

      return ws.update(data);
    },

    async remove(id) {
      const ws = await Workspace.findByPk(id);
      if (!ws) return null;

      await db.sequelize.transaction(async (t) => {
        const org = await Organization.findByPk(ws.organizationId, { transaction: t });
        await ws.destroy({ transaction: t });
        if (org) await org.decrement("workspaceCount", { transaction: t });
      });
      return ws;
    },
  };
}
