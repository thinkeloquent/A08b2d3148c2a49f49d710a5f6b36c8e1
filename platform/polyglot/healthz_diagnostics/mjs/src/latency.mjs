/**
 * High-precision latency measurement.
 */
export class LatencyCalculator {
    #startTime = null;
    #endTime = null;

    /**
     * Start the timer.
     */
    start() {
        this.#startTime = performance.now();
        this.#endTime = null;
    }

    /**
     * Stop the timer.
     */
    stop() {
        this.#endTime = performance.now();
    }

    /**
     * Return duration in milliseconds with 2 decimal precision.
     * @returns {number}
     */
    getMs() {
        if (this.#startTime === null) {
            return 0.0;
        }

        const end = this.#endTime !== null ? this.#endTime : performance.now();
        const duration = end - this.#startTime;
        return Number(duration.toFixed(2));
    }

    /**
     * Return duration in seconds.
     * @returns {number}
     */
    getSeconds() {
        if (this.#startTime === null) {
            return 0.0;
        }

        const end = this.#endTime !== null ? this.#endTime : performance.now();
        return (end - this.#startTime) / 1000;
    }
}
