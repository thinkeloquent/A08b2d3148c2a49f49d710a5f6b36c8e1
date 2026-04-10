#!/usr/bin/env node
/** Validate PostgreSQL connection status. */

import { PostgresConfig, getPostgresClient, checkConnection } from "@internal/db_connection_postgres";

const start = performance.now();
let client;
try {
  const config = new PostgresConfig();
  const configInfo = {
    host: config.host,
    port: config.port,
    database: config.database,
    schema: config.schema,
    sslMode: config.sslMode,
    hasSslCaCerts: !!config.sslCaCerts,
  };
  console.log("[postgres] checking connection", JSON.stringify(configInfo));
  client = getPostgresClient(config);
  await checkConnection(client);
  const latency_ms = Math.round(performance.now() - start);
  console.log(JSON.stringify({
    status: "ok",
    service: "postgres",
    latency_ms,
    ...configInfo,
  }, null, 2));
} catch (err) {
  const latency_ms = Math.round(performance.now() - start);
  const error = {
    name: err.name || "Error",
    message: err.message,
    code: err.code || null,
    cause: err.cause
      ? { name: err.cause.name, message: err.cause.message, code: err.cause.code || null }
      : null,
  };
  console.error("[postgres] connection failed", JSON.stringify({ latency_ms, error }));
  console.log(JSON.stringify({
    status: "error",
    service: "postgres",
    latency_ms,
    error,
  }, null, 2));
  process.exitCode = 1;
} finally {
  if (client) {
    try {
      await client.close();
    } catch (_) {
      // ignore close errors
    }
  }
}
