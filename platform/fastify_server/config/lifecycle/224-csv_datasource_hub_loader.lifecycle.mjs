import { csvDatasourceHubPlugin } from "@internal/fastify-app-csv-datasource-hub";

/**
 * Register CSV Datasource Hub plugin on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info("[lifecycle:csv_datasource_hub] Initializing CSV Datasource Hub plugin...");

  try {
    server.log.info("[lifecycle:csv_datasource_hub] Registering CSV Datasource Hub plugin");
    await server.register(csvDatasourceHubPlugin, {
      appName: "csv-datasource-hub",
      apiPrefix: "/~/api/csv-datasource",
    });
    server.log.info("[lifecycle:csv_datasource_hub] CSV Datasource Hub plugin registered successfully");
  } catch (err) {
    server.log.error({ err, hookName: '224-csv_datasource_hub' }, '[lifecycle:csv_datasource_hub] Plugin registration failed');
    throw err;
  }
}
