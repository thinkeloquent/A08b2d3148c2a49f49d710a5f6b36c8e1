/**
 * Database Plugin
 *
 * Ensures Fastify instance has Sequelize models decorated.
 * When running under the main fastify_server, extends the existing db decorator.
 * When running standalone, initializes its own connection.
 */

import fastifyPlugin from 'fastify-plugin';

async function databasePlugin(fastify, _options) {
  // Import persona_editor models
  const {
    sequelize: personaSequelize,
    Persona,
    LLMDefault,
    AuditLog,
  } = await import('../../../sequelize/models/index.mjs');

  // Check if db decorator already exists (provided by lifecycle)
  if (fastify.hasDecorator('db') && fastify.db?.sequelize) {
    fastify.log.info('Extending existing db decorator with persona_editor models');

    // Extend existing db decorator with persona_editor models
    Object.assign(fastify.db, {
      Persona,
      LLMDefault,
      AuditLog,
    });
    return;
  }

  // Standalone mode: initialize connection directly
  fastify.log.info('Initializing Sequelize connection (standalone mode)...');

  // Decorate fastify with database models
  fastify.decorate('db', {
    sequelize: personaSequelize,
    Persona,
    LLMDefault,
    AuditLog,
  });

  // Test connection on startup — warn instead of crashing if DB is unavailable
  try {
    await personaSequelize.authenticate();
    fastify.log.info('Database connection established (standalone)');
  } catch (error) {
    fastify.log.warn(
      { err: error },
      'Unable to connect to database (standalone) — routes will return errors until the database is ready'
    );
  }

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    await personaSequelize.close();
    fastify.log.info('Database connection closed');
  });

  return Promise.resolve();
}

export default fastifyPlugin(databasePlugin, {
  name: 'database',
});
