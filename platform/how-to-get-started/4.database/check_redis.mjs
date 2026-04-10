#!/usr/bin/env node
/** Validate Redis connection status. */

import { RedisConfig, getRedisClient } from "@internal/db_connection_redis";

const start = performance.now();
let client;
try {
  const config = new RedisConfig();
  const configInfo = {
    host: config.host,
    port: config.port,
    db: config.db,
    useSsl: config.useSsl,
    sslCertReqs: config.sslCertReqs,
    hasSslCaCerts: !!config.sslCaCerts,
  };
  console.log("[redis] checking connection", JSON.stringify(configInfo));
  client = getRedisClient(config);
  await client.ping();
  const latency_ms = Math.round(performance.now() - start);
  console.log(JSON.stringify({
    status: "ok",
    service: "redis",
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
  console.error("[redis] connection failed", JSON.stringify({ latency_ms, error }));
  console.log(JSON.stringify({
    status: "error",
    service: "redis",
    latency_ms,
    error,
  }, null, 2));
  process.exitCode = 1;
} finally {
  if (client) {
    try {
      client.disconnect();
    } catch (_) {
      // ignore disconnect errors
    }
  }
}
