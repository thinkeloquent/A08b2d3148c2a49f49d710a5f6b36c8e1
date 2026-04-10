/**
 * Components Routes — Figma API SDK
 */

export default async function componentsRoutes(server, { componentsClient }) {
  server.get('/components/:key', async (request) => {
    return componentsClient.getComponent(request.params.key);
  });

  server.get('/files/:fileKey/components', async (request) => {
    return componentsClient.getFileComponents(request.params.fileKey);
  });

  server.get('/teams/:teamId/components', async (request) => {
    const { teamId } = request.params;
    const { page_size, cursor } = request.query;
    return componentsClient.getTeamComponents(teamId, { pageSize: page_size, cursor });
  });

  server.get('/component_sets/:key', async (request) => {
    return componentsClient.getComponentSet(request.params.key);
  });

  server.get('/teams/:teamId/component_sets', async (request) => {
    const { teamId } = request.params;
    const { page_size, cursor } = request.query;
    return componentsClient.getTeamComponentSets(teamId, { pageSize: page_size, cursor });
  });

  server.get('/teams/:teamId/styles', async (request) => {
    const { teamId } = request.params;
    const { page_size, cursor } = request.query;
    return componentsClient.getTeamStyles(teamId, { pageSize: page_size, cursor });
  });

  server.get('/styles/:key', async (request) => {
    return componentsClient.getStyle(request.params.key);
  });

  return Promise.resolve();
}
