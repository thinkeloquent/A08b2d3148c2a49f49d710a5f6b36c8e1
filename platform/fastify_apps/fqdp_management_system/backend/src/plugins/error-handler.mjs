/**
 * Error Handler Plugin
 *
 * Provides global error handling with structured responses.
 * Detects missing database tables and returns 503 with descriptive messages.
 *
 * Exports a direct function (not fp-wrapped) to avoid FSTWRN004 scope conflicts.
 */

import {
  detectMissingTable,
  buildMissingTableResponse,
} from "../../../../_shared/sequelize-error-utils.mjs";

/**
 * Register the error handler on a Fastify instance.
 * Call this directly (not via fastify.register) to keep the handler in the correct scope.
 *
 * @param {import('fastify').FastifyInstance} fastify
 */
export function registerErrorHandlers(fastify) {
  fastify.setErrorHandler((error, request, reply) => {
    // Check for missing database table
    const missingTable = detectMissingTable(error);
    if (missingTable) {
      fastify.log.warn(
        { err: error, table: missingTable.tableName },
        `Missing database table "${missingTable.tableName}" — database setup may not have been run`,
      );
      return reply
        .status(503)
        .send(
          buildMissingTableResponse(
            missingTable.tableName,
            "fqdp-management-system",
          ),
        );
    }

    // Handle Sequelize validation errors
    if (error.name === "SequelizeUniqueConstraintError") {
      return reply.status(409).send({
        error: "Conflict",
        message: "A record with this value already exists",
        statusCode: 409,
        fields: error.fields,
      });
    }

    if (error.name === "SequelizeValidationError") {
      return reply.status(400).send({
        error: "ValidationError",
        message: error.message,
        statusCode: 400,
        errors: error.errors?.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }

    const statusCode = error.statusCode || 500;

    fastify.log.error({
      err: error,
      request: {
        method: request.method,
        url: request.url,
        params: request.params,
      },
    });

    reply.status(statusCode).send({
      error: error.name || "InternalServerError",
      message: error.message,
      statusCode,
    });
  });
}

export default registerErrorHandlers;
