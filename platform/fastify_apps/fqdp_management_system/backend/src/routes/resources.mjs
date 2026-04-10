import { createResourceService } from "../services/resource.service.mjs";

export default async function resourceRoutes(fastify) {
  const service = createResourceService(fastify.db);

  // GET /resources
  fastify.get("/resources", async (request, reply) => {
    const {
      projectId,
      applicationId,
      teamId,
      workspaceId,
      organizationId,
      resourceType,
      status,
      search,
      page,
      limit,
    } = request.query;
    const result = await service.findAll({
      projectId,
      applicationId,
      teamId,
      workspaceId,
      organizationId,
      resourceType,
      status,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return reply.send({ success: true, ...result });
  });

  // GET /resources/:id
  fastify.get("/resources/:id", async (request, reply) => {
    const entity = await service.findByIdOrSlug(request.params.id);
    if (!entity) {
      throw fastify.httpErrors.notFound("Resource not found");
    }
    return reply.send({ success: true, data: entity });
  });

  // POST /resources
  fastify.post("/resources", async (request, reply) => {
    const entity = await service.create(request.body);
    return reply.status(201).send({ success: true, data: entity });
  });

  // PUT /resources/:id
  fastify.put("/resources/:id", async (request, reply) => {
    const resolved = await service.findByIdOrSlug(request.params.id);
    if (!resolved) {
      throw fastify.httpErrors.notFound("Resource not found");
    }
    const entity = await service.update(resolved.id, request.body);
    return reply.send({ success: true, data: entity });
  });

  // DELETE /resources/:id
  fastify.delete("/resources/:id", async (request, reply) => {
    const resolved = await service.findByIdOrSlug(request.params.id);
    if (!resolved) {
      throw fastify.httpErrors.notFound("Resource not found");
    }
    await service.remove(resolved.id);
    return reply.send({
      success: true,
      message: `Resource ${request.params.id} deleted successfully`,
    });
  });
}
