/**
 * Files Routes — Figma API SDK
 */

export default async function filesRoutes(server, { filesClient }) {
  server.get('/files/:fileKey', async (request) => {
    const { fileKey } = request.params;
    const { version, ids, depth, geometry, plugin_data } = request.query;
    return filesClient.getFile(fileKey, { version, ids, depth, geometry, pluginData: plugin_data });
  });

  server.get('/files/:fileKey/nodes', async (request) => {
    const { fileKey } = request.params;
    const { ids, version, depth, geometry, plugin_data } = request.query;
    return filesClient.getFileNodes(fileKey, ids, { version, depth, geometry, pluginData: plugin_data });
  });

  server.get('/images/:fileKey', async (request) => {
    const { fileKey } = request.params;
    const { ids, scale, format } = request.query;
    return filesClient.getImages(fileKey, ids, { scale, format });
  });

  server.get('/files/:fileKey/images', async (request) => {
    const { fileKey } = request.params;
    return filesClient.getImageFills(fileKey);
  });

  server.get('/files/:fileKey/versions', async (request) => {
    const { fileKey } = request.params;
    return filesClient.getFileVersions(fileKey);
  });

  return Promise.resolve();
}
