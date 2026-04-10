/**
 * Fastify adapter for common-exceptions.
 *
 * Provides exception handler registration and request ID plugin.
 *
 * @example
 * import Fastify from 'fastify';
 * import { registerExceptionHandlers } from '@internal/common-exceptions/fastify';
 *
 * const app = Fastify();
 * registerExceptionHandlers(app);
 */

export {
  registerExceptionHandlers,
  createErrorHandler,
  createSchemaErrorFormatter,
} from './handlers.js';

export { normalizeAjvErrors, normalizeZodErrors } from './normalizers.js';

export { requestIdPlugin, RequestIdPluginOptions } from './middleware.js';
