/**
 * Route aggregator for GitHub Workflow Action UI
 *
 * This app is a thin integration layer — all GitHub API data
 * flows through the polyglot proxy. These routes provide:
 * - Health check
 * - App configuration
 */

export default async function routes(fastify, _opts) {
  // Health check
  fastify.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "github-workflow-action-ui",
  }));

  // App configuration (consumed by frontend)
  fastify.get("/config", async () => ({
    defaultOwner: "thinkeloquent",
    defaultRepo: "mta-v800",
    apiBase: "/~/api/rest/02-01-2026/providers/github_api/2022-11-28",
  }));

  return Promise.resolve();
}
