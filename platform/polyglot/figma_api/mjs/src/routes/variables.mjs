/**
 * Variables Routes — Figma API SDK (Enterprise)
 */

export default async function variablesRoutes(server, { variablesClient }) {
  server.get('/files/:fileKey/variables/local', async (request) => {
    return variablesClient.getLocalVariables(request.params.fileKey);
  });

  server.get('/files/:fileKey/variables/published', async (request) => {
    return variablesClient.getPublishedVariables(request.params.fileKey);
  });

  server.post('/files/:fileKey/variables', async (request, reply) => {
    const result = await variablesClient.createVariables(request.params.fileKey, request.body);
    return reply.status(201).send(result);
  });

  return Promise.resolve();
}
