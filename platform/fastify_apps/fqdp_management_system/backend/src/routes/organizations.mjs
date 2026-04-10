import { createOrganizationService } from "../services/organization.service.mjs";

export default async function organizationRoutes(fastify) {
  const service = createOrganizationService(fastify.db);

  // GET /organizations
  fastify.get("/organizations", async (request, reply) => {
    const { status, search, page, limit } = request.query;
    const result = await service.findAll({
      status,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return reply.send({ success: true, ...result });
  });

  // GET /organizations/:id
  fastify.get("/organizations/:id", async (request, reply) => {
    const entity = await service.findByIdOrSlug(request.params.id);
    if (!entity) {
      throw fastify.httpErrors.notFound("Organization not found");
    }
    return reply.send({ success: true, data: entity });
  });

  // POST /organizations
  fastify.post("/organizations", async (request, reply) => {
    const entity = await service.create(request.body);
    return reply.status(201).send({ success: true, data: entity });
  });

  // PUT /organizations/:id
  fastify.put("/organizations/:id", async (request, reply) => {
    const resolved = await service.findByIdOrSlug(request.params.id);
    if (!resolved) {
      throw fastify.httpErrors.notFound("Organization not found");
    }
    const entity = await service.update(resolved.id, request.body);
    return reply.send({ success: true, data: entity });
  });

  // DELETE /organizations/:id
  fastify.delete("/organizations/:id", async (request, reply) => {
    const resolved = await service.findByIdOrSlug(request.params.id);
    if (!resolved) {
      throw fastify.httpErrors.notFound("Organization not found");
    }
    await service.remove(resolved.id);
    return reply.send({
      success: true,
      message: `Organization ${request.params.id} deleted successfully`,
    });
  });
}
