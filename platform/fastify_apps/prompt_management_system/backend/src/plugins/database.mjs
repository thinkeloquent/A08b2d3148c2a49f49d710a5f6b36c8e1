/**
 * Database Plugin
 * Decorates fastify with db models.
 * In lifecycle mode, extends the existing db decorator.
 * In standalone mode, initializes its own connection.
 */

import fastifyPlugin from 'fastify-plugin';

async function databasePlugin(fastify, _options) {
  const {
    sequelize,
    Project,
    Prompt,
    PromptVersion,
    Deployment,
    Variable,
  } = await import('../../../sequelize/models/index.mjs');

  if (fastify.hasDecorator('db') && fastify.db?.sequelize) {
    // Lifecycle mode: db decorator already exists — add our models
    fastify.log.info('Extending lifecycle db decorator with prompt-management-system models');
    Object.assign(fastify.db, {
      Project,
      Prompt,
      PromptVersion,
      Deployment,
      Variable,
    });

    // Ensure 'disabled' enum value exists
    try {
      await fastify.db.sequelize.query(
        `ALTER TYPE "enum_prompt_management_system_prompt_versions_status" ADD VALUE IF NOT EXISTS 'disabled';`
      );
    } catch { /* type may not exist yet or value already exists */ }

    return;
  }

  // Standalone mode
  fastify.log.info('Initializing Sequelize connection (standalone mode)...');

  fastify.decorate('db', {
    sequelize,
    Project,
    Prompt,
    PromptVersion,
    Deployment,
    Variable,
  });

  try {
    await sequelize.authenticate();
    fastify.log.info('Database connection established (standalone)');
  } catch (error) {
    fastify.log.warn(
      { err: error },
      'Unable to connect to database (standalone) — routes will return errors until the database is ready'
    );
  }

  fastify.addHook('onClose', async () => {
    await sequelize.close();
    fastify.log.info('Database connection closed');
  });

  return Promise.resolve();
}

export default fastifyPlugin(databasePlugin, {
  name: 'prompt-management-system-database',
});
