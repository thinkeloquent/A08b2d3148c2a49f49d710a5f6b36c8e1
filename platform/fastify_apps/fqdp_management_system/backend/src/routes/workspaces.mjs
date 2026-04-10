import { createWorkspaceService } from "../services/workspace.service.mjs";

export default async function workspaceRoutes(fastify) {
  const service = createWorkspaceService(fastify.db);

  // GET /workspaces
  fastify.get("/workspaces", async (request, reply) => {
    const { organizationId, status, search, page, limit } = request.query;
    const result = await service.findAll({
      organizationId,
      status,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return reply.send({ success: true, ...result });
  });

  // GET /workspaces/:id
  fastify.get("/workspaces/:id", async (request, reply) => {
    const entity = await service.findByIdOrSlug(request.params.id);
    if (!entity) {
      throw fastify.httpErrors.notFound("Workspace not found");
    }
    return reply.send({ success: true, data: entity });
  });

  // POST /workspaces
  fastify.post("/workspaces", async (request, reply) => {
    const entity = await service.create(request.body);
    return reply.status(201).send({ success: true, data: entity });
  });

  // PUT /workspaces/:id
  fastify.put("/workspaces/:id", async (request, reply) => {
    const resolved = await service.findByIdOrSlug(request.params.id);
    if (!resolved) {
      throw fastify.httpErrors.notFound("Workspace not found");
    }
    const entity = await service.update(resolved.id, request.body);
    return reply.send({ success: true, data: entity });
  });

  // DELETE /workspaces/:id
  fastify.delete("/workspaces/:id", async (request, reply) => {
    const resolved = await service.findByIdOrSlug(request.params.id);
    if (!resolved) {
      throw fastify.httpErrors.notFound("Workspace not found");
    }
    await service.remove(resolved.id);
    return reply.send({
      success: true,
      message: `Workspace ${request.params.id} deleted successfully`,
    });
  });
}
