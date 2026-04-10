/**
 * Dev Resources Routes — Figma API SDK
 */

export default async function devResourcesRoutes(server, { devResourcesClient }) {
  server.get('/files/:fileKey/dev_resources', async (request) => {
    const { fileKey } = request.params;
    const { node_id } = request.query;
    return devResourcesClient.listDevResources(fileKey, { nodeId: node_id });
  });

  server.post('/files/:fileKey/dev_resources', async (request, reply) => {
    const result = await devResourcesClient.createDevResources(request.params.fileKey, request.body);
    return reply.status(201).send(result);
  });

  server.put('/files/:fileKey/dev_resources', async (request) => {
    return devResourcesClient.updateDevResources(request.params.fileKey, request.body);
  });

  server.delete('/files/:fileKey/dev_resources/:devResourceId', async (request) => {
    const { fileKey, devResourceId } = request.params;
    return devResourcesClient.deleteDevResource(fileKey, devResourceId);
  });

  return Promise.resolve();
}
