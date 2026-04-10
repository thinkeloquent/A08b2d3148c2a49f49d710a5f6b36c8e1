/**
 * Webhooks Routes — Figma API SDK (v2 API)
 */

export default async function webhooksRoutes(server, { webhooksClient }) {
  server.get('/webhooks/:webhookId', async (request) => {
    return webhooksClient.getWebhook(request.params.webhookId);
  });

  server.get('/teams/:teamId/webhooks', async (request) => {
    return webhooksClient.listTeamWebhooks(request.params.teamId);
  });

  server.post('/webhooks', async (request, reply) => {
    const result = await webhooksClient.createWebhook(request.body.team_id, request.body);
    return reply.status(201).send(result);
  });

  server.put('/webhooks/:webhookId', async (request) => {
    return webhooksClient.updateWebhook(request.params.webhookId, request.body);
  });

  server.delete('/webhooks/:webhookId', async (request) => {
    return webhooksClient.deleteWebhook(request.params.webhookId);
  });

  server.get('/webhooks/:webhookId/requests', async (request) => {
    return webhooksClient.getWebhookRequests(request.params.webhookId);
  });

  return Promise.resolve();
}
