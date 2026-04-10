/**
 * Routes Aggregator
 * Registers all routes under the /api/figma_component_inspector prefix
 */

import figmaRoutes from "./figma.routes.mjs";
import healthRoutes from "./health.routes.mjs";
import commentsRoutes from "./comments.routes.mjs";
import pinsRoutes from "./pins.routes.mjs";
import nodeLabelsRoutes from "./node-labels.routes.mjs";
import imageProxyRoutes from "./image-proxy.routes.mjs";
import schemaRoutes from "./schema.routes.mjs";

export default async function routes(fastify, _options) {
  // Register Figma API routes under /figma prefix
  fastify.register(figmaRoutes, { prefix: "/figma" });

  // Register local comments CRUD routes under /comments prefix
  fastify.register(commentsRoutes, { prefix: "/comments" });

  // Register pinned nodes CRUD routes under /pins prefix
  fastify.register(pinsRoutes, { prefix: "/pins" });

  // Register node labels CRUD routes under /node-labels prefix
  fastify.register(nodeLabelsRoutes, { prefix: "/node-labels" });

  // Register image proxy with S3 caching under /image prefix
  fastify.register(imageProxyRoutes, { prefix: "/image" });

  // Register schema analysis routes under /schema prefix
  fastify.register(schemaRoutes, { prefix: "/schema" });

  // Register health routes at the root of the API prefix
  fastify.register(healthRoutes);

  fastify.log.info(
    "  -> Registered routes for figma, comments, pins, node-labels, image, schema, and health",
  );

  return Promise.resolve();
}
