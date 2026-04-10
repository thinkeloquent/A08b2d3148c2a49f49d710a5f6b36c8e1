/**
 * Health Routes
 *
 * Health check endpoints
 *
 * @module routes/health
 */

/**
 * Health Routes Plugin
 */
export async function healthRoutes(app) {
  /**
   * GET /health
   * Basic health check
   */
  app.get('/', async (request, reply) => {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'task-graph',
    });
  });

  /**
   * GET /health/ready
   * Readiness check (database connectivity)
   */
  app.get('/ready', async (request, reply) => {
    try {
      const dbHealth = await app.checkDatabaseHealth?.();
      const redisHealth = app.redis ? await checkRedisHealth(app.redis) : { healthy: true, message: 'Redis not configured' };

      const isReady = dbHealth?.healthy !== false && redisHealth.healthy;

      return reply.status(isReady ? 200 : 503).send({
        status: isReady ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: dbHealth || { healthy: true },
          redis: redisHealth,
        },
      });
    } catch (error) {
      return reply.status(503).send({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  });

  /**
   * GET /health/live
   * Liveness check
   */
  app.get('/live', async (request, reply) => {
    return reply.send({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  });

  return Promise.resolve();
}

async function checkRedisHealth(redis) {
  try {
    const result = await redis.ping();
    return {
      healthy: result === 'PONG',
      latency: 0,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
    };
  }
}
