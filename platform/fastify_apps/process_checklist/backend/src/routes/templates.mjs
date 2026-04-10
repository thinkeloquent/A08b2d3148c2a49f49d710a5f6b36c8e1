import { validateSchema } from "../zod-schema-contract/common/index.mjs";
import {
  GetTemplateParamsSchema,
  ListTemplatesQuerySchema,
  DeleteTemplateParamsSchema,
} from "../zod-schema-contract/templates/index.mjs";
import { createTemplateService } from "../services/template.service.mjs";
import { serializeTemplate } from "./serializers.mjs";

export default async function templateRoutes(fastify) {
  const service = createTemplateService(fastify.db);

  // POST /templates
  fastify.post("/templates", async (request, reply) => {
    const template = await service.createTemplate(request.body);
    return reply.status(201).send({ success: true, data: serializeTemplate(template) });
  });

  // GET /templates/:id
  fastify.get("/templates/:id", async (request, reply) => {
    const params = validateSchema(
      GetTemplateParamsSchema,
      request.params,
      "Invalid parameters",
    );
    const template = await service.getTemplate(params.id);
    return reply.status(200).send({ success: true, data: serializeTemplate(template) });
  });

  // GET /templates
  fastify.get("/templates", async (request, reply) => {
    const query = validateSchema(
      ListTemplatesQuerySchema,
      request.query,
      "Invalid query parameters",
    );
    const result = await service.listTemplates(query);
    return reply
      .status(200)
      .send({ success: true, data: result.templates.map(serializeTemplate), meta: result.meta });
  });

  // PUT /templates/:id
  fastify.put("/templates/:id", async (request, reply) => {
    const params = validateSchema(
      GetTemplateParamsSchema,
      request.params,
      "Invalid parameters",
    );
    const template = await service.updateTemplate(params.id, request.body);
    return reply.status(200).send({ success: true, data: serializeTemplate(template) });
  });

  // DELETE /templates/:id
  fastify.delete("/templates/:id", async (request, reply) => {
    const params = validateSchema(
      DeleteTemplateParamsSchema,
      request.params,
      "Invalid parameters",
    );
    await service.deleteTemplate(params.id);
    return reply.status(200).send({
      success: true,
      message: `Template ${params.id} deleted successfully`,
    });
  });
}
