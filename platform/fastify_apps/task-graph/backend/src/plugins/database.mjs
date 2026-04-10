/**
 * Database Plugin
 *
 * Decorates Fastify with sequelize
 *
 * @module plugins/database
 */

import fp from 'fastify-plugin';
import { sequelize } from '@mta/task-graph-sequelize';

const APP_NAME = 'task-graph';

async function databasePlugin(app, options = {}) {
  // Use provided sequelize or import from models
  const db = options.sequelize || sequelize;

  app.decorate('sequelize', db);

  app.decorate('checkDatabaseHealth', async () => {
    try {
      await db.authenticate();
      return { healthy: true };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  });

  app.addHook('onClose', async () => {
    console.debug(`[${APP_NAME}] [DatabasePlugin] Closing database connection`);
    await db.close();
  });

  console.debug(`[${APP_NAME}] [DatabasePlugin] Database connection initialized`);

  return Promise.resolve();
}

export const databasePlugin_ = fp(databasePlugin, {
  name: 'task-graph-database',
});
