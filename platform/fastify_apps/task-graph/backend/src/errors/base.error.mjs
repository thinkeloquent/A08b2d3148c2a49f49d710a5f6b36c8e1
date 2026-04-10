/**
 * Base Application Error
 * All custom errors extend from this class for consistent error handling
 *
 * @module errors/base.error
 */

export class AppError extends Error {
  constructor(code, statusCode, message, details = undefined, isOperational = true) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      statusCode: this.statusCode,
      name: this.name,
    };
  }
}
