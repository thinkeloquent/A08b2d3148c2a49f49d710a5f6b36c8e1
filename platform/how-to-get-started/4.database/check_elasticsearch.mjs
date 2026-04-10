#!/usr/bin/env node
/** Validate Elasticsearch connection status. */

import { ElasticsearchConfig, checkConnection } from "@internal/db-connection-elasticsearch";

const start = performance.now();
try {
  const config = new ElasticsearchConfig();
  const configInfo = {
    host: config.options.host,
    port: config.options.port,
    scheme: config.options.scheme,
    vendor: config.options.vendorType,
    useTls: config.options.useTls,
    verifyCerts: config.options.verifyCerts,
    sslShowWarn: config.options.sslShowWarn,
    hasCaCerts: !!config.options.caCerts,
  };
  console.log("[elasticsearch] checking connection", JSON.stringify(configInfo));
  const result = await checkConnection(config);
  const latency_ms = Math.round(performance.now() - start);
  if (result.success) {
    console.log(JSON.stringify({
      status: "ok",
      service: "elasticsearch",
      latency_ms,
      ...configInfo,
      info: result.info,
    }, null, 2));
  } else {
    const error = {
      name: "ConnectionError",
      message: result.error || "Connection check returned unsuccessful",
      code: null,
      cause: null,
    };
    console.error("[elasticsearch] connection failed", JSON.stringify({ latency_ms, error }));
    console.log(JSON.stringify({
      status: "error",
      service: "elasticsearch",
      latency_ms,
      ...configInfo,
      error,
    }, null, 2));
    process.exitCode = 1;
  }
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
  console.error("[elasticsearch] connection failed", JSON.stringify({ latency_ms, error }));
  console.log(JSON.stringify({
    status: "error",
    service: "elasticsearch",
    latency_ms,
    error,
  }, null, 2));
  process.exitCode = 1;
}
