/**
 * Node Labels CRUD Routes
 *
 * Stores user-defined display names for Figma nodes.
 * Mounted at /node-labels under the API prefix.
 */

import { NodeLabel } from "@internal/figma-component-inspector-sequelize";

function toLabelDTO(label) {
  return {
    id: label.id,
    fileId: label.figma_file_id,
    nodeId: label.node_id,
    displayName: label.display_name,
    createdAt: label.createdAt,
    updatedAt: label.updatedAt,
  };
}

export default async function nodeLabelsRoutes(fastify, _options) {
  // GET /node-labels?fileId=...
  // Returns a map of nodeId -> displayName for efficient lookup
  fastify.get("/", async (request, reply) => {
    const { fileId } = request.query;
    if (!fileId) {
      return reply.badRequest("fileId query parameter is required");
    }

    const labels = await NodeLabel.findAll({
      where: { figma_file_id: fileId },
      order: [["created_at", "DESC"]],
    });

    return { success: true, data: labels.map(toLabelDTO) };
  });

  // PUT /node-labels  (upsert — create or update)
  fastify.put("/", async (request, reply) => {
    const { fileId, nodeId, displayName } = request.body || {};
    if (!fileId || !nodeId) {
      return reply.badRequest("fileId and nodeId are required");
    }

    if (!displayName || !displayName.trim()) {
      // If displayName is empty, delete the label
      await NodeLabel.destroy({
        where: { figma_file_id: fileId, node_id: nodeId },
      });
      return { success: true, data: null };
    }

    const [label] = await NodeLabel.upsert(
      {
        figma_file_id: fileId,
        node_id: nodeId,
        display_name: displayName.trim(),
      },
      {
        conflictFields: ["figma_file_id", "node_id"],
      },
    );

    return { success: true, data: toLabelDTO(label) };
  });

  // DELETE /node-labels/:labelId
  fastify.delete("/:labelId", async (request, reply) => {
    const { labelId } = request.params;
    const label = await NodeLabel.findByPk(labelId);
    if (!label) {
      return reply.notFound(`Label ${labelId} not found`);
    }

    await label.destroy();
    return { success: true, data: { deleted: labelId } };
  });
}
