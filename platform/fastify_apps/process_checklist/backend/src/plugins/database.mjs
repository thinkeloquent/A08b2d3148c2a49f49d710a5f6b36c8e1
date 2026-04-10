/**
 * Database Plugin
 *
 * Ensures Fastify instance has Sequelize models decorated.
 * When running under the main fastify_server, the `db` decorator is provided
 * by the lifecycle hook. This plugin handles standalone testing scenarios.
 */

import fastifyPlugin from "fastify-plugin";

async function databasePlugin(fastify, _options) {
  // Check if db decorator already exists (provided by lifecycle)
  if (fastify.hasDecorator("db") && fastify.db?.sequelize) {
    fastify.log.info("Using Sequelize connection from lifecycle");

    // Merge process_checklist models into existing db decorator
    const { Template, Step, ChecklistInstance, ChecklistStep } = await import(
      "../../../sequelize/models/index.mjs"
    );
    Object.assign(fastify.db, {
      Template,
      Step,
      ChecklistInstance,
      ChecklistStep,
    });

    return;
  }

  // Standalone mode: initialize connection directly
  fastify.log.info("Initializing Sequelize connection (standalone mode)...");

  const { sequelize, Template, Step, ChecklistInstance, ChecklistStep } =
    await import("../../../sequelize/models/index.mjs");

  // Decorate fastify with database models
  fastify.decorate("db", {
    sequelize,
    Template,
    Step,
    ChecklistInstance,
    ChecklistStep,
  });

  // Test connection on startup
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
  name: "process-checklist-database",
});
