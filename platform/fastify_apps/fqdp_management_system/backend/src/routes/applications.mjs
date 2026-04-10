import { createApplicationService } from "../services/application.service.mjs";

export default async function applicationRoutes(fastify) {
  const service = createApplicationService(fastify.db);

  // GET /applications
  fastify.get("/applications", async (request, reply) => {
    const { teamId, workspaceId, organizationId, status, search, page, limit } =
      request.query;
    const result = await service.findAll({
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

  // GET /applications/:id
  fastify.get("/applications/:id", async (request, reply) => {
    const entity = await service.findByIdOrSlug(request.params.id);
    if (!entity) {
      throw fastify.httpErrors.notFound("Application not found");
    }
    return reply.send({ success: true, data: entity });
  });

  // POST /applications
  fastify.post("/applications", async (request, reply) => {
    const entity = await service.create(request.body);
    return reply.status(201).send({ success: true, data: entity });
  });

  // PUT /applications/:id
  fastify.put("/applications/:id", async (request, reply) => {
    const resolved = await service.findByIdOrSlug(request.params.id);
    if (!resolved) {
      throw fastify.httpErrors.notFound("Application not found");
    }
    const entity = await service.update(resolved.id, request.body);
    return reply.send({ success: true, data: entity });
  });

  // DELETE /applications/:id
  fastify.delete("/applications/:id", async (request, reply) => {
    const resolved = await service.findByIdOrSlug(request.params.id);
    if (!resolved) {
      throw fastify.httpErrors.notFound("Application not found");
    }
    await service.remove(resolved.id);
    return reply.send({
      success: true,
      message: `Application ${request.params.id} deleted successfully`,
    });
  });
}
