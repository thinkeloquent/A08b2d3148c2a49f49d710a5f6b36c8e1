/**
 * Comments Routes — Figma API SDK
 */

export default async function commentsRoutes(server, { commentsClient }) {
  server.get('/files/:fileKey/comments', async (request) => {
    const { fileKey } = request.params;
    const { as_md } = request.query;
    return commentsClient.listComments(fileKey, { as_md: as_md === 'true' });
  });

  server.post('/files/:fileKey/comments', async (request, reply) => {
    const { fileKey } = request.params;
    const result = await commentsClient.addComment(fileKey, request.body);
    return reply.status(201).send(result);
  });

  server.delete('/files/:fileKey/comments/:commentId', async (request) => {
    const { fileKey, commentId } = request.params;
    return commentsClient.deleteComment(fileKey, commentId);
  });

  return Promise.resolve();
}
