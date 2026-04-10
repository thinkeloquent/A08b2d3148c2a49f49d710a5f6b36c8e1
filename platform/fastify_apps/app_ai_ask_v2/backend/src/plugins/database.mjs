import fastifyPlugin from 'fastify-plugin';

async function databasePlugin(fastify, _options) {
  if (fastify.hasDecorator('db') && fastify.db?.sequelize) {
    fastify.log.info('Using Sequelize connection from lifecycle');
    return;
  }

  fastify.log.info('Initializing Sequelize connection (standalone mode)...');

  const {
    sequelize,
    Persona,
    LLMDefault,
  } = await import('../../../sequelize/models/index.mjs');

  fastify.decorate('db', {
    sequelize,
    Persona,
    LLMDefault,
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
  name: 'database',
});
