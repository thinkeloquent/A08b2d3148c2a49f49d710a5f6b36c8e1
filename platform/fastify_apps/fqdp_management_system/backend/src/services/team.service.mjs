import { Op } from "sequelize";
import { buildCompoundSlug, slugify, getDescendantTableNames } from "../utils/fqdp.mjs";
import { isUUID } from "../utils/lookup.mjs";

export function createTeamService(db) {
  const { Team, Workspace, Organization } = db;

  return {
    async findAll({ workspaceId, organizationId, status, search, page = 1, limit = 50 } = {}) {
      const where = {};
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
      const { rows, count } = await Team.findAndCountAll({
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
      return Team.findByPk(id);
    },

    async findByIdOrSlug(idOrSlug) {
      if (isUUID(idOrSlug)) return Team.findByPk(idOrSlug);
      return Team.findOne({ where: { slug: idOrSlug } });
    },

    async create(data) {
      const ws = await Workspace.findByPk(data.workspaceId);
      if (!ws) throw new Error("Workspace not found");

      const slug = buildCompoundSlug(ws.slug, data.name);

      const team = await db.sequelize.transaction(async (t) => {
        const created = await Team.create(
          {
            ...data,
            slug,
            workspaceName: ws.name,
            organizationId: ws.organizationId,
            organizationName: ws.organizationName,
          },
          { transaction: t },
        );
        await ws.increment("teamCount", { transaction: t });
        return created;
      });
      return team;
    },

    async update(id, data) {
      const team = await Team.findByPk(id);
      if (!team) return null;

      if (data.name && data.name !== team.name) {
        const oldSlug = team.slug;
        const parts = oldSlug.split(">>");
        parts[parts.length - 1] = slugify(data.name);
        const newSlug = parts.join(">>");
        data.slug = newSlug;

        return db.sequelize.transaction(async (t) => {
          await team.update(data, { transaction: t });
          const tables = getDescendantTableNames("team");
          for (const table of tables) {
            await db.sequelize.query(
              `UPDATE "${table}" SET slug = $2 || SUBSTRING(slug FROM LENGTH($1) + 1) WHERE slug LIKE $3`,
              {
                bind: [oldSlug, newSlug, oldSlug + ">>%"],
                transaction: t,
              },
            );
          }
          return team;
        });
      }

      return team.update(data);
    },

    async remove(id) {
      const team = await Team.findByPk(id);
      if (!team) return null;

      await db.sequelize.transaction(async (t) => {
        const ws = await Workspace.findByPk(team.workspaceId, { transaction: t });
        await team.destroy({ transaction: t });
        if (ws) await ws.decrement("teamCount", { transaction: t });
      });
      return team;
    },
  };
}
