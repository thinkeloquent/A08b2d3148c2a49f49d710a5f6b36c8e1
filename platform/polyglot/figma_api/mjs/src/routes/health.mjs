/**
 * Health Route — Figma API SDK
 */

export default async function healthRoutes(server) {
  server.get('/health', async () => {
    const client = server.figma;

    let rateLimit = null;
    if (client) {
      const last = client.lastRateLimit;
      const { rateLimitHits, rateLimitWaits, rateLimitTotalWaitSeconds } = client.stats;
      rateLimit = {
        lastHit: last ? {
          retryAfter: last.retryAfter,
          retryAfterMinutes: last.retryAfterMinutes,
          planTier: last.planTier,
          rateLimitType: last.rateLimitType,
          timestamp: last.timestamp.toISOString(),
        } : null,
        totalHits: rateLimitHits,
        totalWaits: rateLimitWaits,
        totalWaitSeconds: rateLimitTotalWaitSeconds,
      };
    }

    return {
      status: 'ok',
      service: 'figma-api',
      timestamp: new Date().toISOString(),
      rateLimit,
    };
  });

  return Promise.resolve();
}
