import { create as createLogger } from './logger.mjs';
import { LatencyCalculator } from './latency.mjs';
import { TimestampFormatter } from './timestamp.mjs';

const logger = createLogger("healthz-diagnostics", import.meta.url);

/**
 * Collects diagnostic events (start, end, error) during request lifecycle.
 */
export class DiagnosticsCollector {
    #events = [];
    #latency = new LatencyCalculator();
    #timestamp = new TimestampFormatter();

    /**
     * Record request:start event.
     * @param {string} url 
     * @param {string} [method="GET"]
     */
    pushStart(url, method = "GET") {
        logger.info(`pushStart("${url}", "${method}")`);
        this.#latency.start();

        this.#events.push({
            type: "request:start",
            timestamp: this.#timestamp.format(),
            status: null,
            error: null,
            duration_ms: null,
            metadata: { url, method }
        });
    }

    /**
     * Record request:end event.
     * @param {number} status 
     */
    pushEnd(status) {
        logger.info(`pushEnd(${status})`);
        this.#latency.stop();

        this.#events.push({
            type: "request:end",
            timestamp: this.#timestamp.format(),
            status,
            error: null,
            duration_ms: this.#latency.getMs(),
            metadata: null
        });
    }

    /**
     * Record request:error event.
     * @param {any} error 
     */
    pushError(error) {
        const errorMsg = String(error instanceof Error ? error.message : error);
        logger.info(`pushError("${errorMsg}")`);
        this.#latency.stop();

        this.#events.push({
            type: "request:error",
            timestamp: this.#timestamp.format(),
            status: null,
            error: errorMsg,
            duration_ms: this.#latency.getMs(),
            metadata: null
        });
    }

    /**
     * Return ordered list of events.
     * @returns {Array}
     */
    getEvents() {
        return this.#events;
    }

    /**
     * Return total duration in seconds.
     * @returns {number}
     */
    getDuration() {
        return this.#latency.getSeconds();
    }
}
