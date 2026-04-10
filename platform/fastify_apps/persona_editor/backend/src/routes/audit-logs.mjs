/**
 * Audit Logs Routes
 * Global audit log listing endpoint
 */

import { createAuditService } from '../services/audit.service.mjs';

export default async function auditLogsRoutes(fastify, _options) {
  const auditService = createAuditService(fastify.db);

  /**
   * List recent audit logs across all personas
   * GET /audit-logs
   */
  fastify.get('/', {
    schema: {
      description: 'List recent audit logs across all personas',
      tags: ['Audit'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 500, default: 100 },
        },
      },
    },
  }, async (request, reply) => {
    const { limit = 100 } = request.query;
    const logs = await auditService.getRecentLogs(parseInt(limit));
    return reply.send(logs);
  });
}
