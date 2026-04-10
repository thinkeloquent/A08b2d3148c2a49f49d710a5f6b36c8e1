import fastifyPlugin from 'fastify-plugin';

async function databasePlugin(fastify, _options) {
  const {
    sequelize: dhSequelize,
    CsvDatasource,
    CsvDatasourceTag,
    CsvDatasourceLabel,
    CsvInstance,
    CsvPayload,
  } = await import('../../../sequelize/models/index.mjs');

  if (fastify.hasDecorator('db') && fastify.db?.sequelize) {
    fastify.log.info('Extending existing db decorator with CSV Datasource Hub models');
    Object.assign(fastify.db, {
      CsvDatasource, CsvDatasourceTag, CsvDatasourceLabel, CsvInstance, CsvPayload,
    });
    return;
  }

  fastify.log.info('Initializing Sequelize connection (standalone)...');
  fastify.decorate('db', {
    sequelize: dhSequelize,
    CsvDatasource, CsvDatasourceTag, CsvDatasourceLabel, CsvInstance, CsvPayload,
  });

  try {
    await dhSequelize.authenticate();
    fastify.log.info('Database connection established');
  } catch (error) {
    fastify.log.warn({ err: error }, 'Unable to connect to database');
  }

  fastify.addHook('onClose', async () => {
    await dhSequelize.close();
    fastify.log.info('Database connection closed');
  });

  return Promise.resolve();
}

export default fastifyPlugin(databasePlugin, {
  name: 'csv-datasource-hub-database',
});
