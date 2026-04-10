import { analyzeFileSchema } from "../services/schema.service.mjs";
import { analyzeComponentAtlas } from "../services/component-atlas.service.mjs";

export default async function schemaRoutes(fastify, _options) {
  const figmaService = fastify.figmaService;

  // GET /schema/:fileId
  fastify.get("/:fileId", async (request, reply) => {
    const { fileId } = request.params;
    if (!fileId?.trim()) {
      return reply.badRequest("fileId is required");
    }

    try {
      const fileData = await figmaService.getFigmaFile(fileId);
      const data = analyzeFileSchema(fileData);
      return { success: true, data };
    } catch (err) {
      request.log.error(err, "Error generating schema summary");
      return reply.status(err.statusCode || 500).send({
        success: false,
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  });

  // GET /schema/:fileId/component-atlas
  fastify.get("/:fileId/component-atlas", async (request, reply) => {
    const { fileId } = request.params;
    if (!fileId?.trim()) {
      return reply.badRequest("fileId is required");
    }

    try {
      const [fileData, devResources] = await Promise.all([
        figmaService.getFigmaFile(fileId),
        figmaService.getDevResources(fileId).catch(() => []),
      ]);
      const data = analyzeComponentAtlas(fileData, devResources);
      return { success: true, data };
    } catch (err) {
      request.log.error(err, "Error generating component atlas");
      return reply.status(err.statusCode || 500).send({
        success: false,
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  });
}
