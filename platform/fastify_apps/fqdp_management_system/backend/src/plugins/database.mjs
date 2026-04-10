/**
 * Database Plugin
 *
 * Ensures Fastify instance has Sequelize models decorated.
 * When running under the main fastify_server, the `db` decorator is provided
 * by the 105-sequelize.lifecycle.mjs hook. This plugin handles standalone
 * testing scenarios where the lifecycle isn't available.
 */

import fastifyPlugin from "fastify-plugin";

async function databasePlugin(fastify, _options) {
  // Check if db decorator already exists (provided by lifecycle)
  if (fastify.hasDecorator("db") && fastify.db?.sequelize) {
    // Ensure FQDP models are present — lifecycle may only load other schemas
    if (!fastify.db.Organization) {
      const {
        Organization,
        Workspace,
        Team,
        Application,
        Project,
        Resource,
        Reference,
      } = await import("../../../sequelize/models/index.mjs");

      Object.assign(fastify.db, {
        Organization,
        Workspace,
        Team,
        Application,
        Project,
        Resource,
        Reference,
      });
      fastify.log.info("FQDP models added to existing Sequelize connection");
    }
    fastify.log.info("Using Sequelize connection from lifecycle");
    return;
  }

  // Standalone mode: initialize connection directly
  fastify.log.info(
    "Initializing Sequelize connection (standalone mode)...",
  );

  const {
    sequelize,
    Organization,
    Workspace,
    Team,
    Application,
    Project,
    Resource,
    Reference,
  } = await import("../../../sequelize/models/index.mjs");

  // Decorate fastify with database models
  fastify.decorate("db", {
    sequelize,
    Organization,
    Workspace,
    Team,
    Application,
    Project,
    Resource,
    Reference,
  });

  // Test connection on startup — warn instead of crashing if DB is unavailable
  try {
    await sequelize.authenticate();
    fastify.log.info("Database connection established (standalone)");
  } catch (error) {
    fastify.log.warn(
      { err: error },
      "Unable to connect to database (standalone) — routes will return errors until the database is ready",
    );
  }

  // Graceful shutdown
  fastify.addHook("onClose", async () => {
    await sequelize.close();
    fastify.log.info("Database connection closed");
  });

  return Promise.resolve();
}

export default fastifyPlugin(databasePlugin, {
  name: "fqdp-management-system-database",
});
