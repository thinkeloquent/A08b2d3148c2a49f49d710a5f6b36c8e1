import { createReferenceService } from "../services/reference.service.mjs";

export default async function referenceRoutes(fastify) {
  const service = createReferenceService(fastify.db);

  // GET /references
  fastify.get("/references", async (request, reply) => {
    const { entityType, entityId, type, search, page, limit } = request.query;
    const result = await service.findAll({
      entityType,
      entityId,
      type,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return reply.send({ success: true, ...result });
  });

  // GET /references/:id
  fastify.get("/references/:id", async (request, reply) => {
    const entity = await service.findById(request.params.id);
    if (!entity) {
      throw fastify.httpErrors.notFound("Reference not found");
    }
    return reply.send({ success: true, data: entity });
  });

  // POST /references
  fastify.post("/references", async (request, reply) => {
    const entity = await service.create(request.body);
    return reply.status(201).send({ success: true, data: entity });
  });

  // PUT /references/:id
  fastify.put("/references/:id", async (request, reply) => {
    const entity = await service.update(request.params.id, request.body);
    if (!entity) {
      throw fastify.httpErrors.notFound("Reference not found");
    }
    return reply.send({ success: true, data: entity });
  });

  // DELETE /references/:id
  fastify.delete("/references/:id", async (request, reply) => {
    const entity = await service.remove(request.params.id);
    if (!entity) {
      throw fastify.httpErrors.notFound("Reference not found");
    }
    return reply.send({
      success: true,
      message: `Reference ${request.params.id} deleted successfully`,
    });
  });
}
