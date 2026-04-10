/**
 * Test utilities for healthz-diagnostics tests.
 * Provides helper functions for mocking, spying, and assertions.
 */

/**
 * Create a spy function that records all calls.
 * @returns {{fn: Function, calls: Array}}
 */
export function createSpy() {
    const calls = [];
    const fn = (...args) => {
        calls.push(args);
    };
    return { fn, calls };
}

/**
 * Create a logger spy that captures log output.
 * @returns {{output: Function, messages: string[]}}
 */
export function createLoggerSpy() {
    const messages = [];
    const output = (message) => {
        messages.push(message);
    };
    return { output, messages };
}

/**
 * Assert that a log message contains expected content.
 * @param {string[]} messages - Array of logged messages
 * @param {string} expected - Expected substring
 * @returns {boolean}
 */
export function expectLogContains(messages, expected) {
    return messages.some(msg => msg.includes(expected));
}

/**
 * Create a mock HTTP client for testing.
 * @param {object} options
 * @param {number} [options.statusCode=200] - Response status code
 * @param {Error} [options.error] - Error to throw on request
 * @param {object} [options.body] - Response body
 * @returns {object} Mock HTTP client
 */
export function createMockHttpClient(options = {}) {
    const { statusCode = 200, error = null, body = {} } = options;

    const handler = async () => {
        if (error) {
            throw error;
        }
        return {
            status: statusCode,
            statusCode: statusCode,
            body: body
        };
    };

    return {
        // Support both old-style positional args and new-style options object
        request: async (optsOrMethod, path) => {
            return handler();
        },
        get: async (url) => {
            return handler();
        },
        close: async () => {}
    };
}

/**
 * Create a mock time controller for testing latency.
 * Uses performance.now() mocking.
 * @param {number} startTime - Initial time in ms
 * @returns {{current: number, advance: Function, restore: Function}}
 */
export function createMockTime(startTime = 0) {
    let currentTime = startTime;
    const originalNow = performance.now.bind(performance);

    // Override performance.now
    performance.now = () => currentTime;

    return {
        get current() {
            return currentTime;
        },
        set(value) {
            currentTime = value;
        },
        advance(ms) {
            currentTime += ms;
        },
        restore() {
            performance.now = originalNow;
        }
    };
}

/**
 * Create a mock Date.now controller for testing timestamps.
 * @param {number} startTime - Initial epoch time in ms
 * @returns {{current: number, set: Function, restore: Function}}
 */
export function createMockDateNow(startTime = 1705312200000) {
    let currentTime = startTime;
    const originalNow = Date.now.bind(Date);

    Date.now = () => currentTime;

    return {
        get current() {
            return currentTime;
        },
        set(value) {
            currentTime = value;
        },
        advance(ms) {
            currentTime += ms;
        },
        restore() {
            Date.now = originalNow;
        }
    };
}

/**
 * Environment variable helper for tests.
 */
export class EnvHelper {
    #savedVars = {};

    /**
     * Set environment variables for testing.
     * @param {Record<string, string>} vars
     */
    set(vars) {
        for (const [key, value] of Object.entries(vars)) {
            this.#savedVars[key] = process.env[key];
            process.env[key] = value;
        }
    }

    /**
     * Restore original environment variables.
     */
    restore() {
        for (const [key, originalValue] of Object.entries(this.#savedVars)) {
            if (originalValue === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = originalValue;
            }
        }
        this.#savedVars = {};
    }
}
