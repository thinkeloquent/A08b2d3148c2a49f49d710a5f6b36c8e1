/**
 * Logger module for healthz-diagnostics package.
 *
 * Provides defensive programming logging with consistent format:
 * [{LEVEL}] [{package}:{filename}] {message}
 *
 * Usage:
 *     import { create as createLogger } from './logger.mjs';
 *     const logger = createLogger("healthz-diagnostics", "config_store.mjs");
 *     logger.info("Operation completed");
 */

// Log levels
export const DEBUG = 10;
export const INFO = 20;
export const WARN = 30;
export const ERROR = 40;

// Default log level (can be overridden via environment variable)
const DEFAULT_LEVEL = INFO;
const LOG_LEVEL = parseInt(process.env.HEALTHZ_DIAGNOSTICS_LOG_LEVEL || String(DEFAULT_LEVEL), 10);

/**
 * Extract clean filename from path or import.meta.url
 * @param {string} filename - Raw filename or URL
 * @returns {string} Clean filename without extension
 */
function extractFilename(filename) {
    // Handle import.meta.url style (file:///path/to/file.mjs)
    if (filename.startsWith("file://")) {
        filename = filename.split("/").pop();
    }
    // Handle path style
    if (filename.includes("/")) {
        filename = filename.split("/").pop();
    }
    // Remove .mjs/.js extension
    if (filename.endsWith(".mjs")) {
        filename = filename.slice(0, -4);
    } else if (filename.endsWith(".js")) {
        filename = filename.slice(0, -3);
    }
    return filename;
}

/**
 * Logger class with package/filename context
 */
class Logger {
    #package;
    #filename;
    #level;
    #output;

    /**
     * @param {string} packageName - Package identifier
     * @param {string} filename - Source file identifier
     * @param {number} level - Log level threshold
     * @param {Function} output - Output function (default: console.log)
     */
    constructor(packageName, filename, level = LOG_LEVEL, output = console.log) {
        this.#package = packageName;
        this.#filename = extractFilename(filename);
        this.#level = level;
        this.#output = output;
    }

    /**
     * Internal log method with level check
     * @param {string} level - Level name
     * @param {number} levelValue - Numeric level value
     * @param {string} message - Log message
     */
    #log(level, levelValue, message) {
        if (levelValue >= this.#level) {
            const formatted = `[${level}] [${this.#package}:${this.#filename}] ${message}`;
            this.#output(formatted);
        }
    }

    /**
     * Log debug message (detailed internal state)
     * @param {string} message
     */
    debug(message) {
        this.#log("DEBUG", DEBUG, message);
    }

    /**
     * Log info message (normal operations)
     * @param {string} message
     */
    info(message) {
        this.#log("INFO", INFO, message);
    }

    /**
     * Log warning message (recoverable issues)
     * @param {string} message
     */
    warn(message) {
        this.#log("WARN", WARN, message);
    }

    /**
     * Log error message (failures requiring attention)
     * @param {string} message
     */
    error(message) {
        this.#log("ERROR", ERROR, message);
    }
}

/**
 * Create a logger instance for the given package and file.
 *
 * @param {string} packageName - Package identifier (e.g., "healthz-diagnostics")
 * @param {string} filename - Source file identifier (e.g., import.meta.url or "config_store.mjs")
 * @param {object} options - Optional configuration
 * @param {number} [options.level] - Log level override
 * @param {Function} [options.output] - Output function override
 * @returns {Logger} Logger instance
 *
 * @example
 * const logger = create("healthz-diagnostics", import.meta.url);
 * logger.info("Config loaded successfully");
 */
export function create(packageName, filename, options = {}) {
    const { level, output } = options;
    return new Logger(
        packageName,
        filename,
        level ?? LOG_LEVEL,
        output ?? console.log
    );
}

export { Logger };
