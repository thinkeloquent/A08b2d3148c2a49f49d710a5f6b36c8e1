/**
 * Apps discovery routes for the Overview dashboard.
 */

import { discoverApps } from "../services/apps-discovery.service.mjs";

let _cachedApps = null;

export default async function appsRoutes(fastify) {
  fastify.get("/", async () => {
    if (!_cachedApps) {
      _cachedApps = discoverApps();
    }
    return { apps: _cachedApps };
  });
}
