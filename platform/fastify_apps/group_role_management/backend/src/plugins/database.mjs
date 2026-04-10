/**
 * Database Plugin
 *
 * Ensures Fastify instance has Sequelize models decorated.
 * When running under the main fastify_server, the `db` decorator is provided
 * by the 105-sequelize.lifecycle.mjs hook with a shared sequelize connection.
 * This plugin adds the group-role-management models to that decorator.
 * In standalone mode, it initializes its own connection.
 */

import fastifyPlugin from 'fastify-plugin';

async function databasePlugin(fastify, _options) {
  const {
    sequelize,
    Role,
    Group,
    Label,
    Action,
    Restriction,
    ROLE_GROUPS_REF_TABLE,
    ROLE_LABELS_REF_TABLE,
    ROLE_ACTIONS_REF_TABLE,
    ROLE_RESTRICTIONS_REF_TABLE,
    GROUP_ACTIONS_REF_TABLE,
    GROUP_RESTRICTIONS_REF_TABLE,
  } = await import('../../../sequelize/models/index.mjs');

  if (fastify.hasDecorator('db') && fastify.db?.sequelize) {
    // Lifecycle mode: db decorator already exists — add our models to it
    fastify.log.info('Extending lifecycle db decorator with group-role-management models');
    Object.assign(fastify.db, {
      Role,
      Group,
      Label,
      Action,
      Restriction,
      ROLE_GROUPS_REF_TABLE,
      ROLE_LABELS_REF_TABLE,
      ROLE_ACTIONS_REF_TABLE,
      ROLE_RESTRICTIONS_REF_TABLE,
      GROUP_ACTIONS_REF_TABLE,
      GROUP_RESTRICTIONS_REF_TABLE,
    });
    return;
  }

  // Standalone mode: initialize connection directly
  fastify.log.info('Initializing Sequelize connection (standalone mode)...');

  fastify.decorate('db', {
    sequelize,
    Role,
    Group,
    Label,
    Action,
    Restriction,
    ROLE_GROUPS_REF_TABLE,
    ROLE_LABELS_REF_TABLE,
    ROLE_ACTIONS_REF_TABLE,
    ROLE_RESTRICTIONS_REF_TABLE,
    GROUP_ACTIONS_REF_TABLE,
    GROUP_RESTRICTIONS_REF_TABLE,
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
  name: 'group-role-management-database',
});
