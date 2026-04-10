/**
 * Figma API Routes
 *
 * Provides endpoints for fetching Figma file data, component images,
 * variables, node properties, and comments.
 */

export default async function figmaRoutes(fastify, _options) {
  const figmaService = fastify.figmaService;

  // GET /files/:fileId — Fetch a complete Figma file
  fastify.get("/files/:fileId", async (request, reply) => {
    const { fileId } = request.params;
    if (!fileId?.trim()) {
      return reply.badRequest("fileId is required");
    }
    try {
      const data = await figmaService.getFigmaFile(fileId);
      return { success: true, data };
    } catch (err) {
      request.log.error(err, "Error fetching Figma file");
      return reply.status(err.statusCode || 500).send({
        success: false,
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  });

  // GET /files/:fileId/meta — Fetch file metadata (folder_name, creator, etc.)
  fastify.get("/files/:fileId/meta", async (request, reply) => {
    const { fileId } = request.params;
    if (!fileId?.trim()) {
      return reply.badRequest("fileId is required");
    }
    try {
      const data = await figmaService.getFileMeta(fileId);
      return { success: true, data };
    } catch (err) {
      request.log.error(err, "Error fetching Figma file metadata");
      return reply.status(err.statusCode || 500).send({
        success: false,
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  });

  // GET /images/:fileId — Get rendered images for nodes
  // Query params: nodeIds (comma-separated), scale (default 2.0), format (default 'png')
  fastify.get("/images/:fileId", async (request, reply) => {
    const { fileId } = request.params;
    if (!fileId?.trim()) {
      return reply.badRequest("fileId is required");
    }

    const { nodeIds, scale, format } = request.query;
    if (!nodeIds?.trim()) {
      return reply.badRequest("nodeIds query parameter is required (comma-separated node IDs)");
    }

    const nodeIdArray = nodeIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (nodeIdArray.length === 0) {
      return reply.badRequest("At least one valid nodeId is required");
    }

    const parsedScale = scale ? parseFloat(scale) : 2.0;
    const validScale = Number.isFinite(parsedScale) && parsedScale > 0 ? parsedScale : 2.0;

    try {
      const data = await figmaService.getComponentImages(
        fileId,
        nodeIdArray,
        validScale,
        format || "png",
      );
      return { success: true, data };
    } catch (err) {
      request.log.error(err, "Error fetching component images");
      return reply.status(err.statusCode || 500).send({
        success: false,
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  });

  // GET /token-export/:fileId — Rich token-node association map for export
  fastify.get("/token-export/:fileId", async (request, reply) => {
    const { fileId } = request.params;
    if (!fileId?.trim()) {
      return reply.badRequest("fileId is required");
    }

    try {
      const result = await figmaService.getTokenNodeMap(fileId);
      return { success: true, data: result };
    } catch (err) {
      request.log.error(err, "Error building token export");
      return reply.status(err.statusCode || 500).send({
        success: false,
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  });

  // GET /variables/:fileId — Get local variables for a file
  fastify.get("/variables/:fileId", async (request, reply) => {
    const { fileId } = request.params;
    if (!fileId?.trim()) {
      return reply.badRequest("fileId is required");
    }

    try {
      const variables = await figmaService.getFileVariables(fileId);
      return { success: true, data: variables };
    } catch (err) {
      request.log.error(err, "Error fetching file variables");
      return reply.status(err.statusCode || 500).send({
        success: false,
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  });

  // GET /node/:fileId/:nodeId — Fetch a specific node and extract its properties
  fastify.get("/node/:fileId/:nodeId", async (request, reply) => {
    const { fileId, nodeId } = request.params;
    if (!fileId?.trim()) {
      return reply.badRequest("fileId is required");
    }
    if (!nodeId?.trim()) {
      return reply.badRequest("nodeId is required");
    }

    try {
      const fileData = await figmaService.getFigmaFile(fileId);
      const document = fileData?.document;
      if (!document) {
        return reply.status(500).send({
          success: false,
          error: "Invalid Figma file structure — no document root",
          statusCode: 500,
        });
      }

      const node = figmaService.findNodeById(document, nodeId);
      if (!node) {
        return reply.notFound(`Node "${nodeId}" not found in file "${fileId}"`);
      }

      const properties = figmaService.extractComponentProperties(node);

      return {
        success: true,
        data: {
          id: node.id,
          name: node.name,
          type: node.type,
          properties,
        },
      };
    } catch (err) {
      request.log.error(err, "Error fetching node");
      return reply.status(err.statusCode || 500).send({
        success: false,
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  });

  // GET /components/:fileId — List all component nodes in a file
  fastify.get("/components/:fileId", async (request, reply) => {
    const { fileId } = request.params;
    if (!fileId?.trim()) {
      return reply.badRequest("fileId is required");
    }

    try {
      const fileData = await figmaService.getFigmaFile(fileId);
      const document = fileData?.document;
      if (!document) {
        return reply.status(500).send({
          success: false,
          error: "Invalid Figma file structure — no document root",
          statusCode: 500,
        });
      }

      const components = figmaService.getAllComponentNodes(document);

      return {
        success: true,
        data: components.map((comp) => ({
          id: comp.id,
          name: comp.name,
          type: comp.type,
          properties: figmaService.extractComponentProperties(comp),
        })),
        count: components.length,
      };
    } catch (err) {
      request.log.error(err, "Error fetching components");
      return reply.status(err.statusCode || 500).send({
        success: false,
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  });

  // GET /files/:fileId/comments — Proxy to Figma comments API
  fastify.get("/files/:fileId/comments", async (request, reply) => {
    const { fileId } = request.params;
    if (!fileId?.trim()) {
      return reply.badRequest("fileId is required");
    }

    const token = figmaService.token;
    if (!token) {
      return reply.status(503).send({
        success: false,
        error: "FIGMA_TOKEN is not configured",
        statusCode: 503,
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    try {
      const url = `https://api.figma.com/v1/files/${encodeURIComponent(fileId.trim())}/comments`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-Figma-Token": token,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        return reply.status(response.status).send({
          success: false,
          error: `Figma API error ${response.status}: ${body || response.statusText}`,
          statusCode: response.status,
        });
      }

      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      if (err.name === "AbortError") {
        return reply.status(504).send({
          success: false,
          error: "Figma comments API request timed out",
          statusCode: 504,
        });
      }
      request.log.error(err, "Error fetching Figma comments");
      return reply.status(err.statusCode || 500).send({
        success: false,
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  });
}
