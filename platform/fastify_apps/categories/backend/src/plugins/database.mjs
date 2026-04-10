import fastifyPlugin from 'fastify-plugin';

async function databasePlugin(fastify, _options) {
  if (fastify.hasDecorator('db') && fastify.db?.sequelize) {
    fastify.log.info('Using Sequelize connection from lifecycle');

    const { Category, CategoryType, TargetApp } =
      await import('../../../sequelize/models/index.mjs');

    Object.assign(fastify.db, { Category, CategoryType, TargetApp });
    return;
  }

  fastify.log.info('Initializing Sequelize connection (standalone mode)...');

  const { sequelize, Category, CategoryType, TargetApp } =
    await import('../../../sequelize/models/index.mjs');

  fastify.decorate('db', { sequelize, Category, CategoryType, TargetApp });

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
}

export default fastifyPlugin(databasePlugin, {
  name: 'categories-database',
});
