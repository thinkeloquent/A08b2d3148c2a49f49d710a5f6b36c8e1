import { create as createLogger } from "./logger.mjs";
import { DiagnosticsCollector } from "./collector.mjs";
import { TimestampFormatter } from "./timestamp.mjs";

const defaultLogger = createLogger("healthz-diagnostics", import.meta.url);

/**
 * Orchestrates health checks with diagnostics, timing, and error handling.
 */
export class HealthCheckExecutor {
  #clientFactory;
  #logger;
  #timestamp;

  /**
   * @param {Function} httpClientFactory - Factory that returns an HTTP client
   * @param {object} [logger] - Optional logger override
   */
  constructor(httpClientFactory, logger = null) {
    this.#clientFactory = httpClientFactory;
    this.#logger = logger || defaultLogger;
    this.#timestamp = new TimestampFormatter();
  }

  /**
   * Execute health check for a single provider.
   * @param {string} providerName
   * @param {object} providerConfig
   * @returns {Promise<import('../types.d.ts').HealthCheckResult>}
   */
  async execute(providerName, providerConfig) {
    this.#logger.info(`Executing health check for ${providerName}`);

    const collector = new DiagnosticsCollector();
    let statusCode = null;
    let errorMsg = null;
    let healthy = false;
    let responseData = null;

    const baseUrl = providerConfig.base_url;
    const healthEndpoint = providerConfig.health_endpoint || "";
    const model = providerConfig.model;
    const method = (providerConfig.method || "GET").toUpperCase();
    const healthBody = providerConfig.health_body || null;

    if (!baseUrl) {
      errorMsg = `${providerName} provider not configured (missing base_url)`;
      collector.pushError(errorMsg);
      return this.#buildResult(
        providerName,
        false,
        null,
        errorMsg,
        null,
        model,
        collector,
        null
      );
    }

    // URL construction per REQ0006
    // Always remove trailing slash from baseUrl
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    let fullUrl;
    let normalizedEndpoint;

    if (!healthEndpoint) {
      fullUrl = cleanBase;
      normalizedEndpoint = "";
    } else {
      // Ensure healthEndpoint starts with /
      normalizedEndpoint = healthEndpoint.startsWith("/")
        ? healthEndpoint
        : `/${healthEndpoint}`;
      fullUrl = `${cleanBase}${normalizedEndpoint}`;
    }

    const client = this.#clientFactory(providerConfig);

    try {
      collector.pushStart(fullUrl, method);

      // Execute request - pass normalized path, not full URL
      // (client already has base_url configured)
      const requestOpts = { method, path: normalizedEndpoint };
      if (healthBody && method === "POST") {
        requestOpts.json = healthBody;
      }
      const response = await client.request(requestOpts);

      statusCode =
        response.status || response.statusCode || response.status_code;
      responseData = response.data;

      if (statusCode && statusCode >= 200 && statusCode < 300) {
        healthy = true;
        collector.pushEnd(statusCode);
      } else {
        healthy = false;
        errorMsg = `Unhealthy status code: ${statusCode}`;
        collector.pushError(errorMsg);
      }
    } catch (e) {
      healthy = false;
      errorMsg = e instanceof Error ? e.message : String(e);
      collector.pushError(errorMsg);
      this.#logger.error(`Health check failed for ${providerName}: ${e}`);
    } finally {
      try {
        if (client.close) {
          await client.close();
        }
      } catch (closeErr) {
        this.#logger.warn(
          `Failed to close client for ${providerName}: ${closeErr}`
        );
      }
    }

    return this.#buildResult(
      providerName,
      healthy,
      statusCode,
      errorMsg,
      fullUrl,
      model,
      collector,
      responseData
    );
  }

  #buildResult(
    provider,
    healthy,
    statusCode,
    error,
    endpoint,
    model,
    collector,
    data
  ) {
    return {
      provider,
      healthy,
      status_code: statusCode,
      latency_ms: collector.getDuration() * 1000,
      error,
      endpoint,
      model,
      timestamp: this.#timestamp.format(),
      diagnostics: collector.getEvents(),
      data,
    };
  }
}
