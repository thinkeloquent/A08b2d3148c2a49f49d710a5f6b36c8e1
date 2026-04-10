/**
 * Comments CRUD Routes
 *
 * Local comment storage backed by Sequelize Comment/CommentReply models.
 * Mounted at /comments under the API prefix.
 */

import { Comment, CommentReply } from "@internal/figma-component-inspector-sequelize";

/** Map a Comment model instance to the shape the frontend expects. */
function toCommentDTO(comment) {
  return {
    id: comment.id,
    fileId: comment.figma_file_id,
    nodeId: comment.node_id,
    text: comment.content,
    userName: comment.author_name || "Unknown",
    userId: comment.author_handle || null,
    timestamp: comment.createdAt,
    resolved: false,
    replies: (comment.replies || []).map(toReplyDTO),
  };
}

function toReplyDTO(reply) {
  return {
    id: reply.id,
    commentId: reply.comment_id,
    text: reply.content,
    userName: reply.author_name || "Unknown",
    userId: reply.author_handle || null,
    timestamp: reply.createdAt,
  };
}

export default async function commentsRoutes(fastify, _options) {
  // GET /comments?fileId=...&nodeId=...
  fastify.get("/", async (request, reply) => {
    const { fileId, nodeId } = request.query;
    if (!fileId) {
      return reply.badRequest("fileId query parameter is required");
    }

    const where = { figma_file_id: fileId };
    if (nodeId) {
      where.node_id = nodeId;
    }

    const comments = await Comment.findAll({
      where,
      include: [{ model: CommentReply, as: "replies" }],
      order: [["created_at", "DESC"]],
    });

    return { success: true, data: comments.map(toCommentDTO) };
  });

  // POST /comments
  fastify.post("/", async (request, reply) => {
    const { fileId, nodeId, userId, userName, text } = request.body || {};
    if (!fileId || !text) {
      return reply.badRequest("fileId and text are required");
    }

    const comment = await Comment.create({
      figma_file_id: fileId,
      node_id: nodeId || null,
      content: text,
      author_name: userName || null,
      author_handle: userId || null,
    });

    // Reload with replies association
    const full = await Comment.findByPk(comment.id, {
      include: [{ model: CommentReply, as: "replies" }],
    });

    return { success: true, data: toCommentDTO(full) };
  });

  // PATCH /comments/:commentId
  fastify.patch("/:commentId", async (request, reply) => {
    const { commentId } = request.params;
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return reply.notFound(`Comment ${commentId} not found`);
    }

    const { text } = request.body || {};
    if (text !== undefined) {
      comment.content = text;
    }
    await comment.save();

    const full = await Comment.findByPk(comment.id, {
      include: [{ model: CommentReply, as: "replies" }],
    });

    return { success: true, data: toCommentDTO(full) };
  });

  // DELETE /comments/:commentId
  fastify.delete("/:commentId", async (request, reply) => {
    const { commentId } = request.params;
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return reply.notFound(`Comment ${commentId} not found`);
    }

    // Delete replies first, then the comment
    await CommentReply.destroy({ where: { comment_id: commentId } });
    await comment.destroy();

    return { success: true, data: { deleted: commentId } };
  });

  // POST /comments/:commentId/replies
  fastify.post("/:commentId/replies", async (request, reply) => {
    const { commentId } = request.params;
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return reply.notFound(`Comment ${commentId} not found`);
    }

    const { userId, userName, text } = request.body || {};
    if (!text) {
      return reply.badRequest("text is required");
    }

    const replyRecord = await CommentReply.create({
      comment_id: commentId,
      content: text,
      author_name: userName || null,
      author_handle: userId || null,
    });

    return { success: true, data: toReplyDTO(replyRecord) };
  });
}
