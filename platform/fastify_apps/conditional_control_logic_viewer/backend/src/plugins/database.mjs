/**
 * Database Plugin
 *
 * Ensures Fastify instance has Sequelize models decorated.
 * When running under the main fastify_server, the `db` decorator is provided
 * by the 105-sequelize.lifecycle.mjs hook with a shared sequelize connection.
 * This plugin adds the conditional-control-logic-viewer models to that decorator.
 * In standalone mode, it initializes its own connection.
 */

import fastifyPlugin from 'fastify-plugin';

async function databasePlugin(fastify, _options) {
  const {
    sequelize,
    FilterTree,
    DropdownOption,
  } = await import('../../../sequelize/models/index.mjs');

  if (fastify.hasDecorator('db') && fastify.db?.sequelize) {
    // Lifecycle mode: db decorator already exists — add our models to it
    fastify.log.info('Extending lifecycle db decorator with conditional-control-logic-viewer models');
    Object.assign(fastify.db, {
      FilterTree,
      DropdownOption,
    });
    return;
  }

  // Standalone mode: initialize connection directly
  fastify.log.info('Initializing Sequelize connection (standalone mode)...');

  fastify.decorate('db', {
    sequelize,
    FilterTree,
    DropdownOption,
  });

  // Test connection on startup — warn instead of crashing if DB is unavailable
  try {
    await sequelize.authenticate();
    fastify.log.info('Database connection established (standalone)');
  } catch (error) {
    fastify.log.warn(
      { err: error },
      'Unable to connect to database (standalone) — routes will return errors until the database is ready'
    );
  }

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    await sequelize.close();
    fastify.log.info('Database connection closed');
  });

  return Promise.resolve();
}

export default fastifyPlugin(databasePlugin, {
  name: 'conditional-control-logic-viewer-database',
});
