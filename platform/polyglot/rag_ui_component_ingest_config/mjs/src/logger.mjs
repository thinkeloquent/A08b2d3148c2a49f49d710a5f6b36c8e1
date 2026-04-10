/**
 * @fileoverview Lightweight logger factory for rag_ui_component_ingest_config.
 *
 * When a parent Pino/Fastify logger is provided the child() delegation is used
 * so that structured log output is preserved.  When no parent logger is
 * available (standalone / test usage) a simple prefix-based fallback is used.
 *
 * NOTE: console.* is intentionally used ONLY inside the fallback logger that
 * activates when no project-level logger is supplied.  Production code always
 * passes a real logger and never reaches the console calls.
 */

const DEFAULT_PACKAGE = 'rag_ui_component_ingest_config';

/**
 * Create a scoped logger.
 *
 * @param {string} scope - Dot-separated scope label, e.g. "BaseIngestConfig".
 * @param {object|null} [parentLogger=null] - A Pino-compatible logger instance.
 *   When provided, `parentLogger.child({ scope })` is used for structured
 *   output.  When omitted a console-based fallback is returned.
 * @returns {{ info, warn, error, debug, child }} Logger object.
 */
export function createLogger(scope, parentLogger = null) {
  if (parentLogger) {
    return parentLogger.child({ scope });
  }

  const prefix = `[${DEFAULT_PACKAGE}:${scope}]`;

  return {
    /* eslint-disable no-console */
    info:  (msg, meta) => console.info(prefix, msg, meta || ''),
    warn:  (msg, meta) => console.warn(prefix, msg, meta || ''),
    error: (msg, meta) => console.error(prefix, msg, meta || ''),
    debug: (msg, meta) => console.debug(prefix, msg, meta || ''),
    /* eslint-enable no-console */

    /**
     * Create a child logger inheriting this scope.
     *
     * @param {{ scope?: string }} childMeta
     * @returns {object} Child logger.
     */
    child: (childMeta) =>
      createLogger(`${scope}.${childMeta.scope || 'child'}`, null),
  };
}
