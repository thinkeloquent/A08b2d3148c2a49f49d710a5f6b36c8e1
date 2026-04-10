import { createProjectService } from "../services/project.service.mjs";

export default async function projectRoutes(fastify) {
  const service = createProjectService(fastify.db);

  // GET /projects
  fastify.get("/projects", async (request, reply) => {
    const {
      applicationId,
      teamId,
      workspaceId,
      organizationId,
      status,
      search,
      page,
      limit,
    } = request.query;
    const result = await service.findAll({
      applicationId,
      teamId,
      workspaceId,
      organizationId,
      status,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return reply.send({ success: true, ...result });
  });

  // GET /projects/:id
  fastify.get("/projects/:id", async (request, reply) => {
    const entity = await service.findByIdOrSlug(request.params.id);
    if (!entity) {
      throw fastify.httpErrors.notFound("Project not found");
    }
    return reply.send({ success: true, data: entity });
  });

  // POST /projects
  fastify.post("/projects", async (request, reply) => {
    const entity = await service.create(request.body);
    return reply.status(201).send({ success: true, data: entity });
  });

  // PUT /projects/:id
  fastify.put("/projects/:id", async (request, reply) => {
    const resolved = await service.findByIdOrSlug(request.params.id);
    if (!resolved) {
      throw fastify.httpErrors.notFound("Project not found");
    }
    const entity = await service.update(resolved.id, request.body);
    return reply.send({ success: true, data: entity });
  });

  // DELETE /projects/:id
  fastify.delete("/projects/:id", async (request, reply) => {
    const resolved = await service.findByIdOrSlug(request.params.id);
    if (!resolved) {
      throw fastify.httpErrors.notFound("Project not found");
    }
    await service.remove(resolved.id);
    return reply.send({
      success: true,
      message: `Project ${request.params.id} deleted successfully`,
    });
  });
}
