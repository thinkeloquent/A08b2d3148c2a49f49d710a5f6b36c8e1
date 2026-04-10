import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import fastifyPlugin from "fastify-plugin";
import { registerErrorHandlers } from "./plugins/error-handler.mjs";
import databasePlugin from "./plugins/database.mjs";
import categoryRoutes from "./routes/categories.mjs";
import { buildApiDocsHtml, buildApiDocsMd } from "./api-docs-html.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function categoriesPlugin(fastify, options) {
  const apiPrefix = options.apiPrefix || "/~/api/categories";

  // 1. Error handler (direct call, not fp-wrapped)
  registerErrorHandlers(fastify);

  // 2. Database plugin
  await fastify.register(databasePlugin);

  // 3. Health endpoint
  fastify.get(`${apiPrefix}/health`, async () => ({
    status: "healthy",
    service: "categories",
    timestamp: new Date().toISOString(),
  }));

  // 4. API routes
  await fastify.register(categoryRoutes, { prefix: apiPrefix });

  // 5. API docs pages (path must not collide with SPA routes)
  if (options.appName) {
    const docsRoute = `${apiPrefix}/docs`;
    fastify.get(docsRoute, async (_request, reply) => {
      const html = buildApiDocsHtml(apiPrefix, { nonce: reply.cspNonce });
      reply.type('text/html; charset=utf-8').send(html);
    });

    const mdRoute = `${apiPrefix}/docs.md`;
    fastify.get(mdRoute, async (_request, reply) => {
      const md = buildApiDocsMd(apiPrefix);
      reply.type('text/markdown; charset=utf-8').send(md);
    });
  }

  // 6. Static file serving for frontend
  if (options.appName) {
    const staticRoot = resolve(__dirname, "../../frontend/dist");

    if (!existsSync(staticRoot)) {
      fastify.log.warn(
        `  ⚠ Frontend dist not found, skipping static serving: ${staticRoot}`
      );
    } else {
      fastify.log.info("→ Setting up frontend static serving via static-app-loader...");

      const { staticAppLoader } = await import("static-app-loader");

      await fastify.register(staticAppLoader, {
        appName: options.appName,
        rootPath: staticRoot,
        spaMode: true,
        maxAge: process.env.NODE_ENV === "production" ? 86400 : 0,
      });

      fastify.log.info(`  ✓ Registered static assets at: ${options.appName}`);
    }
  }
}

export default fastifyPlugin(
  (fastify, opts) => categoriesPlugin(fastify, opts),
  { name: "categories" },
);

export { categoriesPlugin };
