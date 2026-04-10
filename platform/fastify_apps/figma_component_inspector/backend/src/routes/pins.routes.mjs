/**
 * Pinned Nodes CRUD Routes
 *
 * Local pin storage backed by Sequelize PinnedNode model.
 * Mounted at /pins under the API prefix.
 */

import { PinnedNode } from "@internal/figma-component-inspector-sequelize";

/** Map a PinnedNode model instance to the shape the frontend expects. */
function toPinDTO(pin) {
  return {
    id: pin.id,
    fileId: pin.figma_file_id,
    nodeId: pin.node_id,
    nodeName: pin.node_name,
    nodeType: pin.node_type,
    tags: pin.tags || [],
    description: pin.description,
    nodePath: pin.node_path,
    pinnedBy: pin.pinned_by,
    createdAt: pin.createdAt,
    updatedAt: pin.updatedAt,
  };
}

export default async function pinsRoutes(fastify, _options) {
  // GET /pins?fileId=...&nodeId=...&tag=...
  fastify.get("/", async (request, reply) => {
    const { fileId, nodeId, tag } = request.query;
    if (!fileId) {
      return reply.badRequest("fileId query parameter is required");
    }

    const where = { figma_file_id: fileId };
    if (nodeId) {
      where.node_id = nodeId;
    }

    const pins = await PinnedNode.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    let result = pins.map(toPinDTO);

    // Optional client-side tag filter
    if (tag) {
      result = result.filter((p) => p.tags.includes(tag));
    }

    return { success: true, data: result };
  });

  // GET /pins/:pinId
  fastify.get("/:pinId", async (request, reply) => {
    const { pinId } = request.params;
    const pin = await PinnedNode.findByPk(pinId);
    if (!pin) {
      return reply.notFound(`Pin ${pinId} not found`);
    }
    return { success: true, data: toPinDTO(pin) };
  });

  // POST /pins
  fastify.post("/", async (request, reply) => {
    const {
      fileId,
      nodeId,
      nodeName,
      nodeType,
      tags,
      description,
      nodePath,
      pinnedBy,
    } = request.body || {};

    if (!fileId || !nodeId) {
      return reply.badRequest("fileId and nodeId are required");
    }

    const pin = await PinnedNode.create({
      figma_file_id: fileId,
      node_id: nodeId,
      node_name: nodeName || null,
      node_type: nodeType || null,
      tags: Array.isArray(tags) ? tags : [],
      description: description || null,
      node_path: nodePath || null,
      pinned_by: pinnedBy || null,
    });

    return { success: true, data: toPinDTO(pin) };
  });

  // PATCH /pins/:pinId
  fastify.patch("/:pinId", async (request, reply) => {
    const { pinId } = request.params;
    const pin = await PinnedNode.findByPk(pinId);
    if (!pin) {
      return reply.notFound(`Pin ${pinId} not found`);
    }

    const { tags, description } = request.body || {};
    if (tags !== undefined) pin.tags = Array.isArray(tags) ? tags : [];
    if (description !== undefined) pin.description = description;
    await pin.save();

    return { success: true, data: toPinDTO(pin) };
  });

  // DELETE /pins/:pinId
  fastify.delete("/:pinId", async (request, reply) => {
    const { pinId } = request.params;
    const pin = await PinnedNode.findByPk(pinId);
    if (!pin) {
      return reply.notFound(`Pin ${pinId} not found`);
    }

    await pin.destroy();
    return { success: true, data: { deleted: pinId } };
  });
}
