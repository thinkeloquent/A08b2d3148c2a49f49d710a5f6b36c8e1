import { ZodError } from "zod";

export class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = "ValidationError";
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

export function validateSchema(schema, data, errorMessage = "Validation failed") {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(errorMessage, error.errors);
    }
    throw error;
  }
}
