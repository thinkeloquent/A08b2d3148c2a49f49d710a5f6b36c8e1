/**
 * Routes Aggregator
 * Registers all CRUD routes under the /api/fqdp_management_system prefix
 */

import organizationRoutes from "./organizations.mjs";
import workspaceRoutes from "./workspaces.mjs";
import teamRoutes from "./teams.mjs";
import applicationRoutes from "./applications.mjs";
import projectRoutes from "./projects.mjs";
import resourceRoutes from "./resources.mjs";
import referenceRoutes from "./references.mjs";

export default async function routes(fastify, _options) {
  // Register all entity routes
  fastify.register(organizationRoutes);
  fastify.register(workspaceRoutes);
  fastify.register(teamRoutes);
  fastify.register(applicationRoutes);
  fastify.register(projectRoutes);
  fastify.register(resourceRoutes);
  fastify.register(referenceRoutes);

  fastify.log.info(
    "  ✓ Registered CRUD routes for organizations, workspaces, teams, applications, projects, resources, references",
  );

  return Promise.resolve();
}
