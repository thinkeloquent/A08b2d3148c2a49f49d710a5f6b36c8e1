import { Op } from "sequelize";
import { buildCompoundSlug, slugify, getDescendantTableNames } from "../utils/fqdp.mjs";
import { isUUID } from "../utils/lookup.mjs";

export function createApplicationService(db) {
  const { Application, Team } = db;

  return {
    async findAll({ teamId, workspaceId, organizationId, status, search, page = 1, limit = 50 } = {}) {
      const where = {};
      if (teamId) where.teamId = teamId;
      if (workspaceId) where.workspaceId = workspaceId;
      if (organizationId) where.organizationId = organizationId;
      if (status) where.status = status;
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { slug: { [Op.iLike]: `%${search}%` } },
        ];
      }
      const offset = (page - 1) * limit;
      const { rows, count } = await Application.findAndCountAll({
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
      return Application.findByPk(id);
    },

    async findByIdOrSlug(idOrSlug) {
      if (isUUID(idOrSlug)) return Application.findByPk(idOrSlug);
      return Application.findOne({ where: { slug: idOrSlug } });
    },

    async create(data) {
      const team = await Team.findByPk(data.teamId);
      if (!team) throw new Error("Team not found");

      const slug = buildCompoundSlug(team.slug, data.name);

      const app = await db.sequelize.transaction(async (t) => {
        const created = await Application.create(
          {
            ...data,
            slug,
            teamName: team.name,
            workspaceId: team.workspaceId,
            workspaceName: team.workspaceName,
            organizationId: team.organizationId,
            organizationName: team.organizationName,
          },
          { transaction: t },
        );
        await team.increment("applicationCount", { transaction: t });
        return created;
      });
      return app;
    },

    async update(id, data) {
      const app = await Application.findByPk(id);
      if (!app) return null;

      if (data.name && data.name !== app.name) {
        const oldSlug = app.slug;
        const parts = oldSlug.split(">>");
        parts[parts.length - 1] = slugify(data.name);
        const newSlug = parts.join(">>");
        data.slug = newSlug;

        return db.sequelize.transaction(async (t) => {
          await app.update(data, { transaction: t });
          const tables = getDescendantTableNames("application");
          for (const table of tables) {
            await db.sequelize.query(
              `UPDATE "${table}" SET slug = $2 || SUBSTRING(slug FROM LENGTH($1) + 1) WHERE slug LIKE $3`,
              {
                bind: [oldSlug, newSlug, oldSlug + ">>%"],
                transaction: t,
              },
            );
          }
          return app;
        });
      }

      return app.update(data);
    },

    async remove(id) {
      const app = await Application.findByPk(id);
      if (!app) return null;

      await db.sequelize.transaction(async (t) => {
        const team = await Team.findByPk(app.teamId, { transaction: t });
        await app.destroy({ transaction: t });
        if (team) await team.decrement("applicationCount", { transaction: t });
      });
      return app;
    },
  };
}
