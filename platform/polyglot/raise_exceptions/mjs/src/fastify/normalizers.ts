/**
 * Validation error normalizers for Fastify/AJV/Zod.
 *
 * Converts validation library errors to standardized format.
 */

import { create } from '../logger.js';

const logger = create('common-exceptions', __filename);

/**
 * Normalized field error structure.
 */
export interface NormalizedFieldError {
  field: string;
  message: string;
  code?: string;
}

/**
 * AJV error shape.
 */
export interface AjvError {
  keyword: string;
  dataPath?: string;
  instancePath?: string;
  message?: string;
  params?: Record<string, unknown>;
  schemaPath?: string;
}

/**
 * Zod error shape.
 */
export interface ZodIssue {
  code: string;
  path: (string | number)[];
  message: string;
}

/**
 * Normalize AJV validation errors to standardized format.
 *
 * AJV errors have shape:
 *   { keyword: "...", instancePath: "/user/email", message: "..." }
 *
 * Normalized output:
 *   { field: "user.email", message: "...", code: "..." }
 *
 * @param errors - Array of AJV error objects
 * @returns Array of normalized error objects
 */
export function normalizeAjvErrors(errors: AjvError[]): NormalizedFieldError[] {
  const normalized: NormalizedFieldError[] = [];

  for (const error of errors) {
    // Convert path: /user/email or instancePath to dot notation
    const path = error.instancePath || error.dataPath || '';
    const fieldPath = path
      .replace(/^\//, '') // Remove leading slash
      .replace(/\//g, '.'); // Convert slashes to dots

    // Get message
    const message = error.message || 'Invalid value';

    // Map keyword to code
    const code = normalizeAjvKeyword(error.keyword);

    const normalizedError: NormalizedFieldError = {
      field: fieldPath || 'body',
      message: capitalizeFirst(message),
    };

    if (code) {
      normalizedError.code = code;
    }

    logger.debug(`Normalized AJV error: ${normalizedError.field} - ${message}`);
    normalized.push(normalizedError);
  }

  return normalized;
}

/**
 * Normalize Zod validation errors to standardized format.
 *
 * Zod errors have shape:
 *   { code: "...", path: ["user", "email"], message: "..." }
 *
 * Normalized output:
 *   { field: "user.email", message: "...", code: "..." }
 *
 * @param issues - Array of Zod issue objects
 * @returns Array of normalized error objects
 */
export function normalizeZodErrors(issues: ZodIssue[]): NormalizedFieldError[] {
  const normalized: NormalizedFieldError[] = [];

  for (const issue of issues) {
    // Convert path array to dot notation
    const fieldPath = issue.path.map(String).join('.');

    // Get message
    const message = issue.message || 'Invalid value';

    // Map Zod code to standardized code
    const code = normalizeZodCode(issue.code);

    const normalizedError: NormalizedFieldError = {
      field: fieldPath || 'body',
      message: capitalizeFirst(message),
    };

    if (code) {
      normalizedError.code = code;
    }

    logger.debug(`Normalized Zod error: ${normalizedError.field} - ${message}`);
    normalized.push(normalizedError);
  }

  return normalized;
}

/**
 * Map AJV keyword to standardized code.
 */
function normalizeAjvKeyword(keyword: string): string | undefined {
  const keywordMapping: Record<string, string> = {
    required: 'required',
    type: 'type.invalid',
    format: 'format.invalid',
    minimum: 'number.minimum',
    maximum: 'number.maximum',
    minLength: 'string.min_length',
    maxLength: 'string.max_length',
    pattern: 'string.pattern',
    enum: 'enum.invalid',
    const: 'enum.invalid',
    minItems: 'array.min_items',
    maxItems: 'array.max_items',
    uniqueItems: 'array.unique_items',
    additionalProperties: 'object.additional_properties',
  };

  return keywordMapping[keyword] ?? keyword;
}

/**
 * Map Zod code to standardized code.
 */
function normalizeZodCode(code: string): string | undefined {
  const codeMapping: Record<string, string> = {
    invalid_type: 'type.invalid',
    invalid_literal: 'enum.invalid',
    unrecognized_keys: 'object.additional_properties',
    invalid_union: 'union.invalid',
    invalid_enum_value: 'enum.invalid',
    invalid_string: 'string.invalid',
    too_small: 'size.too_small',
    too_big: 'size.too_big',
    invalid_date: 'format.date',
    custom: 'custom',
  };

  return codeMapping[code] ?? code;
}

/**
 * Capitalize first letter of message.
 */
function capitalizeFirst(message: string): string {
  if (!message) return message;
  return message.charAt(0).toUpperCase() + message.slice(1);
}

logger.debug('Validation normalizers initialized');
