import { validateSchema } from "../zod-schema-contract/common/index.mjs";
import {
  GetChecklistParamsSchema,
  ListChecklistsQuerySchema,
} from "../zod-schema-contract/checklists/index.mjs";
import { createChecklistService } from "../services/checklist.service.mjs";
import { serializeChecklist } from "./serializers.mjs";

export default async function checklistRoutes(fastify) {
  const service = createChecklistService(fastify.db);

  // POST /checklists
  fastify.post("/checklists", async (request, reply) => {
    const checklist = await service.generateChecklist(request.body);
    return reply.status(201).send({ success: true, data: serializeChecklist(checklist) });
  });

  // GET /checklists/:id
  fastify.get("/checklists/:id", async (request, reply) => {
    const params = validateSchema(
      GetChecklistParamsSchema,
      request.params,
      "Invalid parameters",
    );
    const checklist = await service.getChecklist(params.id);
    return reply.status(200).send({ success: true, data: serializeChecklist(checklist) });
  });

  // GET /checklists
  fastify.get("/checklists", async (request, reply) => {
    const query = validateSchema(
      ListChecklistsQuerySchema,
      request.query,
      "Invalid query parameters",
    );
    const result = await service.listChecklists(query);
    return reply
      .status(200)
      .send({ success: true, data: result.checklists.map(serializeChecklist), meta: result.meta });
  });
}
