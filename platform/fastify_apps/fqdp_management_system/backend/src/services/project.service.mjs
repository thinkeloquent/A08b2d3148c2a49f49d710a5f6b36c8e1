import { Op } from "sequelize";
import { buildCompoundSlug, slugify, getDescendantTableNames } from "../utils/fqdp.mjs";
import { isUUID } from "../utils/lookup.mjs";

export function createProjectService(db) {
  const { Project, Application } = db;

  return {
    async findAll({ applicationId, teamId, workspaceId, organizationId, status, search, page = 1, limit = 50 } = {}) {
      const where = {};
      if (applicationId) where.applicationId = applicationId;
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
      const { rows, count } = await Project.findAndCountAll({
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
      return Project.findByPk(id);
    },

    async findByIdOrSlug(idOrSlug) {
      if (isUUID(idOrSlug)) return Project.findByPk(idOrSlug);
      return Project.findOne({ where: { slug: idOrSlug } });
    },

    async create(data) {
      const app = await Application.findByPk(data.applicationId);
      if (!app) throw new Error("Application not found");

      const slug = buildCompoundSlug(app.slug, data.name);

      const project = await db.sequelize.transaction(async (t) => {
        const created = await Project.create(
          {
            ...data,
            slug,
            applicationName: app.name,
            teamId: app.teamId,
            teamName: app.teamName,
            workspaceId: app.workspaceId,
            workspaceName: app.workspaceName,
            organizationId: app.organizationId,
            organizationName: app.organizationName,
          },
          { transaction: t },
        );
        await app.increment("projectCount", { transaction: t });
        return created;
      });
      return project;
    },

    async update(id, data) {
      const project = await Project.findByPk(id);
      if (!project) return null;

      if (data.name && data.name !== project.name) {
        const oldSlug = project.slug;
        const parts = oldSlug.split(">>");
        parts[parts.length - 1] = slugify(data.name);
        const newSlug = parts.join(">>");
        data.slug = newSlug;

        return db.sequelize.transaction(async (t) => {
          await project.update(data, { transaction: t });
          const tables = getDescendantTableNames("project");
          for (const table of tables) {
            await db.sequelize.query(
              `UPDATE "${table}" SET slug = $2 || SUBSTRING(slug FROM LENGTH($1) + 1) WHERE slug LIKE $3`,
              {
                bind: [oldSlug, newSlug, oldSlug + ">>%"],
                transaction: t,
              },
            );
          }
          return project;
        });
      }

      return project.update(data);
    },

    async remove(id) {
      const project = await Project.findByPk(id);
      if (!project) return null;

      await db.sequelize.transaction(async (t) => {
        const app = await Application.findByPk(project.applicationId, { transaction: t });
        await project.destroy({ transaction: t });
        if (app) await app.decrement("projectCount", { transaction: t });
      });
      return project;
    },
  };
}
