/**
 * Health Routes
 * Health check endpoints
 */

export default async function healthRoutes(fastify, _options) {
  /**
   * Basic health check
   * GET /health
   */
  fastify.get('/', {
    schema: {
      description: 'Basic health check',
      tags: ['Health'],
    },
  }, async (request, reply) => {
    return reply.send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Detailed health check with database status
   * GET /health/detailed
   */
  fastify.get('/detailed', {
    schema: {
      description: 'Detailed health check with database status',
      tags: ['Health'],
    },
  }, async (request, reply) => {
    const services = {};
    let overallStatus = 'healthy';

    // Check database connection
    try {
      await fastify.db.sequelize.authenticate();
      services.database = {
        status: 'healthy',
        message: 'Connection OK',
      };
    } catch (error) {
      services.database = {
        status: 'unhealthy',
        message: error.message,
      };
      overallStatus = 'unhealthy';
    }

    return reply.send({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
    });
  });
}
