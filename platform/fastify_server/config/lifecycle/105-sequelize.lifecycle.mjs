/**
 * Sequelize Lifecycle Hook for Fastify
 *
 * Initializes Sequelize connection and decorates the server with database models.
 * Manages connection lifecycle including authentication and graceful shutdown.
 *
 * Loading Order: 105 (after core config, before app plugins)
 *
 * Usage in routes/plugins:
 *     const { CodeRepository, CodeRepositoryTag } = req.server.db;
 *     const repos = await CodeRepository.findAll();
 *
 *     // Or access sequelize directly
 *     const { sequelize } = req.server.db;
 *     await sequelize.transaction(async (t) => { ... });
 */

import { getSequelize, getConfig, closeConnection } from '@internal/db_connection_sequelize';

/**
 * Startup hook - Initialize Sequelize and decorate server with models.
 *
 * @param {object} server - Fastify server instance
 * @param {object} config - Bootstrap config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:sequelize] Initializing Sequelize connection...');

  try {
    // Get singleton Sequelize instance
    server.log.info('[lifecycle:sequelize] Getting Sequelize singleton instance');
    const sequelize = getSequelize();
    const dbConfig = getConfig();

    // Test connection — warn instead of crashing if DB is unavailable
    try {
      server.log.info('[lifecycle:sequelize] Testing database connection...');
      await sequelize.authenticate();
      const url = dbConfig.getConnectionUrl();
      const schemaLine = `  Schema: ${dbConfig.schema}`;
      server.log.info(
        { connectionUrl: url, schema: dbConfig.schema },
        '[lifecycle:sequelize] Database connection successful'
      );
      server.log.info(
        '\n' +
        '  ┌──────────────────────────────────────────────────┐\n' +
        '  │  Sequelize          ✔  CONNECTED                 │\n' +
        `  │  ${url.padEnd(48)}│\n` +
        `  │  ${schemaLine.padEnd(48)}│\n` +
        '  └──────────────────────────────────────────────────┘'
      );
    } catch (authError) {
      server.log.warn(
        { err: authError },
        '[lifecycle:sequelize] Database connection failed — routes will return errors until DB is ready'
      );
      server.log.warn(
        '\n' +
        '  ┌──────────────────────────────────────────────────┐\n' +
        '  │  Sequelize          ✘  FAILURE                   │\n' +
        `  │  ${String(authError.message).slice(0, 48).padEnd(48)}│\n` +
        '  │  Database may be unavailable.                    │\n' +
        '  │  Routes will return errors until DB is ready.    │\n' +
        '  └──────────────────────────────────────────────────┘'
      );
    }

    // Import models from code-repositories schema
    server.log.info('[lifecycle:sequelize] Loading code-repositories models');
    const {
      CodeRepository,
      CodeRepositoryTag,
      CodeRepositoryMetadata,
    } = await import('../../../fastify_apps/code-repositories/sequelize/models/index.mjs');
    server.log.info('[lifecycle:sequelize] code-repositories models loaded');

    // Import models from figma-files schema
    server.log.info('[lifecycle:sequelize] Loading figma-files models');
    const {
      FigmaFile,
      FigmaFileTag,
      FigmaFileMetadata,
    } = await import('../../../fastify_apps/figma-files/sequelize/models/index.mjs');
    server.log.info('[lifecycle:sequelize] figma-files models loaded');

    // Import models from form-builder schema
    server.log.info('[lifecycle:sequelize] Loading form-builder models');
    const {
      FormDefinition,
      FormDefinitionTag,
      FormDefinitionVersion,
    } = await import('../../../fastify_apps/form_builder/sequelize/models/index.mjs');
    server.log.info('[lifecycle:sequelize] form-builder models loaded');

    // Import models from ui-component-metadata schema
    server.log.info('[lifecycle:sequelize] Loading ui-component-metadata models');
    const {
      ComponentDefinition,
      ComponentTag,
    } = await import('../../../fastify_apps/ui_component_metadata/sequelize/models/index.mjs');
    server.log.info('[lifecycle:sequelize] ui-component-metadata models loaded');

    // Decorate server with database models
    if (!server.hasDecorator('db')) {
      server.decorate('db', {
        sequelize,
        CodeRepository,
        CodeRepositoryTag,
        CodeRepositoryMetadata,
        FigmaFile,
        FigmaFileTag,
        FigmaFileMetadata,
        FormDefinition,
        FormDefinitionTag,
        FormDefinitionVersion,
        ComponentDefinition,
        ComponentTag,
      });
    } else {
      // Extend existing db decorator
      Object.assign(server.db, {
        sequelize,
        CodeRepository,
        CodeRepositoryTag,
        CodeRepositoryMetadata,
        FigmaFile,
        FigmaFileTag,
        FigmaFileMetadata,
        FormDefinition,
        FormDefinitionTag,
        FormDefinitionVersion,
        ComponentDefinition,
        ComponentTag,
      });
    }

    // Register cleanup hook
    server.addHook('onClose', async () => {
      server.log.info('[lifecycle:sequelize] Closing Sequelize connection...');
      await closeConnection();
      server.log.info('[lifecycle:sequelize] Sequelize connection closed');
    });

    server.log.info({
      models: [
        'CodeRepository', 'CodeRepositoryTag', 'CodeRepositoryMetadata',
        'FigmaFile', 'FigmaFileTag', 'FigmaFileMetadata',
        'FormDefinition', 'FormDefinitionTag', 'FormDefinitionVersion',
        'ComponentDefinition', 'ComponentTag',
      ],
    }, '[lifecycle:sequelize] Sequelize initialized successfully with models');

  } catch (error) {
    server.log.error({ err: error, hookName: '105-sequelize' }, '[lifecycle:sequelize] Failed to initialize Sequelize connection');
    throw error;
  }
}

/**
 * Shutdown hook - Cleanup Sequelize resources.
 *
 * Note: Connection closing is also handled by the onClose hook registered in onStartup,
 * but this provides an explicit shutdown point if needed.
 *
 * @param {object} server - Fastify server instance
 */
export async function onShutdown(server) {
  if (server.db?.sequelize) {
    server.log.info('Shutting down Sequelize...');
    await closeConnection();
  }
}
