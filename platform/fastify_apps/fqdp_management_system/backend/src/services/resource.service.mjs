import { Op } from "sequelize";
import { buildCompoundSlug, slugify } from "../utils/fqdp.mjs";
import { isUUID } from "../utils/lookup.mjs";

export function createResourceService(db) {
  const { Resource, Project } = db;

  return {
    async findAll({ projectId, applicationId, teamId, workspaceId, organizationId, resourceType, status, search, page = 1, limit = 50 } = {}) {
      const where = {};
      if (projectId) where.projectId = projectId;
      if (applicationId) where.applicationId = applicationId;
      if (teamId) where.teamId = teamId;
      if (workspaceId) where.workspaceId = workspaceId;
      if (organizationId) where.organizationId = organizationId;
      if (resourceType) where.resourceType = resourceType;
      if (status) where.status = status;
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { slug: { [Op.iLike]: `%${search}%` } },
          { resourceName: { [Op.iLike]: `%${search}%` } },
        ];
      }
      const offset = (page - 1) * limit;
      const { rows, count } = await Resource.findAndCountAll({
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
      return Resource.findByPk(id);
    },

    async findByIdOrSlug(idOrSlug) {
      if (isUUID(idOrSlug)) return Resource.findByPk(idOrSlug);
      return Resource.findOne({ where: { slug: idOrSlug } });
    },

    async create(data) {
      const project = await Project.findByPk(data.projectId);
      if (!project) throw new Error("Project not found");

      const slug = buildCompoundSlug(project.slug, data.name);
      const fqdpId = slug.replaceAll(">>", "/");

      const resource = await db.sequelize.transaction(async (t) => {
        const created = await Resource.create(
          {
            ...data,
            slug,
            fqdpId,
            projectName: project.name,
            applicationId: project.applicationId,
            applicationName: project.applicationName,
            teamId: project.teamId,
            teamName: project.teamName,
            workspaceId: project.workspaceId,
            workspaceName: project.workspaceName,
            organizationId: project.organizationId,
            organizationName: project.organizationName,
          },
          { transaction: t },
        );
        await project.increment("resourceCount", { transaction: t });
        return created;
      });
      return resource;
    },

    async update(id, data) {
      const resource = await Resource.findByPk(id);
      if (!resource) return null;

      if (data.name && data.name !== resource.name) {
        const oldSlug = resource.slug;
        const parts = oldSlug.split(">>");
        parts[parts.length - 1] = slugify(data.name);
        const newSlug = parts.join(">>");
        data.slug = newSlug;
        data.fqdpId = newSlug.replaceAll(">>", "/");
      }

      return resource.update(data);
    },

    async remove(id) {
      const resource = await Resource.findByPk(id);
      if (!resource) return null;

      await db.sequelize.transaction(async (t) => {
        const project = await Project.findByPk(resource.projectId, {
          transaction: t,
        });
        await resource.destroy({ transaction: t });
        if (project) await project.decrement("resourceCount", { transaction: t });
      });
      return resource;
    },
  };
}
