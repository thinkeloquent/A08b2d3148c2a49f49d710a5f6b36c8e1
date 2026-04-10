/**
 * Error Handler Plugin
 *
 * Provides global error handling with structured responses.
 * Exports a direct function (not fp-wrapped) to avoid FSTWRN004 scope conflicts.
 */

import { ZodError } from "zod";

export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
    this.code = "NOT_FOUND";
  }
}

export class ConflictError extends Error {
  constructor(message = "Resource conflict") {
    super(message);
    this.name = "ConflictError";
    this.statusCode = 409;
    this.code = "CONFLICT";
  }
}

export class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.code = "VALIDATION_ERROR";
    this.errors = errors;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errors: this.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
        code: err.code,
      })),
    };
  }
}

/**
 * Register the error handler on a Fastify instance.
 * Call this directly (not via fastify.register) to keep the handler in the correct scope.
 *
 * @param {import('fastify').FastifyInstance} fastify
 */
export function registerErrorHandlers(fastify) {
  fastify.setErrorHandler((error, request, reply) => {
    const isDevelopment = process.env.NODE_ENV === "development";

    request.log.error({
      err: error,
      url: request.url,
      method: request.method,
    });

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: isDevelopment
            ? error.errors.map((err) => ({
                path: err.path.join("."),
                message: err.message,
                code: err.code,
              }))
            : undefined,
        },
      });
    }

    // Handle custom ValidationError
    if (error instanceof ValidationError) {
      return reply.status(400).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: isDevelopment ? error.toJSON() : undefined,
        },
      });
    }

    // Handle NotFoundError
    if (error instanceof NotFoundError) {
      return reply.status(404).send({
        success: false,
        error: { code: error.code, message: error.message },
      });
    }

    // Handle ConflictError
    if (error instanceof ConflictError) {
      return reply.status(409).send({
        success: false,
        error: { code: error.code, message: error.message },
      });
    }

    // Handle Fastify errors (with statusCode)
    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code || "ERROR",
          message: error.message,
          details: isDevelopment ? { stack: error.stack } : undefined,
        },
      });
    }

    // Generic 500
    return reply.status(500).send({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: isDevelopment ? error.message : "An unexpected error occurred",
        details: isDevelopment ? { stack: error.stack } : undefined,
      },
    });
  });
}
