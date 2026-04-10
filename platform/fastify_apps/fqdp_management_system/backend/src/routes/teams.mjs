import { createTeamService } from "../services/team.service.mjs";

export default async function teamRoutes(fastify) {
  const service = createTeamService(fastify.db);

  // GET /teams
  fastify.get("/teams", async (request, reply) => {
    const { workspaceId, organizationId, status, search, page, limit } =
      request.query;
    const result = await service.findAll({
      workspaceId,
      organizationId,
      status,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return reply.send({ success: true, ...result });
  });

  // GET /teams/:id
  fastify.get("/teams/:id", async (request, reply) => {
    const entity = await service.findByIdOrSlug(request.params.id);
    if (!entity) {
      throw fastify.httpErrors.notFound("Team not found");
    }
    return reply.send({ success: true, data: entity });
  });

  // POST /teams
  fastify.post("/teams", async (request, reply) => {
    const entity = await service.create(request.body);
    return reply.status(201).send({ success: true, data: entity });
  });

  // PUT /teams/:id
  fastify.put("/teams/:id", async (request, reply) => {
    const resolved = await service.findByIdOrSlug(request.params.id);
    if (!resolved) {
      throw fastify.httpErrors.notFound("Team not found");
    }
    const entity = await service.update(resolved.id, request.body);
    return reply.send({ success: true, data: entity });
  });

  // DELETE /teams/:id
  fastify.delete("/teams/:id", async (request, reply) => {
    const resolved = await service.findByIdOrSlug(request.params.id);
    if (!resolved) {
      throw fastify.httpErrors.notFound("Team not found");
    }
    await service.remove(resolved.id);
    return reply.send({
      success: true,
      message: `Team ${request.params.id} deleted successfully`,
    });
  });
}
